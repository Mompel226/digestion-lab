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
  var PORTAL = [[200, 650], [206, 620], [204, 592], [196, 564], [182, 536], [166, 508], [152, 486]];
  var BILE = [[144, 488], [150, 489], [156, 490], [156, 508], [153, 526], [148, 543], [142, 556]];
  var PANC = [[258, 504], [247, 510], [236, 515], [224, 520], [212, 524], [200, 528], [188, 534], [177, 539], [168, 546], [159, 556], [149, 559]];

  var SCENES = [
    { id:'ingestion', name:'Ingestion', organ:'mouth', station:'mouth', stationName:'Mouth and teeth', pos:'bottom', cam:{ cx:140, cy:150, w:210 }, ms:7000,
      def:'Ingestion is the taking of substances — food and drink — into the body through the mouth.',
      notes:[[0, 'The meal goes in. Chewing starts physical digestion at once, and saliva adds the first enzyme, amylase.']] },
    { id:'digestion', name:'Digestion', organ:'stomach', station:'stomach', stationName:'Stomach', pos:'top', cam:{ cx:190, cy:420, w:320 }, ms:16000,
      def:'Digestion is the breakdown of food. Physical digestion breaks it into smaller pieces without chemical change; chemical digestion uses enzymes to break large, insoluble molecules into small, soluble ones.',
      notes:[[0, 'Swallowed, then pushed down the oesophagus by peristalsis.'],
             [4200, 'In the stomach: churned (physical digestion), acid kills microbes, and pepsin starts on protein.'],
             [8600, 'In the duodenum, bile and pancreatic juice arrive through ducts. The food never enters the liver, gall bladder or pancreas — they only secrete into the tube.']] },
    { id:'absorption', name:'Absorption', organ:'ileum-villi', station:'ileum-villi', stationName:'Small intestine', pos:'bottom', cam:{ cx:192, cy:620, w:300 }, ms:10000,
      def:'Absorption is the movement of nutrients from the intestines into the blood.',
      notes:[[0, 'Along the small intestine the small, soluble molecules cross the villi into the blood — and most of the water goes the same way. The meal shrinks as it is absorbed.']] },
    { id:'assimilation', name:'Assimilation', organ:'liver', station:'liver', stationName:'Liver', pos:'bottom', cam:{ cx:170, cy:540, w:290 }, ms:9000,
      def:'Assimilation is the movement of digested food molecules into the cells of the body, where they are used and become part of the cells.',
      notes:[[0, 'What reaches the liver is the nutrients in the blood, in the hepatic portal vein — never the food. Glucose is stored as glycogen; amino acids go on to build new proteins in every cell.']] },
    { id:'egestion', name:'Egestion', organ:'colon', station:'colon', stationName:'Large intestine', pos:'top', cam:{ cx:182, cy:700, w:290 }, ms:11000,
      def:'Egestion is the passing out of food that has not been digested or absorbed, as faeces, through the anus.',
      notes:[[0, 'In the colon the remaining water is reabsorbed and what is left becomes faeces.'],
             [5500, 'Not excretion: faeces were never inside the body’s cells. Excretion is urea from the kidneys and carbon dioxide from the lungs.']] }
  ];

  var card = null, fx = null, timers = [], running = false, idx = -1, opener = null, onStop = null;

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
  /* nutrients leaving the intestine into the blood and up the portal vein to the liver */
  function nutrientRoute(t) { return [canalPoint(t)].concat(PORTAL); }
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
  function showCard(sc, i) {
    var c = buildCard();
    c.hidden = false;
    c.classList.toggle('tourcard--bottom', sc.pos === 'bottom');
    c.querySelector('.tourcard__more').innerHTML = '<button type="button" class="tourcard__link" data-act="learn">Learn more at the ' + sc.stationName + ' station</button><span>or click any organ on the plate</span>';
    c.querySelector('.tourcard__chip').innerHTML = '<span class="chip chip--' + sc.id + '"><i class="chip__n">' + (i + 1) + '</i>' + sc.name + '</span>';
    c.querySelector('.tourcard__step').textContent = (i + 1) + ' of ' + SCENES.length;
    c.querySelector('.tourcard__def').textContent = sc.def;
    c.querySelector('.tourcard__note').textContent = sc.notes[0][1];
    c.querySelector('.tourcard__btns').innerHTML =
      '<button type="button" class="btn btn--ghost" data-act="back"' + (i === 0 ? ' disabled' : '') + '>Back</button>' +
      '<button type="button" class="btn" data-act="next">' + (i === SCENES.length - 1 ? 'Finish' : 'Next') + '</button>' +
      '<button type="button" class="btn btn--ghost" data-act="stop">Stop</button>';
    sc.notes.slice(1).forEach(function (n) { later(function () { c.querySelector('.tourcard__note').textContent = n[1]; }, n[0]); });
  }
  function showEnd() {
    var c = buildCard();
    c.classList.add('tourcard--bottom');
    c.querySelector('.tourcard__more').innerHTML = '<span>click any organ on the plate to learn more</span>';
    c.querySelector('.tourcard__chip').innerHTML = '<b>Five processes, in order</b>';
    c.querySelector('.tourcard__step').textContent = '';
    c.querySelector('.tourcard__def').textContent = 'Ingestion → digestion → absorption → assimilation → egestion.';
    c.querySelector('.tourcard__note').textContent = 'The food itself only ever travels down one tube, the alimentary canal. Everything else — bile, pancreatic juice, the nutrients in the blood — moves in or out of that tube.';
    c.querySelector('.tourcard__btns').innerHTML = '<button type="button" class="btn" data-act="again">Play again</button><button type="button" class="btn btn--ghost" data-act="stop">Close</button>';
  }

  /* ---------- the scenes ---------- */
  function camera(cam, ms) { if (global.Zoom) global.Zoom.flyTo(global.Zoom.frameFor(cam), ms || 900); }
  function focus(organ) {
    if (!global.Anatomy) return;
    global.Anatomy.state.active = organ; global.Anatomy.highlight();
  }
  function play(i) {
    clearTimers(); clearFx();
    var A = global.Anatomy;
    if (i >= SCENES.length) { idx = SCENES.length; running = true; if (A) A.stopJourney(); if (typeof opener === 'function') opener('overview', true); camera({ cx:180, cy:430, w:420 }, 1000); showEnd(); return; }
    idx = i; running = true;
    var sc = SCENES[i];
    if (typeof opener === 'function') opener(sc.station, true);
    camera(sc.cam, 900); focus(sc.organ); showCard(sc, i);
    if (!A) return;
    A.stopJourney();
    if (sc.id === 'ingestion') {
      A.placeBolus(0.005);
      later(function () { A.travel(0.005, 0.03, 4500); }, 900);
    } else if (sc.id === 'digestion') {
      A.travel(0.03, 0.24, 4200, function () {
        /* churning: the bolus is held in the stomach and wobbles */
        later(function () { A.travel(0.24, 0.235, 400, function () { A.travel(0.235, 0.245, 500); }); }, 200);
        later(function () { A.travel(0.245, 0.235, 500, function () { A.travel(0.235, 0.245, 500); }); }, 1300);
        later(function () { A.travel(0.245, 0.235, 500, function () { A.travel(0.235, 0.245, 500); }); }, 2400);
        later(function () {
          A.travel(0.245, 0.40, 3200, function () {
            drops(BILE, '#8DB43A', 2.2, 4.5, 5);
            drops(PANC, '#E8C95A', 2.2, 4.5, 5);
          });
        }, 4200);
      });
    } else if (sc.id === 'absorption') {
      A.travel(0.40, 0.66, 8200);
      [0.46, 0.52, 0.58, 0.63].forEach(function (t, k) {
        later(function () { drops(nutrientRoute(t), k % 2 ? '#BC235B' : '#E8A33D', 2.2, 5.5, 3); }, 1200 + k * 1500);
      });
    } else if (sc.id === 'assimilation') {
      A.placeBolus(0.66);
      drops(nutrientRoute(0.5), '#E8A33D', 2.2, 5, 4); drops(nutrientRoute(0.6), '#BC235B', 2.2, 5.6, 3);
    } else if (sc.id === 'egestion') {
      A.travel(0.66, 0.99, 8500, function () { later(function () { A.stopJourney(); }, 600); });
      [0.74, 0.79, 0.84, 0.89].forEach(function (t, k) { later(function () { water(t); }, 800 + k * 700); });
    }
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
