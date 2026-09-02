/* ============================================================
   zoom.js — the plate follows the text.

   As the reader scrolls a station's Learn tab, the camera on the anatomical
   plate flies to the organ, and a lens over it steps through a ladder of
   real images: the organ, then inside it, then the tissue, then the cell
   surface. Every level is a photograph, micrograph or licensed medical
   render — never drawn anatomy — and each carries its magnification and
   its credit. The ladder for each station lives in js/data/zoom.js.

   Two things the reader can always do: click the lens to open the image
   full size, and press "Whole body" to pull the camera back.
   ============================================================ */
(function (global) {
  'use strict';

  var VIEW = { x:-88, y:-12, w:530, h:848 };          /* the plate's home view */
  var ASPECT = VIEW.h / VIEW.w;
  /* camera frame per organ, in plate coordinates: centre and the width shown */
  var CAM = {
    'mouth':           { cx:134, cy:128, w:150 },
    'salivary-glands': { cx:146, cy:146, w:160 },
    'epiglottis':      { cx:158, cy:198, w:140 },
    'oesophagus':      { cx:178, cy:318, w:240 },
    'stomach':         { cx:238, cy:474, w:190 },
    'liver':           { cx:124, cy:456, w:200 },
    'gall-bladder':    { cx:120, cy:486, w:150 },
    'pancreas':        { cx:212, cy:538, w:190 },
    'duodenum':        { cx:160, cy:566, w:170 },
    'ileum-villi':     { cx:192, cy:650, w:210 },
    'colon':           { cx:182, cy:662, w:270 },
    'rectum-anus':     { cx:178, cy:772, w:160 }
  };

  var svg = null, lens = null, imgA = null, imgB = null, front = null, link = null, prevLevel = null, curDir = 1;
  var cur = { x:VIEW.x, y:VIEW.y, w:VIEW.w, h:VIEW.h };
  var anim = null, station = null, ladder = null, steps = [], activeKey = null, bound = null;
  var lastLevel = null, onScroll = null, scroller = null;

  function frameFor(cam) {
    if (!cam) return { x:VIEW.x, y:VIEW.y, w:VIEW.w, h:VIEW.h };
    var w = cam.w, h = w * ASPECT;
    /* the organ is framed in the upper-right part of the view: the lens sits
       bottom-left, and the connector line runs from the lens up to the organ */
    return { x:cam.cx - w * 0.58, y:cam.cy - h * 0.34, w:w, h:h };
  }
  function setBox(b) {
    cur = b;
    if (svg) svg.setAttribute('viewBox', b.x + ' ' + b.y + ' ' + b.w + ' ' + b.h);
    var zoomed = b.w < VIEW.w * 0.8;
    if (svg) svg.classList.toggle('is-zoomed', zoomed);
    var host = document.querySelector('.bodycol');
    if (host) host.classList.toggle('is-zoomed', zoomed);
    drawLink();
  }
  /* A line from the lens to the organ it came from, so a picture is never
     floating free of the body. Runs in plate coordinates -> screen. */
  function drawLink() {
    if (!link || !lens || lens.hidden || !svg) { if (link) link.style.display = 'none'; return; }
    var organ = (ladder && ladder.organ) ? ladder.organ : null;
    var o = organ && global.Anatomy ? global.Anatomy.ORGANS.filter(function (x) { return x.id === organ; })[0] : null;
    if (!o) { link.style.display = 'none'; return; }
    var m = svg.getScreenCTM(); if (!m) return;
    var wrap = svg.parentNode.getBoundingClientRect();
    var ax = m.a * o.anchor[0] + m.c * o.anchor[1] + m.e - wrap.left;
    var ay = m.b * o.anchor[0] + m.d * o.anchor[1] + m.f - wrap.top;
    var lr = lens.getBoundingClientRect();
    var lx = lr.right - wrap.left - 14, ly = lr.top - wrap.top + 14;
    link.style.display = '';
    link.setAttribute('viewBox', '0 0 ' + wrap.width + ' ' + wrap.height);
    link.setAttribute('width', wrap.width); link.setAttribute('height', wrap.height);
    var l = link.querySelector('line'); l.setAttribute('x1', lx); l.setAttribute('y1', ly); l.setAttribute('x2', ax); l.setAttribute('y2', ay);
    var c = link.querySelector('circle'); c.setAttribute('cx', ax); c.setAttribute('cy', ay);
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

  /* ---------- the lens ---------- */
  function buildLens() {
    var wrap = document.querySelector('.bodywrap');
    if (!wrap || lens) return;
    lens = document.createElement('div');
    lens.className = 'lens';
    lens.hidden = true;
    lens.innerHTML =
      '<div class="lens__stage"><img class="lens__img is-front" alt=""><img class="lens__img" alt="">' +
      '<div class="lens__from" hidden><img alt=""><i class="lens__fromBox"></i><span>from here</span></div></div>' +
      '<div class="lens__side"><div class="lens__bar"><span class="lens__mag"></span><span class="lens__cap"></span></div>' +
      '<div class="lens__crumb"></div></div>' +
      '<button class="lens__x" type="button" aria-label="Hide the picture">×</button>';
    wrap.appendChild(lens);
    link = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    link.setAttribute('class', 'lenslink');
    link.innerHTML = '<line class="lenslink__l"/><circle class="lenslink__c" r="5"/>';
    wrap.appendChild(link);
    var imgs = lens.querySelectorAll('.lens__img');
    imgA = imgs[0]; imgB = imgs[1]; front = imgA;
    lens.querySelector('.lens__x').addEventListener('click', function (e) { e.stopPropagation(); hideLens(); });
    lens.querySelector('.lens__stage').addEventListener('click', function () {
      if (lastLevel && lastLevel.img && global.LabLightbox) global.LabLightbox(front.src, lastLevel.cap, lastLevel.mag, lastLevel.credit);
    });
  }
  function hideLens() { if (lens) { lens.hidden = true; } if (link) link.style.display = 'none'; }

  function showLevel(level, dir) {
    if (!lens) buildLens();
    if (!level || !level.img) { hideLens(); return; }
    var back = front === imgA ? imgB : imgA;
    var src = 'assets/' + level.img;
    lens.hidden = false;
    curDir = dir;
    setTimeout(drawLink, 0);
    lens.classList.toggle('lens--in', dir >= 0);
    lens.classList.toggle('lens--out', dir < 0);
    var key = src + '|' + (level.pos || '') + '|' + (level.scale || 1);
    if (front.getAttribute('data-key') !== key) {
      /* pos = where to look in the picture; scale = how far into it to zoom.
         The picture is scaled about that point, so a 3-D render of the whole
         canal can be used at ×1 for the canal and at ×3 for one organ. */
      back.style.objectPosition = level.pos || '50% 50%';
      back.style.objectFit = level.fit || 'cover';
      back.style.transformOrigin = level.pos || '50% 50%';
      back.style.setProperty('--zoom', String(level.scale || 1));
      back.setAttribute('data-key', key);
      /* The swap must run exactly once per picture. A cached image fires its
         load event as well as answering `complete`, and running the swap twice
         removed is-front from the picture that had just been given it — the
         lens went black with the right caption under it. */
      back.onload = function () {
        back.onload = null;
        if (front === back) return;
        back.classList.add('is-front');
        front.classList.remove('is-front');
        front = back;
        applyText(level);
      };
      var same = back.getAttribute('src') === src;
      back.src = src;
      if (same && back.complete && back.naturalWidth) back.onload();
    } else applyText(level);
  }
  function applyText(level) {
    /* where this picture comes from: the previous level, with the region boxed */
    var fromEl = lens.querySelector('.lens__from');
    if (curDir >= 0 && prevLevel && prevLevel.img && prevLevel.img !== level.img) {
      fromEl.hidden = false;
      fromEl.querySelector('img').src = 'assets/' + prevLevel.img;
      fromEl.querySelector('img').style.objectPosition = prevLevel.pos || '50% 50%';
      var f = level.from || [36, 36, 28, 28];
      var box = fromEl.querySelector('.lens__fromBox');
      box.style.left = f[0] + '%'; box.style.top = f[1] + '%'; box.style.width = f[2] + '%'; box.style.height = f[3] + '%';
    } else fromEl.hidden = true;
    prevLevel = level;
    lens.querySelector('.lens__mag').textContent = level.mag || '';
    lens.querySelector('.lens__cap').innerHTML = level.cap || '';
    lens.querySelector('.lens__crumb').innerHTML = (level.crumb || []).map(function (c, i) {
      return (i ? '<i>›</i>' : '') + '<span>' + c + '</span>';
    }).join('') + (level.credit ? '<em class="lens__credit">' + level.credit + '</em>' : '');
  }

  /* ---------- station + steps ---------- */
  function setStation(id, opts) {
    station = id;
    ladder = (global.ZOOM_LADDER || {})[id] || null;
    activeKey = null; lastLevel = null; prevLevel = null;
    hideLens();
    var quiet = opts && opts.tour;
    var cam = (!quiet && ladder && ladder.organ) ? CAM[ladder.organ] : (CAM[id] && !quiet ? CAM[id] : null);
    flyTo(frameFor(cam), 750);
  }
  function reset() {
    activeKey = null;
    hideLens();
    flyTo(frameFor(null), 650);
  }

  /* bind the Learn list: each <li> is a step; a bullet without its own level
     keeps the level before it */
  function bindLearn(pane) {
    unbind();
    steps = [];
    if (!pane || !ladder) return;
    var lis = pane.querySelectorAll('.exam-list > li');
    var level = null;
    Array.prototype.forEach.call(lis, function (li, i) {
      if (ladder.steps && ladder.steps[i]) level = ladder.steps[i];
      steps.push({ el:li, level:level, i:i });
    });
    scroller = findScroller(pane);
    bound = pane;
    onScroll = function () { update(); };
    (scroller === document.documentElement ? window : scroller).addEventListener('scroll', onScroll, { passive:true });
    update();
  }
  function unbind() {
    if (onScroll && scroller) (scroller === document.documentElement ? window : scroller).removeEventListener('scroll', onScroll);
    onScroll = null; scroller = null; bound = null; steps = [];
  }
  function findScroller(el) {
    var n = el.parentElement;
    while (n && n !== document.documentElement) {
      var o = getComputedStyle(n).overflowY;
      if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight + 4) return n;
      n = n.parentElement;
    }
    return document.documentElement;
  }
  /* the reading line sits a third of the way down the visible panel; the
     active step is the last one whose top has passed it */
  function update() {
    if (!steps.length) return;
    var top, height;
    if (scroller === document.documentElement) { top = 0; height = global.innerHeight; }
    else { var r = scroller.getBoundingClientRect(); top = r.top; height = r.height; }
    var line = top + height * 0.34, pick = steps[0];
    for (var i = 0; i < steps.length; i++) if (steps[i].el.getBoundingClientRect().top <= line) pick = steps[i];
    var key = pick.i + ':' + (pick.level ? pick.level.img || 'none' : 'none');
    if (key === activeKey) return;
    var dir = (lastLevel && pick.level && steps.indexOf(pick) < lastIndex) ? -1 : 1;
    activeKey = key; lastIndex = steps.indexOf(pick);
    var lvl = pick.level;
    if (lvl && lvl.cam) flyTo(frameFor(typeof lvl.cam === 'string' ? CAM[lvl.cam] : lvl.cam), 700);
    else if (ladder && ladder.organ) flyTo(frameFor(CAM[ladder.organ]), 700);
    showLevel(lvl, dir);
    lastLevel = lvl;
  }
  var lastIndex = -1;

  function init(svgEl) { svg = svgEl; buildLens(); setBox(frameFor(null)); }

  global.Zoom = { init:init, setStation:setStation, bindLearn:bindLearn, unbind:unbind, reset:reset,
                  update:update, flyTo:flyTo, frameFor:frameFor, CAM:CAM,
                  _state:function () { return { cur:cur, station:station, activeKey:activeKey, steps:steps.length }; } };
})(window);
