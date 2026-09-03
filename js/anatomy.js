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

  /* The route a meal takes, in artwork coordinates — traced on the plate: the oral cavity, the
     pharynx, down the oesophagus, into the stomach at the cardia and round to the pylorus, the
     duodenal loop, a long meander through the coils of the jejunum and ileum, the caecum, then up,
     across and down the colon to the rectum. Landmarks along it are found at run time (marks). */
  var CANAL = 'M124,128 C127,129.7 136,134.3 142,138 C148,141.7 155,144.3 160,150 C165,155.7 169.2,165.3 172,172 C174.8,178.7 176,182.8 177,190 C178,197.2 177.8,203.3 178,215 C178.2,226.7 178,245.8 178,260 C178,274.2 178.2,287.5 178,300 C177.8,312.5 176.8,323.3 177,335 C177.2,346.7 178,358.3 179,370 C180,381.7 181.5,394.7 183,405 C184.5,415.3 183.2,425 188,432 C192.8,439 203.7,442 212,447 C220.3,452 230.7,455.8 238,462 C245.3,468.2 252.3,476.8 256,484 C259.7,491.2 262,499.2 260,505 C258,510.8 251,516 244,519 C237,522 226.3,522.7 218,523 C209.7,523.3 201,522.2 194,521 C187,519.8 180.3,515.2 176,516 C171.7,516.8 173,522.3 168,526 C163,529.7 153,532.3 146,538 C139,543.7 129,552.7 126,560 C123,567.3 125.3,575.3 128,582 C130.7,588.7 135.3,596.7 142,600 C148.7,603.3 160.7,603.3 168,602 C175.3,600.7 179.8,591.3 186,592 C192.2,592.7 197.7,602.3 205,606 C212.3,609.7 221.7,613 230,614 C238.3,615 248,609 255,612 C262,615 269.8,625.3 272,632 C274.2,638.7 272.5,647.3 268,652 C263.5,656.7 253.8,660 245,660 C236.2,660 225,651.7 215,652 C205,652.3 195,662 185,662 C175,662 164.5,651.7 155,652 C145.5,652.3 134.2,658.7 128,664 C121.8,669.3 116,678.7 118,684 C120,689.3 131.3,695 140,696 C148.7,697 160,689.3 170,690 C180,690.7 190,699.7 200,700 C210,700.3 220.3,691.7 230,692 C239.7,692.3 251.7,697.3 258,702 C264.3,706.7 270.2,715.3 268,720 C265.8,724.7 253.8,729.3 245,730 C236.2,730.7 225,723.7 215,724 C205,724.3 195,732 185,732 C175,732 164.5,728 155,724 C145.5,720 135.8,712.7 128,708 C120.2,703.3 112.7,700 108,696 C103.3,692 101.5,691.7 100,684 C98.5,676.3 99.2,661.5 99,650 C98.8,638.5 98.3,625 99,615 C99.7,605 99.5,596.7 103,590 C106.5,583.3 112.2,577.2 120,575 C127.8,572.8 136.7,576.2 150,577 C163.3,577.8 184.2,580.2 200,580 C215.8,579.8 233,575 245,576 C257,577 265.8,580 272,586 C278.2,592 280.3,601.3 282,612 C283.7,622.7 282,637 282,650 C282,663 284,678 282,690 C280,702 277,713.3 270,722 C263,730.7 250.8,737 240,742 C229.2,747 214.5,748.7 205,752 C195.5,755.3 187.5,756.5 183,762 C178.5,767.5 179.2,777.7 178,785 C176.8,792.3 176.3,802.5 176,806';
  var LANDMARKS = { mouth:[126,130], pharynx:[176,190], oesophagus:[178,300], cardia:[188,432], stomach:[250,490],
                    pylorus:[176,516], duodenum:[128,582], jejunum:[205,606], ileum:[200,700], caecum:[104,694],
                    colon:[200,580], sigmoid:[240,742], anus:[176,806] };
  var marks = null;
  function findMarks() {
    var p = document.getElementById('canalPath'); if (!p) return null;
    var L = p.getTotalLength(), N = 1600, pts = [];
    for (var i = 0; i <= N; i++) { var q = p.getPointAtLength(L * i / N); pts.push([q.x, q.y]); }
    var out = {};
    Object.keys(LANDMARKS).forEach(function (k) {
      var lm = LANDMARKS[k], best = 0, bd = 1e9;
      pts.forEach(function (q, i) { var dd = (q[0] - lm[0]) * (q[0] - lm[0]) + (q[1] - lm[1]) * (q[1] - lm[1]); if (dd < bd) { bd = dd; best = i; } });
      out[k] = best / N;
    });
    out.anus = 1; return out;
  }
  function getMarks() { if (!marks) marks = findMarks(); return marks; }

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

  /* how far along the canal each station sits — used to park the bolus; read off the landmarks */
  var STATION_MARK = { 'mouth':'mouth', 'salivary-glands':'mouth', 'epiglottis':'pharynx', 'oesophagus':'oesophagus',
                       'stomach':'stomach', 'liver':'duodenum', 'gall-bladder':'duodenum', 'pancreas':'duodenum',
                       'duodenum':'duodenum', 'ileum-villi':'ileum', 'colon':'colon', 'rectum-anus':'anus' };
  var STOP_T = {};
  function stopFor(id) { var m = getMarks(), k = STATION_MARK[id]; if (!m || !k) return null; return k === 'anus' ? 0.995 : m[k]; }

  global.Anatomy = {
    ORGANS:ORGANS, state:state, render:render, highlight:paint,
    tour:tour, stopTour:stopTour, travel:travel, stopJourney:stopJourney,
    placeBolus:placeBolus, STOP_T:STOP_T, marks:getMarks,
    stopFor:stopFor
  };
})(window);
