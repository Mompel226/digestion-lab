/* ============================================================
   assets.js — where a picture actually lives, and how big it is.

   Two jobs, both about the page not jumping and not waiting:

   1. WebP when it is safe. tools/make-webp.py writes a .webp beside a photograph only
      when it is meaningfully smaller at the same quality, and tools/build.mjs records
      which ones exist in window.WEBP_HAVE. This file swaps to one ONLY when that list
      says the file is there AND this browser has said it can decode one. Nothing is
      renamed, so a browser that cannot simply keeps the .jpg or .png it always had.

   2. The box before the picture. window.PHOTO_SIZE carries every file's real width and
      height, so a picture can be given width and height attributes and the browser can
      leave the right gap for it. Without that the text under a picture jumps when it
      lands — which is most of what "it feels laggy" turns out to mean.

   The WebP question is asked synchronously so the very first picture can use the answer.
   The canvas test is right for Chrome, Edge and Firefox; Safari 14 and 15 can DECODE WebP
   but cannot encode one, so they answer "no" and keep their JPEGs. A real decode test then
   runs in the background and remembers the true answer for the next visit — so those
   Safaris are conservative for one load only, never broken.
   ============================================================ */
(function (global) {
  'use strict';
  var KEY = 'lab.webp';

  function remembered() {
    try { var v = localStorage.getItem(KEY); return v === '1' ? true : v === '0' ? false : null; }
    catch (e) { return null; }
  }
  function canvasSaysYes() {
    try {
      var c = document.createElement('canvas');
      c.width = c.height = 1;
      return !!c.toDataURL && c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) { return false; }
  }

  var was = remembered();
  var webpOK = was === null ? canvasSaysYes() : was;

  /* the real answer, for next time: a 1x1 lossy WebP, decoded for real */
  var probe = new Image();
  probe.onload = probe.onerror = function () {
    var ok = probe.width === 1 && probe.height === 1;
    try { localStorage.setItem(KEY, ok ? '1' : '0'); } catch (e) {}
    if (ok && !webpOK) webpOK = true;      /* helps anything drawn from here on */
  };
  probe.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

  function best(rel) {
    if (!rel) return rel;
    return (webpOK && (global.WEBP_HAVE || {})[rel])
      ? rel.replace(/\.(jpe?g|png)$/i, '.webp')
      : rel;
  }
  function url(rel) { return 'assets/' + best(rel); }
  function size(rel) { return (global.PHOTO_SIZE || {})[rel] || null; }

  /* Reserve the box. The attributes give the browser the aspect ratio; the CSS still
     decides the drawn width, so every maxw and every column stays exactly as it was —
     as long as the rule that draws it also says height:auto. */
  function box(img, rel) {
    var wh = size(rel) || size(best(rel));
    if (wh) { img.width = wh[0]; img.height = wh[1]; }
  }

  /* An <img src> is an ABSOLUTE url once it is set, so a caller holding one needs this
     to get back to the path PHOTO_SIZE is keyed by. */
  function relOf(src) {
    try { return new URL(src, location.href).pathname.split('/assets/').pop(); }
    catch (e) { return String(src).replace(/^assets\//, ''); }
  }

  global.Assets = { url: url, best: best, size: size, box: box, relOf: relOf,
                    webp: function () { return webpOK; } };
})(window);
