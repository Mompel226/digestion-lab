/* ============================================================
   app.js — wiring: plate ⇄ panel ⇄ rail, progress, guided tour.
   ============================================================ */
(function () {
  'use strict';

  var ORDER = ['diet','overview','mouth','salivary-glands','epiglottis','oesophagus','stomach',
               'liver','gall-bladder','pancreas','duodenum','ileum-villi','colon',
               'rectum-anus','molecules-lab'];

  /* which drawn/animated figures each station shows in "See it" */
  var FIGS = {
    diet:[], overview:[], mouth:['toothTypes','tooth','chewing'],
    'salivary-glands':['starchPath'], epiglottis:['swallow'], oesophagus:['peristalsis'],
    stomach:['churn'], liver:[], 'gall-bladder':['emulsify'], pancreas:[],
    duodenum:['starchPath'], 'ileum-villi':['villus'],
    colon:['waterColon'], 'rectum-anus':['egestVsExcrete'],
    'molecules-lab':['starchPath']
  };

  /* which sentence each drawn diagram illustrates */
  var FIG_AFTER = {
    'mouth:toothTypes':3, 'mouth:tooth':4, 'mouth:chewing':1,
    'salivary-glands:starchPath':2, 'epiglottis:swallow':1,
    'oesophagus:peristalsis':1,
    'stomach:churn':1, 'gall-bladder:emulsify':3,
    'duodenum:starchPath':4,
    'ileum-villi:villus':3,
    'colon:waterColon':1, 'rectum-anus:egestVsExcrete':2,
    'molecules-lab:starchPath':1
  };

  var S = {};                       /* stations by id */
  var MODES = { mastery:'Mastery', test:'Test', practice:'Practice' };
  var mode = localStorage.getItem('digestion-lab.mode') || 'mastery';
  if (mode === 'practice') mode = 'mastery';        /* practice needs the password again each session */
  var progress = load();
  var current = null;
  var tab = 'learn';

  /* ---------- progress ---------- */
  function load() {
    var d;
    try { d = JSON.parse(localStorage.getItem('digestion-lab.v2') || '{}'); } catch (e) { d = {}; }
    Object.keys(MODES).forEach(function (m) { if (!d[m]) d[m] = {}; });
    return d;
  }
  function save() {
    try { localStorage.setItem('digestion-lab.v2', JSON.stringify(progress)); } catch (e) {}
  }
  function p(id, m) {
    var bag = progress[m || mode];
    if (!bag[id]) bag[id] = { done:{}, tried:{} };
    return bag[id];
  }
  function stationScore(id, m) {
    var st = S[id];
    if (!st) return { done:0, total:0, tried:0 };
    var rec = p(id, m), n = 0, t = 0;
    Object.keys(rec.done).forEach(function (k) { if (rec.done[k]) n++; });
    Object.keys(rec.tried).forEach(function (k) { if (rec.tried[k]) t++; });
    return { done:n, total:(st.activities || []).length, tried:t };
  }
  function totals() {
    var done = 0, total = 0;
    ORDER.forEach(function (id) { var s = stationScore(id); done += s.done; total += s.total; });
    return { done:done, total:total };
  }

  /* ---------- header ---------- */
  function paintHeader() {
    var t = totals(), pct = t.total ? t.done / t.total : 0, C = 2 * Math.PI * 11;
    var sel = document.getElementById('modeSel');
    if (sel && sel.value !== mode) sel.value = mode;
    document.body.setAttribute('data-mode', mode);
    var sub = document.getElementById('btnSubmit');
    if (sub) {
      var ready = mode === 'mastery' && t.total > 0 && t.done === t.total;
      sub.hidden = mode !== 'mastery';
      sub.disabled = !ready;
      sub.title = ready ? 'Hand in your completed work'
        : 'Answer all ' + t.total + ' questions correctly in Mastery mode to hand in';
    }
    document.getElementById('ringFg').setAttribute('stroke-dasharray',
      (C * pct).toFixed(1) + ' ' + C.toFixed(1));
    document.getElementById('qDone').textContent = t.done;
    document.getElementById('qTotal').textContent = t.total;
    document.getElementById('stDone').textContent = ORDER.filter(function (id) {
      var s = stationScore(id); return s.total && s.done === s.total;
    }).length;
    document.getElementById('stTotal').textContent = ORDER.length;
  }

  /* ---------- journey rail ---------- */
  function paintRail() {
    var track = document.getElementById('railTrack');
    track.innerHTML = '';
    ORDER.forEach(function (id, i) {
      var st = S[id]; if (!st) return;
      var sc = stationScore(id), full = sc.total && sc.done === sc.total;
      var b = document.createElement('button');
      b.className = 'rstep' + (full ? ' done' : '');
      b.setAttribute('aria-current', id === current ? 'true' : 'false');
      b.title = st.name + ' — ' + sc.done + ' of ' + sc.total + ' questions answered';
      var n = document.createElement('span');
      n.className = 'rstep__n';
      n.textContent = full ? '✓' : (i + 1);
      var lab = document.createElement('span'); lab.textContent = st.name;
      var bar = document.createElement('span'); bar.className = 'rstep__bar';
      var fill = document.createElement('i');
      fill.style.width = (sc.total ? (sc.done / sc.total) * 100 : 0) + '%';
      bar.appendChild(fill);
      b.appendChild(n); b.appendChild(lab); b.appendChild(bar);
      b.addEventListener('click', function () { open(id); });
      track.appendChild(b);
    });
    var cur = track.querySelector('[aria-current="true"]');
    if (cur) cur.scrollIntoView({ block:'nearest', inline:'center', behavior:'smooth' });
  }

  /* ---------- panel ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function icon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#14572B" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 3c-2.5 0-4 1.8-4 4 0 1.6.7 2.4 1.4 3.2.6.7 1.1 1.3 1.1 2.3v9"/>' +
      '<path d="M12 3c2.5 0 4 1.8 4 4 0 1.6-.7 2.4-1.4 3.2-.6.7-1.1 1.3-1.1 2.3"/>' +
      '<path d="M8.5 14.5c-2 .6-3.5 2-3.5 4"/><path d="M15.5 14.5c2 .6 3.5 2 3.5 4"/></svg>';
  }

  function paintPanel() {
    var st = S[current]; if (!st) return;
    var host = document.getElementById('panelInner'), sc = stationScore(current);
    host.innerHTML = '';

    var head = document.createElement('div');
    head.className = 'st-head';
    head.innerHTML = '<div class="st-head__ic">' + icon() + '</div>' +
      '<div><h2 class="st-title">' + esc(st.name) + '</h2>' +
      '<div class="st-sub">' + esc(st.subtitle || '') + '</div></div>';
    host.appendChild(head);

    var chips = document.createElement('div');
    chips.className = 'chips';
    var STAGE_N = { ingestion:'1', digestion:'2', absorption:'3', assimilation:'4', egestion:'5' };
    (st.processes || []).forEach(function (pr) {
      var c = document.createElement('span');
      c.className = 'chip chip--' + pr;
      if (STAGE_N[pr]) {
        var n = document.createElement('i');
        n.className = 'chip__n'; n.style.fontStyle = 'normal'; n.textContent = STAGE_N[pr];
        c.appendChild(n);
      }
      c.appendChild(document.createTextNode(pr.charAt(0).toUpperCase() + pr.slice(1)));
      chips.appendChild(c);
    });
    if (st.beyond) {
      var bc = document.createElement('span');
      bc.className = 'chip chip--beyond';
      bc.textContent = 'Beyond the syllabus';
      bc.title = 'Not required by IGCSE 0610 — worth knowing, but not examined.';
      chips.appendChild(bc);
    }
    host.appendChild(chips);

    var tabs = document.createElement('div');
    tabs.className = 'tabs';
    tabs.setAttribute('role', 'tablist');
    [['learn','Learn',''],['do','Practise', sc.done + '/' + sc.total]]
      .forEach(function (t) {
        var b = document.createElement('button');
        b.className = 'tab';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', tab === t[0] ? 'true' : 'false');
        b.appendChild(document.createTextNode(t[1]));
        if (t[2]) {
          var n = document.createElement('span');
          n.className = 'tab__n'; n.textContent = t[2];
          b.appendChild(n);
        }
        b.addEventListener('click', function () { tab = t[0]; paintPanel(); });
        tabs.appendChild(b);
      });
    host.appendChild(tabs);

    var pane = document.createElement('div');
    pane.className = 'tabpane';
    host.appendChild(pane);

    /* The colour key sits above the text, always visible. Hiding it behind a
       toggle meant nobody found it, and a code you cannot decode is noise. */
    if (tab === 'learn' && window.Terms) {
      var key = document.createElement('div');
      key.className = 'keybar';
      key.innerHTML = window.Terms.legend();
      pane.appendChild(key);
    }

    if (tab === 'learn') paintLearn(pane, st);
    else paintDo(pane, st);

    document.getElementById('panel').scrollTop = 0;
  }

  function paintLearn(pane, st) {
    if (window.Terms) window.Terms.setStation(st.id);
    var M = window.Terms ? window.Terms.mark : esc;
    var media = (window.PHOTOS || {})[st.id] || [];
    var figs = FIGS[st.id] || [];

    if (st.learn && st.learn.golden) {
      var g = document.createElement('div');
      g.className = 'golden';
      g.innerHTML = '<div class="golden__h">⬤ The mistake to avoid</div><p>' + M(st.learn.golden) + '</p>';
      pane.appendChild(g);
    }

    /* The text and the pictures are one thing now: each image sits under the
       sentence it illustrates, instead of in a separate tab to hunt through. */
    var card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<div class="card__h">What you need to know</div>';
    var list = document.createElement('ul');
    list.className = 'exam-list';
    card.appendChild(list);

    (st.learn.exam || []).forEach(function (b, i) {
      var li = document.createElement('li');
      li.innerHTML = M(b);
      list.appendChild(li);
      media.filter(function (x) { return !x.more && x.after === i; })
           .forEach(function (x) { li.appendChild(mediaBox(x)); });
      figs.filter(function (f) { return FIG_AFTER[st.id + ':' + f] === i; })
          .forEach(function (name) { li.appendChild(figBox(name)); });
    });

    if (st.id === 'overview') {
      var trace = document.createElement('button');
      trace.className = 'traceBtn';
      trace.innerHTML = '<span class="traceBtn__dot"></span>Trace it on the diagram — send a meal down the whole canal';
      trace.addEventListener('click', function () { startTour(); });
      card.appendChild(trace);
    }

    /* anything not anchored to a sentence follows the list */
    media.filter(function (x) { return !x.more && x.after == null; })
         .forEach(function (x) { card.appendChild(mediaBox(x)); });
    figs.filter(function (f) { return FIG_AFTER[st.id + ':' + f] == null; })
        .forEach(function (name) { var fb = figBox(name); if (fb) card.appendChild(fb); });

    if ((st.learn.real || []).length) {
      var r = document.createElement('div');
      r.className = 'real';
      r.innerHTML = '<div class="real__h">Real science — not examined</div><ul>' +
        st.learn.real.map(function (b) { return '<li>' + M(b) + '</li>'; }).join('') + '</ul>';
      card.appendChild(r);
    }
    pane.appendChild(card);

    var extras = media.filter(function (x) { return x.more; });
    if (extras.length) {
      var d = document.createElement('details');
      d.className = 'moremedia';
      d.innerHTML = '<summary>More from the lesson — ' + extras.length +
        (extras.length === 1 ? ' image' : ' images') + '</summary>';
      var wrap = document.createElement('div');
      wrap.className = 'moremedia__grid';
      extras.forEach(function (x) { wrap.appendChild(mediaBox(x)); });
      d.appendChild(wrap);
      pane.appendChild(d);
    }

    if ((st.later || []).length) {
      var L = document.createElement('div');
      L.className = 'card later';
      L.innerHTML = '<div class="card__h">Where this comes back later in the course</div>' +
        '<ul class="later__list">' + st.later.map(function (x) {
          return '<li><span class="later__ref">' + esc(x.ref) + '</span>' + M(x.text) + '</li>';
        }).join('') + '</ul>';
      pane.appendChild(L);
    }

    if ((st.keywords || []).length) {
      var k = document.createElement('div');
      k.className = 'card';
      k.innerHTML = '<div class="card__h">Key words</div><dl class="kw-grid">' +
        st.keywords.map(function (w) {
          return '<div class="kw"><dt>' + M(w.term) + '</dt><dd>' + M(w.def) + '</dd></div>';
        }).join('') + '</dl>';
      pane.appendChild(k);
    }
  }

  /* a drawn diagram, in the same frame as the photographs */
  function figBox(name) {
    var f = window.Figures.get(name);
    if (!f || !f.svg) return null;
    var box = document.createElement('figure');
    box.className = 'media media--fig';
    box.innerHTML = f.svg + '<figcaption class="media__cap">' +
      '<span class="kindtag kindtag--fig">Diagram</span> ' + f.cap + '</figcaption>';
    Array.prototype.forEach.call(box.querySelectorAll('svg[data-hide]'), function (sv) {
      var idx = sv.getAttribute('data-hide').split(',');
      var paths = sv.querySelectorAll('.plate path');
      idx.forEach(function (i) { if (paths[+i]) paths[+i].style.display = 'none'; });
    });
    return box;
  }

  /* One media item — a photograph, a micrograph or an animation. */
  function mediaBox(ph) {
    var box = document.createElement('figure');
    box.className = 'media' + (ph.t === 'video' ? ' media--video' : '');
    var cap = document.createElement('figcaption');
    cap.className = 'media__cap';
    cap.innerHTML = '<span class="kindtag">' + esc(ph.kind) + '</span> ' + ph.cap;

    if (ph.t === 'video') {
      var v = document.createElement('video');
      v.className = 'media__el';
      v.src = 'assets/video/' + ph.src + '.mp4';
      v.poster = 'assets/video/' + ph.src + '.jpg';
      v.controls = true; v.loop = true; v.muted = true; v.playsInline = true; v.preload = 'metadata';
      v.setAttribute('aria-label', ph.kind);
      box.appendChild(v);
    } else {
      var img = new Image();
      img.className = 'media__el media__el--img';
      img.alt = String(ph.cap).replace(/<[^>]+>/g, '');
      img.loading = 'lazy';
      img.src = 'assets/photos/' + ph.src;
      img.title = 'Click to see it full size';
      img.addEventListener('click', function () { lightbox(img.src, ph.cap, ph.kind, ph.annot); });
      img.addEventListener('error', function () {
        var miss = document.createElement('div');
        miss.className = 'photo-missing';
        miss.textContent = 'Image not found: assets/photos/' + ph.src;
        if (img.parentNode) img.parentNode.replaceChild(miss, img);
      });
      if (ph.annot && ph.annot.length) {
        var stage = document.createElement('div');
        stage.className = 'annot';
        stage.appendChild(img);
        stage.insertAdjacentHTML('beforeend', annotLayer(ph.annot));
        box.appendChild(stage);
      } else {
        box.appendChild(img);
      }
    }
    box.appendChild(cap);
    return box;
  }

  /* Labels drawn ON the photograph, so the student does not have to work out
     which bit of the picture the caption is talking about. Positions are
     percentages, so they hold at any size. */
  function annotLayer(list) {
    var out = '<svg class="annot__svg" viewBox="0 0 100 100" preserveAspectRatio="none">';
    list.forEach(function (a) {
      if (a.to) out += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + a.to[0] + '" y2="' + a.to[1] +
                       '" vector-effect="non-scaling-stroke"/>';
      if (a.to) out += '<circle cx="' + a.to[0] + '" cy="' + a.to[1] + '" r="0.9" vector-effect="non-scaling-stroke"/>';
    });
    out += '</svg>';
    list.forEach(function (a) {
      out += '<span class="annot__lab' + (a.big ? ' annot__lab--big' : '') + '" style="left:' + a.x +
             '%;top:' + a.y + '%">' + a.t + '</span>';
    });
    return out;
  }

  /* click any image to see it full size — essential for the micrographs */
  function lightbox(src, cap, kind, annot) {
    var lb = document.getElementById('lightbox');
    var st = lb.querySelector('.lb__stage');
    st.innerHTML = '';
    var im = new Image(); im.src = src; im.alt = '';
    st.appendChild(im);
    if (annot && annot.length) { st.classList.add('annot'); st.insertAdjacentHTML('beforeend', annotLayer(annot)); }
    else st.classList.remove('annot');
    lb.querySelector('.lb__cap').innerHTML =
      '<span class="kindtag">' + esc(kind) + '</span> ' + cap;
    lb.hidden = false;
  }

  function paintDo(pane, st) {
    (st.activities || []).forEach(function (a, i) {
      var card = window.Engine.render(a, i, st.id + ':' + i);
      if (p(st.id).done[i]) {
        var tick = document.createElement('span');
        tick.className = 'verdict ok';
        tick.textContent = '✓ answered correctly earlier';
        tick.style.marginLeft = 'auto';
        card.querySelector('.act__top').appendChild(tick);
      }
      card.addEventListener('result', function (e) {
        if (!e.detail) return;
        var rec = p(st.id);
        rec.tried[i] = true;
        if (e.detail.correct) rec.done[i] = true;
        save(); paintHeader(); paintRail(); refreshTabCount();
        var s = stationScore(st.id);
        if (e.detail.correct && s.done === s.total) {
          window.Anatomy.state.done[st.id] = true;
          window.Anatomy.render(document.getElementById('bodySvg'));
          toast('Station complete: ' + st.name);
        }
      });
      pane.appendChild(card);
    });

    var nav = document.createElement('div');
    nav.className = 'act__foot';
    nav.style.justifyContent = 'space-between';
    var i = ORDER.indexOf(st.id);
    if (i > 0) {
      var prev = document.createElement('button');
      prev.className = 'btn btn--ghost';
      prev.textContent = '← ' + S[ORDER[i - 1]].name;
      prev.addEventListener('click', function () { open(ORDER[i - 1]); });
      nav.appendChild(prev);
    }
    if (i < ORDER.length - 1) {
      var next = document.createElement('button');
      next.className = 'btn';
      next.textContent = 'Next: ' + S[ORDER[i + 1]].name + ' →';
      next.addEventListener('click', function () { open(ORDER[i + 1]); });
      nav.appendChild(next);
    }
    pane.appendChild(nav);
  }

  function refreshTabCount() {
    var sc = stationScore(current);
    var n = document.querySelector('.tabs .tab:last-child .tab__n');
    if (n) n.textContent = sc.done + '/' + sc.total;
  }

  /* ---------- open a station ---------- */
  function open(id, fromTour, focusTerm, cameFrom) {
    if (!S[id]) return;
    current = id;
    tab = 'learn';
    p(id).opened = true;
    save();
    window.Anatomy.state.active = id;
    window.Anatomy.highlight();
    if (!fromTour) {
      stopTourUI();
      var t = window.Anatomy.stopFor(id);
      if (t != null) window.Anatomy.placeBolus(t); else window.Anatomy.stopJourney();
    }
    paintPanel(); paintRail();
    if (focusTerm) focusOnTerm(focusTerm, cameFrom);
    if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  }

  /* Landing at the top of a long station and being told to go and find the
     word yourself is no better than not linking at all. Find where the term
     is actually explained, scroll to it, and flash it so the eye lands on it. */
  function focusOnTerm(term, cameFrom) {
    var panel = document.getElementById('panel');
    var low = term.toLowerCase();
    var re = new RegExp('(?<![A-Za-z0-9-])' + low.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z0-9-])', 'i');

    /* a key-word definition is the best landing place, then a sentence, then a caption */
    var target = null;
    var kws = document.querySelectorAll('#panelInner .kw');
    for (var i = 0; i < kws.length && !target; i++) {
      var dt = kws[i].querySelector('dt');
      if (dt && re.test(dt.textContent)) target = kws[i];
    }
    if (!target) {
      var lis = document.querySelectorAll('#panelInner .exam-list > li');
      for (var j = 0; j < lis.length && !target; j++) if (re.test(lis[j].textContent)) target = lis[j];
    }
    if (!target) {
      var caps = document.querySelectorAll('#panelInner .media__cap, #panelInner .later__list li');
      for (var k = 0; k < caps.length && !target; k++) if (re.test(caps[k].textContent)) target = caps[k];
    }
    if (!target) return;

    var prev = panel.style.scrollBehavior;
    panel.style.scrollBehavior = 'smooth';
    var hr = document.getElementById('panelInner').getBoundingClientRect();
    var tr = target.getBoundingClientRect();
    panel.scrollTop += (tr.top - panel.getBoundingClientRect().top) - panel.clientHeight / 2 + tr.height / 2;
    setTimeout(function () { panel.style.scrollBehavior = prev || ''; }, 600);

    target.classList.add('flash');
    setTimeout(function () { target.classList.remove('flash'); }, 2800);

    if (cameFrom && S[cameFrom]) showBackChip(cameFrom, term);
  }

  /* a way back, so following a link is not a one-way trip */
  var backChip = null;
  function showBackChip(id, term) {
    if (backChip) backChip.remove();
    var b = document.createElement('button');
    b.className = 'backchip';
    b.innerHTML = '← back to ' + esc(S[id].name);
    b.title = 'You followed "' + term + '" from here';
    b.addEventListener('click', function () { b.remove(); backChip = null; open(id); });
    document.getElementById('panel').appendChild(b);
    backChip = b;
    setTimeout(function () { if (backChip === b) { b.classList.add('is-fading'); } }, 9000);
    setTimeout(function () { if (backChip === b) { b.remove(); backChip = null; } }, 11000);
  }

  /* ---------- guided tour ---------- */
  function tourBtn() { return document.getElementById('tJourney'); }
  function tourLabel() { return tourBtn().querySelector('.tool__txt'); }
  function stopTourUI() {
    var b = tourBtn();
    if (!b || b.dataset.running !== '1') return;
    window.Anatomy.stopTour();
    b.dataset.running = '';
    b.setAttribute('aria-pressed', 'false');
    tourLabel().textContent = 'Follow the food';
  }
  function startTour() {
    var b = tourBtn();
    b.dataset.running = '1';
    b.setAttribute('aria-pressed', 'true');
    tourLabel().textContent = 'Stop the tour';
    var stops = window.Anatomy.ORGANS
      .filter(function (o) { return window.Anatomy.state.showBeyond || !o.beyond; })
      .map(function (o) { return { id:o.id, t:window.Anatomy.stopFor(o.id) }; })
      .sort(function (a, b2) { return a.t - b2.t; });
    window.Anatomy.tour(stops, {
      travelMs:1500, holdMs:3200,
      onArrive:function (s) { open(s.id, true); },
      onDone:function () {
        b.dataset.running = '';
        b.setAttribute('aria-pressed', 'false');
        tourLabel().textContent = 'Follow the food';
        toast('The meal has finished its journey — about 9 metres, and roughly a day.');
      }
    });
  }


  /* ---------- modes ---------- */
  function setMode(m, opts) {
    if (m === 'practice' && !window.Marking.isUnlocked()) { askPassword(); return; }
    mode = m;
    localStorage.setItem('digestion-lab.mode', m);
    window.Engine.setMode(m);
    if (m !== 'practice') window.Marking.lock();
    paintHeader(); paintRail(); paintPanel();
    if (!opts || !opts.quiet) toast(MODES[m] + ' mode');
  }

  function askPassword() {
    var dlg = document.getElementById('pwDlg');
    var inp = document.getElementById('pwInput');
    var err = document.getElementById('pwErr');
    err.textContent = ''; inp.value = '';
    dlg.hidden = false;
    setTimeout(function () { inp.focus(); }, 30);

    function close() {
      dlg.hidden = true;
      document.getElementById('modeSel').value = mode;
      go.removeEventListener('click', submit);
      inp.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Enter') submit(); }
    function submit() {
      err.textContent = 'Checking…';
      window.Marking.unlock(inp.value).then(function () {
        close();
        mode = 'practice';
        localStorage.setItem('digestion-lab.mode', 'practice');
        window.Engine.setMode('practice');
        paintHeader(); paintRail(); paintPanel();
        toast('Practice mode — answers and explanations are shown');
      }).catch(function () {
        err.textContent = 'That password does not open the answers. Check with Dr Mompel.';
        inp.select();
      });
    }
    var go = document.getElementById('pwGo');
    go.addEventListener('click', submit);
    inp.addEventListener('keydown', onKey);
    document.getElementById('pwCancel').onclick = close;
    dlg.onclick = function (e) { if (e.target === dlg) close(); };
  }

  /* ---------- handing in ---------- */
  function completionCode(name, form, score) {
    var raw = name.trim().toLowerCase() + '|' + form + '|' + score + '|digestion-lab';
    var s1 = 0, s2 = 0;
    for (var i = 0; i < raw.length; i++) { s1 = (s1 * 31 + raw.charCodeAt(i)) >>> 0; s2 = (s2 ^ (s1 + i)) >>> 0; }
    var A = 'ACDEFGHJKLMNPQRTUVWXY3479';
    function chunk(n) { var o = ''; for (var i = 0; i < 4; i++) { o += A[n % A.length]; n = Math.floor(n / A.length); } return o; }
    return 'DL-' + chunk(s1) + '-' + chunk(s2);
  }

  function openSubmit() {
    var t = totals();
    var dlg = document.getElementById('subDlg');
    var body = document.getElementById('subBody');
    var cfg = window.LAB_CONFIG || {};
    body.innerHTML =
      '<p class="st-sub">You have answered all <b>' + t.total + '</b> questions correctly in Mastery mode. ' +
      'Fill this in to hand your work to Dr Mompel.</p>' +
      '<label class="fld"><span>Your full name</span><input id="subName" type="text" autocomplete="name"></label>' +
      '<label class="fld"><span>Your class</span><select id="subForm">' +
      (cfg.classes || ['Other']).map(function (c) { return '<option>' + c + '</option>'; }).join('') +
      '</select></label><div id="subMsg" class="submsg"></div>';
    dlg.hidden = false;
    document.getElementById('subGo').onclick = doSubmit;
    document.getElementById('subClose').onclick = function () { dlg.hidden = true; };
    dlg.onclick = function (e) { if (e.target === dlg) dlg.hidden = true; };
    setTimeout(function () { document.getElementById('subName').focus(); }, 30);
  }

  function doSubmit() {
    var name = (document.getElementById('subName') || {}).value || '';
    var form = (document.getElementById('subForm') || {}).value || '';
    var msg = document.getElementById('subMsg');
    var go = document.getElementById('subGo');
    if (name.trim().length < 3) { msg.className = 'submsg no'; msg.textContent = 'Please type your full name.'; return; }
    var t = totals();
    var code = completionCode(name, form, t.done + '/' + t.total);
    var perStation = {};
    ORDER.forEach(function (id) { var s = stationScore(id); perStation[id] = s.done + '/' + s.total; });
    var payload = { app:'digestion-lab', name:name.trim(), form:form, mode:'mastery',
                    score:t.done, total:t.total, code:code,
                    stations:perStation, at:new Date().toISOString() };
    var url = (window.LAB_CONFIG || {}).submitUrl;
    go.disabled = true;
    msg.className = 'submsg'; msg.textContent = url ? 'Sending…' : 'Generating your code…';

    function finish(sent) {
      go.disabled = false;
      go.style.display = 'none';
      msg.className = 'submsg ok';
      msg.innerHTML = (sent ? '<b>Sent to Dr Mompel.</b> ' : '<b>Could not reach the server.</b> ') +
        'Your completion code is<div class="code">' + code + '</div>' +
        (sent ? 'Keep it as your receipt.' : 'Paste this into the Google Classroom assignment to hand in.');
      var rec = { name:name.trim(), form:form, code:code, at:payload.at, sent:sent };
      try { localStorage.setItem('digestion-lab.submitted', JSON.stringify(rec)); } catch (e) {}
    }
    if (!url) { finish(false); return; }
    fetch(url, { method:'POST', mode:'no-cors',
                 headers:{ 'Content-Type':'text/plain;charset=utf-8' },
                 body:JSON.stringify(payload) })
      .then(function () { finish(true); })
      .catch(function () { finish(false); });
  }


  /* ---------- clicking a highlighted word ----------
     Some words open a small picture where you clicked; others take you to
     the station that explains them. Both are marked so you can tell which
     is which before you click. */
  var peekEl = null;
  function closePeek() { if (peekEl) { peekEl.remove(); peekEl = null; } }

  /* The card lives inside the scrolling panel and is positioned against it,
     so it stays put beside its word while the student scrolls. */
  function openPeek(el) {
    closePeek();
    var host = document.getElementById('panelInner');
    var src = el.getAttribute('data-peek'), note = el.getAttribute('data-note');
    var p = document.createElement('div');
    p.className = 'peek';
    p.innerHTML = '<img src="assets/photos/' + src + '" alt="">' +
                  '<div class="peek__note">' + note + '</div>' +
                  '<button class="peek__x" aria-label="Close">×</button>';
    host.appendChild(p);
    var hr = host.getBoundingClientRect(), r = el.getBoundingClientRect();
    var w = p.offsetWidth, h = p.offsetHeight, pad = 8;
    var left = Math.min(Math.max(pad, (r.left - hr.left) + r.width / 2 - w / 2), host.clientWidth - w - pad);
    var top = (r.bottom - hr.top) + 8;
    /* flip above the word if there is not room below inside the panel */
    var panel = document.getElementById('panel');
    if (r.bottom + 8 + h > panel.getBoundingClientRect().bottom) top = (r.top - hr.top) - h - 8;
    p.style.left = left + 'px';
    p.style.top = Math.max(0, top) + 'px';
    p.querySelector('.peek__x').addEventListener('click', closePeek);
    peekEl = p;
  }

  function wireTermClicks(root) {
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-peek],[data-jump]');
      if (!t) { closePeek(); return; }
      e.preventDefault();
      if (t.hasAttribute('data-peek')) openPeek(t);
      else { closePeek(); open(t.getAttribute('data-jump'), false, t.textContent.trim(), current); }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target.closest('[data-peek],[data-jump]');
      if (!t) return;
      e.preventDefault();
      if (t.hasAttribute('data-peek')) openPeek(t);
      else open(t.getAttribute('data-jump'), false, t.textContent.trim(), current);
    });
  }

  /* ---------- toast ---------- */
  var toastT = null;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  /* ---------- boot ---------- */
  function boot() {
    (window.STATIONS || []).forEach(function (s) { S[s.id] = s; });
    ORDER = ORDER.filter(function (id) { return S[id]; });

    var svg = document.getElementById('bodySvg');
    window.Anatomy.state.onPick = function (id) { open(id); };
    ORDER.forEach(function (id) {
      var s = stationScore(id);
      if (s.total && s.done === s.total) window.Anatomy.state.done[id] = true;
    });
    window.Anatomy.render(svg);

    document.getElementById('tLabels').addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') !== 'true';
      this.setAttribute('aria-pressed', on);
      window.Anatomy.state.showLabels = on;
      window.Anatomy.render(svg);
    });
    document.getElementById('tBeyond').addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') !== 'true';
      this.setAttribute('aria-pressed', on);
      window.Anatomy.state.showBeyond = on;
      window.Anatomy.render(svg);
    });
    tourBtn().addEventListener('click', function () {
      if (this.dataset.running === '1') stopTourUI(); else startTour();
    });

    window.Engine.setMode(mode);
    document.getElementById('modeSel').addEventListener('change', function () { setMode(this.value); });
    document.getElementById('btnSubmit').addEventListener('click', openSubmit);

    wireTermClicks(document.getElementById('panel'));
    window.addEventListener('resize', closePeek);

    var lb = document.getElementById('lightbox');
    lb.addEventListener('click', function () { lb.hidden = true; });
    document.getElementById('btnHelp').addEventListener('click', function () {
      document.getElementById('modal').hidden = false;
    });
    document.getElementById('modalClose').addEventListener('click', function () {
      document.getElementById('modal').hidden = true;
    });
    document.getElementById('modal').addEventListener('click', function (e) {
      if (e.target === this) this.hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closePeek();
      document.getElementById('modal').hidden = true;
      document.getElementById('pwDlg').hidden = true;
      document.getElementById('subDlg').hidden = true;
      lb.hidden = true;
    });
    document.getElementById('btnReset').addEventListener('click', function () {
      if (!confirm('Clear all your answers and start again? This cannot be undone.')) return;
      progress = { mastery:{}, test:{}, practice:{} };
      try { localStorage.removeItem('digestion-lab.v2'); } catch (e) {}
      window.Anatomy.state.done = {};
      window.Anatomy.render(svg);
      paintHeader(); paintRail(); paintPanel();
      toast('Progress cleared.');
    });

    var start = (location.hash || '').slice(1);
    open(S[start] ? start : ORDER[0]);
    paintHeader();
    window.addEventListener('hashchange', function () {
      var id = location.hash.slice(1);
      if (S[id] && id !== current) open(id);
    });
  }

  /* GitHub Pages caches the HTML for ten minutes, so a student can sit on an old
     copy without knowing. Ask the server for a plain version stamp and say so. */
  function checkForUpdate() {
    fetch('version.txt', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (v) {
        if (!v) return;
        v = v.trim();
        if (v && v !== '1788262282') {
          var t = document.getElementById('toast');
          t.innerHTML = 'A newer version of this page is available. ' +
            '<button class="btn btn--ghost" style="margin-left:8px;padding:3px 12px;font-size:13px" ' +
            'onclick="location.reload(true)">Reload</button>';
          t.classList.add('show');
        }
      }).catch(function () {});
  }
  setTimeout(checkForUpdate, 4000);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
