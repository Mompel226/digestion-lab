/* ============================================================
   build.mjs — turns the master content into what the site ships.

     node tools/build.mjs [password]

   Reads   ../digestion-lab-source/stations.master.js   (has the answers)
   Writes  js/data/stations.js    presentation + salted hashes, NO answers

   The hashes let the page mark an answer right or wrong without the answer
   existing anywhere in the download. Nothing in the site can say what the
   answer is, because nothing in the site has it.

   Pass --vault to also write js/data/keys.enc.js, an AES-GCM encrypted copy
   of the answers for your own checking. The site never loads it, .gitignore
   keeps it out of the repo, and it is not published.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const MASTER = resolve(REPO, '../digestion-lab-source/stations.master.js');
const ITER = 250000;

const password = process.argv[2] || 'Biology2026';
if (!existsSync(MASTER)) {
  console.error('Cannot find the master content at:\n  ' + MASTER +
    '\nIt must stay outside the published repo. See README.');
  process.exit(1);
}
const { STATIONS } = await import(pathToFileURL(MASTER).href);

/* ---------- the shared glossary ----------
   One definition per term, for every lab, written once in labs-shared/glossary.master.js.
   A station names the terms it introduces; the wording is looked up here. That is what
   makes "the same term means the same thing everywhere" a fact rather than a promise:
   there is only one definition anywhere, and a term a station names but the glossary
   does not define stops the build. */
function findShared(from) {
  let dir = from;
  for (let i = 0; i < 8; i++) {
    const p = resolve(dir, 'labs-shared/glossary.master.js');
    if (existsSync(p)) return p;
    const up = resolve(dir, '..');
    if (up === dir) break;
    dir = up;
  }
  return null;
}
const GLOSS_PATH = findShared(REPO);
if (!GLOSS_PATH) {
  console.error('Cannot find labs-shared/glossary.master.js above:\n  ' + REPO +
    '\nIt holds the definitions every lab shares. See README.');
  process.exit(1);
}
const { GLOSSARY } = await import(pathToFileURL(GLOSS_PATH).href);
const DEF = new Map(GLOSSARY.map(e => [e.term.toLowerCase(), e]));

/* A station's keywords may be plain names (preferred) or the older {term, def} pairs.
   Either way the wording that ships is the glossary's, and a disagreement is an error
   rather than a silent overwrite. */
const missing = [], clash = [];
for (const st of STATIONS) {
  st.keywords = (st.keywords || []).map(k => {
    const term = typeof k === 'string' ? k : k.term;
    const e = DEF.get(String(term).toLowerCase());
    if (!e) { missing.push(st.id + ' -> ' + term); return { term, def: '' }; }
    if (typeof k === 'object' && k.def && k.def !== e.def) clash.push(st.id + ' -> ' + term);
    return { term: e.term, def: e.def };
  });
}
if (missing.length || clash.length) {
  if (missing.length) console.error('Terms named by a station but not in the glossary:\n  ' + missing.join('\n  '));
  if (clash.length) console.error('Terms whose station wording differs from the glossary:\n  ' + clash.join('\n  '));
  process.exit(1);
}

/* ---------- helpers shared with the runtime (must stay identical) ---------- */
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');

function norm(s) {
  return String(s ?? '').toLowerCase().trim()
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ').replace(/[.,;:!?]+$/, '').replace(/^(the|a|an)\s+/, '');
}
const SALT = hex(crypto.getRandomValues(new Uint8Array(16)));
async function H(parts) {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(SALT + '|' + parts.join('|')));
  return hex(d).slice(0, 32);           // 128 bits is plenty and keeps the file small
}

/* deterministic shuffle so ordering tasks never ship in the right order */
function scramble(arr, seed) {
  const a = arr.slice();
  let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.join('|') === arr.join('|') && a.length > 1 ? scramble(arr, seed + '.') : a;
}

/* ---------- transform ---------- */
const vault = {};       // id -> the plain answer key + explanations
const pub = [];
let nAct = 0;

for (const st of STATIONS) {
  const s = { ...st, activities: [] };
  for (let i = 0; i < (st.activities || []).length; i++) {
    const a = st.activities[i], id = st.id + ':' + i, t = a.type;
    const p = { type: t, prompt: a.prompt };
    if (a.table) p.table = a.table;          /* presentation only */
    if (a.img) { p.img = a.img; if (a.imgCap) p.imgCap = a.imgCap; }   /* a graph or photograph the question is about */
    const v = {};
    nAct++;

    if (t === 'blank') {
      p.text = a.text;
      p.hints = {}; p.k = {};
      for (const [g, spec] of Object.entries(a.answers)) {
        p.hints[g] = spec.hint;
        p.k[g] = await Promise.all(spec.accept.map(x => H([id, 'g' + g, norm(x)])));
      }
      v.answers = Object.fromEntries(Object.entries(a.answers).map(([g, sp]) => [g, sp.accept[0]]));

    } else if (t === 'mcq') {
      p.options = a.options;
      p.multi = a.correct.length > 1;
      p.k = await H([id, 'mcq', a.correct.slice().sort((x, y) => x - y).join(',')]);
      v.correct = a.correct; v.why = a.why;

    } else if (t === 'order') {
      p.items = scramble(a.items, id);
      p.k = await H([id, 'order', a.items.join('~')]);
      v.items = a.items;

    } else if (t === 'match') {
      p.left = a.left; p.right = a.right;
      p.leftHead = a.leftHead; p.rightHead = a.rightHead;
      if (a.leftNotes) p.leftNotes = a.leftNotes;       /* presentation only */
      if (a.rightCharts) p.rightCharts = a.rightCharts; /* the pie data is not the answer */
      p.k = await H([id, 'match', a.pairs.map(x => x.join('-')).sort().join(',')]);
      v.pairs = a.pairs;

    } else if (t === 'sort') {
      p.bins = a.bins;
      p.items = scramble(a.items.map(x => x.text), id);
      p.k = await H([id, 'sort', a.items.map(x => norm(x.text) + '=' + x.bin).sort().join(',')]);
      v.items = a.items;

    } else if (t === 'drag') {
      p.tokens = a.tokens; p.distractors = a.distractors || [];
      p.slots = a.slots.map(s2 => ({ label: s2.label }));
      p.k = await H([id, 'drag', a.slots.map((s2, j) => j + '=' + norm(s2.accept)).join(',')]);
      v.slots = a.slots.map(s2 => s2.accept);

    } else if (t === 'ph') {
      p.enzyme = a.enzyme;
      const tol = a.tolerance ?? 0.6;
      /* every half-unit the slider can land on that is within tolerance */
      const ok = [];
      for (let x = 0; x <= 14.0001; x += 0.5)
        if (Math.abs(x - a.optimum) <= tol) ok.push(await H([id, 'ph', x.toFixed(1)]));
      if (!ok.length) throw new Error(id + ': no slider value falls within the tolerance');
      p.k = ok;
      v.optimum = a.optimum; v.tolerance = tol; v.explain = a.explain;
    }

    vault[id] = v;
    s.activities.push(p);
  }
  pub.push(s);
}

/* ---------- the answer vault ----------
   Nothing in the site can show an answer any more — there is no mode for it — so the
   encrypted vault is not published. Pass --vault to write it anyway (it is the only
   machine-readable copy of the answers outside the master file, useful for checking). */
const kSalt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: kSalt, iterations: ITER, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(vault)));
const b64 = Buffer.from(new Uint8Array(ct)).toString('base64');

/* the glossary ships as its own file: every lab carries the same list */
writeFileSync(resolve(REPO, 'js/data/glossary.js'),
  '/* GENERATED by tools/build.mjs from labs-shared/glossary.master.js — do not edit.\n' +
  '   The definitions every Biology Lab shares. */\n' +
  'window.GLOSSARY = ' + JSON.stringify(GLOSSARY, null, 1) + ';\n');

writeFileSync(resolve(REPO, 'js/data/stations.js'),
  '/* GENERATED by tools/build.mjs — do not edit.\n' +
  '   Presentation only. The answers are not in this file: each question carries\n' +
  '   a salted hash, which is enough to mark an answer but not to read it. */\n' +
  'window.ANSWER_SALT = ' + JSON.stringify(SALT) + ';\n' +
  'window.STATIONS = ' + JSON.stringify(pub, null, 1) + ';\n');

const wantVault = process.argv.includes('--vault');
if (wantVault) {
  writeFileSync(resolve(REPO, 'js/data/keys.enc.js'),
    '/* GENERATED by tools/build.mjs --vault — do not edit, and do not add it to index.html.\n' +
    '   The answer key and explanations, AES-GCM encrypted. The site never loads this. */\n' +
    'window.ANSWER_VAULT = ' + JSON.stringify({
      v: 1, iter: ITER,
      salt: Buffer.from(kSalt).toString('hex'),
      iv: Buffer.from(iv).toString('hex'),
      ct: b64
    }) + ';\n');
}

/* One stamp, set here, so a deploy cannot ship new JS behind an old ?v=. The stamp in
   index.html IS the cache key: bumping version.txt alone changes nothing a browser fetches. */
const STAMP = String(Math.floor(Date.now() / 1000));
writeFileSync(resolve(REPO, 'version.txt'), STAMP + '\n');
const idxPath = resolve(REPO, 'index.html');
const idx = readFileSync(idxPath, 'utf8');
const stamped = idx.replace(/(\.(?:js|css))\?v=\d+/g, `$1?v=${STAMP}`);
const nStamp = (idx.match(/\.(?:js|css)\?v=\d+/g) || []).length;
if (!nStamp) throw new Error('index.html has no ?v= stamps to bump — cache busting would be silent');
writeFileSync(idxPath, stamped);

console.log(`built ${pub.length} stations, ${nAct} activities`);
console.log(`  js/data/stations.js   presentation + hashes (no answers)`);
console.log(`  js/data/glossary.js   ${GLOSSARY.length} shared definitions`);
console.log(`  index.html + version.txt  stamped ${STAMP} (${nStamp} assets)`);
console.log(wantVault
  ? `  js/data/keys.enc.js   encrypted vault (NOT loaded by the site)`
  : `  the answers are not written anywhere in the repo`);
