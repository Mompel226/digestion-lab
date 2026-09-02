/* ============================================================
   zoom.js — the plate follows the text.

   When a station opens, the camera on the anatomical plate flies to the
   organ. As it arrives, a professional illustration of THAT organ fades in
   on the plate itself, registered over the organ's own outline — the way a
   3-D viewer swaps in a higher-detail model as you get closer. Nothing pops
   up over the page, and nothing shown here is repeated in the text on the
   right: the plate carries the organ, the text carries the photographs and
   micrographs. "Whole body" pulls the camera back and the detail fades.

   The illustration for each station, and where its organ sits inside the
   picture, is in js/data/zoom.js.
   ============================================================ */
(function (global) {
  'use strict';

  var VIEW = { x:-88, y:-12, w:530, h:848 };          /* the plate's home view */
  var ASPECT = VIEW.h / VIEW.w;
  var NS = 'http://www.w3.org/2000/svg';
  /* camera frame per organ, in plate coordinates: centre and the width shown */
  var CAM = {
    'mouth':           { cx:132, cy:128, w:150 },
    'salivary-glands': { cx:146, cy:146, w:160 },
    'epiglottis':      { cx:158, cy:198, w:140 },
    'oesophagus':      { cx:178, cy:318, w:250 },
    'stomach':         { cx:238, cy:474, w:200 },
    'liver':           { cx:130, cy:466, w:220 },
    'gall-bladder':{cx:116,cy:487,w:200},
    'pancreas':        { cx:205, cy:535, w:210 },
    'duodenum':        { cx:165, cy:560, w:190 },
    'ileum-villi':     { cx:192, cy:650, w:220 },
    'colon':           { cx:182, cy:662, w:280 },
    'rectum-anus':     { cx:178, cy:772, w:170 }
  };

  var svg = null, layer = null, imgEl = null, maskRect = null, strip = null;
  var cur = { x:VIEW.x, y:VIEW.y, w:VIEW.w, h:VIEW.h };
  var anim = null, station = null, detail = null, detailCam = null, backRect = null;

  function frameFor(cam) {
    if (!cam) return { x:VIEW.x, y:VIEW.y, w:VIEW.w, h:VIEW.h };
    var w = cam.w, h = w * ASPECT;
    return { x:cam.cx - w / 2, y:cam.cy - h * 0.46, w:w, h:h };
  }
  function zoomOf(b) { return VIEW.w / b.w; }
  function setBox(b) {
    cur = b;
    if (!svg) return;
    svg.setAttribute('viewBox', b.x + ' ' + b.y + ' ' + b.w + ' ' + b.h);
    var z = zoomOf(b), zoomed = z > 1.25;
    svg.classList.toggle('is-zoomed', zoomed);
    var host = document.querySelector('.bodycol');
    if (host) host.classList.toggle('is-zoomed', zoomed);
    /* the detail fades in as the camera closes on the station's own frame:
       none at the whole-body view, fully on when it has arrived */
    var k = 0;
    if (detail && detailCam) {
      var span = VIEW.w - detailCam.w * 1.08;
      k = Math.max(0, Math.min(1, (VIEW.w - b.w) / span));
      k = k * k * (3 - 2 * k);
    }
    if (layer) layer.style.opacity = detail ? k : 0;
    svg.classList.toggle('has-detail', !!detail && k > 0.05);
    if (strip) strip.classList.toggle('is-on', !!detail && k > 0.6);
  }
  /* Tween the viewBox. A timer finishes the leg if requestAnimationFrame is
     starved (background tab), so the camera can never be left half way. */
  function flyTo(target, ms) {
    if (anim) { cancelAnimationFrame(anim.raf); clearTimeout(anim.timer); anim = null; }
    if (ms === 0 || prefersStill()) { setBox(target); return; }
    var from = cur, t0 = null, done = false;
    anim = {};
    function finish() { if (done) return; done = true; if (anim) { cancelAnimationFrame(anim.raf); clearTimeout(anim.timer); } anim = null; setBox(target); }
    function step(now) {
      if (done) return;
      if (t0 === null) t0 = now;
      var k = Math.min(1, (now - t0) / ms);
      var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setBox({ x:from.x + (target.x - from.x) * e, y:from.y + (target.y - from.y) * e,
               w:from.w + (target.w - from.w) * e, h:from.h + (target.h - from.h) * e });
      if (k < 1) anim.raf = requestAnimationFrame(step); else finish();
    }
    anim.raf = requestAnimationFrame(step);
    anim.timer = setTimeout(finish, ms + 120);
  }
  function prefersStill() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- the detail layer, drawn inside the plate ---------- */
  function build() {
    if (!svg) return;
    if (layer && layer.isConnected) return;
    layer = null;
    var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
    var filt = document.createElementNS(NS, 'filter');
    filt.setAttribute('id', 'detailSoft'); filt.setAttribute('x', '-20%'); filt.setAttribute('y', '-20%');
    filt.setAttribute('width', '140%'); filt.setAttribute('height', '140%');
    var blur = document.createElementNS(NS, 'feGaussianBlur'); blur.setAttribute('stdDeviation', '14');
    filt.appendChild(blur); defs.appendChild(filt);
    var mask = document.createElementNS(NS, 'mask'); mask.setAttribute('id', 'detailMask');
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    // Explicit region: the default is the current viewport +10%, which clips a zoomed camera at a hard edge.
    mask.setAttribute('x', '-4000'); mask.setAttribute('y', '-4000'); mask.setAttribute('width', '10000'); mask.setAttribute('height', '10000');
    maskRect = document.createElementNS(NS, 'rect');
    maskRect.setAttribute('fill', '#fff'); maskRect.setAttribute('rx', '22'); maskRect.setAttribute('filter', 'url(#detailSoft)');
    mask.appendChild(maskRect); defs.appendChild(mask);

    layer = document.createElementNS(NS, 'g');
    layer.setAttribute('class', 'detail');
    layer.style.opacity = 0;
    backRect = document.createElementNS(NS, 'rect');
    backRect.setAttribute('fill', '#FFFDF9'); backRect.setAttribute('mask', 'url(#detailMask)');
    layer.appendChild(backRect);
    imgEl = document.createElementNS(NS, 'image');
    imgEl.setAttribute('mask', 'url(#detailMask)');
    imgEl.setAttribute('preserveAspectRatio', 'none');
    layer.appendChild(imgEl);
    var hits = svg.querySelector('.hits');
    if (hits) svg.insertBefore(layer, hits); else svg.appendChild(layer);

    var wrap = svg.parentNode;
    strip = document.createElement('div');
    strip.className = 'detailstrip';
    wrap.appendChild(strip);
  }

  /* where the organ sits on the plate, in plate coordinates */
  function organBox(organ) {
    var inv = svg.getScreenCTM().inverse();
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, n = 0;
    Array.prototype.forEach.call(svg.querySelectorAll('.op[data-organ="' + organ + '"]'), function (p) {
      if (p.style.display === 'none') return;
      var r = p.getBoundingClientRect(); if (!r.width && !r.height) return;
      var a = pt(inv, r.left, r.top), b = pt(inv, r.right, r.bottom);
      x0 = Math.min(x0, a.x); y0 = Math.min(y0, a.y); x1 = Math.max(x1, b.x); y1 = Math.max(y1, b.y); n++;
    });
    if (!n) return null;
    return { x:x0, y:y0, w:x1 - x0, h:y1 - y0 };
  }
  function pt(m, x, y) { return { x:m.a * x + m.c * y + m.e, y:m.b * x + m.d * y + m.f }; }

  /* Register the illustration: the organ inside the picture (roi, in
     fractions of the picture) is scaled and moved onto the organ's outline on
     the plate. `box` can override the plate target when the plate's own paths
     are a poor guide (the rectum shares a path with the colon). */
  function place(d) {
    if (!d || !imgEl) return;
    if (!d.w) {                                   /* learn the picture's size first */
      var probe = new Image();
      probe.onload = function () { d.w = probe.naturalWidth; d.h = probe.naturalHeight; if (detail === d) place(d); };
      probe.src = 'assets/' + d.img;
      return;
    }
    var target = d.box ? { x:d.box[0], y:d.box[1], w:d.box[2], h:d.box[3] } : organBox(d.organ);
    if (!target) return;
    var roi = d.roi || [0, 0, 1, 1];
    var rw = roi[2] * d.w, rh = roi[3] * d.h;
    var s = Math.max(target.w / rw, target.h / rh) * (d.grow || 1);
    /* a side-view section of the head cannot register onto a front view; it
       is shown as a cut-away that fills its window, centred on the organ */
    if (d.window && d.cover) s = Math.max(s, d.window[2] / d.w, d.window[3] / d.h);
    if (d.scale) s = d.scale; // plate units per image pixel, when a station must zoom further than fit-to-organ
    var W = d.w * s, H = d.h * s;
    var x = target.x + target.w / 2 - (roi[0] * d.w + rw / 2) * s;
    var y = target.y + target.h / 2 - (roi[1] * d.h + rh / 2) * s;
    if (d.fixed) { s = d.fixed[2] / d.w; W = d.w * s; H = d.h * s; x = d.fixed[0]; y = d.fixed[1]; } // one placement shared by several stations, so the picture stays put while the camera moves
    imgEl.setAttribute('href', 'assets/' + d.img);
    imgEl.setAttribute('x', x); imgEl.setAttribute('y', y);
    imgEl.setAttribute('width', W); imgEl.setAttribute('height', H);
    backRect.setAttribute('x', x - 40); backRect.setAttribute('y', y - 40);
    backRect.setAttribute('width', W + 80); backRect.setAttribute('height', H + 80);
    /* the soft window: the organ's box, grown so the picture has room to breathe */
    var g = d.pad != null ? d.pad : 0.45;
    var mx = target.x - target.w * g, my = target.y - target.h * g;
    var mw = target.w * (1 + 2 * g), mh = target.h * (1 + 2 * g);
    if (d.window) { mx = d.window[0]; my = d.window[1]; mw = d.window[2]; mh = d.window[3]; }
    maskRect.setAttribute('x', mx); maskRect.setAttribute('y', my);
    maskRect.setAttribute('width', mw); maskRect.setAttribute('height', mh);
    strip.innerHTML = '<b>' + (d.label || '') + '</b>' + (d.credit ? '<span>' + d.credit + '</span>' : '');
  }

  /* ---------- station ---------- */
  function setStation(id, opts) {
    station = id;
    var quiet = opts && opts.tour;
    detail = (!quiet && (global.ZOOM_DETAIL || {})[id]) || null;
    var cam = (!quiet && CAM[detail ? detail.organ : id]) || null;
    detailCam = detail ? cam : null;
    if (detail) { if (!layer || !layer.isConnected) build(); place(detail); }
    else if (layer) layer.style.opacity = 0;
    flyTo(frameFor(cam), 800);
  }
  function reset() { detail = null; detailCam = null; if (layer) layer.style.opacity = 0; if (strip) strip.classList.remove('is-on'); flyTo(frameFor(null), 650); }
  function init(svgEl) { svg = svgEl; build(); setBox(frameFor(null)); global.addEventListener('resize', function () { if (detail) place(detail); }); }

  /* The plate is rebuilt from scratch by some controls (labels, beyond,
     reset). That wipes the detail layer, so it is put back here. */
  function refresh() { if (!svg) return; if (!layer || !layer.isConnected) build(); if (detail) place(detail); setBox(cur); }
  global.Zoom = { init:init, setStation:setStation, reset:reset, refresh:refresh, flyTo:flyTo, frameFor:frameFor, CAM:CAM,
                  bindLearn:function () {}, unbind:function () {}, update:function () {},
                  _state:function () { return { cur:cur, station:station, detail:detail && detail.img }; } };
})(window);
