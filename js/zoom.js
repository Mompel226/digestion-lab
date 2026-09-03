/* ============================================================
   zoom.js — the plate follows the text.

   When a station opens, the camera on the anatomical plate flies to the
   organ. As it arrives, a professional illustration of THAT organ fades in
   on the plate itself, registered over the organ's own outline — the way a
   3-D viewer swaps in a higher-detail model as you get closer. As the reader
   scrolls the Learn text, the illustration can give way to the next one (a
   real photograph of the teeth, say), fading out and in on the plate: the
   picture on the left is never static while the text on the right moves.

   Each step can carry its own labels (drawn by us, in plate coordinates, so
   the camera never cuts a word), a spotlight on the organ being read about,
   and an animation drawn on the illustration (plateanim.js). Nothing pops
   up over the page, and nothing shown here is repeated in the text on the
   right. "Whole body" pulls the camera back and the detail fades.

   The data — pictures, where their organs sit, labels, steps — is in
   js/data/zoom.js.
   ============================================================ */
(function (global) {
  'use strict';

  var VIEW = { x:-88, y:-12, w:530, h:848 };          /* the plate's home view */
  var ASPECT = VIEW.h / VIEW.w;
  var NS = 'http://www.w3.org/2000/svg', XL = 'http://www.w3.org/1999/xlink';
  /* camera frame per organ, in plate coordinates: centre and the width shown */
  var CAM = {
    'mouth':           { cx:132, cy:146, w:150 },
    'salivary-glands': { cx:146, cy:146, w:160 },
    'epiglottis':      { cx:152, cy:190, w:190 },
    'oesophagus':      { cx:178, cy:318, w:250 },
    'stomach':         { cx:238, cy:474, w:200 },
    'liver':           { cx:130, cy:466, w:220 },
    'gall-bladder':    { cx:116, cy:487, w:200 },
    'pancreas':        { cx:205, cy:535, w:210 },
    'duodenum':        { cx:165, cy:560, w:190 },
    'ileum-villi':     { cx:192, cy:660, w:300 },
    'colon':           { cx:182, cy:662, w:280 },
    'rectum-anus':     { cx:178, cy:772, w:170 }
  };
  /* the organ shapes inside the biliary plate, found by their fill colour */
  var SPOT_FILLS = { liver:['#967348', '#c58c55'], 'gall-bladder':['#d1e8c5'], pancreas:['#e89e55'],
                     duodenum:['#f69799', '#facccc', '#f7c5b5', '#f16668'] };
  var SPOT_SRC = 'assets/photos/biliary-system-plain2.svg';

  var svg = null, layer = null, maskRect = null, strip = null, backRect = null;
  var keyImg = null, keyImgFront = null, keyWrap = null, keyCache = {};
  var gImgs = null, dimRect = null, spotImg = null, spotClip = null, spotLine = null, gAnim = null, gLabels = null, gInsets = null, softBlur = null;
  var cur = { x:VIEW.x, y:VIEW.y, w:VIEW.w, h:VIEW.h };
  var anim = null, station = null, detail = null, detailCam = null;
  var steps = [], stepIdx = -1, fade = 1, fadeTimer = null, lis = null, bound = false;
  var SPOT = null, spotLoading = false, hidden = [];

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
    if (layer) layer.style.opacity = detail ? k * fade : 0;
    svg.classList.toggle('has-detail', !!detail && k > 0.05);
    if (strip) strip.classList.toggle('is-on', !!detail && k > 0.6 && fade > 0);
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
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function build() {
    if (!svg) return;
    if (layer && layer.isConnected) return;
    layer = null;
    var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
    var filt = el('filter', { id:'detailSoft', x:'-20%', y:'-20%', width:'140%', height:'140%' }, defs);
    softBlur = el('feGaussianBlur', { stdDeviation:'14' }, filt);
    var sh = el('filter', { id:'insetShadow', x:'-20%', y:'-20%', width:'140%', height:'150%' }, defs);
    el('feDropShadow', { dx:'0', dy:'1.2', stdDeviation:'1.6', 'flood-color':'#3a2e1c', 'flood-opacity':'.35' }, sh);
    /* explicit region: the default is the current viewport +10%, which clips a zoomed camera at a hard edge */
    var mask = el('mask', { id:'detailMask', maskUnits:'userSpaceOnUse', x:'-4000', y:'-4000', width:'10000', height:'10000' }, defs);
    maskRect = el('rect', { fill:'#fff', rx:'22', filter:'url(#detailSoft)' }, mask);
    spotClip = el('clipPath', { id:'detailSpot', clipPathUnits:'userSpaceOnUse' }, defs);

    layer = el('g', { 'class':'detail' });
    layer.style.opacity = 0;
    backRect = el('rect', { fill:'#FFFDF9', mask:'url(#detailMask)' }, layer);
    gImgs = el('g', { 'class':'detail__imgs', mask:'url(#detailMask)' }, layer);
    dimRect = el('rect', { fill:'#FFFDF9', opacity:'.66', mask:'url(#detailMask)', width:'0', height:'0' }, layer);
    var km = el('mask', { id:'detailKey', maskUnits:'userSpaceOnUse', maskContentUnits:'userSpaceOnUse', x:'-4000', y:'-4000', width:'10000', height:'10000' }, defs);
    keyImg = el('image', { preserveAspectRatio:'none', width:'0', height:'0' }, km);
    var glow = el('filter', { id:'spotGlow', x:'-20%', y:'-20%', width:'140%', height:'140%' }, defs);
    el('feDropShadow', { dx:'0', dy:'0', stdDeviation:'1.6', 'flood-color':'#E8A33D', 'flood-opacity':'.95' }, glow);
    spotImg = el('image', { 'clip-path':'url(#detailSpot)', mask:'url(#detailMask)', preserveAspectRatio:'none', width:'0', height:'0' }, layer);
    keyWrap = el('g', { filter:'url(#spotGlow)' }, layer);
    keyImgFront = el('image', { mask:'url(#detailKey)', preserveAspectRatio:'none', width:'0', height:'0' }, keyWrap);
    spotLine = el('g', { 'class':'detail__spot', fill:'none', stroke:'#D9962B', 'stroke-linejoin':'round', opacity:'.9' }, layer);
    gAnim = el('g', { 'class':'detail__anim' }, layer);
    gLabels = el('g', { 'class':'detail__labels' }, layer);
    gInsets = el('g', { 'class':'detail__insets' }, layer);
    var hits = svg.querySelector('.hits');
    if (hits) svg.insertBefore(layer, hits.nextSibling); else svg.appendChild(layer);

    var wrap = svg.parentNode;
    if (!strip || !strip.isConnected) {
      strip = wrap.querySelector('.detailstrip') || document.createElement('div');
      strip.className = 'detailstrip';
      if (!strip.isConnected) wrap.appendChild(strip);
    }
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
  /* the organ's own outline on the plate, sampled every `step` units along its longest path */
  function outlineFor(organ, step) {
    var root = svg.getScreenCTM().inverse(), best = null, bestLen = 0;
    Array.prototype.forEach.call(svg.querySelectorAll('.art .op[data-organ="' + organ + '"]'), function (p) {
      if (p.tagName !== 'path') return;
      var L = p.getTotalLength(); if (L > bestLen) { bestLen = L; best = p; }
    });
    if (!best) return [];
    var m = best.getScreenCTM(), out = [];
    for (var s = 0; s < bestLen; s += (step || 2)) {
      var q = best.getPointAtLength(s), sx = m.a * q.x + m.c * q.y + m.e, sy = m.b * q.x + m.d * q.y + m.f;
      out.push([root.a * sx + root.c * sy + root.e, root.b * sx + root.d * sy + root.f]);
    }
    return out;
  }
  /* outline points of every path of an organ whose box lies inside `box` [x0,y0,x1,y1] */
  function outlineIn(organ, box, step) {
    var root = svg.getScreenCTM().inverse(), out = [];
    Array.prototype.forEach.call(svg.querySelectorAll('.art .op[data-organ="' + organ + '"]'), function (p) {
      if (p.tagName !== 'path') return;
      /* a path the step has hidden has no layout box (its rect collapses to the screen origin), so it
         is shown for the measurement and hidden again — the outline is wanted precisely when the
         plate's own drawing is hidden and redrawn */
      var wasHidden = p.style.display === 'none';
      if (wasHidden) p.style.display = '';
      var r = p.getBoundingClientRect(), a = pt(root, r.left, r.top), b = pt(root, r.right, r.bottom);
      var inside = !(a.x < box[0] - 2 || a.y < box[1] - 2 || b.x > box[2] + 2 || b.y > box[3] + 2);
      if (inside) {
        var L = p.getTotalLength(), m = p.getScreenCTM();
        for (var s = 0; s < L; s += (step || 2)) { var q = p.getPointAtLength(s), sx = m.a * q.x + m.c * q.y + m.e, sy = m.b * q.x + m.d * q.y + m.f; out.push([root.a * sx + root.c * sy + root.e, root.b * sx + root.d * sy + root.f]); }
      }
      if (wasHidden) p.style.display = 'none';
    });
    return out;
  }
  /* is this plate point inside the organ's own artwork? (the plate's paths carry transforms, so
     the test goes plate -> screen -> each path's local space) */
  function inFillFor(organ) {
    var root = svg.getScreenCTM();
    var paths = Array.prototype.filter.call(svg.querySelectorAll('.art .op[data-organ="' + organ + '"]'), function (p) { return p.tagName === 'path' && p.style.display !== 'none'; });
    var inv = paths.map(function (p) { return p.getScreenCTM().inverse(); });
    var P = svg.createSVGPoint();
    return function (x, y) {
      var sx = root.a * x + root.c * y + root.e, sy = root.b * x + root.d * y + root.f;
      for (var i = 0; i < paths.length; i++) { P.x = sx; P.y = sy; if (paths[i].isPointInFill(P.matrixTransform(inv[i]))) return true; }
      return false;
    };
  }
  /* screen pixels per plate unit at a camera frame — so a label can be given
     a size in pixels and drawn in units */
  function ppu(frame) {
    var r = svg.getBoundingClientRect();
    return Math.min(r.width / frame.w, r.height / frame.h) || 1;
  }

  /* Register one picture: the organ inside it (roi, in fractions of the
     picture) is scaled and moved onto the organ's box on the plate. Options:
     cover — scale up until the picture fills its window; scale — plate
     units per pixel; fixed — an explicit placement [x, y, width] shared by
     several stations so the picture stays put while the camera moves. */
  function placeImage(d, target, frame) {
    var roi = d.roi || [0, 0, 1, 1];
    var rw = roi[2] * d.w, rh = roi[3] * d.h;
    var s = Math.max(target.w / rw, target.h / rh) * (d.grow || 1);
    if (d.window && d.cover) s = Math.max(s, d.window[2] / d.w, d.window[3] / d.h);
    if (d.scale) s = d.scale;
    var W = d.w * s, H = d.h * s;
    var x = target.x + target.w / 2 - (roi[0] * d.w + rw / 2) * s;
    var y = target.y + target.h / 2 - (roi[1] * d.h + rh / 2) * s;
    /* fit: the whole picture inside its window, centred — for a plate whose printed labels must all stay in frame */
    if (d.window && d.fit) { s = Math.min(d.window[2] / d.w, d.window[3] / d.h); W = d.w * s; H = d.h * s; x = d.window[0] + (d.window[2] - W) / 2; y = d.window[1] + (d.window[3] - H) / 2; }
    if (d.fixed) { s = d.fixed[2] / d.w; W = d.w * s; H = d.h * s; x = d.fixed[0]; y = d.fixed[1]; }
    return { x:x, y:y, W:W, H:H, s:s };
  }
  function probe(d, s) {
    if (d._probing) return;
    d._probing = true;
    var im = new Image();
    im.onload = function () { d.w = im.naturalWidth; d.h = im.naturalHeight; d._probing = false; if (steps[stepIdx] === s) applyStep(s); };
    im.src = 'assets/' + d.img;
  }
  function f1(v) { return (+v).toFixed(1); }

  /* a label: text with a halo, a leader line and a dot on the feature.
     `at` is the feature in fractions of the picture (or plate units with
     plate:true); `tx` the text position in the same terms; else dx/dy in
     ems from the feature. Labels the camera would cut are not drawn. */
  function drawLabel(L, pl, fs, frame) {
    var ax = null, ay = null, tx, ty, caption = !L.at;     /* no feature: a caption, text only */
    if (caption) { if (!L.plate && !pl) return; }
    else if (L.plate) { ax = L.at[0]; ay = L.at[1]; }
    else { if (!pl) return; ax = pl.x + L.at[0] * pl.W; ay = pl.y + L.at[1] * pl.H; }
    if (L.tx) { if (L.plate) { tx = L.tx[0]; ty = L.tx[1]; } else { tx = pl.x + L.tx[0] * pl.W; ty = pl.y + L.tx[1] * pl.H; } }
    else { tx = ax + (L.dx || 1.2) * fs; ty = ay + (L.dy || 0) * fs; }
    var anchor = L.anchor || (tx < ax ? 'end' : 'start');
    var lines = String(L.t).split('\n');
    var wmax = 0; lines.forEach(function (l) { wmax = Math.max(wmax, l.length); });
    var tw = wmax * fs * 0.52, x0 = anchor === 'end' ? tx - tw : anchor === 'middle' ? tx - tw / 2 : tx;
    if (frame && (x0 < frame.x - fs || x0 + tw > frame.x + frame.w + fs || ty - fs > frame.y + frame.h || ty < frame.y)) return;
    /* the leader leaves the text box at the point nearest the feature */
    var yTop = ty - fs * 0.85, yBot = ty + (lines.length - 1) * fs * 1.15 + fs * 0.25;
    var sx = Math.max(x0, Math.min(x0 + tw, ax)), sy = Math.max(yTop, Math.min(yBot, ay));
    if (sx === x0) sx -= fs * 0.25; else if (sx === x0 + tw) sx += fs * 0.25;
    if (sy === yTop) sy -= fs * 0.15; else if (sy === yBot) sy += fs * 0.15;
    if (!caption) {
      el('line', { 'class':'dl__l', x1:f1(sx), y1:f1(sy), x2:f1(ax), y2:f1(ay), 'stroke-width':f1(fs * 0.09) }, gLabels);
      el('circle', { 'class':'dl__d', cx:f1(ax), cy:f1(ay), r:f1(fs * 0.22), 'stroke-width':f1(fs * 0.08) }, gLabels);
    }
    var t = el('text', { 'class':'dl__t', x:f1(tx), y:f1(ty), 'font-size':f1(fs), 'text-anchor':anchor }, gLabels);
    lines.forEach(function (l, i) {
      var ts = el('tspan', { x:f1(tx), dy:i ? '1.15em' : '0' }, t);
      ts.textContent = l;
    });
  }

  /* ---------- the spotlight: the organ being read about, in full colour ---------- */
  function loadSpot(cb) {
    if (SPOT) { cb(); return; }
    if (spotLoading) return;
    spotLoading = true;
    fetch(SPOT_SRC).then(function (r) { return r.text(); }).then(function (txt) {
      var doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      var root = document.importNode(doc.documentElement, true);
      root.style.position = 'absolute'; root.style.left = '-9999px'; root.style.top = '0'; root.style.visibility = 'hidden';
      document.body.appendChild(root);
      var found = {};
      Object.keys(SPOT_FILLS).forEach(function (key) {
        found[key] = [];
        Array.prototype.forEach.call(root.querySelectorAll('path'), function (p) {
          var st = p.getAttribute('style') || '', fill = (st.match(/fill:([^;]+)/) || [])[1] || p.getAttribute('fill') || '';
          if (SPOT_FILLS[key].indexOf(fill.trim().toLowerCase()) < 0) return;
          var m = p.getCTM(); if (!m) return;
          found[key].push({ d:p.getAttribute('d'), m:[m.a, m.b, m.c, m.d, m.e, m.f] });
        });
      });
      root.remove();
      SPOT = found; spotLoading = false; cb();
    }).catch(function () { spotLoading = false; });
  }
  function spot(key, pl, win) {
    if (!SPOT) { loadSpot(function () { if (steps[stepIdx] && steps[stepIdx].spot === key) applyStep(steps[stepIdx]); }); return; }
    var shapes = SPOT[key] || [];
    if (!shapes.length) return;
    var s = pl.s;
    shapes.forEach(function (sh) {
      var m = sh.m, T = 'matrix(' + [s * m[0], s * m[1], s * m[2], s * m[3], s * m[4] + pl.x, s * m[5] + pl.y].map(function (v) { return v.toFixed(4); }).join(',') + ')';
      el('path', { d:sh.d, transform:T }, spotClip);
      el('path', { d:sh.d, transform:T, 'stroke-width':f1(5 / s), stroke:'#F3D9A0', opacity:'.7' }, spotLine);
      el('path', { d:sh.d, transform:T, 'stroke-width':f1(1.8 / s) }, spotLine);
    });
    dimRect.setAttribute('x', win[0]); dimRect.setAttribute('y', win[1]);
    dimRect.setAttribute('width', win[2]); dimRect.setAttribute('height', win[3]);
    spotImg.setAttribute('href', spotImg._href); spotImg.setAttributeNS(XL, 'xlink:href', spotImg._href);
    spotImg.setAttribute('x', pl.x); spotImg.setAttribute('y', pl.y);
    spotImg.setAttribute('width', pl.W); spotImg.setAttribute('height', pl.H);
  }

  /* The organ's pixels, picked out by colour (hue/saturation/value ranges in
     0..1), become a mask: the picture is dimmed and the organ shown again in
     full colour on top with a soft gold edge. Masks are cached per key. */
  function spotByColour(key, p, win, s) {
    var src = 'assets/' + p.d.img, id = src + '|' + JSON.stringify(key);
    function apply(url) {
      keyImg.setAttribute('href', url); keyImg.setAttributeNS(XL, 'xlink:href', url);
      [keyImg, keyImgFront].forEach(function (im) { im.setAttribute('x', p.pl.x); im.setAttribute('y', p.pl.y); im.setAttribute('width', p.pl.W); im.setAttribute('height', p.pl.H); });
      keyImgFront.setAttribute('href', src); keyImgFront.setAttributeNS(XL, 'xlink:href', src);
      dimRect.setAttribute('x', win[0]); dimRect.setAttribute('y', win[1]); dimRect.setAttribute('width', win[2]); dimRect.setAttribute('height', win[3]);
    }
    if (keyCache[id]) { apply(keyCache[id]); return; }
    var im = new Image();
    im.onload = function () {
      var W = Math.min(480, im.naturalWidth), H = Math.round(im.naturalHeight * W / im.naturalWidth);
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var g = c.getContext('2d'); g.drawImage(im, 0, 0, W, H);
      var d = g.getImageData(0, 0, W, H), px = d.data, out = g.createImageData(W, H), o = out.data;
      for (var i = 0; i < px.length; i += 4) {
        var r = px[i] / 255, gg = px[i + 1] / 255, b = px[i + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), v = mx, sat = mx ? (mx - mn) / mx : 0, h = 0;
        if (mx !== mn) { if (mx === r) h = ((gg - b) / (mx - mn) + 6) % 6; else if (mx === gg) h = (b - r) / (mx - mn) + 2; else h = (r - gg) / (mx - mn) + 4; h /= 6; }
        var hit = key.h.some(function (rng) { return h >= rng[0] && h <= rng[1]; }) && sat >= key.s[0] && sat <= key.s[1] && v >= key.v[0] && v <= key.v[1];
        var val = hit ? 255 : 0; o[i] = val; o[i + 1] = val; o[i + 2] = val; o[i + 3] = 255;
      }
      /* fill pinholes and soften: a blur pass, then a threshold */
      g.putImageData(out, 0, 0);
      var c2 = document.createElement('canvas'); c2.width = W; c2.height = H; var g2 = c2.getContext('2d');
      g2.filter = 'blur(2px)'; g2.drawImage(c, 0, 0); g2.filter = 'none';
      var d2 = g2.getImageData(0, 0, W, H), q = d2.data;
      for (var j = 0; j < q.length; j += 4) { var t = q[j] > 110 ? 255 : 0; q[j] = t; q[j + 1] = t; q[j + 2] = t; q[j + 3] = 255; }
      g2.putImageData(d2, 0, 0);
      var c3 = document.createElement('canvas'); c3.width = W; c3.height = H; var g3 = c3.getContext('2d'); g3.filter = 'blur(1px)'; g3.drawImage(c2, 0, 0);
      var url = c3.toDataURL('image/png'); keyCache[id] = url;
      if (steps[stepIdx] === s) apply(url);
    };
    im.src = src;
  }

  /* ---------- one step: pictures, window, labels, spotlight, animation ---------- */
  function applyStep(s) {
    if (!s || !layer) return;
    gImgs.innerHTML = ''; gAnim.innerHTML = ''; gLabels.innerHTML = ''; gInsets.innerHTML = ''; spotClip.innerHTML = ''; spotLine.innerHTML = '';
    dimRect.setAttribute('width', 0); spotImg.setAttribute('width', 0); spotImg.removeAttribute('href');
    keyImgFront.setAttribute('width', 0); keyImgFront.removeAttribute('href'); keyImg.setAttribute('width', 0);
    /* organs the step covers with its own picture are hidden, so nothing shows twice */
    hidden.forEach(function (p) { p.style.display = ''; }); hidden = [];
    (s.hide || []).forEach(function (h) {
      var organ = typeof h === 'string' ? h : h.organ, keep = typeof h === 'string' ? null : h.except, within = typeof h === 'string' ? null : h.within, inv = svg.getScreenCTM().inverse();
      var sel = organ ? '.art .op[data-organ="' + organ + '"]' : '.art path';
      Array.prototype.forEach.call(svg.querySelectorAll(sel), function (p) {
        var r = p.getBoundingClientRect(), a = pt(inv, r.left, r.top), b = pt(inv, r.right, r.bottom);
        if (keep && a.x >= keep[0] - 2 && a.y >= keep[1] - 2 && b.x <= keep[2] + 2 && b.y <= keep[3] + 2) return;
        if (within && !(a.x >= within[0] - 1 && a.y >= within[1] - 1 && b.x <= within[2] + 1 && b.y <= within[3] + 1)) return;
        if (h.fill && getComputedStyle(p).fill.indexOf(h.fill) < 0) return;
        p.style.display = 'none'; hidden.push(p);
      });
    });
    svg.classList.toggle('keep-organ', !!s.keep);
    var frame = frameFor(detailCam || CAM[detail.organ]);
    var fs = (s.px || 12.5) / ppu(frame);
    var target = s.box ? { x:s.box[0], y:s.box[1], w:s.box[2], h:s.box[3] } : organBox(detail.organ);
    if (!target) target = { x:frame.x + frame.w * 0.35, y:frame.y + frame.h * 0.4, w:frame.w * 0.3, h:frame.w * 0.3 };

    var specs = s.imgs || (s.img ? [s] : []);
    var placed = [], bounds = null, pending = false;
    specs.forEach(function (d) {
      if (!d.w) { probe(d, s); pending = true; return; }
      var pl = placeImage(d, target, frame);
      var im = el('image', { href:'assets/' + d.img, x:f1(pl.x), y:f1(pl.y), width:f1(pl.W), height:f1(pl.H), preserveAspectRatio:'none' }, gImgs);
      im.setAttributeNS(XL, 'xlink:href', 'assets/' + d.img);
      placed.push({ d:d, pl:pl });
      bounds = bounds ? { x:Math.min(bounds.x, pl.x), y:Math.min(bounds.y, pl.y), x1:Math.max(bounds.x1, pl.x + pl.W), y1:Math.max(bounds.y1, pl.y + pl.H) }
                      : { x:pl.x, y:pl.y, x1:pl.x + pl.W, y1:pl.y + pl.H };
    });
    /* painted organs: the plate's own paths, cloned and recoloured */
    (s.paint || []).forEach(function (pp) {
      var list = Array.prototype.filter.call(svg.querySelectorAll('.art .op[data-organ="' + pp.organ + '"]'), function (path) { return path.tagName === 'path' && path.style.display !== 'none'; });
      if (pp.only) { var inv = svg.getScreenCTM().inverse(); list = list.filter(function (path) { var r = path.getBoundingClientRect(); var q1 = pt(inv, r.left, r.top), q2 = pt(inv, r.right, r.bottom); return q1.x >= pp.only[0] - 2 && q1.y >= pp.only[1] - 2 && q2.x <= pp.only[2] + 2 && q2.y <= pp.only[3] + 2; }); }
      if (pp.largest) { var best = null, ba = 0; list.forEach(function (path) { var r = path.getBoundingClientRect(), ar = r.width * r.height; if (ar > ba) { ba = ar; best = path; } }); list = best ? [best] : []; }
      list.forEach(function (path) {
        /* the path in plate units: screen matrix of the path, then back through the plate's own screen matrix
           (getCTM alone includes the viewport scaling in some browsers, so a clone drifts with the window size) */
        var m = svg.getScreenCTM().inverse().multiply(path.getScreenCTM()); if (!m) return;
        var g = el('g', { transform:'matrix(' + [m.a, m.b, m.c, m.d, m.e, m.f].map(function (v) { return v.toFixed(4); }).join(',') + ')' }, gImgs);
        var c = el('path', { d:path.getAttribute('d'), fill:pp.fill || '#ccc', stroke:pp.stroke || 'none', 'stroke-width':pp.sw != null ? pp.sw : 1.2, 'stroke-linejoin':'round', opacity:pp.opacity != null ? pp.opacity : 1 }, g);
        if (pp.dash) c.setAttribute('stroke-dasharray', pp.dash);
      });
    });
    /* the soft window */
    var win;
    if (s.window) win = s.window;
    else if (s.crop && placed[0]) { var cp = placed[0].pl, cr = s.crop; win = [cp.x + cr[0] * cp.W, cp.y + cr[1] * cp.H, (cr[2] - cr[0]) * cp.W, (cr[3] - cr[1]) * cp.H]; }
    else if (s.full && bounds) win = [bounds.x - 18, bounds.y - 18, bounds.x1 - bounds.x + 36, bounds.y1 - bounds.y + 36];
    else { var g = s.pad != null ? s.pad : 0.45; win = [target.x - target.w * g, target.y - target.h * g, target.w * (1 + 2 * g), target.h * (1 + 2 * g)]; }
    /* a soft edge is for a cut-away; a whole plate with printed labels is shown crisp, the fade falling on its white margin */
    softBlur.setAttribute('stdDeviation', s.soft != null ? s.soft : (s.full ? 5 : 14));
    maskRect.setAttribute('x', win[0]); maskRect.setAttribute('y', win[1]); maskRect.setAttribute('width', win[2]); maskRect.setAttribute('height', win[3]);
    if (s.paint && !specs.length) win = [frame.x - 50, frame.y - 50, frame.w + 100, frame.h + 100];
    var back = s.noback || !specs.length ? [0, 0, 0, 0] : [win[0] - 30, win[1] - 30, win[2] + 60, win[3] + 60];
    backRect.setAttribute('x', back[0]); backRect.setAttribute('y', back[1]); backRect.setAttribute('width', back[2]); backRect.setAttribute('height', back[3]);

    /* labels: each picture's own, then the step's */
    placed.forEach(function (p) { (p.d.labels || []).forEach(function (L) { drawLabel(L, p.pl, fs, frame); }); });
    if (!s.img) (s.labels || []).forEach(function (L) { drawLabel(L, placed[0] ? placed[0].pl : null, fs, frame); }); /* a single-picture step already drew its own */

    if (s.spot && placed[0]) { spotImg._href = 'assets/' + placed[0].d.img; spot(s.spot, placed[0].pl, win); }
    if (s.spotKey && placed[0]) spotByColour(s.spotKey, placed[0], win, s);
    /* insets: small crisp photographs in a frame, on top of the illustration, never faded */
    (s.insets || []).forEach(function (ins) {
      if (!ins.w) { probe(ins, s); pending = true; return; }
      var x = ins.at[0], y = ins.at[1], w = ins.at[2], h = w * ins.h / ins.w;
      var g = el('g', { 'class':'inset' }, gInsets);
      el('rect', { x:f1(x - 1.6), y:f1(y - 1.6), width:f1(w + 3.2), height:f1(h + 3.2), rx:'2.4', fill:'#FFFDF9', stroke:'#B9AE9B', 'stroke-width':'.5', filter:'url(#insetShadow)' }, g);
      var im = el('image', { href:'assets/' + ins.img, x:f1(x), y:f1(y), width:f1(w), height:f1(h), preserveAspectRatio:'none' }, g);
      im.setAttributeNS(XL, 'xlink:href', 'assets/' + ins.img);
      var ipl = { x:x, y:y, W:w, H:h };
      var keep = gLabels; gLabels = g;
      (ins.labels || []).forEach(function (L) { drawLabel(L, ipl, fs * (ins.fs || 0.92), null); });
      gLabels = keep;
      if (ins.cap) {
        var capLines = String(ins.cap).split('\n').length;
        var cy0 = ins.capTop ? y - fs * 0.55 - (capLines - 1) * fs * 0.88 * 1.15 : y + h + fs * 1.15;   /* above the picture when asked */
        var t = el('text', { 'class':'dl__t', x:f1(x + w / 2), y:f1(cy0), 'font-size':f1(fs * 0.88), 'text-anchor':'middle' }, g);
        String(ins.cap).split('\n').forEach(function (l, i) { var ts = el('tspan', { x:f1(x + w / 2), dy:i ? '1.15em' : '0' }, t); ts.textContent = l; });
      }
      var capText = String(ins.cap || s.label || '').replace(/\n/g, ' ');
      g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
      var badge = el('g', { 'class':'inset__zoom', transform:'translate(' + f1(x + w - fs * 0.9) + ',' + f1(y + fs * 0.9) + ')' }, g);
      el('circle', { r:f1(fs * 0.62), fill:'#FFFDF9', stroke:'#B9AE9B', 'stroke-width':'.4' }, badge);
      var bt = el('text', { 'class':'dl__t', 'font-size':f1(fs * 0.78), 'text-anchor':'middle', y:f1(fs * 0.28) }, badge); bt.textContent = '⤢';
      g.addEventListener('click', function (ev) { ev.stopPropagation(); if (typeof global.LabLightbox === 'function') global.LabLightbox('assets/' + ins.img, capText, 'Photograph'); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); g.dispatchEvent(new MouseEvent('click')); } });
      if (ins.link) {
        var tgt = placed[0] ? placed[0].pl : (s.animBox ? { x:s.animBox[0], y:s.animBox[1], W:s.animBox[2], H:s.animBox[3] } : null);
        if (tgt) {
          var lk = ins.link, bx = x + lk[0] * w, by = y + lk[1] * h, bw = (lk[2] - lk[0]) * w, bh = (lk[3] - lk[1]) * h;
          var zg = el('g', { 'class':'dl__zoom' }, g);
          el('rect', { x:f1(bx), y:f1(by), width:f1(bw), height:f1(bh), fill:'none', 'stroke-width':f1(fs * 0.14) }, zg);
          var horizontal = Math.abs((x + w / 2) - (tgt.x + tgt.W / 2)) > Math.abs((y + h / 2) - (tgt.y + tgt.H / 2));
          var c1, c2, t1, t2, cl = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
          if (horizontal) {
            var ex = x + w / 2 < tgt.x + tgt.W / 2 ? tgt.x : tgt.x + tgt.W, sxx = ex === tgt.x ? bx + bw : bx;
            c1 = [sxx, by]; c2 = [sxx, by + bh]; t1 = [ex, cl(by, tgt.y, tgt.y + tgt.H)]; t2 = [ex, cl(by + bh, tgt.y, tgt.y + tgt.H)];
          } else {
            var ey = y + h / 2 < tgt.y + tgt.H / 2 ? tgt.y : tgt.y + tgt.H, syy = ey === tgt.y ? by + bh : by;
            c1 = [bx, syy]; c2 = [bx + bw, syy]; t1 = [cl(bx, tgt.x, tgt.x + tgt.W), ey]; t2 = [cl(bx + bw, tgt.x, tgt.x + tgt.W), ey];
          }
          el('line', { x1:f1(c1[0]), y1:f1(c1[1]), x2:f1(t1[0]), y2:f1(t1[1]), 'stroke-width':f1(fs * 0.1) }, zg);
          el('line', { x1:f1(c2[0]), y1:f1(c2[1]), x2:f1(t2[0]), y2:f1(t2[1]), 'stroke-width':f1(fs * 0.1) }, zg);
          el('rect', { x:f1(tgt.x), y:f1(tgt.y), width:f1(tgt.W), height:f1(tgt.H), fill:'none', 'stroke-width':f1(fs * 0.12) }, zg);
        }
      }
      if (ins.to && placed[0]) {
        var ax = placed[0].pl.x + ins.to[0] * placed[0].pl.W, ay = placed[0].pl.y + ins.to[1] * placed[0].pl.H;
        var sx = ax < x ? x - 2 : x + w + 2, sy = y + h / 2;
        el('line', { 'class':'dl__l', x1:f1(sx), y1:f1(sy), x2:f1(ax), y2:f1(ay), 'stroke-width':f1(fs * 0.09) }, g);
        el('circle', { 'class':'dl__d', cx:f1(ax), cy:f1(ay), r:f1(fs * 0.22), 'stroke-width':f1(fs * 0.08) }, g);
      }
    });
    if (s.anim && global.PlateAnim && global.PlateAnim[s.anim] && !prefersStill()) {
      var ab = s.animBox ? { x:s.animBox[0], y:s.animBox[1], w:s.animBox[2], h:s.animBox[3] } : target;
      var r = svg.getBoundingClientRect();
      gAnim.innerHTML = global.PlateAnim[s.anim]({ box:ab, img:placed[0] ? placed[0].pl : null, fs:fs, u:frame.w / 200, compact:ppu(frame) < 1.6, inFill:inFillFor, outline:outlineFor, outlineIn:outlineIn, focus:s.focus || detail.organ });
    }
    strip.innerHTML = '<b>' + (s.label || '') + '</b>' + (s.credit ? '<span>' + s.credit + '</span>' : '');
    if (pending) return;
  }

  /* ---------- steps follow the reading position ---------- */
  function readingLine() {
    var panel = document.getElementById('panel');
    var pr = panel.getBoundingClientRect();
    var bc = document.querySelector('.bodycol'), bcr = bc ? bc.getBoundingClientRect() : { bottom:0 };
    /* stacked (phone) layout: the sticky plate covers the top of the panel */
    var stacked = global.matchMedia && global.matchMedia('(max-width:1000px)').matches;
    var top = Math.max(pr.top, stacked ? bcr.bottom : 0, 0), bottom = Math.min(pr.bottom, global.innerHeight);
    return top + Math.max(0, bottom - top) * 0.3;
  }
  function pickStep() {
    if (steps.length < 2) return 0;
    if (!lis || !lis.length) return Math.max(0, stepIdx);
    var line = readingLine(), idx = -1, frac = 0;
    for (var i = 0; i < lis.length; i++) {
      var r = lis[i].getBoundingClientRect();
      if (r.top <= line) { idx = i; frac = r.height ? (line - r.top) / r.height : 0; } else break;
    }
    var best = 0;
    steps.forEach(function (s, j) { var at = s.at || 0, sub = s.sub || 0; if (at < idx || (at === idx && sub <= frac)) best = j; });
    return best;
  }
  function goStep(j, now) {
    stepIdx = j;
    var s = steps[j];
    var cam = s.cam || CAM[detail.organ];
    if (cam !== detailCam) { detailCam = cam; if (!now) flyTo(frameFor(cam), 700); }
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    if (now) { applyStep(s); fade = 1; setBox(cur); return; }
    fade = 0; setBox(cur);
    fadeTimer = setTimeout(function () { fadeTimer = null; applyStep(s); fade = 1; setBox(cur); }, 300);
  }
  function update() {
    if (!detail) return;
    var j = pickStep();
    if (j !== stepIdx) goStep(j, stepIdx < 0);
  }
  function onScroll() { update(); }
  function bindLearn(pane) {
    lis = pane ? pane.querySelectorAll('.exam-list > li') : null;
    if (!bound) {
      bound = true;
      var p = document.getElementById('panel'), st = document.querySelector('.stage');
      if (p) p.addEventListener('scroll', onScroll, { passive:true });
      if (st) st.addEventListener('scroll', onScroll, { passive:true });
      global.addEventListener('scroll', onScroll, { passive:true });
    }
    update();
    setTimeout(update, 60);                     /* once layout has settled */
  }
  function unbind() { lis = null; }

  /* ---------- station ---------- */
  function setStation(id, opts) {
    station = id;
    var quiet = opts && opts.tour;
    detail = (!quiet && (global.ZOOM_DETAIL || {})[id]) || null;
    var cam = (!quiet && CAM[detail ? detail.organ : id]) || null;
    detailCam = detail ? cam : null;
    steps = detail ? (detail.steps || [detail]) : [];
    stepIdx = -1; lis = null;
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    hidden.forEach(function (p) { p.style.display = ''; }); hidden = [];
    if (detail) { if (!layer || !layer.isConnected) build(); goStep(0, true); }
    else if (layer) { fade = 1; layer.style.opacity = 0; svg.classList.remove('keep-organ'); }
    flyTo(frameFor(detailCam || cam), 800);
  }
  function reset() { if (svg) svg.classList.remove('keep-organ'); detail = null; detailCam = null; steps = []; stepIdx = -1; hidden.forEach(function (p) { p.style.display = ''; }); hidden = []; if (layer) layer.style.opacity = 0; if (strip) strip.classList.remove('is-on'); flyTo(frameFor(null), 650); }
  function init(svgEl) {
    svg = svgEl; build(); setBox(frameFor(null));
    global.addEventListener('resize', function () { if (detail && steps[stepIdx]) applyStep(steps[stepIdx]); });
  }
  /* The plate is rebuilt from scratch by some controls (labels, beyond,
     reset). That wipes the detail layer, so it is put back here. */
  function refresh() { if (!svg) return; if (!layer || !layer.isConnected) build(); if (detail && steps[stepIdx]) applyStep(steps[stepIdx]); setBox(cur); }
  global.Zoom = { init:init, setStation:setStation, reset:reset, refresh:refresh, flyTo:flyTo, frameFor:frameFor, CAM:CAM,
                  bindLearn:bindLearn, unbind:unbind, update:update, _spot:function () { return SPOT; },
                  _state:function () { return { cur:cur, station:station, step:stepIdx, steps:steps.length, detail:detail && (steps[stepIdx] || {}).img }; } };
})(window);
