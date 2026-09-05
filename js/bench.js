/* ============================================================
   bench.js — the visking tubing practical as a bench you work at.

   Not an animation that plays: nothing happens unless the student does it. Pick up the
   pipette, draw a sample from inside or outside any tube, test it with iodine or with
   Benedict's, run the clock forward and test again. The colours are what those tests
   would actually give, and Benedict's is graded, because a reducing sugar test is not a
   yes or a no.
   ============================================================ */
(function (global) {
  'use strict';

  var f1 = function (v) { return (+v).toFixed(1); };
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* ---------- what is true, and why (see the comment block in the commit) ---------- */
  var TUBES = [
    { id:'A', name:'negative control', has:'starch, no amylase',  starch:true,  amylase:false, malt:false },
    { id:'B', name:'the experiment',   has:'starch and amylase',  starch:true,  amylase:true,  malt:false },
    { id:'C', name:'positive control', has:'maltose only',        starch:false, amylase:false, malt:true  }
  ];
  /* sn = how many starch molecules are drawn; starch = what iodine would report.
     In B some starch is still there at 30 minutes, which is why iodine inside B is still
     blue-black: an enzyme does not finish the job in half an hour. */
  var TRUTH = {
    A: { inside:{ before:{ starch:true,  sn:3, malt:0 }, after:{ starch:true,  sn:3, malt:0 } },
         outside:{ before:{ starch:false, sn:0, malt:0 }, after:{ starch:false, sn:0, malt:0 } } },
    B: { inside:{ before:{ starch:true,  sn:3, malt:0 }, after:{ starch:true,  sn:1, malt:4 } },
         outside:{ before:{ starch:false, sn:0, malt:0 }, after:{ starch:false, sn:0, malt:4 } } },
    C: { inside:{ before:{ starch:false, sn:0, malt:4 }, after:{ starch:false, sn:0, malt:3 } },
         outside:{ before:{ starch:false, sn:0, malt:0 }, after:{ starch:false, sn:0, malt:2 } } }
  };

  /* Benedict's is semi-quantitative: the colour says how much, not merely whether. */
  var BEN = [
    { col:'#3E6FA8', word:'stays blue',   sub:'no reducing sugar' },
    { col:'#4E9A6A', word:'green',        sub:'a trace of reducing sugar' },
    { col:'#C9B23A', word:'yellow',       sub:'a little reducing sugar' },
    { col:'#D98F2E', word:'orange',       sub:'a lot of reducing sugar' },
    { col:'#B6412A', word:'brick-red',    sub:'a great deal of reducing sugar' }
  ];
  var IOD = { yes:{ col:'#21203A', word:'blue-black', sub:'starch is present' },
              no: { col:'#C77B34', word:'orange-brown', sub:'no starch' } };

  var S = { ran:false, sample:null, result:null, log:{} };
  global.BenchState = S;

  /* ---------- geometry ----------
     The bench is laid out against the frame the camera actually gives us, not against fixed
     numbers: a phone and a laptop hand us different shapes, and the bench should fill either.
     R holds the baselines of the rows under the rack, worked upwards from the caption strip. */
  var F = { x:30, y:116, w:280, h:448 };
  var RACK = { y:182, h:170, w:56 };
  var CX = [74, 158, 242];      /* the rack sits left, leaving the right of the bench for the pipette */
  var R = {};

  /* The viewBox is not what you can see. The plate is drawn with xMidYMid meet, so on a pane
     that is not the viewBox's shape the browser letterboxes and shows MORE than the viewBox on
     one axis: 412 units of width where the viewBox claims 280. Work it out from the pane's
     pixel shape and the frame we are heading for — NEVER from the live CTM, which during a
     camera flight still holds the viewBox we are flying away from. */
  function visibleBox(frame) {
    var svg = document.getElementById('bodySvg');
    if (!svg) return null;
    var r = svg.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return null;
    var paneA = r.height / r.width, vw, vh;
    if (paneA < frame.h / frame.w) { vh = frame.h; vw = frame.h / paneA; }   /* fitted by height */
    else { vw = frame.w; vh = frame.w * paneA; }                             /* fitted by width  */
    var cap = frame.w * 1.55;
    if (vw > cap) vw = cap;                    /* or the bench sprawls on a very wide pane */
    var box = { x:frame.x + frame.w / 2 - vw / 2, y:frame.y + frame.h / 2 - vh / 2, w:vw, h:vh };
    /* Reserve the caption strip. Ask it how TALL it is, never where its top is: the strip
       slides in after the bench is drawn, so its top at draw time is a number that will not
       be true a moment later — that is how Start again ended up underneath it. */
    var el = document.querySelector('.detailstrip'), scale = r.height / vh;
    box.bottom = box.y + box.h * 0.82;
    if (el && scale > 0) {
      var ch = el.getBoundingClientRect().height;
      if (ch > 8) box.bottom = Math.min(box.y + box.h - ch / scale - 8, box.y + box.h * 0.90);
    }
    return box;
  }

  function layout(frame) {
    if (frame && frame.w) F = { x:frame.x, y:frame.y, w:frame.w, h:frame.h };
    var vis = frame && frame.w ? visibleBox(frame) : null, bottom = null;
    if (vis) { bottom = typeof vis.bottom === 'number' ? vis.bottom : null; F = { x:vis.x, y:vis.y, w:vis.w, h:vis.h }; }
    var strip = bottom !== null ? bottom : F.y + F.h * 0.82;   /* nothing may go below it */
    R.say = F.y + F.h * 0.032;
    R.key = F.y + F.h * 0.062;
    R.clock = strip - 79; R.btn = strip - 71; R.reset = strip - 37;
    R.swatch = strip - 38; R.res = strip - 27; R.sub = strip - 16;
    /* height first: the tubes take what vertical room is left, then the width follows from it,
       so a boiling tube always looks like a boiling tube and never like a beaker */
    RACK.y = F.y + F.h * 0.118;
    RACK.h = Math.max(120, R.clock - 60 - RACK.y);   /* 60 leaves the three captions clear of the clock */
    RACK.w = Math.min(F.w * 0.25, RACK.h * 0.38);    /* a boiling tube, never a beaker */
    var sp = Math.min(F.w * 0.30, RACK.w * 1.5), tot = sp * 2 + RACK.w, pip = Math.min(56, F.w * 0.13);
    R.left = F.x + Math.max(6, (F.w - pip - tot) / 2);
    for (var c = 0; c < 3; c++) CX[c] = R.left + RACK.w / 2 + c * sp;
    R.right = R.left + tot;
    R.mid = R.left + tot / 2;   /* the writing belongs over the bench, not over the pipette's margin */
    /* Molecules scale with the tube, but never past the point where the fullest tube — three
       starch and an amylase — would not fit inside the tubing. */
    R.mol = Math.min(RACK.w / 56, (RACK.h - 50) / 120);
    R.id = RACK.y + RACK.h + 18; R.nm = RACK.y + RACK.h + 30; R.has = RACK.y + RACK.h + 41;
  }

  /* ---------- what the molecules actually are ----------
     One glucose is one circle, and it is the SAME circle everywhere. Maltose is two of them
     joined; starch is a long branched chain of many. That is the whole experiment: the pores
     let maltose through and cannot let starch through, and a student can see why by counting.
     Amylase is not a carbohydrate at all, so it is drawn as a protein with an active site —
     and it stays inside the tubing, because a protein is far too large to cross as well. */
  var GLU = '#D98F2E', GLUE = '#A9651C', ENZ = '#7A5AA8';

  function glucose(cx, cy, r) {
    return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(r) +
           '" fill="' + GLU + '" stroke="' + GLUE + '" stroke-width=".7"/>';
  }
  /* maltose: two glucose, joined — small enough to pass through a pore */
  function pair(cx, cy, s) {
    s = s || 1;
    return '<line x1="' + f1(cx - 3.4 * s) + '" y1="' + f1(cy) + '" x2="' + f1(cx + 3.4 * s) + '" y2="' + f1(cy) +
           '" stroke="' + GLUE + '" stroke-width="' + f1(1.6 * s) + '"/>' +
           glucose(cx - 3.4 * s, cy, 3.2 * s) + glucose(cx + 3.4 * s, cy, 3.2 * s);
  }
  /* starch: a chain of seven glucose, folded so it fits down a tube — many times the bulk of
     maltose, which is the whole reason one crosses the wall and the other cannot */
  function starch(cx, cy, s) {
    s = s || 1;
    var dx = 10 * s, dy = 8 * s, r = 3.2 * s, pts = [], g = '';
    [0, 1, 2].forEach(function (row) {
      [0, 1].forEach(function (col) {
        var c = row % 2 ? 1 - col : col;                       /* serpentine, so the chain is unbroken */
        pts.push([cx + (c - 0.5) * dx, cy + (row - 1) * dy]);
      });
    });
    g += '<polyline points="' + pts.map(function (q) { return f1(q[0]) + ',' + f1(q[1]); }).join(' ') +
         '" fill="none" stroke="' + GLUE + '" stroke-width="' + f1(1.6 * s) + '" stroke-linejoin="round" stroke-linecap="round"/>';
    var bx = cx + dx * 0.5, by = cy - dy;
    g += '<line x1="' + f1(bx) + '" y1="' + f1(by) + '" x2="' + f1(bx - dx * 0.7) + '" y2="' + f1(by - dy * 0.8) +
         '" stroke="' + GLUE + '" stroke-width="' + f1(1.6 * s) + '" stroke-linecap="round"/>';   /* a branch */
    pts.push([bx - dx * 0.7, by - dy * 0.8]);
    pts.forEach(function (q) { g += glucose(q[0], q[1], r); });
    return g;
  }
  /* amylase: a protein with a cleft — the active site the starch fits into */
  function amylase(cx, cy, s) {
    s = s || 1;
    return '<path d="M' + f1(cx - 9 * s) + ',' + f1(cy - 6 * s) +
           ' a' + f1(9 * s) + ',' + f1(8 * s) + ' 0 1 0 ' + f1(18 * s) + ',0' +
           ' l' + f1(-5 * s) + ',0 l' + f1(-4 * s) + ',' + f1(5 * s) + ' l' + f1(-4 * s) + ',' + f1(-5 * s) + ' Z"' +
           ' fill="' + ENZ + '" fill-opacity=".85" stroke="#5A3F84" stroke-width="1" stroke-linejoin="round"/>';
  }

  function starchFlat(cx, cy, s) {
    var d = 8 * s, g = '<line x1="' + f1(cx - 2 * d) + '" y1="' + f1(cy) + '" x2="' + f1(cx + 2 * d) + '" y2="' + f1(cy) +
            '" stroke="' + GLUE + '" stroke-width="' + f1(1.5 * s) + '"/>';
    for (var i = -2; i <= 2; i++) g += glucose(cx + i * d, cy, 3 * s);
    return g;
  }

  function tubeArt(i) {
    var t = TUBES[i], x = CX[i] - RACK.w / 2, y = RACK.y, w = RACK.w, h = RACK.h, g = '';
    var bagW = w * 0.52, bx = CX[i] - bagW / 2, by = y - 20, bh = h - 30;
    g += '<path fill="#CFE4EE" opacity=".5" d="M' + f1(x + 2) + ',' + f1(y + 16) +
         ' H' + f1(x + w - 2) + ' V' + f1(y + h - 11) + ' a' + f1(w / 2 - 2) + ',11 0 0 1 ' + f1(-(w - 4)) + ',0 Z"/>';
    g += '<path fill="none" stroke="#9FB3BD" stroke-width="1.6" stroke-linejoin="round" d="M' + f1(x) + ',' + f1(y) +
         ' V' + f1(y + h - 11) + ' a' + f1(w / 2) + ',11 0 0 0 ' + f1(w) + ',0 V' + f1(y) + '"/>';
    g += '<ellipse cx="' + f1(CX[i]) + '" cy="' + f1(y) + '" rx="' + f1(w / 2) + '" ry="3.4" fill="none" stroke="#9FB3BD" stroke-width="1.6"/>';
    /* the tubing, knotted above the rim and again at the bottom */
    g += '<rect x="' + f1(bx) + '" y="' + f1(by + 6) + '" width="' + f1(bagW) + '" height="' + f1(bh - 12) +
         '" rx="' + f1(bagW / 2) + '" fill="#F3E6C8" opacity=".95" stroke="#C9AE72" stroke-width="1.4"/>';
    g += '<path d="M' + f1(bx) + ',' + f1(by + 6) + ' v' + f1(bh - 12) + ' M' + f1(bx + bagW) + ',' + f1(by + 6) + ' v' + f1(bh - 12) +
         '" stroke="#FFFDF9" stroke-width="1.8" stroke-dasharray="1.3 5" stroke-linecap="round"/>';
    [by + 6, by + bh - 6].forEach(function (ky) {
      g += '<ellipse cx="' + f1(CX[i]) + '" cy="' + f1(ky) + '" rx="' + f1(bagW / 4 + 0.5) + '" ry="3.2" fill="#E4D2A4" stroke="#B99C5E" stroke-width="1.2"/>'; });

    /* Contents, stacked so nothing can ever land on top of anything else, and sized as a
       fraction of the tube so the picture means the same on a phone and on a laptop. */
    var mol = R.mol || 1;
    var inside = TRUTH[t.id].inside[S.ran ? 'after' : 'before'];
    var items = [];
    for (var q = 0; q < (inside.sn || 0); q++) items.push({ t:'s', h:26 * mol });
    if (t.amylase) items.push({ t:'e', h:16 * mol });
    for (var m = 0; m < Math.min(3, inside.malt); m++) items.push({ t:'m', h:11 * mol });
    var top = by + 6 + 26 * mol, bot = by + bh - 14, span = bot - top;
    var tot = items.reduce(function (a2, it) { return a2 + it.h; }, 0);
    var cy = top + Math.max(0, (span - tot) / 2), k = 0;
    items.forEach(function (it) {
      var mid = cy + it.h / 2;
      if (it.t === 's') g += starch(CX[i], mid, mol);
      else if (it.t === 'e') g += amylase(CX[i], mid, 0.9 * mol);
      else { g += pair(CX[i] + (k % 2 ? 1 : -1) * 6 * mol, mid, mol); k++; }
      cy += it.h;
    });
    /* what has crossed into the water: maltose only — starch and amylase are far too large */
    var out = TRUTH[t.id].outside[S.ran ? 'after' : 'before'];
    for (var o = 0; o < Math.min(3, out.malt); o++)
      g += pair(CX[i] + (o % 2 ? 1 : -1) * (bagW / 2 + 6 * mol), y + h * (0.22 + o * 0.20), mol);
    return g;
  }
  /* A teat pipette: bulb, barrel, drawn point. It rests on the bench until a sample is
     taken, then stands beside the tube it was taken from, holding what it drew. */
  function pipette(x, y, fill) {
    var g = '<g transform="translate(' + f1(x) + ',' + f1(y) + ')">';
    g += '<ellipse cx="0" cy="-20" rx="7" ry="9" fill="#F2EDE1" stroke="#9C8E77" stroke-width="1.2"/>';
    g += '<rect x="-3.2" y="-12" width="6.4" height="20" fill="#FFFDF9" stroke="#9C8E77" stroke-width="1.2"/>';
    g += '<path d="M-3.2,8 L0,21 L3.2,8 Z" fill="#FFFDF9" stroke="#9C8E77" stroke-width="1.2" stroke-linejoin="round"/>';
    if (fill) {
      g += '<rect x="-2" y="-2" width="4" height="9" fill="' + fill + '" opacity=".85"/>';
      g += '<path d="M-1.7,7 L0,15 L1.7,7 Z" fill="' + fill + '" opacity=".85"/>';
    }
    return g + '</g>';
  }

  /* ---------- the bench ---------- */
  function btn(id, x, y, w, h, label, on, sub) {
    return '<g class="bn' + (on ? ' is-on' : '') + '" data-bench="' + esc(id) + '" role="button" tabindex="0">' +
           '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + f1(h / 2) + '"/>' +
           '<text x="' + f1(x + w / 2) + '" y="' + f1(y + h / 2 + (sub ? -1 : 3.4)) + '" text-anchor="middle">' + esc(label) + '</text>' +
           (sub ? '<text class="bn__sub" x="' + f1(x + w / 2) + '" y="' + f1(y + h / 2 + 9) + '" text-anchor="middle">' + esc(sub) + '</text>' : '') +
           '</g>';
  }

  function draw(ctx) {
    layout(ctx && ctx.frame);
    var g = '';
    /* what to do, in one line that changes with what has been done */
    var say = !S.sample ? 'Tap a dotted spot to draw a sample \u2014 inside the tubing, or the water outside it.'
            : !S.result ? 'Now test what is in the pipette: iodine, or Benedict\u2019s.'
            : 'Test somewhere else, or run the clock and test again.';
    g += '<text class="bn__say" x="' + f1(R.mid) + '" y="' + f1(R.say) + '" text-anchor="middle">' + esc(say) + '</text>';

    /* the key, read before the bench rather than after the buttons. Starch sits next to
       maltose on purpose: both are made of the same glucose, and one is far bigger. */
    var KEY = [['starch', 38, 6], ['maltose', 14, 7], ['amylase', 16, 7], ['tap to sample', 10, 13]];
    var kw = KEY.reduce(function (a2, k) { return a2 + k[1] + 6 + k[2] * 3.1 + 9; }, 0) - 9;
    var ky = R.key, kx = Math.max(F.x + 4, R.mid - kw / 2);
    function keyItem(icon, word, w) {
      var t = icon + '<text class="bn__key" x="' + f1(kx + w + 3) + '" y="' + f1(ky + 3) + '">' + word + '</text>';
      kx += w + 6 + word.length * 3.1 + 9;
      return t;
    }
    g += keyItem(starchFlat(kx + 19, ky, 0.8), 'starch', 38);
    g += keyItem(pair(kx + 7, ky, 0.8), 'maltose', 14);
    g += keyItem(amylase(kx + 8, ky, 0.55), 'amylase', 16);
    g += keyItem('<circle class="bn__spot" cx="' + f1(kx + 5) + '" cy="' + f1(ky) + '" r="5"/>', 'tap to sample', 10);

    /* the three tubes, each with two places you can sample */
    TUBES.forEach(function (t, i) {
      g += tubeArt(i);
      var picked = S.sample && S.sample.tube === t.id;
      ['outside', 'inside'].forEach(function (side) {
        var sel = picked && S.sample.side === side;
        var bagBot = RACK.y - 20 + (RACK.h - 30) - 6, tubeBot = RACK.y + RACK.h - 11;
        var x = CX[i], y = side === 'inside' ? RACK.y - 20 + 6 + 13 * (R.mol || 1) : (bagBot + tubeBot) / 2;
        g += '<circle class="bn__spot' + (sel ? ' is-sel' : '') + '" data-bench="take:' + t.id + ':' + side +
             '" role="button" tabindex="0" cx="' + f1(x) + '" cy="' + f1(y) + '" r="9"/>';
      });
      g += '<text class="bn__id" x="' + f1(CX[i]) + '" y="' + f1(R.id) + '" text-anchor="middle">' + t.id + '</text>';
      g += '<text class="bn__nm" x="' + f1(CX[i]) + '" y="' + f1(R.nm) + '" text-anchor="middle">' + esc(t.name) + '</text>';
      g += '<text class="bn__nm" x="' + f1(CX[i]) + '" y="' + f1(R.has) + '" text-anchor="middle">' + esc(t.has) + '</text>';
    });
    /* the bench top, and the pipette standing on it until it is used */
    g += '<path d="M' + f1(F.x + 6) + ',' + f1(RACK.y + RACK.h + 2) + ' H' + f1(F.x + F.w - 6) +
         '" stroke="#C3B69C" stroke-width="2" stroke-linecap="round"/>';
    if (S.sample) {
      var pi = S.sample.tube.charCodeAt(0) - 65;
      var px = Math.max(F.x + 14, Math.min(R.right + 10, CX[pi] + (S.sample.side === 'inside' ? -38 : 38)));
      g += pipette(px, RACK.y + 66, S.result ? S.result.col : '#CFE4EE');
    } else {
      g += pipette(R.right + 26, RACK.y + 72, null);
      g += '<text class="bn__key" x="' + f1(R.right + 26) + '" y="' + f1(RACK.y + 108) + '" text-anchor="middle">pipette</text>';
    }

    /* the controls, one row to a job, each button sized to the words it holds */
    var clock = S.ran ? 'at 30 minutes' : 'at the start';
    g += '<text class="bn__samp" x="' + f1(R.left) + '" y="' + f1(R.clock) + '">Clock: ' + clock +
         (S.sample ? '  \u00b7  pipette holds: ' +
            esc(S.sample.side === 'inside' ? 'inside ' + S.sample.tube : 'water outside ' + S.sample.tube) : '') +
         '</text>';
    g += btn('run', R.left, R.btn, 106, 26, S.ran ? 'clock has run' : 'Run 30 minutes', S.ran);
    if (S.sample) {
      g += btn('test:iodine', R.left + 114, R.btn, 66, 26, 'iodine', S.result && S.result.kind === 'iodine');
      g += btn('test:benedict', R.left + 188, R.btn, 78, 26, 'Benedict\u2019s', S.result && S.result.kind === 'benedict');
    }
    g += btn('reset', R.left, R.reset, 66, 22, 'Start again', false);

    /* the result: the colour that test would actually give, and what it means */
    if (S.result) {
      var r = S.result;
      g += '<rect x="' + f1(R.left + 76) + '" y="' + f1(R.swatch) + '" width="26" height="24" rx="4" fill="' + r.col + '" stroke="#9FB3BD" stroke-width="1"/>';
      g += '<text class="bn__res" x="' + f1(R.left + 108) + '" y="' + f1(R.res) + '">' + esc(r.word) + '</text>';
      g += '<text class="bn__sub2" x="' + f1(R.left + 108) + '" y="' + f1(R.sub) + '">' + esc(r.sub) + '</text>';
    }
    return g;
  }

  /* every click goes through here, so what the bench shows is always what the science says */
  function hit(id) {
    if (id === 'run')   { S.ran = true;  S.result = null; return true; }
    if (id === 'reset') { S.ran = false; S.sample = null; S.result = null; S.log = {}; return true; }
    var m = /^take:([ABC]):(inside|outside)$/.exec(id);
    if (m) { S.sample = { tube:m[1], side:m[2] }; S.result = null; return true; }
    m = /^test:(iodine|benedict)$/.exec(id);
    if (m && S.sample) {
      var truth = TRUTH[S.sample.tube][S.sample.side][S.ran ? 'after' : 'before'];
      S.result = m[1] === 'iodine'
        ? { kind:'iodine', col:(truth.starch ? IOD.yes : IOD.no).col,
            word:(truth.starch ? IOD.yes : IOD.no).word, sub:(truth.starch ? IOD.yes : IOD.no).sub }
        : { kind:'benedict', col:BEN[truth.malt].col, word:BEN[truth.malt].word, sub:BEN[truth.malt].sub };
      S.log[S.sample.tube + ':' + S.sample.side + ':' + (S.ran ? 'after' : 'before') + ':' + m[1]] = S.result.word;
      return true;
    }
    return false;
  }

  global.Bench = { TUBES:TUBES, starch:starch, amylase:amylase, glucose:glucose, TRUTH:TRUTH, BEN:BEN, IOD:IOD, S:S, F:F, RACK:RACK, CX:CX,
                   layout:layout, tubeArt:tubeArt, starchFlat:starchFlat, pair:pair, f1:f1, esc:esc, draw:draw, hit:hit };
})(window);
