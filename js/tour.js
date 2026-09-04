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
  /* Saliva, the same idea as bile: two short ducts into the mouth so the glands are seen to
     be doing something rather than just being named. The parotid runs forward across the
     cheek; the submandibular and sublingual come up into the floor of the mouth. Plate
     coordinates, taken from where those organs actually sit in the artwork. */
  var SAL_PAROTID = [[168, 141], [160, 141], [152, 140], [144, 139], [137, 139]];
  var SAL_SUBMAND = [[145, 172], [141, 166], [137, 159], [134, 152], [132, 146]];

  /* Timings are set by how long the words take to read, not by how long the movement takes: a
     scene lasts about a word every third of a second, and the notes inside it are spaced the same
     way. Anyone who reads faster can press Next. */
  var SCENES = [
    { id:'ingestion', name:'Ingestion', organ:'mouth', station:'mouth', stationName:'Mouth and teeth', pos:'bottom', cam:{ cx:140, cy:150, w:210 }, ms:14000,
      def:'Ingestion is the taking of substances — food and drink — into the body through the mouth.',
      seek:['mouth'],
      notes:[[0, 'The meal goes in. Chewing starts physical digestion at once, and saliva adds the first enzyme, amylase.']] },
    { id:'digestion', name:'Digestion', organ:'stomach', station:'stomach', stationName:'Stomach', pos:[[0, 'bottom'], [18200, 'top']], cam:{ cx:150, cy:196, w:250 }, ms:42400,
      /* The camera travels with the food. A single frame on the stomach leaves the swallow and the
         whole oesophagus off the top of the plate: for ten seconds the reader sees nothing happen
         and then the bolus appears, already in the stomach. Each leg is [when, camera, how long]. */
      cams:[[0,     { cx:150, cy:196, w:250 }, 900],
            [6900,  { cx:186, cy:470, w:330 }, 7700],
            [15200, { cx:196, cy:498, w:300 }, 1300],
            [22600, { cx:182, cy:520, w:330 }, 1300]],
      def:'Digestion is the breakdown of food. Physical digestion breaks it into smaller pieces without chemical change; chemical digestion uses enzymes to break large, insoluble molecules into small, soluble ones.',
      /* Read these out loud before changing them. The first three used to land 3.4s and 4s
         apart, which is under two words a second for a sentence of seventeen — the reader
         sees the words move, not what they say. Each note now gets at least five seconds,
         and still arrives with the picture it belongs to: the camera starts travelling at
         6.9s, reaches the stomach at 15.2s and the duodenum at 22.6s. */
      /* Where the food is when each sentence shows, so stepping moves the picture with the
         words instead of leaving the bolus wherever the clock had got to. */
      seek:['mouth', 'swallowed', 'oesoph', 'stomach', 'stomach', 'duodenum'],
      notes:[[0, 'Swallowing: the tongue pushes the bolus to the back of the mouth.'],
             [5200, 'The epiglottis folds over the windpipe, so the bolus goes down the oesophagus and not the airway.'],
             [12000, 'Down the oesophagus by peristalsis — muscle contracting behind the bolus and relaxing in front of it.'],
             /* The card moves to the top at 16800 too, so this sentence is already there when it
                arrives rather than replacing the oesophagus one a moment afterwards. */
             [18200, 'In the stomach: churning is physical digestion; hydrochloric acid kills bacteria.'],
             [23800, 'Pepsin, a protease, digests protein into polypeptides — the acid gives it the low pH it needs.'],
             [30400, 'In the duodenum, bile and pancreatic juice arrive through ducts. The food never enters the liver, gall bladder or pancreas — they only secrete into the tube.']] },
    { id:'absorption', name:'Absorption', organ:'ileum-villi', station:'ileum-villi', stationName:'Small intestine', pos:'bottom', also:['liver'], spot:['liver'], hide:['gall-bladder'], cam:{ cx:202, cy:580, w:362 }, ms:18000,
      def:'Absorption is the movement of nutrients from the intestines into the blood.',
      seek:['duodenum', 'jejunum'],
      notes:[[0, 'Along the small intestine the small, soluble molecules cross the villi into the blood — and most of the water goes the same way. The meal shrinks as it is absorbed.'],
             [9000, 'The veins that collect them run inside the mesentery, the sheet that holds the intestine, and join into one vein to the liver.']] },
    { id:'assimilation', name:'Assimilation', organ:'liver', station:'liver', stationName:'Liver', pos:'bottom', also:['ileum-villi'], spot:['liver'], hide:['gall-bladder'], cam:{ cx:202, cy:580, w:362 }, ms:20000,
      def:'Assimilation is the movement of digested food molecules into the cells of the body, where they are used and become part of the cells.',
      seek:['ileum', 'ileum'],
      notes:[[0, 'What reaches the liver is the nutrients in the blood, in the hepatic portal vein — never the food.'],
             [9000, 'Glucose that is not needed straight away is stored as glycogen; amino acids go on to build new proteins in every cell.']] },
    { id:'egestion', name:'Egestion', organ:'colon', station:'colon', stationName:'Large intestine', pos:'top', cam:{ cx:182, cy:637, w:340 }, ms:20000,
      def:'Egestion is the passing out of food that has not been digested or absorbed, as faeces, through the anus.',
      seek:['ileum', 'colon'],
      notes:[[0, 'In the colon the remaining water is reabsorbed into the blood, and what is left becomes faeces.'],
             [9500, 'Not excretion: faeces were never inside the body’s cells. Excretion is urea from the kidneys and carbon dioxide from the lungs.']] }
  ];


  var card = null, fx = null, timers = [], running = false, idx = -1, opener = null, onStop = null, at = null;
  var pending = [], paused = false;
  /* Which sentence of the current scene the card is showing: -1 is the definition, 0.. are
     the notes. Next and Back step through these, not through whole scenes — a reader who
     missed a sentence wants that sentence again, not the last two minutes again. */
  var noteAt = -1, noteTimers = [], manual = false;
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
  /* The card says one thing at a time. Two blocks of words — a definition that never changes
     above a note that does — makes the change easy to miss: the reader has to notice that the
     lower half moved. So the definition has the card to itself while it is read, and then hands
     over to the running commentary, each note fading through the one before. The eyebrow says
     which of the two you are reading. */
  var SAY = { def:'what the word means', note:'what is happening' };
  function say(c, kind, text, instant) {
    var box = c.querySelector('.tourcard__say');
    if (!box) return;
    var set = function () {
      c.classList.toggle('is-notes', kind !== 'def');
      box.querySelector('.tourcard__eyebrow').textContent = SAY[kind] || '';
      var line = box.querySelector('.tourcard__line');
      line.textContent = text;
      line.classList.toggle('tourcard__line--def', kind === 'def');
    };
    if (instant || !canAnimate()) { box.classList.remove('is-swap'); set(); return; }
    box.classList.add('is-swap');
    later(function () { set(); box.classList.remove('is-swap'); }, 240);
  }
  /* Hold the card at the height of its longest line, so handing over does not make it jump. */
  function sizeSay(c, strings) {
    var box = c.querySelector('.tourcard__say'); if (!box) return;
    var line = box.querySelector('.tourcard__line'), eb = box.querySelector('.tourcard__eyebrow');
    var keepLine = line.textContent, keepEb = eb.textContent, keepDef = line.classList.contains('tourcard__line--def');
    box.style.minHeight = ''; var max = 0;
    strings.forEach(function (t) {
      line.textContent = t[1]; line.classList.toggle('tourcard__line--def', t[0] === 'def');
      eb.textContent = SAY[t[0]] || '';
      max = Math.max(max, box.offsetHeight);
    });
    line.textContent = keepLine; eb.textContent = keepEb; line.classList.toggle('tourcard__line--def', keepDef);
    box.style.minHeight = max ? max + 'px' : '';
  }
  /* How long the definition keeps the card to itself: the time it takes to read it. */
  function leadFor(sc) {
    var words = String(sc.def || '').split(/\s+/).length;
    return Math.min(8000, Math.max(3500, Math.round(words * 300)));
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
  /* Everything the tour does later goes through here, and every one of those is remembered
     with the time it is due. That is what makes pausing possible: on pause the timers are
     cancelled and what is left of each wait is kept; on play they are set again for what
     remains. Without the record, pausing would either lose the rest of the scene or replay
     it from the top. */
  function later(fn, ms) {
    var rec = { fn:fn, left:ms || 0, due:Date.now() + (ms || 0), t:null };
    var fire = function () {
      rec.t = null;
      var k = pending.indexOf(rec); if (k >= 0) pending.splice(k, 1);
      if (running && !paused) fn();
    };
    if (!paused) rec.t = setTimeout(fire, rec.left);
    rec.fire = fire;
    pending.push(rec);
    if (rec.t) timers.push(rec.t);
    return rec.t;
  }
  function clearTimers() {
    timers.forEach(clearTimeout); timers = [];
    pending.forEach(function (r) { if (r.t) clearTimeout(r.t); });
    pending = [];
  }

  /* The drawn animations are SMIL, so the browser can hold them still for us. */
  function plateSvg() { return document.getElementById('bodySvg'); }

  function setPaused(v) {
    if (!running || paused === v) return;
    paused = v;
    var svg = plateSvg(), now = Date.now();
    if (paused) {
      pending.forEach(function (r) {
        if (r.t) { clearTimeout(r.t); r.t = null; }
        r.left = Math.max(0, r.due - now);
      });
      try { if (svg) svg.pauseAnimations(); } catch (e) {}
    } else {
      pending.forEach(function (r) {
        r.due = now + r.left;
        r.t = setTimeout(r.fire, r.left);
        timers.push(r.t);
      });
      try { if (svg) svg.unpauseAnimations(); } catch (e) {}
      if (manual) { manual = false; rearmFrom(noteAt); }
      else rearmNotes();
    }
    paintPause(); paintStep();
  }

  /* Stepping by hand cancels the sentences still queued for the scene. Put them back, spaced
     as they were from the one now showing, so Play carries on instead of leaving the rest of
     the scene silent. */
  function rearmNotes() {
    var sc = SCENES[idx];
    if (!sc || !sc.notes || !sc.notes.length || noteTimers.length) return;
    var base = noteAt >= 0 ? sc.notes[noteAt][0] : 0;
    for (var k = noteAt + 1; k < sc.notes.length; k++) {
      (function (j) {
        noteTimers.push(later(function () {
          noteAt = j;
          if (card) say(card, 'note', sc.notes[j][1]);
          paintStep();
        }, Math.max(400, sc.notes[j][0] - base)));
      })(k);
    }
  }

  /* A landmark name from a scene's seek map, as a fraction along the canal. */
  function markAt(name) {
    var A = global.Anatomy; if (!A) return null;
    var M = A.marks() || { mouth:0.01, pharynx:0.04, stomach:0.24, duodenum:0.34, jejunum:0.38,
                           ileum:0.62, caecum:0.68, colon:0.78, sigmoid:0.92, anus:1 };
    var mix = function (a, b, k) { return a + (b - a) * k; };
    switch (name) {
      case 'mouth':     return M.mouth;
      case 'swallowed': return mix(M.mouth, M.pharynx, 0.55);
      case 'oesoph':    return mix(mix(M.mouth, M.pharynx, 0.55), M.stomach, 0.55);
      case 'stomach':   return M.stomach;
      case 'duodenum':  return M.duodenum;
      case 'jejunum':   return mix(M.duodenum, M.ileum, 0.6);
      case 'ileum':     return M.ileum;
      case 'colon':     return mix(M.caecum, M.sigmoid, 0.55);
      case 'anus':      return 0.995;
    }
    return null;
  }

  /* Put the whole picture where that sentence belongs: the camera leg that covers it, the
     side of the plate the card sits on, and the food itself. Stepping used to move only the
     words, so the bolus stayed wherever the clock had reached and pressing Play spent a long
     time catching up — or never did. */
  function seekPicture(sc, k, ms) {
    var T = k < 0 ? 0 : (sc.notes && sc.notes[k] ? sc.notes[k][0] : 0);
    var cam = sc.cam;
    (sc.cams || []).forEach(function (leg) { if (leg[0] <= T) cam = leg[1]; });
    var place = typeof sc.pos === 'string' ? sc.pos : (sc.pos && sc.pos.length ? sc.pos[0][1] : null);
    if (sc.pos && typeof sc.pos !== 'string') sc.pos.forEach(function (q) { if (q[0] <= T) place = q[1]; });
    if (card && place) { card.classList.toggle('tourcard--bottom', place === 'bottom'); at = place; }
    curCam = cam;
    camera(cam, ms == null ? 520 : ms, place || at);

    var A = global.Anatomy;
    if (!A || !sc.seek) return;
    var f = markAt(sc.seek[Math.max(0, k)]);
    if (f == null) return;
    A.stopJourney();
    A.placeBolus(f);
  }

  /* After a manual step the scene's own chain of animations has been cancelled, so Play
     cannot simply resume it. Instead the remaining sentences are re-armed with their original
     spacing, and the food travels from each one's landmark to the next — the picture keeps up
     with the words rather than replaying a schedule that no longer matches them. */
  function rearmFrom(k) {
    var sc = SCENES[idx];
    if (!sc || !sc.notes || !sc.notes.length) return;
    var A = global.Anatomy;
    var base = k >= 0 ? sc.notes[k][0] : 0;
    for (var j = Math.max(0, k) + (k < 0 ? 0 : 1); j < sc.notes.length; j++) {
      (function (n) {
        var gap = Math.max(500, sc.notes[n][0] - base);
        var from = markAt((sc.seek || [])[Math.max(0, n - 1)]);
        var to = markAt((sc.seek || [])[n]);
        noteTimers.push(later(function () {
          noteAt = n;
          if (card) say(card, 'note', sc.notes[n][1]);
          seekPicture(sc, n, 700);
          paintStep();
        }, gap));
        if (A && from != null && to != null && Math.abs(to - from) > 0.001) {
          noteTimers.push(later(function () { A.travel(from, to, Math.max(600, gap - 500)); },
                                Math.max(200, gap - Math.max(600, gap - 500))));
        }
      })(j);
    }
    later(function () { play(idx + 1); }, Math.max(1500, sc.ms - base));
  }

  function paintPause() {
    if (!card) return;
    var b = card.querySelector('[data-act="pause"]');
    if (!b) return;
    b.textContent = paused ? '▶ Play' : '⏸ Pause';
    b.setAttribute('aria-label', paused ? 'Play the tour' : 'Pause the tour');
    b.setAttribute('aria-pressed', paused ? 'true' : 'false');
  }
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

  /* An organ that is secreting should look like it. Without this the drops appear out of a
     grey silhouette, and only the liver read as the source because the bile happens to start
     on top of it — the pancreas was doing the same work with nothing to show for it. */
  function lightSecretors(list, ms) {
    var on = [];
    (list || []).forEach(function (o) {
      Array.prototype.forEach.call(document.querySelectorAll('#bodySvg .art .op[data-organ="' + o + '"]'),
        function (p) { p.classList.remove('is-dim'); p.classList.add('is-on'); on.push(p); });
    });
    if (ms) later(function () { on.forEach(function (p) { p.classList.remove('is-on'); }); }, ms);
  }
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
      '<div class="tourcard__say"><p class="tourcard__eyebrow"></p><p class="tourcard__line"></p></div>' +
      '<div class="tourcard__foot"><div class="tourcard__btns"><button type="button" class="btn btn--ghost" data-act="back">Back</button>' +
      '<button type="button" class="btn btn--ghost" data-act="pause" aria-pressed="false"' +
        ' title="Hold the tour here" aria-label="Pause the tour">⏸ Pause</button>' +
      '<button type="button" class="btn" data-act="next">Next</button>' +
      '<button type="button" class="btn btn--ghost" data-act="stop"' +
        ' title="End the tour and open this station">Close</button></div><div class="tourcard__more"></div></div>';
    host.appendChild(card);
    card.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'pause') { setPaused(!paused); return; }
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
    var lead = leadFor(sc);
    if (typeof sc.pos === 'string') place(sc.pos);
    else if (sc.pos && sc.pos.length) { place(sc.pos[0][1]); sc.pos.slice(1).forEach(function (q) { later(function () { place(q[1], true); }, lead + q[0]); }); }
    c.querySelector('.tourcard__more').innerHTML = '';                 /* the panel beside is already the station */
    c.querySelector('.tourcard__chip').innerHTML = '<span class="chip chip--' + sc.id + '"><i class="chip__n">' + (i + 1) + '</i>' + sc.name + '</span>';
    c.querySelector('.tourcard__step').textContent = (i + 1) + ' of ' + SCENES.length;
    sizeSay(c, [['def', sc.def]].concat(sc.notes.map(function (n) { return ['note', n[1]]; })));
    say(c, 'def', sc.def, true);
    /* This row is rebuilt for every scene, so the pause button has to be rebuilt with it —
       put it only in the card's first markup and it disappears the moment a scene plays. */
    c.querySelector('.tourcard__btns').innerHTML =
      '<button type="button" class="btn btn--ghost" data-act="back"' + (i === 0 ? ' disabled' : '') + '>Back</button>' +
      '<button type="button" class="btn btn--ghost" data-act="pause" aria-pressed="false"' +
        ' title="Hold the tour here" aria-label="Pause the tour">\u23F8 Pause</button>' +
      '<button type="button" class="btn" data-act="next">Next</button>' +
      /* Not the same as Pause, and it should not read like it: this ends the tour and opens
         the station it had reached, so you can read that organ properly. The end-of-tour
         card already calls the same action Close. */
      '<button type="button" class="btn btn--ghost" data-act="stop"' +
        ' title="End the tour and open this station">Close</button>';
    paintPause(); paintStep();
    /* in, drifting from the side the card was on — after the camera has begun to move, so the
       plate leads and the words follow it */
    fadeIn(c, was === 'top' ? '-16px' : was === 'bottom' ? '16px' : '8px', 260);
    noteAt = -1; noteTimers = []; manual = false;
    sc.notes.forEach(function (n, k) {
      noteTimers.push(later(function () { noteAt = k; say(c, 'note', n[1]); }, lead + n[0]));
    });
  }

  function showEnd() { swapCard(fillEnd); }
  function fillEnd(c) {
    var wasEnd = at;
    c.hidden = false;
    c.classList.add('tourcard--bottom'); at = 'bottom';
    c.querySelector('.tourcard__say').classList.remove('is-swap');
    c.querySelector('.tourcard__say').style.minHeight = '';
    fadeIn(c, wasEnd === 'top' ? '-16px' : '16px', 300);
    c.querySelector('.tourcard__more').innerHTML = '<span>click any organ on the plate to learn more</span>';
    c.querySelector('.tourcard__chip').innerHTML = '<b>Five processes, in order</b>';
    c.querySelector('.tourcard__step').textContent = '';
    var END1 = 'Ingestion → digestion → absorption → assimilation → egestion.';
    var END2 = 'The food itself only ever travels down one tube, the alimentary canal. Everything else — bile, pancreatic juice, the nutrients in the blood — moves in or out of that tube.';
    sizeSay(c, [['def', END1], ['note', END2]]);
    say(c, 'def', END1, true);
    later(function () { say(c, 'note', END2); }, 4200);
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
    if (paused) { paused = false; try { var _s = plateSvg(); if (_s) _s.unpauseAnimations(); } catch (e) {} }
    paintPause();
    var sc = SCENES[i];
    /* The definition has the card to itself first, so the scene's own clock starts after it:
       the food waits where the last scene left it while the reader takes in what the word means. */
    var LEAD = leadFor(sc);
    if (typeof opener === 'function') opener(sc.station, true);
    curCam = sc.cam;
    camera(sc.cam, 1100, typeof sc.pos === 'string' ? sc.pos : (sc.pos && sc.pos[0][1]));   /* the plate leads, unhurried */
    /* the camera track: the view follows the food instead of waiting at the far end for it */
    (sc.cams || []).slice(1).forEach(function (leg) {
      later(function () { curCam = leg[1]; camera(leg[1], leg[2] || 900, at); }, LEAD + leg[0]);
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
      later(function () {
        drops(SAL_PAROTID, '#8FC7E8', 1.9, 3.4, 4);
        drops(SAL_SUBMAND, '#8FC7E8', 1.9, 3.4, 4);
        lightSecretors(['salivary-glands'], 8000);
      }, LEAD + 900);
      later(function () { A.travel(M.mouth * 0.3, M.mouth, 2600); }, LEAD + 1200);
      later(function () { A.travel(M.mouth, M.mouth * 0.6, 1800); }, LEAD + 5000);
      later(function () { A.travel(M.mouth * 0.6, M.mouth, 1800); }, LEAD + 8000);
    } else if (sc.id === 'digestion') {
      var st = M.stomach, w = 0.006;
      /* swallow: up to the pharynx, a beat while the epiglottis closes the airway, then down */
      A.placeBolus(M.mouth);
      later(function () { A.travel(M.mouth, swallowed, 3200, function () {
        later(function () {
          A.travel(swallowed, st, 7400, function () {              /* down the oesophagus, unhurried */
            /* churning: the bolus is held in the stomach and wobbles */
            later(function () { A.travel(st, st - w, 700, function () { A.travel(st - w, st + w, 800); }); }, 300);
            later(function () { A.travel(st + w, st - w, 800, function () { A.travel(st - w, st + w, 800); }); }, 2200);
            later(function () { A.travel(st + w, st - w, 800, function () { A.travel(st - w, st + w, 800); }); }, 4000);
            later(function () { A.travel(st + w, st - w, 800, function () { A.travel(st - w, st + w, 800); }); }, 5800);
            later(function () {
              A.travel(st + w, M.duodenum, 3600, function () {
                drops(BILE, '#8DB43A', 2.2, 4.5, 6);
                drops(PANC, '#E8C95A', 2.2, 4.5, 6);
                lightSecretors(['liver', 'gall-bladder', 'pancreas'], 7000);
              });
            }, 9000);
          });
        }, 4000);                                                   /* the beat at the epiglottis */
      }); }, LEAD);
    } else if (sc.id === 'absorption') {
      A.placeBolus(M.duodenum);
      later(function () { A.travel(M.duodenum, M.ileum, 13000); }, LEAD);
      later(function () { vein(); }, LEAD + 1400);    /* the mesentery's veins do the collecting */
    } else if (sc.id === 'assimilation') {
      A.placeBolus(M.ileum);
      later(function () { vein(); }, LEAD);
    } else if (sc.id === 'egestion') {
      A.placeBolus(M.ileum);
      later(function () { A.travel(M.ileum, 0.995, 13000, function () { later(function () { A.stopJourney(); }, 900); }); }, LEAD);
      [0.15, 0.35, 0.55, 0.75, 0.9].forEach(function (k, i) { later(function () { water(mix(M.caecum, M.sigmoid, k)); }, LEAD + 1200 + i * 1400); });
    }
    var span = sc.ms + LEAD;
    later(function () { fadeOut(card, '-10px'); fxFade(0, 280); }, Math.max(600, span - 320));
    later(function () { play(i + 1); }, span);
  }
  /* Next and Back move one sentence. At either end of a scene they move to the next or the
     previous scene, as they always did. Stepping hands control to the reader, so it also
     pauses: otherwise the sentence you just went back for would be replaced a moment later
     by the one that was already on its way. Press Play to let it run on. */
  function stepNote(dir) {
    if (!running) return;
    var sc = SCENES[idx];
    if (!sc || !sc.notes || !sc.notes.length) {
      play(dir > 0 ? Math.min(idx + 1, SCENES.length) : Math.max(idx - 1, 0));
      return;
    }
    var k = noteAt + dir;
    if (k >= sc.notes.length) { play(Math.min(idx + 1, SCENES.length)); return; }
    if (k < -1) { play(Math.max(idx - 1, 0)); return; }

    /* The reader is driving now. Everything the scene had queued goes — the sentences and the
       chain of animations behind them — because a schedule built for the clock no longer
       matches where the reader has moved to. Play rebuilds it from here. */
    clearTimers();
    noteTimers = [];
    manual = true;

    noteAt = k;
    /* Instant, not faded. say() otherwise schedules the swap 240ms later, and the setPaused
       below holds that timer — so the card faded out and the words never arrived. A reader
       who pressed a button wants the sentence now anyway. */
    if (card) say(card, k < 0 ? 'def' : 'note', k < 0 ? sc.def : sc.notes[k][1], true);
    seekPicture(sc, k, 420);          /* the picture goes where the sentence is */
    setPaused(true);
    paintStep();
  }
  function next() { stepNote(1); }
  function back() { stepNote(-1); }

  /* Back is only dead at the very beginning, and Next reads Finish only on the last
     sentence of the last scene. */
  function paintStep() {
    if (!card) return;
    var sc = SCENES[idx], b = card.querySelector('[data-act="back"]'), n = card.querySelector('[data-act="next"]');
    if (b) b.disabled = (idx <= 0 && noteAt <= -1);
    if (n && sc) n.textContent = (idx === SCENES.length - 1 && noteAt >= sc.notes.length - 1) ? 'Finish' : 'Next';
  }
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
    if (paused) { paused = false; try { var _s2 = plateSvg(); if (_s2) _s2.unpauseAnimations(); } catch (e) {} }
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
  global.Tour = { start:start, stop:stop, next:next, back:back, isRunning:function () { return running; }, SCENES:SCENES,
    peek:function () { return { idx:idx, noteAt:noteAt, notes:(SCENES[idx] || {}).notes ? SCENES[idx].notes.length : -1,
                                paused:paused, noteTimers:noteTimers.length, pending:pending.length }; } };
})(window);
