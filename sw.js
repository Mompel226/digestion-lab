/* ============================================================
   sw.template.js — the offline worker both labs share.

   tools/build.mjs fills in the four placeholders below — the lab's name, this build's
   version, the list of stamped files, and a hash per picture — and writes the result to that
   lab's repo root as sw.js. Its scope is therefore exactly /<lab>/ on Pages:
   the most a worker gets by default, this lab and nothing above it. Never edit sw.js.

   ---------------------------------------------------------------------------
   THE ONE DECISION THAT MATTERS: the HTML document is fetched NETWORK-FIRST.

   A service worker on GitHub Pages is the one change that cannot be undone by pushing a fix,
   because we cannot set response headers. The way that goes wrong is always the same: the
   worker serves a cached index.html forever, and every later deploy is invisible. The usual
   defence is a version banner and a kill switch, and the usual result is that a class sits on
   a stale page for a lesson while someone works out why.

   So this worker never prefers the cache for the document while the network is reachable. It
   asks the network first, with a short timeout, and only falls back to what it holds when
   that fails. Online, a student sees exactly what they see today. Offline, they get the lab.

   Everything else IS cache-first, and safely so, because every other URL is immutable by
   construction: index.html carries a ?v= stamp on every script and stylesheet, and the stamp
   changes whenever the file does, so a cached ?v=1 file can never stand in for ?v=2. Pictures
   are keyed by a hash of their own bytes for the same reason.

   The cost is one 12 KB document fetch per online load. That is the price of making the
   unrecoverable failure impossible, and it is worth paying.
   ---------------------------------------------------------------------------

   Cache names are prefixed with the lab, because both labs — and the hubs, and the other
   sims — share the origin mompel226.github.io and therefore share one CacheStorage.
   ============================================================ */
const LAB        = 'digestion-lab';
const VERSION    = '1789100835';
const SHELL      = LAB + '-shell-v' + VERSION;
const MEDIA      = LAB + '-media';
const PRECACHE   = ["./css/app.css?v=1789100835","./js/config.js?v=1789100835","./js/data/photo-size.js?v=1789100835","./js/assets.js?v=1789100835","./js/data/glossary.js?v=1789100835","./js/data/syllabus.js?v=1789100835","./js/data/stations.js?v=1789100835","./js/data/photos.js?v=1789100835","./js/data/anatomy-art.js?v=1789100835","./js/data/zoom.js?v=1789100835","./js/bench.js?v=1789100835","./js/plateanim.js?v=1789100835","./js/zoom.js?v=1789100835","./js/anatomy.js?v=1789100835","./js/tour.js?v=1789100835","./js/terms.js?v=1789100835","./js/figures.js?v=1789100835","./js/marking.js?v=1789100835","./js/sync.js?v=1789100835","./js/engine.js?v=1789100835","./js/syllabus.js?v=1789100835","./js/app.js?v=1789100835"];      /* every stamped .js and .css, taken from the HTML the build just stamped */
const MEDIA_REV  = {".DS_Store":"ceaa74f1","photos/anaemia-pallor.jpg":"c78d28c4","photos/anaemia-pallor.webp":"630a0060","photos/biliary-system-plain.svg":"ffd1127e","photos/biliary-system-plain2.svg":"71ad0192","photos/biliary-system.svg":"420b44cf","photos/canal-regions.jpg":"211176c7","photos/canal-regions.webp":"15dbdc97","photos/canine-real.jpg":"5824f3c5","photos/canine-real.webp":"aa561b84","photos/carbohydrate-chain.jpg":"22149f75","photos/carbohydrate-chain.webp":"d3a275f5","photos/carbs-complex-simple.jpg":"59f867cd","photos/carbs-complex-simple.webp":"7fd7e578","photos/circular-folds-regions.jpg":"12a71ff6","photos/circular-folds-regions.webp":"ee80a30a","photos/colon-inside.jpg":"4d06ec46","photos/colon-inside.webp":"e7d8b448","photos/eatwell-plate.jpg":"2d8f219e","photos/eatwell-plate.webp":"8a0c20db","photos/enzymes/ph-graph.png":"18b67584","photos/enzymes/ph-graph.webp":"926da3e5","photos/enzymes/temp-graph-denaturation.png":"8a342ff6","photos/enzymes/temp-graph-denaturation.webp":"19204655","photos/enzymes/temp-graph.png":"8c91eb89","photos/enzymes/temp-graph.webp":"d2b92c9d","photos/folds-real-photo.jpg":"ca436fc1","photos/folds-real-photo.webp":"446f102a","photos/food-carbohydrate.jpg":"e4966f6f","photos/food-carbohydrate.webp":"86054f63","photos/food-fats.jpg":"33beda4b","photos/food-fats.webp":"7678761d","photos/food-fibre.jpg":"3da26dc3","photos/food-fibre.webp":"7b6375a6","photos/food-protein.jpg":"298a1e1c","photos/food-protein.webp":"66e840e6","photos/haemoglobin-iron.jpg":"a85188ad","photos/haemoglobin-iron.webp":"e48fd7f6","photos/incisors-real.jpg":"dcf95abb","photos/intestine-dissection.jpg":"0d0cfdb3","photos/intestine-dissection.webp":"c3d788d4","photos/jaw-model-xray.jpg":"63e766a5","photos/jaw-model-xray.webp":"f53d2741","photos/kwashiorkor.jpg":"3bf57e8d","photos/kwashiorkor.webp":"ee5976f2","photos/large-intestine-parts.jpg":"b6bc2be7","photos/large-intestine-parts.webp":"6c7d4716","photos/maltase-membrane.jpg":"0c9d5bfc","photos/maltase-membrane.webp":"e2631964","photos/mesentery-render.jpg":"1cf9bdf8","photos/mesentery-render.webp":"89150144","photos/osteoporosis.jpg":"ba3b61d9","photos/osteoporosis.webp":"c96af946","photos/pancreas-dissection.jpg":"7ffdb3f1","photos/pancreas-dissection.webp":"1c40779d","photos/pancreas-duct.jpg":"8435948e","photos/pancreas-duct.webp":"7372ba5f","photos/premolars-molars-real.jpg":"5450d1ce","photos/premolars-molars-real.webp":"eab4a859","photos/rickets.jpg":"292cc6b0","photos/rickets.webp":"93f50e86","photos/salivary-glands.jpg":"fee33b74","photos/salivary-glands.webp":"8e8f9aae","photos/scurvy-gums.jpg":"ce0b6d7b","photos/scurvy-gums.webp":"9be2faa1","photos/small-intestine-parts.jpg":"c1a506f0","photos/small-intestine-parts.webp":"78472cd4","photos/stomach-churning.jpg":"04856725","photos/stomach-churning.webp":"7990b0d0","photos/stomach-inside.jpg":"9a6f5d4b","photos/stomach-inside.webp":"b67a699a","photos/stomach-wall.jpg":"528b8564","photos/stomach-wall.webp":"cbad916b","photos/surface-area-levels.jpg":"972a39e6","photos/surface-area-levels.webp":"fe32c7c8","photos/tests/benedict.jpg":"cf192c14","photos/tests/benedict.webp":"62e10ea4","photos/tests/biuret.jpg":"acfa795c","photos/tests/biuret.webp":"584292bb","photos/tests/emulsion.jpg":"a39a4e28","photos/tests/emulsion.webp":"4b62df71","photos/tests/iodine.jpg":"d9f95060","photos/tests/iodine.webp":"26773b76","photos/tooth-cut-open.jpg":"2894a84a","photos/tooth-cut-open.webp":"938e587e","photos/tooth-decay.jpg":"e663c86a","photos/tooth-decay.webp":"3d0da4ca","photos/tooth-xray.jpg":"63ff9bab","photos/tooth-xray.webp":"f16646d9","photos/villi-and-microvilli-em.jpg":"7692f22b","photos/villi-and-microvilli-em.webp":"8b79f4c4","photos/villi-carpet.jpg":"dee8922f","photos/villi-carpet.webp":"2c76804b","photos/villi-micrograph-set.jpg":"2c40e6a7","photos/villi-micrograph-set.webp":"817451a1","video/peristalsis.jpg":"7232df8d","video/peristalsis.webp":"5e378dd6","video/villus-absorption.jpg":"fc409567","video/villus-absorption.webp":"7dd11e0d","zoom/.DS_Store":"0f9fb978","zoom/accessory-organs.jpg":"275d0436","zoom/accessory-organs.webp":"04a1fbc5","zoom/head-section.png":"a01efdca","zoom/head-section.webp":"c2d13d32","zoom/large-intestine-illus.jpg":"c1e30b41","zoom/large-intestine-illus.webp":"9833996a","zoom/lining-duodenum.jpg":"9374de79","zoom/lining-duodenum.webp":"1a83003a","zoom/lining-ileum.jpg":"fa7e84a4","zoom/lining-ileum.webp":"2c24c14b","zoom/lining-jejunum.jpg":"114d2a67","zoom/lining-jejunum.webp":"549173b4","zoom/microvilli-em.jpg":"d3b82738","zoom/microvilli-em.webp":"148b28e3","zoom/microvilli-tem-band.jpg":"551ae32c","zoom/microvilli-tem-band.webp":"c1ab2b3e","zoom/microvilli-tem.jpg":"b5568999","zoom/microvilli-tem.webp":"8c7c6b49","zoom/pancreas-acinar.png":"fc511c2a","zoom/pancreas-acinar.webp":"dde7172f","zoom/pancreas-render2.jpg":"c5f242a6","zoom/pancreas-render2.webp":"3dfb60be","zoom/salivary-glands-illus.jpg":"dad09f2c","zoom/salivary-glands-illus.webp":"cc0434f3","zoom/small-intestine-illus.jpg":"a536fa97","zoom/small-intestine-illus.webp":"404002c3","zoom/stomach-cutaway.jpg":"ae85f516","zoom/stomach-cutaway.webp":"8bfc564b","zoom/stomach-wall-block.jpg":"7a0c5f4f","zoom/stomach-wall-block.webp":"c7b1e6be","zoom/villi-lm.jpg":"4f4fc33a","zoom/villi-lm.webp":"540e3993"};     /* 'photos/x.jpg' -> a short hash of its bytes */
const DOC_TIMEOUT = 3000;

/* ---------- install: take a complete, self-consistent copy ---------- */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const c = await caches.open(SHELL);
    /* cache:'reload' is not optional. A Request built from a plain string uses the default
       cache mode, so './' would come from the browser's own HTTP cache — which Pages lets it
       hold for ten minutes — while the never-before-seen ?v= urls come from the network. That
       pairs an old document with new files, which is the exact failure this worker exists to
       avoid. */
    const doc = await fetch('./', { cache: 'reload' });
    if (!doc.ok) throw new Error('index responded ' + doc.status);
    await c.put('./', doc.clone());
    await c.addAll(PRECACHE);
    /* And then check what is ACTUALLY in the cache, not what the server said. If the document
       we hold does not name this worker's own version, throw: a failed install simply never
       activates, and the lab goes on behaving exactly as it does without a worker. */
    const held = await (await c.match('./')).text();
    const m = held.match(/stations\.js\?v=(\d+)/);
    if (!m || m[1] !== VERSION) {
      await caches.delete(SHELL);
      throw new Error('cached index is v' + (m && m[1]) + ' but this worker is v' + VERSION);
    }
  })());
});

/* ---------- activate: drop this lab's old shells, and only this lab's ---------- */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys())
      if (k.indexOf(LAB + '-shell-v') === 0 && k !== SHELL) await caches.delete(k);
    /* forget pictures that are no longer in the build */
    const media = await caches.open(MEDIA);
    const want = new Set(Object.keys(MEDIA_REV).map(p => p + '?r=' + MEDIA_REV[p]));
    for (const req of await media.keys()) {
      const u = new URL(req.url);
      const rel = u.pathname.split('/assets/')[1];
      if (rel && !want.has(rel + u.search)) await media.delete(req);
    }
    /* clients.matchAll is scoped to the ORIGIN, not to this worker: both labs live on
       mompel226.github.io, so an unfiltered broadcast would pop a "newer version" banner in
       the OTHER lab's tab, whose Reload button would then do nothing for ever. */
    const cs = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const c of cs)
      if (c.url.indexOf(self.registration.scope) === 0)
        c.postMessage({ type: 'VERSION', lab: LAB, version: VERSION });
  })());
});

self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

/* ---------- fetch ---------- */
function inScope(url) { return url.href.indexOf(self.registration.scope) === 0; }

async function fromNetworkFirst(request) {
  /* the document. Online it is always the live one; offline it is the last one we held. */
  const cache = await caches.open(SHELL);
  try {
    const net = await Promise.race([
      fetch(request, { cache: 'no-store' }),
      new Promise((_, no) => setTimeout(() => no(new Error('slow')), DOC_TIMEOUT))
    ]);
    if (net && net.ok) { cache.put('./', net.clone()); return net; }
    throw new Error('document responded ' + (net && net.status));
  } catch (e) {
    const held = await cache.match('./');
    if (held) return held;
    throw e;
  }
}

async function cacheFirst(request, cacheName) {
  /* Anything unexpected in here — CacheStorage refused in a private window, quota, a bug —
     must end in an ordinary network fetch. A respondWith that rejects does not fall back to
     the network: it fails the request outright, which would be a blank lab. */
  try {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request);
    if (hit) return hit;
    const net = await fetch(request);
    if (net && net.ok && net.type === 'basic') cache.put(request, net.clone());
    return net;
  } catch (e) {
    return fetch(request);
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  /* A Range request is how Safari on iOS plays and scrubs a video. Answering one from a whole
     cached body breaks playback silently on exactly that browser, so never touch them. */
  if (req.headers.has('range')) return;
  const url = new URL(req.url);
  /* cross-origin — the Google sign-in client, the font stylesheet — is never this worker's
     business. Letting it through untouched is what keeps sign-in working. */
  if (url.origin !== location.origin || !inScope(url)) return;

  if (req.mode === 'navigate') { event.respondWith(fromNetworkFirst(req)); return; }

  const rel = url.pathname.slice(new URL(self.registration.scope).pathname.length);

  /* stamped code: the url changes whenever the file does, so the cache can never be stale */
  if (url.search.indexOf('v=') >= 0 && /\.(js|css)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req, SHELL)); return;
  }
  /* pictures, video posters, silhouettes: keyed by a hash of their own bytes */
  if (rel.indexOf('assets/') === 0) {
    const key = rel.slice('assets/'.length);
    const rev = MEDIA_REV[key];
    if (rev) {
      const keyed = new Request(url.origin + url.pathname + '?r=' + rev, { mode: 'same-origin' });
      event.respondWith((async () => {
        try {
          const cache = await caches.open(MEDIA);
          const hit = await cache.match(keyed);
          if (hit) return hit;
          const net = await fetch(req);
          /* the put has to be held open by the event: mobile Chrome and iOS Safari stop the
             worker the moment respondWith settles, so a detached put is dropped on exactly
             the devices this is for, while working every time on a Mac. */
          if (net && net.ok && net.type === 'basic') event.waitUntil(cache.put(keyed, net.clone()));
          return net;
        } catch (e) { return fetch(req); }
      })());
      return;
    }
  }
  /* version.txt above all: it is how the page learns a deploy has happened */
  /* everything else goes straight to the network */
});
