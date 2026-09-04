/* ============================================================
   tour.js — "Follow the food": the five processes of nutrition as
   five animated scenes on the plate, each with its syllabus definition.

   The food stays inside the alimentary canal from the mouth to the anus.
   The liver, gall bladder and pancreas are never visited by the food:
   their secretions are shown arriving through their ducts, and what
   travels to the liver is the absorbed nutrients, in the blood.

   Uses: Anatomy (bolus on the canal path, highlight), Zoom (camera).
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var f1 = function (v) { return (+v).toFixed(1); };

  /* routes on the plate, in plate units (the same ones plateanim draws) */
  var BILE = [[144, 488], [150, 489], [156, 490], [156, 508], [153, 526], [148, 543], [142, 556]];
  var PANC = [[258, 504], [247, 510], [236, 515], [224, 520], [212, 524], [200, 528], [188, 534], [177, 539], [168, 546], [159, 556], [149, 559]];

  /* Timings are set by how long the words take to read, not by how long the movement takes: a
     scene lasts about a word every third of a second, and the notes inside it are spaced the same
     way. Anyone who reads faster can press Next. */
  var SCENES = [
    { id:'ingestion', name:'Ingestion', organ:'mouth', station:'mouth', stationName:'Mouth and teeth', pos:'bottom', cam:{ cx:140, cy:150, w:210 }, ms:14000,
      def:'Ingestion is the taking of substances — food and drink — into the body through the mouth.',
      notes:[[0, 'The meal goes in. Chewing starts physical digestion at once, and saliva adds the first enzyme, amylase.']] },
    { id:'digestion', name:'Digestion', organ:'stomach', station:'stomach', stationName:'Stomach', pos:[[0, 'bottom'], [15600, 'top']], cam:{ cx:150, cy:196, w:250 }, ms:32000,
      /* The camera travels with the food. A single frame on the stomach leaves the swallow and the
         whole oesophagus off the top of the plate: for ten seconds the reader sees nothing happen
         and then the bolus appears, already in the stomach. Each leg is [when, camera, how long]. */
      cams:[[0,     { cx:150, cy:196, w:250 }, 900],
            [6900,  { cx:186, cy:470, w:330 }, 7700],
            [15200, { cx:196, cy:498, w:300 }, 1300],
            [22600, { cx:182, cy:520, w:330 }, 1300]],
      def:'Digestion is the breakdown of food. Physical digestion breaks it into smaller pieces without chemical change; chemical digestion uses enzymes to break large, insoluble molecules into small, soluble ones.',
      notes:[[0, 'Swallowing: the tongue pushes the bolus to the back of the mouth.'],
             [3400, 'The epiglottis folds over the windpipe, so the bolus goes down the oesophagus and not the airway.'],
             [7400, 'Down the oesophagus by peristalsis — muscle contracting behind the bolus and relaxing in front of it.'],
             [14600, 'In the stomach: churned (physical digestion), acid kills microbes, and pepsin starts on protein.'],
             [22600, 'In the duodenum, bile and pancreatic juice arrive through ducts. The food never enters the liver, gall bladder or pancreas — they only secrete into the tube.']] },
    { id:'absorption', name:'Absorption', organ:'ileum-villi', station:'ileum-villi', stationName:'Small intestine', pos:'bottom', also:['liver'], spot:['liver'], hide:['gall-bladder'], cam:{ cx:202, cy:580, w:362 }, ms:18000,
      def:'Absorption is the movement of nutrients from the intestines into the blood.',
      notes:[[0, 'Along the small intestine the small, soluble molecules cross the villi into the blood — and most of the water goes the same way. The meal shrinks as it is absorbed.'],
             [9000, 'The veins that collect them run inside the mesentery, the sheet that holds the intestine, and join into one vein to the liver.']] },
    { id:'assimilation', name:'Assimilation', organ:'liver', station:'liver', stationName:'Liver', pos:'bottom', also:['ileum-villi'], spot:['liver'], hide:['gall-bladder'], cam:{ cx:202, cy:580, w:362 }, ms:20000,
      def:'Assimilation is the movement of digested food molecules into the cells of the body, where they are used and become part of the cells.',
      notes:[[0, 'What reaches the liver is the nutrients in the blood, in the hepatic portal vein — never the food.'],
             [9000, 'Glucose that is not needed straight away is stored as glycogen; amino acids go on to build new proteins in every cell.']] },
    { id:'egestion', name:'Egestion', organ:'colon', station:'colon', stationName:'Large intestine', pos:'top', cam:{ cx:182, cy:637, w:340 }, ms:20000,
      def:'Egestion is the passing out of food that has not been digested or absorbed, as faeces, through the anus.',
      notes:[[0, 'In the colon the remaining water is reabsorbed into the blood, and what is left becomes faeces.'],
             [9500, 'Not excretion: faeces were never inside the body’s cells. Excretion is urea from the kidneys and carbon dioxide from the lungs.']] }
  ];


  var card = null, fx = null, timers = [], running = false, idx = -1, opener = null, onStop = null, at = null;
  var curCam = null;                 /* the leg of the camera track the scene is on */

  /* A fade is only safe while the page is actually being drawn: a transition does not advance in
     a hidden tab, so a card faded out there would still be invisible when the reader came back.
     When the page is hidden, or the reader asks for less motion, the card simply moves. */
  function canAnimate() {
    return !document.hidden && !(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function fadeIn(c, drift, ms) {
    if (!canAnimate()) { c.classList.remove('is-moving'); return; }
    c.style.setProperty('--drift', drift);
    c.classList.add('is-moving');
    later(function () { c.classList.remove('is-moving'); }, ms || 40);
  }
  function fadeOut(c, drift) {
    if (!c || c.hidden || !canAnimate()) return false;
    if (c.classList.contains('is-moving')) return true;            /* already on its way out */
    c.style.setProperty('--drift', drift || '-10px');
    c.classList.add('is-moving');
    return true;
  }
  /* Change one line of the card without it blinking: fade the words out, swap, fade back in. */
  function swapText(el, text) {
    if (!el) return;
    if (!canAnimate()) { el.textContent = text; return; }
    el.classList.add('is-swap');
    later(function () { el.textContent = text; el.classList.remove('is-swap'); }, 240);
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && card) card.classList.remove('is-moving');   /* never come back to a blank card */
  });

  function svgEl(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function later(fn, ms) { var t = setTimeout(function () { if (running) fn(); }, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function canalPoint(t) {
    var p = document.getElementById('canalPath');
    if (!p) return [150, 500];
    var q = p.getPointAtLength(Math.max(0, Math.min(1, t)) * p.getTotalLength());
    return [q.x, q.y];
  }
  function fxLayer() {
    var svg = document.getElementById('bodySvg');
    if (!svg) return null;
    if (fx && fx.isConnected) return fx;
    fx = svgEl('g', { 'class':'tourfx', 'pointer-events':'none' }, svg);
    return fx;
  }
  function clearFx() { if (fx) fx.innerHTML = ''; }
  /* the drawn extras (droplets, the mesentery's veins) fade rather than blink */
  function fxFade(to, ms) {
    var g = fxLayer(); if (!g) return;
    g.style.transition = canAnimate() ? 'opacity ' + (ms || 300) + 'ms ease' : 'none';
    g.style.opacity = to;
  }
  /* a run of droplets along a route: circles on an animateMotion, fading in and out */
  function drops(route, col, r, dur, n, once) {
    var g = fxLayer(); if (!g) return;
    var d = 'M' + route.map(function (q) { return f1(q[0]) + ',' + f1(q[1]); }).join(' L');
    for (var i = 0; i < n; i++) {
      var c = svgEl('circle', { r:f1(r), fill:col, stroke:'#fff', 'stroke-width':f1(r * .25), opacity:'0' }, g);
      var begin = (i * dur / n).toFixed(2) + 's', rep = once ? '1' : 'indefinite';
      svgEl('animateMotion', { dur:dur + 's', begin:begin, repeatCount:rep, path:d, calcMode:'linear', fill:'freeze' }, c);
      svgEl('animate', { attributeName:'opacity', values:'0;1;1;0', keyTimes:'0;0.08;0.9;1', dur:dur + 's', begin:begin, repeatCount:rep, fill:'freeze' }, c);
    }
  }
  /* The mesentery and the hepatic portal vein — the same drawing the small-intestine station
     uses, so the story is told once: the sheet that holds the gut, the veins inside it gathering
     the absorbed food from every loop, and the liver outlined at the end of the road. */
  function vein() {
    var g = fxLayer(); if (!g || !global.PlateAnim || !global.PlateAnim.portal) return;
    var cam = SCENES[Math.min(idx, SCENES.length - 1)].cam || { w: 340 };
    g.innerHTML += global.PlateAnim.portal({
      fs: cam.w / 40, u: cam.w / 200, compact: false,
      outline: global.Zoom && global.Zoom.outline, outlineIn: global.Zoom && global.Zoom.outlineIn
    });
  }
  function water(t) {
    var g = fxLayer(); if (!g) return;
    var p = canalPoint(t), c = svgEl('circle', { cx:f1(p[0]), cy:f1(p[1]), r:'2.6', fill:'#5FA8D3', stroke:'#fff', 'stroke-width':'0.6', opacity:'0' }, g);
    var dx = (Math.random() - 0.5) * 30, dy = (Math.random() - 0.5) * 30;
    svgEl('animateTransform', { attributeName:'transform', type:'translate', from:'0 0', to:f1(dx) + ' ' + f1(dy), dur:'2.2s', begin:'0s', repeatCount:'indefinite' }, c);
    svgEl('animate', { attributeName:'opacity', values:'0;1;0', keyTimes:'0;0.2;1', dur:'2.2s', repeatCount:'indefinite' }, c);
  }

  /* ---------- the card ---------- */
  function buildCard() {
    if (card && card.isConnected) return card;
    var host = document.querySelector('.bodycol');
    card = document.createElement('div');
    card.className = 'tourcard'; card.hidden = true; card.setAttribute('role', 'region'); card.setAttribute('aria-live', 'polite');
    card.innerHTML =
      '<div class="tourcard__top"><span class="tourcard__chip"></span><span class="tourcard__step"></span></div>' +
      '<p class="tourcard__def"></p><p class="tourcard__note"></p>' +
      '<div class="tourcard__foot"><div class="tourcard__btns"><button type="button" class="btn btn--ghost" data-act="back">Back</button>' +
      '<button type="button" class="btn" data-act="next">Next</button>' +
      '<button type="button" class="btn btn--ghost" data-act="stop">Stop</button></div><div class="tourcard__more"></div></div>';
    host.appendChild(card);
    card.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'next') next(); else if (act === 'back') back(); else if (act === 'stop') stop({ reopen:true }); else if (act === 'again') start(opener, onStop);
      else if (act === 'learn') { var sc = SCENES[idx]; stop(); if (sc && typeof opener === 'function') opener(sc.station); }
    });
    return card;
  }
  /* A scene change is a cross-fade, not a cut: the card that is leaving fades out first, the
     camera starts moving, and the new card fades in once the plate has begun to settle. */
  function swapCard(fill) {
    var c = buildCard();
    if (c.hidden || c.classList.contains('is-moving') || !canAnimate()) { fill(c); return; }
    fadeOut(c, '-10px');
    later(function () { fill(c); }, 260);
  }
  function showCard(sc, i) { swapCard(function (c) { fillCard(c, sc, i); }); }
  function fillCard(c, sc, i) {
    var was = at;
    c.hidden = false;
    /* pos is where the card sits: one place, or a list of [ms, place] so the card moves out of
       the way as the food does — in digestion it starts low, so the oesophagus is never covered.
       Moving between the two is a fade and a drift towards where it is going, and the camera
       re-frames at the same time so the organ stays in the space that is left. */
    var place = function (p, animate) {
      if (p === at && animate) return;
      if (!animate || !canAnimate()) {
        c.classList.toggle('tourcard--bottom', p === 'bottom');
        if (animate) camera(curCam || sc.cam, 700, p);
        at = p; return;
      }
      /* out, drifting the way it is going; then in from the other side */
      c.style.setProperty('--drift', p === 'bottom' ? '16px' : '-16px');
      c.classList.add('is-moving');
      camera(curCam || sc.cam, 700, p);
      later(function () {
        c.classList.toggle('tourcard--bottom', p === 'bottom');
        at = p;
        fadeIn(c, p === 'bottom' ? '-16px' : '16px', 30);
      }, 300);
    };
    if (typeof sc.pos === 'string') place(sc.pos);
    else if (sc.pos && sc.pos.length) { place(sc.pos[0][1]); sc.pos.slice(1).forEach(function (q) { later(function () { place(q[1], true); }, q[0]); }); }
    c.querySelector('.tourcard__more').innerHTML = '';                 /* the panel beside is already the station */
    c.querySelector('.tourcard__chip').innerHTML = '<span class="chip chip--' + sc.id + '"><i class="chip__n">' + (i + 1) + '</i>' + sc.name + '</span>';
    c.querySelector('.tourcard__step').textContent = (i + 1) + ' of ' + SCENES.length;
    c.querySelector('.tourcard__def').textContent = sc.def;
    c.querySelector('.tourcard__note').classList.remove('is-swap');
    c.querySelector('.tourcard__note').textContent = sc.notes[0][1];
    c.querySelector('.tourcard__btns').innerHTML =
      '<button type="button" class="btn btn--ghost" data-act="back"' + (i === 0 ? ' disabled' : '') + '>Back</button>' +
      '<button type="button" class="btn" data-act="next">' + (i === SCENES.length - 1 ? 'Finish' : 'Next') + '</button>' +
      '<button type="button" class="btn btn--ghost" data-act="stop">Stop</button>';
    /* in, drifting from the side the card was on — after the camera has begun to move, so the
       plate leads and the words follow it */
    fadeIn(c, was === 'top' ? '-16px' : was === 'bottom' ? '16px' : '8px', 260);
    sc.notes.slice(1).forEach(function (n) { later(function () { swapText(c.querySelector('.tourcard__note'), n[1]); }, n[0]); });
  }

  function showEnd() { swapCard(fillEnd); }
  function fillEnd(c) {
    var wasEnd = at;
    c.hidden = false;
    c.classList.add('tourcard--bottom'); at = 'bottom';
    c.querySelector('.tourcard__note').classList.remove('is-swap');
    fadeIn(c, wasEnd === 'top' ? '-16px' : '16px', 300);
    c.querySelector('.tourcard__more').innerHTML = '<span>click any organ on the plate to learn more</span>';
    c.querySelector('.tourcard__chip').innerHTML = '<b>Five processes, in order</b>';
    c.querySelector('.tourcard__step').textContent = '';
    c.querySelector('.tourcard__def').textContent = 'Ingestion → digestion → absorption → assimilation → egestion.';
    c.querySelector('.tourcard__note').textContent = 'The food itself only ever travels down one tube, the alimentary canal. Everything else — bile, pancreatic juice, the nutrients in the blood — moves in or out of that tube.';
    c.querySelector('.tourcard__btns').innerHTML = '<button type="button" class="btn" data-act="again">Play again</button><button type="button" class="btn btn--ghost" data-act="stop">Close</button>';
  }

  /* ---------- the scenes ---------- */
  /* How much of the plate the card is covering, as a fraction of its height — measured, so the
     framing is right whatever the window size or how long the card's text is. */
  function cardShare() {
    var host = document.querySelector('.bodycol');
    if (!host || !card || card.hidden) return 0;
    var h = host.getBoundingClientRect().height;
    return h ? Math.min(0.42, card.getBoundingClientRect().height / h + 0.04) : 0;
  }
  /* The organ is centred in the band the card leaves free, not in the whole column: with the card
     at the top the view sits lower, with it at the bottom it sits higher. */
  function camera(cam, ms, pos) {
    if (!global.Zoom || !cam) return;
    var f = global.Zoom.frameFor(cam), share = cardShare();
    var shift = pos === 'top' ? -f.h * share / 2 : pos === 'bottom' ? f.h * share / 2 : 0;
    global.Zoom.flyTo(global.Zoom.frameFor({ cx: cam.cx, cy: cam.cy + shift, w: cam.w }), ms == null ? 900 : ms);
  }
  var hidden = [];
  function unhide() { hidden.forEach(function (p) { p.style.display = ''; }); hidden = []; }
  function focus(organ, also, spot, hide) {
    if (!global.Anatomy) return;
    unhide();
    (hide || []).forEach(function (o) {
      Array.prototype.forEach.call(document.querySelectorAll('#bodySvg .art .op[data-organ="' + o + '"]'),
        function (p) { p.style.display = 'none'; hidden.push(p); });
    });
    global.Anatomy.state.active = organ; global.Anatomy.highlight();
    /* a scene can light a second organ — the liver, while the nutrients travel to it — and can
       spotlight one, which lights the organ as it is drawn rather than outlining a silhouette
       that runs on behind whatever overlaps it */
    Array.prototype.forEach.call(document.querySelectorAll('#bodySvg .art .op.is-spot'), function (p) { p.classList.remove('is-spot'); });
    (also || []).forEach(function (o) {
      Array.prototype.forEach.call(document.querySelectorAll('#bodySvg .art .op[data-organ="' + o + '"]'),
        function (p) { p.classList.remove('is-dim'); p.classList.add('is-on'); });
    });
    (spot || []).forEach(function (o) {
      Array.prototype.forEach.call(document.querySelectorAll('#bodySvg .art .op[data-organ="' + o + '"]'),
        function (p) { p.classList.remove('is-dim'); p.classList.add('is-on'); p.classList.add('is-spot'); });
    });
  }
  function play(i) {
    clearTimers(); clearFx(); fxFade(0, 0);
    var A = global.Anatomy;
    if (i >= SCENES.length) { idx = SCENES.length; running = true; if (A) A.stopJourney(); if (typeof opener === 'function') opener('overview', true); curCam = { cx:180, cy:430, w:420 }; showEnd(); camera(curCam, 1000, 'bottom'); return; }
    idx = i; running = true;
    var sc = SCENES[i];
    if (typeof opener === 'function') opener(sc.station, true);
    curCam = sc.cam;
    camera(sc.cam, 1100, typeof sc.pos === 'string' ? sc.pos : (sc.pos && sc.pos[0][1]));   /* the plate leads, unhurried */
    /* the camera track: the view follows the food instead of waiting at the far end for it */
    (sc.cams || []).slice(1).forEach(function (leg) {
      later(function () { curCam = leg[1]; camera(leg[1], leg[2] || 900, at); }, leg[0]);
    });
    later(function () { fxFade(1, 320); }, 120);
    focus(sc.organ, sc.also, sc.spot, sc.hide); showCard(sc, i);
    if (!A) return;
    /* the landmarks along the canal (fractions of its length), found on the plate's own path */
    var M = A.marks() || { mouth:0.01, pharynx:0.04, stomach:0.24, duodenum:0.34, jejunum:0.38, ileum:0.62, caecum:0.68, colon:0.78, sigmoid:0.92, anus:1 };
    var mix = function (a, b, k) { return a + (b - a) * k; };
    var swallowed = mix(M.mouth, M.pharynx, 0.55);
    if (sc.id === 'ingestion') {
      /* chewing: the meal sits in the mouth and works, and is still there when the scene ends */
      A.placeBolus(M.mouth * 0.3);
      later(function () { A.travel(M.mouth * 0.3, M.mouth, 2600); }, 1200);
      later(function () { A.travel(M.mouth, M.mouth * 0.6, 1800); }, 5000);
      later(function () { A.travel(M.mouth * 0.6, M.mouth, 1800); }, 8000);
    } else if (sc.id === 'digestion') {
      var st = M.stomach, w = 0.006;
      /* swallow: up to the pharynx, a beat while the epiglottis closes the airway, then down */
      A.placeBolus(M.mouth);
      A.travel(M.mouth, swallowed, 3200, function () {
        later(function () {
          A.travel(swallowed, st, 7400, function () {              /* down the oesophagus, unhurried */
            /* churning: the bolus is held in the stomach and wobbles */
            later(function () { A.travel(st, st - w, 700, function () { A.travel(st - w, st + w, 800); }); }, 300);
            later(function () { A.travel(st + w, st - w, 800, function () { A.travel(st - w, st + w, 800); }); }, 2200);
            later(function () { A.travel(st + w, st - w, 800, function () { A.travel(st - w, st + w, 800); }); }, 4000);
            later(function () {
              A.travel(st + w, M.duodenum, 3600, function () {
                drops(BILE, '#8DB43A', 2.2, 4.5, 6);
                drops(PANC, '#E8C95A', 2.2, 4.5, 6);
              });
            }, 6000);
          });
        }, 4000);                                                   /* the beat at the epiglottis */
      });
    } else if (sc.id === 'absorption') {
      A.placeBolus(M.duodenum);
      A.travel(M.duodenum, M.ileum, 13000);
      later(function () { vein(); }, 1400);          /* the mesentery's veins do the collecting */
    } else if (sc.id === 'assimilation') {
      A.placeBolus(M.ileum);
      vein();
    } else if (sc.id === 'egestion') {
      A.placeBolus(M.ileum);
      A.travel(M.ileum, 0.995, 13000, function () { later(function () { A.stopJourney(); }, 900); });
      [0.15, 0.35, 0.55, 0.75, 0.9].forEach(function (k, i) { later(function () { water(mix(M.caecum, M.sigmoid, k)); }, 1200 + i * 1400); });
    }
    later(function () { fadeOut(card, '-10px'); fxFade(0, 280); }, Math.max(600, sc.ms - 320));
    later(function () { play(i + 1); }, sc.ms);
  }
  function next() { if (!running) return; play(Math.min(idx + 1, SCENES.length)); }
  function back() { if (!running) return; play(Math.max(idx - 1, 0)); }
  function start(openFn, doneFn) {
    opener = openFn; onStop = doneFn;
    if (typeof opener === 'function') opener('overview', true);   /* the station whose text is the five processes */
    running = true;
    later(function () { play(0); }, 300);
    document.addEventListener('keydown', onKey);
  }
  function stop(opts) {
    if (!running && idx < 0) return;
    if (card) card.classList.remove('is-moving');
    unhide();
    Array.prototype.forEach.call(document.querySelectorAll('#bodySvg .art .op.is-spot'), function (p) { p.classList.remove('is-spot'); });
    var landing = idx >= SCENES.length || idx < 0 ? 'overview' : SCENES[idx].station;
    running = false; idx = -1;
    clearTimers(); clearFx();
    if (global.Anatomy) global.Anatomy.stopJourney();
    if (card) card.hidden = true;
    document.removeEventListener('keydown', onKey);
    if (typeof onStop === 'function') onStop();
    if (opts && opts.reopen && typeof opener === 'function') opener(landing);
  }
  function onKey(e) {
    if (e.key === 'Escape') stop({ reopen:true });
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') back();
  }
  global.Tour = { start:start, stop:stop, next:next, back:back, isRunning:function () { return running; }, SCENES:SCENES };
})(window);
