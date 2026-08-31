/* ============================================================
   app.js — wiring: plate ⇄ panel ⇄ rail, progress, guided tour.
   ============================================================ */
(function () {
  'use strict';

  var ORDER = ['overview','mouth','salivary-glands','epiglottis','oesophagus','stomach',
               'liver','gall-bladder','pancreas','duodenum','ileum-villi','colon',
               'rectum-anus','molecules-lab'];

  /* which drawn/animated figures each station shows in "See it" */
  var FIGS = {
    overview:['peristalsis'], mouth:['toothTypes','tooth','chewing'],
    'salivary-glands':['starchPath'], epiglottis:['swallow'], oesophagus:['peristalsis'],
    stomach:['churn'], liver:['emulsify'], 'gall-bladder':['emulsify'], pancreas:['emulsify'],
    duodenum:['emulsify','starchPath'], 'ileum-villi':['villus','surfaceArea'],
    colon:['waterColon'], 'rectum-anus':['egestVsExcrete'],
    'molecules-lab':['starchPath','surfaceArea']
  };

  var S = {};                       /* stations by id */
  var progress = load();
  var current = null;
  var tab = 'learn';

  /* ---------- progress ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem('digestion-lab.v1') || '{}'); } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem('digestion-lab.v1', JSON.stringify(progress)); } catch (e) {}
  }
  function p(id) {
    if (!progress[id]) progress[id] = { done:{}, opened:false };
    return progress[id];
  }
  function stationScore(id) {
    var st = S[id];
    if (!st) return { done:0, total:0 };
    var d = p(id).done, n = 0;
    Object.keys(d).forEach(function (k) { if (d[k]) n++; });
    return { done:n, total:(st.activities || []).length };
  }
  function totals() {
    var done = 0, total = 0;
    ORDER.forEach(function (id) { var s = stationScore(id); done += s.done; total += s.total; });
    return { done:done, total:total };
  }

  /* ---------- header ---------- */
  function paintHeader() {
    var t = totals(), pct = t.total ? t.done / t.total : 0, C = 2 * Math.PI * 11;
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
    (st.processes || []).forEach(function (pr) {
      var c = document.createElement('span');
      c.className = 'chip chip--' + pr;
      c.textContent = pr.charAt(0).toUpperCase() + pr.slice(1);
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
    [['learn','Learn',''],['see','See it',''],['do','Practise', sc.done + '/' + sc.total]]
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

    if (tab === 'learn') paintLearn(pane, st);
    else if (tab === 'see') paintSee(pane, st);
    else paintDo(pane, st);

    document.getElementById('panel').scrollTop = 0;
  }

  function paintLearn(pane, st) {
    if (st.learn && st.learn.golden) {
      var g = document.createElement('div');
      g.className = 'golden';
      g.innerHTML = '<div class="golden__h">⬤ The mistake to avoid</div><p>' +
        esc(st.learn.golden) + '</p>';
      pane.appendChild(g);
    }
    var card = document.createElement('div');
    card.className = 'card';
    var html = '<div class="card__h">What you need to know</div><ul class="exam-list">' +
      (st.learn.exam || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>';
    if ((st.learn.real || []).length)
      html += '<div class="real"><div class="real__h">Real science — not examined</div><ul>' +
        st.learn.real.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></div>';
    card.innerHTML = html;
    pane.appendChild(card);

    if ((st.keywords || []).length) {
      var k = document.createElement('div');
      k.className = 'card';
      k.innerHTML = '<div class="card__h">Key words</div><dl class="kw-grid">' +
        st.keywords.map(function (w) {
          return '<div class="kw"><dt>' + esc(w.term) + '</dt><dd>' + esc(w.def) + '</dd></div>';
        }).join('') + '</dl>';
      pane.appendChild(k);
    }
  }

  function paintSee(pane, st) {
    (FIGS[st.id] || []).forEach(function (name) {
      var f = window.Figures.get(name);
      if (!f || !f.svg) return;
      var box = document.createElement('div');
      box.className = 'figbox';
      box.innerHTML = f.svg + '<div class="figbox__cap">' + f.cap + '</div>';
      /* a sourced plate keeps its own baked-in labels; hide them by index so only
         our labels show — laid out by us, and guaranteed not to overlap */
      Array.prototype.forEach.call(box.querySelectorAll('svg[data-hide]'), function (sv) {
        var idx = sv.getAttribute('data-hide').split(',');
        var paths = sv.querySelectorAll('.plate path');
        idx.forEach(function (i) { if (paths[+i]) paths[+i].style.display = 'none'; });
      });
      pane.appendChild(box);
    });

    var shots = (window.PHOTOS || {})[st.id] || [];
    if (!shots.length) return;

    var head = document.createElement('div');
    head.className = 'gallery__h';
    head.innerHTML = '<span>From your lesson slides</span>' +
      '<span class="gallery__n">' + shots.length + (shots.length === 1 ? ' image' : ' images') + '</span>';
    pane.appendChild(head);

    shots.forEach(function (ph) {
      var box = document.createElement('div');
      box.className = 'figbox figbox--photo';
      var img = new Image();
      img.className = 'photo';
      img.alt = ph.cap;
      img.loading = 'lazy';
      img.src = 'assets/photos/' + ph.src;
      img.title = 'Click to see it full size';
      img.addEventListener('click', function () { lightbox(img.src, ph.cap, ph.kind); });
      img.addEventListener('error', function () {
        var miss = document.createElement('div');
        miss.className = 'photo-missing';
        miss.textContent = 'Image not found: assets/photos/' + ph.src;
        if (img.parentNode) img.parentNode.replaceChild(miss, img);
      });
      var cap = document.createElement('div');
      cap.className = 'figbox__cap';
      cap.innerHTML = '<span class="kindtag">' + esc(ph.kind) + '</span> ' + esc(ph.cap);
      box.appendChild(img); box.appendChild(cap);
      pane.appendChild(box);
    });
  }

  /* click any image to see it full size — essential for the micrographs */
  function lightbox(src, cap, kind) {
    var lb = document.getElementById('lightbox');
    lb.querySelector('img').src = src;
    lb.querySelector('.lb__cap').innerHTML =
      '<span class="kindtag">' + esc(kind) + '</span> ' + esc(cap);
    lb.hidden = false;
  }

  function paintDo(pane, st) {
    (st.activities || []).forEach(function (a, i) {
      var card = window.Engine.render(a, i);
      if (p(st.id).done[i]) {
        var tick = document.createElement('span');
        tick.className = 'verdict ok';
        tick.textContent = '✓ answered correctly earlier';
        tick.style.marginLeft = 'auto';
        card.querySelector('.act__top').appendChild(tick);
      }
      card.addEventListener('result', function (e) {
        if (!e.detail || !e.detail.correct) return;
        p(st.id).done[i] = true;
        save(); paintHeader(); paintRail(); refreshTabCount();
        var s = stationScore(st.id);
        if (s.done === s.total) {
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
  function open(id, fromTour) {
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
    if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
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
      document.getElementById('modal').hidden = true;
      lb.hidden = true;
    });
    document.getElementById('btnReset').addEventListener('click', function () {
      if (!confirm('Clear all your answers and start again? This cannot be undone.')) return;
      progress = {};
      try { localStorage.removeItem('digestion-lab.v1'); } catch (e) {}
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
