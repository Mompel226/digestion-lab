/* ============================================================
   anatomy.js — the clickable body.

   The artwork is a public-domain anatomical plate (see js/art.js).
   This module does four things to it:
     1. tags the artwork's paths into named organ groups
     2. dims every organ except the one being studied
     3. lays out labels in two gutters, pushing them apart so
        two labels can never overlap, whatever is shown or hidden
     4. drives a bolus of food along the canal

   Artwork coordinate space: 0 0 351 821.
   Our root viewBox adds gutters either side for the labels.
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var VIEW = { x:-88, y:-12, w:530, h:848 };
  var LEFT_X = 36, RIGHT_X = 316, MIN_GAP = 26, TOP = 20, BOT = 812;

  /* Which artwork paths make up each organ. Indices are into the
     artwork's own path list and were read off the plate directly. */
  /* Which artwork paths make up each organ, read off the plate by hit-testing
     it path by path. These drive the VISUAL highlight only — clicking is handled
     by the explicit hit shapes below, so a hit is never ambiguous. */
  var PATHS = {
    'mouth'            : [89,90,91,92,96,97,98,99,106,107,108,111,112,118,119,124,125],
    'salivary-glands'  : [144,145,146,147,148,149,150,151,152,153],
    'epiglottis'       : [100,102,103,104,105,113,114,115,116,117,126],
    'oesophagus'       : [1,67],
    'stomach'          : [55,57,59,65,66],
    'liver'            : [2,3,4,5,6,45],
    'gall-bladder'     : [21,22,23,24,26,27,28,29,30,31,32,33,34,35,36,37,38,39,
                          40,41,42,43,44,51,52,53,54],
    'pancreas'         : [9,60,61,62,63],
    'duodenum'         : [46,47,48,49,50,56,64],
    'ileum-villi'      : [133],
    'colon'            : [130,131,132,134,135,136,137,138,139,140,141,142,143],
    'rectum-anus'      : [127,128]
  };
  /* Path 130 draws the descending colon, the sigmoid AND the rectum as one
     shape. Lighting all of it for the rectum station would teach that the
     descending colon is the rectum, so instead we reveal just the rectum
     slice of that path through a clip. */
  var FOCUS_CLIP = { id:'rectum-anus', path:130, rect:[157,741,35,71] };

  /* Invisible click targets, traced over the plate. Later entries sit on top,
     so a small organ inside a larger one still wins the click. */
  var HITS = [
    { id:'colon',           shape:'path', d:'M97,706 L97,600 C97,578 107,568 127,568 L243,568 C261,568 268,578 268,598 L268,690 C268,712 254,726 230,738 C206,750 184,756 177,766', w:34 },
    { id:'oesophagus',      shape:'path', d:'M178,234 L178,412', w:24 },
    { id:'liver',           shape:'ellipse', cx:118, cy:452, rx:52, ry:34 },
    { id:'stomach',         shape:'ellipse', cx:242, cy:474, rx:40, ry:36 },
    { id:'pancreas',        shape:'ellipse', cx:214, cy:538, rx:46, ry:16 },
    { id:'duodenum',        shape:'path', d:'M170,528 C138,540 122,566 132,588 C146,606 172,604 186,592', w:28 },
    { id:'ileum-villi',     shape:'ellipse', cx:192, cy:650, rx:52, ry:52 },
    { id:'gall-bladder',    shape:'ellipse', cx:116, cy:487, rx:26, ry:13 },
    { id:'rectum-anus',     shape:'path', d:'M178,754 L176,802', w:32 },
    { id:'mouth',           shape:'ellipse', cx:124, cy:122, rx:30, ry:19 },
    { id:'salivary-glands', shape:'ellipse', cx:168, cy:140, rx:16, ry:26 },
    { id:'salivary-glands', shape:'ellipse', cx:124, cy:166, rx:16, ry:12 },
    { id:'epiglottis',      shape:'ellipse', cx:159, cy:208, rx:13, ry:15 }
  ];

  /* label side, preferred label y, and the point the leader line touches */
  var ORGANS = [
    { id:'mouth',           label:'Mouth and teeth',    side:'right', ly:112, anchor:[128,122] },
    { id:'salivary-glands', label:'Salivary glands',  side:'left',  ly:150, anchor:[168,138] },
    { id:'epiglottis',      label:'Epiglottis',       side:'right', ly:206, anchor:[159,204], beyond:true },
    { id:'oesophagus',      label:'Oesophagus',       side:'left',  ly:320, anchor:[179,318] },
    { id:'liver',           label:'Liver',            side:'left',  ly:436, anchor:[104,452] },
    { id:'stomach',         label:'Stomach',          side:'right', ly:446, anchor:[243,470] },
    { id:'gall-bladder',    label:'Gall bladder',        side:'left',  ly:500, anchor:[114,487] },
    { id:'pancreas',        label:'Pancreas',         side:'right', ly:516, anchor:[198,512] },
    { id:'duodenum',        label:'Duodenum',         side:'right', ly:574, anchor:[130,572] },
    { id:'colon',           label:'Large intestine',  side:'left',  ly:612, anchor:[97,648] },
    { id:'ileum-villi',     label:'Small intestine',  side:'right', ly:652, anchor:[196,650] },
    { id:'rectum-anus',     label:'Rectum and anus',    side:'left',  ly:782, anchor:[176,776] }
  ];

  /* The route a meal takes, in artwork coordinates. */
  var CANAL =
    'M124,118 C146,130 158,158 163,196 C172,240 176,290 179,344 ' +
    'C184,404 202,436 228,452 C262,468 270,506 246,528 ' +
    'C218,548 176,524 152,536 C128,548 124,574 144,590 ' +
    'C172,606 202,586 216,606 C230,628 198,648 178,634 ' +
    'C158,620 150,652 172,664 C196,676 228,662 234,682 ' +
    'C238,702 208,714 190,702 C172,690 158,700 162,712 ' +
    'C132,720 100,722 96,706 L96,586 C96,562 104,550 124,550 ' +
    'L250,550 C268,550 274,562 274,584 L274,672 ' +
    'C274,700 258,716 232,730 C204,745 182,754 176,772 L176,800';

  /* ---------- helpers ---------- */
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- label collision pass ----------
     Sorts by y, then guarantees MIN_GAP between neighbours, then
     pulls the whole column back inside [TOP, BOT]. Runs on every
     render, so hiding an organ can never leave two labels touching. */
  function layoutLabels(items) {
    if (!items.length) return items;
    items.sort(function (a, b) { return a.y - b.y; });
    var i, n = items.length;
    for (i = 1; i < n; i++)
      if (items[i].y - items[i - 1].y < MIN_GAP) items[i].y = items[i - 1].y + MIN_GAP;
    var overflow = items[n - 1].y - BOT;
    if (overflow > 0) for (i = n - 1; i >= 0; i--) items[i].y -= overflow;
    if (items[0].y < TOP) {
      var lift = TOP - items[0].y;
      for (i = 0; i < n; i++) items[i].y += lift;
    }
    /* final sweep downward in case the two clamps fought each other */
    for (i = 1; i < n; i++)
      if (items[i].y - items[i - 1].y < MIN_GAP) items[i].y = items[i - 1].y + MIN_GAP;
    return items;
  }

  var state = { showLabels:true, showBeyond:true, active:null, done:{}, onPick:null, debugHits:false };
  var built = false, artRoot = null, labelLayer = null, fxLayer = null, hitLayer = null, focusCopy = null;

  /* ---------- build once ---------- */
  function build(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', VIEW.x + ' ' + VIEW.y + ' ' + VIEW.w + ' ' + VIEW.h);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    var defs = el('defs', {}, svg);
    var gl = el('radialGradient', { id:'bolusGlow' }, defs);
    el('stop', { offset:0, 'stop-color':'#14572B', 'stop-opacity':.34 }, gl);
    el('stop', { offset:1, 'stop-color':'#14572B', 'stop-opacity':0 }, gl);
    el('path', { id:'canalPath', d:CANAL, fill:'none', stroke:'none' }, defs);

    artRoot = el('g', { class:'art' }, svg);
    artRoot.innerHTML = global.ANATOMY_ART.svg;

    var paths = artRoot.querySelectorAll('path');
    Object.keys(PATHS).forEach(function (id) {
      PATHS[id].forEach(function (i) {
        var p = paths[i];
        if (!p) return;
        p.classList.add('op');
        p.setAttribute('data-organ', id);
      });
    });
    /* clipped copy of the rectum, revealed only on the rectum station */
    var src = paths[FOCUS_CLIP.path];
    if (src) {
      var cp = el('clipPath', { id:'focusClip' }, defs);
      el('rect', { x:FOCUS_CLIP.rect[0], y:FOCUS_CLIP.rect[1],
                   width:FOCUS_CLIP.rect[2], height:FOCUS_CLIP.rect[3] }, cp);
      /* The clip must be read in plate coordinates, so it goes on an outer
         group; the plate's own ancestor transforms are then rebuilt inside it
         so the copy lands exactly on top of the original. */
      focusCopy = el('g', { 'clip-path':'url(#focusClip)', class:'focus-copy' }, artRoot);
      var chain = [], node = src.parentNode;
      while (node && node !== artRoot) { chain.unshift(node.getAttribute('transform')); node = node.parentNode; }
      var host = focusCopy;
      chain.forEach(function (tr) { host = el('g', { transform:tr }, host); });
      var copy = src.cloneNode(false);
      copy.removeAttribute('class');
      copy.removeAttribute('data-organ');
      copy.setAttribute('class', 'focus-path');
      host.appendChild(copy);
    }

    /* explicit hit targets — the plate itself never takes a click, so
       what you click is always what you get */
    hitLayer = el('g', { class:'hits' }, svg);
    HITS.forEach(function (hp) {
      var n;
      if (hp.shape === 'ellipse')
        n = el('ellipse', { cx:hp.cx, cy:hp.cy, rx:hp.rx, ry:hp.ry, class:'hit' }, hitLayer);
      else
        n = el('path', { d:hp.d, class:'hit hit--line', 'stroke-width':hp.w }, hitLayer);
      n.setAttribute('data-organ', hp.id);
      n.addEventListener('click', function () { pick(hp.id); });
      n.addEventListener('mouseenter', function () { hover(hp.id, true); });
      n.addEventListener('mouseleave', function () { hover(hp.id, false); });
    });

    labelLayer = el('g', { class:'labels' }, svg);
    fxLayer = el('g', { class:'fx' }, svg);
    el('circle', { id:'bolusGlowC', r:26, fill:'url(#bolusGlow)', opacity:0 }, fxLayer);
    el('circle', { id:'bolus', r:7, fill:'#E8A33D', stroke:'#8A5A12', 'stroke-width':1.4, opacity:0 }, fxLayer);
    built = true;
  }

  function pick(id) { if (state.onPick) state.onPick(id); }

  var hovered = null;
  function hover(id, on) {
    hovered = on ? id : (hovered === id ? null : hovered);
    var svg = document.getElementById('bodySvg');
    if (!svg) return;
    Array.prototype.forEach.call(svg.querySelectorAll('.op'), function (p) {
      var mine = p.getAttribute('data-organ') === hovered || p.getAttribute('data-organ2') === hovered;
      p.classList.toggle('is-hover', !!hovered && mine);
    });
    Array.prototype.forEach.call(svg.querySelectorAll('.lblg'), function (g) {
      g.classList.toggle('is-hover', g.getAttribute('data-id') === hovered);
    });
  }
  function isOrgan(id) {
    for (var i = 0; i < ORGANS.length; i++) if (ORGANS[i].id === id) return true;
    return false;
  }

  /* ---------- labels + dimming ---------- */
  function paint() {
    var svg = document.getElementById('bodySvg');
    if (!svg || !built) return;
    var visible = ORGANS.filter(function (o) { return state.showBeyond || !o.beyond; });
    var visibleIds = {};
    visible.forEach(function (o) { visibleIds[o.id] = 1; });

    /* Dim the rest of the plate only when a real organ is being studied.
       Stations that are not organs (the overview, the molecules lab) leave
       the whole plate at full strength. */
    var focus = isOrgan(state.active) ? state.active : null;
    Array.prototype.forEach.call(artRoot.querySelectorAll('.op'), function (p) {
      var id = p.getAttribute('data-organ'), id2 = p.getAttribute('data-organ2');
      if (focus === 'ileum-villi' && id === 'duodenum') id = 'ileum-villi';   /* one station reads both */
      if (focus === 'liver' && id === 'gall-bladder') id = 'liver';            /* and so does the liver with its gall bladder */
      var mine = id === focus || id2 === focus;
      p.classList.toggle('is-hidden', !visibleIds[id]);
      p.classList.toggle('is-dim', !!focus && !mine);
      p.classList.toggle('is-on', !!focus && mine);
    });
    svg.classList.toggle('has-active', !!focus);
    if (focusCopy) focusCopy.style.display = (focus === FOCUS_CLIP.id) ? '' : 'none';
    if (hitLayer) hitLayer.classList.toggle('debug', !!state.debugHits);
    Array.prototype.forEach.call(svg.querySelectorAll('.hit'), function (n) {
      n.style.display = (!state.showBeyond && n.getAttribute('data-organ') === 'epiglottis') ? 'none' : '';
    });

    /* labels */
    while (labelLayer.firstChild) labelLayer.removeChild(labelLayer.firstChild);
    if (!state.showLabels) return;

    ['left', 'right'].forEach(function (side) {
      var items = visible.filter(function (o) { return o.side === side; })
                         .map(function (o) { return { o:o, y:o.ly }; });
      layoutLabels(items).forEach(function (it) {
        var o = it.o,
            tx = side === 'left' ? LEFT_X : RIGHT_X,
            gx = side === 'left' ? tx + 7 : tx - 7,
            ax = o.anchor[0], ay = o.anchor[1],
            mid = (gx + ax) / 2,
            on = state.active === o.id;
        var g = el('g', { class:'lblg' + (on ? ' is-active' : '') + (o.beyond ? ' beyond' : ''),
                          'data-id':o.id }, labelLayer);
        el('path', { class:'lbl__lead',
                     d:'M' + gx + ',' + it.y + ' C' + mid + ',' + it.y + ' ' + mid + ',' + ay + ' ' + ax + ',' + ay,
                     fill:'none' }, g);
        el('circle', { class:'lbl__dot', cx:ax, cy:ay, r:2.6 }, g);
        var t = el('text', { class:'lbl', x:tx, y:it.y + 4.6,
                             'text-anchor':side === 'left' ? 'end' : 'start' }, g);
        t.textContent = (state.done[o.id] ? '✓ ' : '') + o.label;
        /* a generous invisible hit strip so the label itself is easy to click */
        var w = 150, hx = side === 'left' ? tx - w : tx;
        el('rect', { class:'lbl__hit', x:hx, y:it.y - 11, width:w, height:22 }, g);
        g.addEventListener('click', function () { pick(o.id); });
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', o.label);
        g.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(o.id); }
        });
      });
    });
  }

  function render(svg) {
    if (!built) build(svg);
    paint();
  }

  /* ---------- food journey ---------- */
  var anim = null;
  function stopJourney() {
    cancelAnim();
    var b = document.getElementById('bolus'), g = document.getElementById('bolusGlowC');
    if (b) b.setAttribute('opacity', 0);
    if (g) g.setAttribute('opacity', 0);
  }
  function placeBolus(t) {
    var p = document.getElementById('canalPath'), b = document.getElementById('bolus'),
        g = document.getElementById('bolusGlowC');
    if (!p || !b) return;
    t = Math.max(0, Math.min(1, t));
    var pt = p.getPointAtLength(t * p.getTotalLength());
    b.setAttribute('cx', pt.x); b.setAttribute('cy', pt.y); b.setAttribute('opacity', 1);
    g.setAttribute('cx', pt.x); g.setAttribute('cy', pt.y); g.setAttribute('opacity', 1);
    /* the bolus shrinks as it is digested and absorbed, then re-forms as faeces */
    var r = t < 0.34 ? 7.5 - t * 8 : t < 0.72 ? 4.8 - (t - 0.34) * 6 : 2.6 + (t - 0.72) * 12;
    b.setAttribute('r', Math.max(2.2, Math.min(8, r)));
    b.setAttribute('fill', t < 0.4 ? '#E8A33D' : t < 0.74 ? '#D08A48' : '#7C5A3C');
  }
  /* Travel from one point on the canal to another, then call back.

     Browsers stop firing requestAnimationFrame while a tab is in the
     background, which would leave a tour stalled half way with no way back
     except the Stop button. So the leg also carries a timer that finishes it
     regardless; whichever fires first wins, and the other is cancelled. */
  function travel(from, to, ms, onDone) {
    cancelAnim();
    var t0 = null, done = false;
    anim = { raf:0, timer:0 };
    function finish() {
      if (done) return;
      done = true;
      cancelAnim();
      placeBolus(to);
      if (onDone) onDone();
    }
    function step(now) {
      if (done) return;
      if (t0 === null) t0 = now;
      var k = ms <= 0 ? 1 : Math.min(1, (now - t0) / ms);
      /* ease in and out so it reads like a swallow, not a conveyor belt */
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      placeBolus(from + (to - from) * e);
      if (k < 1) anim.raf = requestAnimationFrame(step);
      else finish();
    }
    placeBolus(from);
    anim.raf = requestAnimationFrame(step);
    anim.timer = setTimeout(finish, Math.max(0, ms) + 260);
  }
  function cancelAnim() {
    if (!anim) return;
    if (anim.raf) cancelAnimationFrame(anim.raf);
    if (anim.timer) clearTimeout(anim.timer);
    anim = null;
  }

  /* a guided tour: travel to each stop in turn and pause there long enough
     to take in the station that has just opened */
  var tourTimer = null, touring = false;
  function tour(stops, opts) {
    stopTour();
    touring = true;
    var i = 0, at = 0;
    var travelMs = (opts && opts.travelMs) || 1500;
    var holdMs = (opts && opts.holdMs) || 2600;
    function next() {
      if (!touring) return;
      if (i >= stops.length) { touring = false; if (opts && opts.onDone) opts.onDone(); return; }
      var s = stops[i++];
      travel(at, s.t, travelMs, function () {
        at = s.t;
        if (!touring) return;
        if (opts && opts.onArrive) opts.onArrive(s);
        tourTimer = setTimeout(next, holdMs);
      });
    }
    next();
  }
  function stopTour() {
    touring = false;
    if (tourTimer) { clearTimeout(tourTimer); tourTimer = null; }
    stopJourney();
  }

  /* how far along the canal each station sits — used to park the bolus */
  var STOP_T = { 'mouth':0.01, 'salivary-glands':0.02, 'epiglottis':0.05, 'oesophagus':0.12,
                 'liver':0.20, 'stomach':0.24, 'gall-bladder':0.28, 'pancreas':0.32,
                 'duodenum':0.36, 'ileum-villi':0.55, 'colon':0.82, 'rectum-anus':0.99 };

  global.Anatomy = {
    ORGANS:ORGANS, state:state, render:render, highlight:paint,
    tour:tour, stopTour:stopTour, travel:travel, stopJourney:stopJourney,
    placeBolus:placeBolus, STOP_T:STOP_T,
    stopFor:function (id) { return STOP_T[id]; }
  };
})(window);
