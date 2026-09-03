/* ============================================================
   app.js — wiring: plate ⇄ panel ⇄ rail, progress, guided tour.
   ============================================================ */
(function () {
  'use strict';

  var ORDER = ['diet','overview','mouth','salivary-glands','epiglottis','oesophagus','stomach',
               'liver','pancreas','ileum-villi','colon',
               'rectum-anus','molecules-lab'];

  /* which drawn/animated figures each station shows in "See it" */
  var FIGS = {
    diet:['sameBalance'], overview:[], mouth:['chewing'],
    'salivary-glands':['starchPath'], epiglottis:[], oesophagus:[],
    stomach:[], liver:['emulsify'], pancreas:[],
    'ileum-villi':['starchPath','villus'],
    colon:['waterColon'], 'rectum-anus':['egestVsExcrete'],
    'molecules-lab':['starchPath']
  };

  /* which sentence each drawn diagram illustrates */
  var FIG_AFTER = {
    'diet:sameBalance':6,
    'mouth:chewing':2,
    'salivary-glands:starchPath':2,
    'liver:emulsify':5,
    'ileum-villi:starchPath':10, 'ileum-villi:villus':11,
    'colon:waterColon':1, 'rectum-anus:egestVsExcrete':3,
    'molecules-lab:starchPath':0
  };

  /* On a phone a figure is wider than the screen and its labels are the part
     that ends up off-screen. When a figure has to scroll, its labels are also
     listed as plain text underneath, and the scroller starts where the drawing
     is (`focus` = fraction of the hidden width to start scrolled past). */
  var FIG_LEGEND = {
    peristalsis:[['Circular muscle','contracts behind the bolus and squeezes it forward'],['The bolus','a ball of chewed food'],['The tube ahead relaxes','opening to receive it']],
    churn:[['Muscular wall','rings of muscle squeeze and travel towards the exit — this is physical digestion'],['Gastric juice','hydrochloric acid + pepsin'],['Chyme','the soupy, acidic mixture that leaves the stomach']],
    villus:[['Microvilli','the brush border'],['Epithelium','one cell thick'],['Villus','a finger-like projection built from many cells'],['Capillaries','glucose + amino acids'],['Lacteal','fatty acids + glycerol'],['Blood vessel','on to the hepatic portal vein']],
    swallow:[['Soft palate','lifts and seals off the nose'],['Tongue','drives the bolus backwards'],['Epiglottis','tips down over the opening of the trachea'],['Trachea','to the lungs — guarded'],['Oesophagus','to the stomach — the bolus goes here']],
    tooth:[['Enamel','hardest substance in the body'],['Dentine','softer, and it senses pain'],['Pulp cavity','blood vessels and nerves'],['Gum',''],['Cement','anchors the root'],['Jaw bone',''],['Blood vessel',''],['Nerve','']],
    emulsify:[['Bile','coats one large fat droplet and splits it into many small ones'],['Same amount of fat','far more surface for lipase to work on — physical, not chemical']],
    egestVsExcrete:[['Egestion','fibre, undigested food and dead gut cells — never entered a cell — passed out as faeces'],['Excretion','urea from the liver in urine; carbon dioxide from respiration in the breath — made inside cells']],
    waterColon:[['Blood vessel','water and mineral salts are carried away'],['Contents','watery from the small intestine on the left; solid faeces to the rectum on the right']],
    chewing:[['One large piece','16 enzymes fit round it'],['Four smaller pieces','32 enzymes fit — same food, twice the edge']],
    starchPath:[['Amylase','starch → maltose, in the mouth and duodenum'],['Maltase','maltose → glucose, on the epithelium of the small intestine']],
    sameBalance:[['A 7-year-old','growing — most protein'],['An office worker','sitting most of the day'],['A builder','heavy work — most energy']]
  };
  FIG_LEGEND.toothCompact = FIG_LEGEND.tooth;
  var FIG_FOCUS = { peristalsis:.15, churn:.05, villus:.35, swallow:.3, tooth:.3, toothCompact:.3, emulsify:.3,
                    egestVsExcrete:0, waterColon:.3, chewing:.2, starchPath:.2, sameBalance:.4 };

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
    if (!bag[id]) bag[id] = { done:{}, tried:{}, sig:(S[id] ? stationSig(S[id]) : '') };
    return bag[id];
  }
  /* A saved answer is filed under the question's position in the station, and
     positions are not stable: if a question is removed, everything after it
     shifts up one, and a record would silently credit a reader for a question
     they never saw. So each station's record carries a fingerprint of the
     question set it was made against — the number of questions and their
     types. If that changes, the record for that station is dropped and the
     station is answered again. Losing one station's progress is a far smaller
     harm than handing in a perfect score that was never earned. */
  function stationSig(st) {
    return (st.activities || []).length + ':' +
           (st.activities || []).map(function (a) { return a.type.charAt(0); }).join('');
  }
  function reconcile() {
    var dropped = 0;
    Object.keys(MODES).forEach(function (m) {
      var bag = progress[m] || {};
      Object.keys(bag).forEach(function (id) {
        var st = S[id];
        if (!st) { delete bag[id]; dropped++; return; }      /* station itself is gone */
        var sig = stationSig(st);
        if (bag[id].sig && bag[id].sig !== sig) { bag[id] = { done:{}, tried:{}, sig:sig }; dropped++; }
        else bag[id].sig = sig;
      });
    });
    if (dropped) save();
    return dropped;
  }

  function stationScore(id, m) {
    var st = S[id];
    if (!st) return { done:0, total:0, tried:0 };
    var rec = p(id, m), total = (st.activities || []).length, n = 0, t = 0;
    /* only positions that still exist may count, so a stale record can never
       push the score above the number of questions actually asked */
    Object.keys(rec.done).forEach(function (k) { if (rec.done[k] && +k < total) n++; });
    Object.keys(rec.tried).forEach(function (k) { if (rec.tried[k] && +k < total) t++; });
    return { done:n, total:total, tried:t };
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
      bc.className += ' tip'; bc.tabIndex = 0;
      bc.setAttribute('data-tip', 'Not required by IGCSE 0610 — worth knowing, but not examined.');
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
    var panelEl = document.getElementById('panel');
    panelEl.style.scrollBehavior = 'auto'; panelEl.scrollTop = 0; panelEl.style.scrollBehavior = '';
    if (window.Zoom) { if (tab === 'learn') window.Zoom.bindLearn(pane); else window.Zoom.unbind(); }
  }

  function paintLearn(pane, st) {
    if (window.Terms) window.Terms.setStation(st.id);
    var M = window.Terms ? window.Terms.mark : esc;
    var media = (window.PHOTOS || {})[st.id] || [];
    var figs = FIGS[st.id] || [];

    /* The text and the pictures are one thing now: each image sits under the
       sentence it illustrates, instead of in a separate tab to hunt through. */
    var card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<div class="card__h">What you need to know</div>';
    var list = document.createElement('ul');
    list.className = 'exam-list';
    card.appendChild(list);

    /* An exam bullet is a string, or {text, sup:true} for Supplement-only
       content, or {text, ext:true} for what the decks teach but 0610 does not
       examine. The badge lets a Core candidate see the fence. */
    (st.learn.exam || []).forEach(function (b, i) {
      var li = document.createElement('li');
      var txt = typeof b === 'string' ? b : b.text;
      var badge = '';
      /* typeof check matters: a JS string has a built-in .sup() method, so
         'b.sup' is truthy for every plain bullet. */
      if (typeof b === 'object' && b.sup) badge = '<span class="sup tip" tabindex="0" data-tip="Supplement — examined on Paper 4 (Extended) only. Core candidates can skip it.">S</span>';
      if (typeof b === 'object' && b.ext) badge = '<span class="sup sup--ext tip" tabindex="0" data-tip="Extension — not in the 2026–28 syllabus. Here to make sense of the rest; you will not be asked to write it.">extension</span>';
      li.innerHTML = badge + M(txt);
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

    /* The mistake to avoid comes AFTER the facts: a refutation only works
       once the reader has something to hold it against. */
    if (st.learn && st.learn.golden) {
      var g = document.createElement('div');
      g.className = 'golden';
      g.innerHTML = '<div class="golden__h">⬤ Check yourself — the mistake students make here</div><p>' + M(st.learn.golden) + '</p>';
      card.appendChild(g);
    }

    /* What the examiner asks here: the words to write, Core and Supplement kept apart,
       and how the questions are phrased. Only stations with a real exam footprint carry one. */
    if ((st.learn.examFocus || []).length) {
      var ef = document.createElement('div');
      ef.className = 'examfocus';
      /* plain text here, no term chips: the box is about the words to write, not the colour code */
      ef.innerHTML = '<div class="examfocus__h">In the exam — what to write here</div><ul>' +
        st.learn.examFocus.map(function (b) {
          var tag = typeof b === 'object' && b.tag ? '<b class="examfocus__tag">' + esc(b.tag) + '</b> ' : '';
          if (typeof b === 'object' && b.qa) {
            return '<li>' + tag + '<dl class="examfocus__qa">' + b.qa.map(function (p) {
              return '<dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd>';
            }).join('') + '</dl></li>';
          }
          return '<li>' + tag + esc(typeof b === 'string' ? b : b.text) + '</li>';
        }).join('') + '</ul>';
      card.appendChild(ef);
    }
    pane.appendChild(card);

    /* A recap of an earlier topic that this station rests on: a little always in view, the rest
       (graphs, the words that earn marks, how it is asked) behind one expandable section. */
    var rc = st.learn && st.learn.recap;
    if (rc) {
      /* Plain text with the mark-earning words in bold — no coloured term chips: on a page about
         enzymes, colouring every "enzyme" is noise, and the words to remember are the marking ones. */
      var rich = function (t) { return esc(t).replace(/&lt;(\/?)(b|i|br)&gt;/g, '<$1$2>'); };
      var R = document.createElement('div');
      R.className = 'card recap';
      var figs = (rc.figs || []).map(function (f) {
        return '<figure><img src="assets/photos/' + esc(f.src) + '" alt="" loading="lazy"><figcaption>' + rich(f.cap) + '</figcaption></figure>';
      }).join('');
      var body = (rc.more || []).map(function (sec) {
        return '<div class="recap__h">' + esc(sec.h) + '</div><ul>' + (sec.items || []).map(function (t) { return '<li>' + rich(t) + '</li>'; }).join('') + '</ul>';
      }).join('');
      var ex = (rc.exam || []).length ? '<div class="recap__exam"><div class="recap__h">In the exam — how it is asked</div><ul>' + rc.exam.map(function (t) { return '<li>' + rich(t) + '</li>'; }).join('') + '</ul></div>' : '';
      R.innerHTML = '<div class="card__h">' + esc(rc.title) + '</div><p class="recap__intro">' + rich(rc.intro) + '</p>' +
        '<details><summary>' + esc(rc.open || 'Open the recap') + '</summary><div class="recap__body">' +
        (figs ? '<div class="recap__figs">' + figs + '</div>' : '') + body + ex + '</div></details>';
      pane.appendChild(R);
    }

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

    /* One section for everything past the examined content — the 0610 topics this links to, what
       IB adds, and the real science 0610 leaves out. Each item is tagged, and none of it repeats
       the list above (what is examined lives there, badged Core, S or extension). */
    var further = (st.learn && st.learn.further) || [];
    if (further.length) {
      var L = document.createElement('div');
      L.className = 'card later';
      L.innerHTML = '<div class="card__h">Going further — links to other topics, IB, and beyond the syllabus</div>' +
        '<ul class="later__list">' + further.map(function (x) {
          var kind = /^IB/.test(x.ref) ? ' later__ref--ib' : /^(Beyond|Not in)/.test(x.ref) ? ' later__ref--beyond' : '';
          return '<li><span class="later__ref' + kind + '">' + esc(x.ref) + '</span>' + M(x.text) + '</li>';
        }).join('') + '</ul>';
      pane.appendChild(L);
    }

    if ((st.keywords || []).length) {
      /* Key words is a glossary, not a place to send the reader off again. */
      if (window.Terms) window.Terms.setQuiet(true);
      var k = document.createElement('div');
      k.className = 'card';
      k.innerHTML = '<div class="card__h">Key words</div><dl class="kw-grid">' +
        st.keywords.map(function (w) {
          return '<div class="kw"><dt>' + M(w.term) + '</dt><dd>' + M(w.def) + '</dd></div>';
        }).join('') + '</dl>';
      pane.appendChild(k);
      if (window.Terms) window.Terms.setQuiet(false);
    }
    hintScrollers(pane);
  }

  /* A figure wider than its column scrolls sideways, and a 7px scrollbar is
     not a cue anyone reads. So: start it centred on the drawing, and show a
     "swipe" pill until the reader has scrolled it once. */
  function hintScrollers(pane) {
    Array.prototype.forEach.call(pane.querySelectorAll('.figscroll'), function (fs) {
      if (fs.scrollWidth <= fs.clientWidth + 2) return;
      var owner = fs.closest('[data-fig]'), name = owner ? owner.getAttribute('data-fig') : '';
      var focus = FIG_FOCUS[name] != null ? FIG_FOCUS[name] : 0.35;
      fs.scrollLeft = Math.round((fs.scrollWidth - fs.clientWidth) * focus);
      var box = fs.closest('.media') || fs.parentNode;
      if (FIG_LEGEND[name] && !(fs.nextSibling && fs.nextSibling.className === 'figlegend')) {
        var ul = document.createElement('ul');
        ul.className = 'figlegend';
        ul.innerHTML = '<li class="figlegend__h">Labels on this diagram</li>' + FIG_LEGEND[name].map(function (l) {
          return '<li><b>' + esc(l[0]) + '</b>' + (l[1] ? ' — ' + esc(l[1]) : '') + '</li>';
        }).join('');
        fs.parentNode.insertBefore(ul, fs.nextSibling);
      }
      if (fs.parentNode.querySelector('.fighint')) return;
      var pill = document.createElement('span');
      pill.className = 'fighint';
      pill.textContent = '⇠ swipe the diagram ⇢';
      fs.parentNode.insertBefore(pill, fs);   /* the scroller's own parent — a pair half is not a direct child of .media */
      fs.addEventListener('scroll', function () { pill.classList.add('is-gone'); }, { once:true });
    });
  }

  /* A diagram carries its own labels, and those labels are drawn in the
     figure's own coordinates — so squeezing the figure into a phone column
     squeezes the type with it, down to about 5px, which is not readable by
     anybody. A figure therefore has a floor: it may not be drawn below the
     width its labels need, and if the column is narrower than that the
     figure scrolls sideways inside its own box. The page itself never
     scrolls sideways. */
  var FIG_MIN_SCALE = 0.92;          /* 12-unit label -> ~11px on screen */
  function keepFigureReadable(box) {
    Array.prototype.forEach.call(box.querySelectorAll('svg[viewBox]'), function (sv) {
      /* Only the figure's own outermost svg. A pie chart is a nested <svg>,
         and wrapping one in a <div> puts an HTML element inside SVG content,
         where it does not render — which silently deleted all three pie
         charts from the balanced-diet figure. */
      if (sv.parentNode && sv.parentNode.closest && sv.parentNode.closest('svg')) return;
      var w = parseFloat((sv.getAttribute('viewBox') || '').split(/\s+/)[2]);
      if (!w) return;
      /* The scroller has to be a box of its own. Marking up the existing
         parent does not work: a wide child then sizes its ancestors instead
         of scrolling inside them, and the whole panel grows past the phone
         screen — which is exactly what happened the first time. */
      var wrap = document.createElement('div');
      wrap.className = 'figscroll';
      sv.parentNode.insertBefore(wrap, sv);
      wrap.appendChild(sv);
      sv.style.minWidth = Math.round(w * FIG_MIN_SCALE) + 'px';
    });
  }

  /* a drawn diagram, in the same frame as the photographs */
  function figBox(name) {
    var f = window.Figures.get(name);
    if (!f || !f.svg) return null;
    var box = document.createElement('figure');
    box.className = 'media media--fig';
    box.setAttribute('data-fig', name);
    box.innerHTML = f.svg + '<figcaption class="media__cap">' +
      '<span class="kindtag kindtag--fig">Diagram</span> ' + f.cap + '</figcaption>';
    hidePlateParts(box);
    keepFigureReadable(box);
    /* An animated figure starts when the page paints, so by the time it is scrolled into
       view it is half way through its cycle — the fat droplet already split. Hold it on its
       first frame and start it from the beginning the moment it comes into view. */
    var stage = box.querySelector('svg.figbox__stage');
    if (stage && stage.pauseAnimations) {
      try { stage.pauseAnimations(); stage.setCurrentTime(0); } catch (e) {}
      var panel = document.getElementById('panel'), started = false;
      var check = function () {
        if (started || !box.isConnected) { if (!box.isConnected) panel.removeEventListener('scroll', check); return; }
        var pr = panel.getBoundingClientRect(), r = box.getBoundingClientRect();
        var seen = Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top);
        if (seen < Math.min(r.height, pr.height) * 0.4) return;
        started = true; panel.removeEventListener('scroll', check);
        try { stage.setCurrentTime(0); stage.unpauseAnimations(); } catch (e) {}
      };
      panel.addEventListener('scroll', check, { passive:true });
      setTimeout(check, 80);
    }
    return box;
  }

  /* A borrowed plate carries its own leader lines and brackets. They are hidden
     so ours are the only ones — a figure inside a pair used to skip this step,
     which left two sets of lines pointing at two sets of places on the tooth. */
  function hidePlateParts(root) {
    Array.prototype.forEach.call(root.querySelectorAll('svg[data-hide]'), function (sv) {
      var idx = sv.getAttribute('data-hide').split(',');
      var paths = sv.querySelectorAll('.plate path');
      idx.forEach(function (i) { if (paths[+i]) paths[+i].style.display = 'none'; });
    });
  }

  /* One media item — a photograph, a micrograph or an animation. */
  /* Two views of one thing, side by side. The point is that the reader sees
     the real tooth and the drawing of it without scrolling between them —
     the comparison only works when both are in the eye at once. */
  function pairBox(ph) {
    var box = document.createElement('figure');
    box.className = 'media media--pair';
    var row = document.createElement('div');
    row.className = 'pair' + (ph.stack ? ' pair--stack' : '');
    (ph.of || []).forEach(function (half) {
      var cell = document.createElement('div');
      cell.className = 'pair__half';
      if (half.w) cell.style.flex = half.w + ' 1 0';
      if (half.fig) {
        var f = window.Figures.get(half.fig);
        cell.setAttribute('data-fig', half.fig);
        if (f) { cell.innerHTML = f.svg; hidePlateParts(cell); }
      } else {
        var img = new Image();
        img.className = 'media__el media__el--img';
        img.alt = half.label || String(ph.cap).replace(/<[^>]+>/g, '');
        img.loading = 'lazy';
        img.src = 'assets/photos/' + half.photo;
        img.title = 'Click to see it full size';
        if (half.maxw) img.style.maxWidth = half.maxw + 'px';
        img.addEventListener('click', function () { lightbox(img.src, half.label || ph.cap, ph.kind, half.annot); });
        if (half.annot && half.annot.length) {
          var stage = document.createElement('div');
          stage.className = 'annot';
          stage.appendChild(img);
          stage.insertAdjacentHTML('beforeend', annotLayer(half.annot));
          cell.appendChild(stage);
        } else {
          cell.appendChild(img);
        }
      }
      if (half.label) {
        var lab = document.createElement('div');
        lab.className = 'pair__lab';
        lab.innerHTML = half.label;
        cell.appendChild(lab);
      }
      row.appendChild(cell);
    });
    box.appendChild(row);
    keepFigureReadable(box);
    var cap = document.createElement('figcaption');
    cap.className = 'media__cap';
    cap.innerHTML = '<span class="kindtag">' + esc(ph.kind) + '</span> ' + ph.cap;
    box.appendChild(cap);
    return box;
  }

  function mediaBox(ph) {
    if (ph.t === 'pair') return pairBox(ph);
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
      /* never draw an image wider than its own pixels support */
      if (ph.maxw) { img.style.maxWidth = ph.maxw + 'px'; img.style.margin = '0 auto'; }
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
      if (!a.to) return;
      /* one label may point at several things — four cusps are four places on
         the same tooth, and they should not need four labels saying "cusp" */
      var pts = Array.isArray(a.to[0]) ? a.to : [a.to];
      pts.forEach(function (pt) {
        out += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + pt[0] + '" y2="' + pt[1] +
               '" vector-effect="non-scaling-stroke"/>' +
               '<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="0.9" vector-effect="non-scaling-stroke"/>';
      });
    });
    out += '</svg>';
    list.forEach(function (a) {
      out += '<span class="annot__lab' + (a.big ? ' annot__lab--big' : '') + '" style="left:' + a.x +
             '%;top:' + a.y + '%">' + a.t + '</span>';
    });
    return out;
  }

  /* click any image to see it full size — essential for the micrographs */
  window.LabLightbox = function (src, cap, kind, credit) { lightbox(src, cap + (credit ? ' <span class="lens__credit">' + credit + '</span>' : ''), kind, null); };
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
  function canon(id) {
    if (id === 'duodenum') return 'ileum-villi';         /* the duodenum is read at the small-intestine station */
    if (id === 'gall-bladder') return 'liver';           /* the gall bladder is read with the liver: one bile story */
    return id;
  }
  function open(id, fromTour, focusTerm, cameFrom) {
    id = canon(id);
    if (!S[id]) return;
    current = id;
    tab = 'learn';
    p(id).opened = true;
    save();
    window.Anatomy.state.active = id;
    window.Anatomy.highlight();
    if (window.Zoom) window.Zoom.setStation(id, { tour:!!fromTour });
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
  /* The tour is the five processes of nutrition, as five animated scenes on the plate
     (js/tour.js). The food stays inside the canal; the liver is only ever reached by
     absorbed nutrients in the blood. */
  function tourOff() {
    var b = tourBtn(); if (!b) return;
    b.dataset.running = '';
    b.setAttribute('aria-pressed', 'false');
    tourLabel().textContent = 'Follow the food';
  }
  function stopTourUI(land) {
    var b = tourBtn();
    if (!b || b.dataset.running !== '1') return;
    tourOff();
    if (window.Tour) window.Tour.stop(land ? { reopen:true } : null);
  }
  function startTour() {
    var b = tourBtn();
    b.dataset.running = '1';
    b.setAttribute('aria-pressed', 'true');
    tourLabel().textContent = 'Stop the tour';
    if (window.Tour) window.Tour.start(open, tourOff);
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
    var credit = el.getAttribute('data-credit');
    var p = document.createElement('div');
    p.className = 'peek';
    var art = '';
    if (src.slice(0, 4) === 'fig:') {
      /* Drawn rather than borrowed: a deficiency is a difference, and one
         photograph has nothing to be different from. */
      var f = window.Figures.get(src.slice(4));
      if (f) { art = '<div class="peek__fig">' + f.svg + '</div>'; p.className += ' has-fig'; }
    } else if (src) {
      art = '<img src="assets/photos/' + src + '" alt="">';
    }
    p.innerHTML = art +
                  '<div class="peek__note">' + note +
                  (credit ? '<span class="peek__credit">' + credit + '</span>' : '') + '</div>' +
                  '<button class="peek__x" aria-label="Close">\u00D7</button>';
    host.appendChild(p);

    /* On a phone there is no room beside or above the word for a tall card:
       measured, it landed on top of the word it was opened from. So it becomes
       a sheet pinned to the bottom of the screen, and the word stays visible. */
    var sheet = window.innerWidth < 600;
    if (sheet) p.className += ' peek--sheet';

    /* Placing has to happen again once the picture has loaded: until then the
       card has no height, so "is there room below?" is answered against the
       wrong number and a tall card can end up hanging out of the panel. */
    function place() {
      var hr = host.getBoundingClientRect(), r = el.getBoundingClientRect();
      var w = p.offsetWidth, h = p.offsetHeight, pad = 8, gap = 8;
      var left = Math.min(Math.max(pad, (r.left - hr.left) + r.width / 2 - w / 2), host.clientWidth - w - pad);
      /* Room is measured against the window. The page is what scrolls, not
         #panel, so #panel's box says nothing about what the reader can see —
         measuring against it sent every card above its word and often off
         the top of the screen. */
      var below = window.innerHeight - r.bottom - gap - pad,
          above = r.top - gap - pad,
          room = Math.max(above, below), top;
      /* On a short window a tall card fits neither above nor below. Sliding it
         back on screen would then park it on top of the word the reader just
         clicked, so cap its height instead and let the card scroll: the word
         stays readable, which is the whole point of showing the card. */
      if (h > room) { p.style.maxHeight = room + 'px'; p.style.overflowY = 'auto'; h = p.offsetHeight; }
      else          { p.style.maxHeight = ''; p.style.overflowY = ''; }
      if (below >= h) top = (r.bottom - hr.top) + gap;                     /* under the word */
      else            top = (r.top - hr.top) - h - gap;                    /* over it instead */
      var vTop = hr.top + top;
      if (vTop + h > window.innerHeight - pad) { top -= (vTop + h) - (window.innerHeight - pad); vTop = hr.top + top; }
      if (vTop < pad) top += pad - vTop;
      p.style.left = left + 'px';
      p.style.top = top + 'px';
    }
    if (!sheet) place();
    var im = p.querySelector('img');
    if (im && !sheet) im.addEventListener('load', function () {
      /* and never draw a picture bigger than it actually is */
      if (im.naturalWidth && im.naturalWidth < im.clientWidth) {
        im.style.width = im.naturalWidth + 'px';
        im.style.margin = '0 auto';
      }
      place();
    });
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
    t.style.pointerEvents = '';
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  /* Instant tooltips for the badges. A native title takes about a second to appear and never
     appears on a touch screen; these show on hover at once, on keyboard focus, and on a tap. */
  /* A magnifying lens drawn on a figure opens its close-up (one enterocyte on the villus). */
  document.addEventListener('click', function (e) {
    var lens = e.target.closest ? e.target.closest('.fig-lens, .fig-cell__close') : null;
    if (lens) {
      var stage = lens.closest('svg'), view = lens.getAttribute('data-view');
      if (view) {
        var cur = stage.getAttribute('data-view');
        if (cur === view) stage.removeAttribute('data-view'); else stage.setAttribute('data-view', view);
        Array.prototype.forEach.call(stage.querySelectorAll('.fig-lens[data-view]'), function (b) { b.setAttribute('aria-expanded', stage.getAttribute('data-view') === b.getAttribute('data-view') ? 'true' : 'false'); });
      } else {
        var open = stage.classList.toggle('is-cell');
        var btn = stage.querySelector('.fig-lens');
        if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      e.preventDefault(); return;
    }
    var tip = e.target.closest ? e.target.closest('.tip') : null;
    Array.prototype.forEach.call(document.querySelectorAll('.tip.is-open'), function (el) { if (el !== tip) el.classList.remove('is-open'); });
    if (tip) { e.preventDefault(); tip.classList.toggle('is-open'); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') Array.prototype.forEach.call(document.querySelectorAll('.tip.is-open'), function (el) { el.classList.remove('is-open'); });
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('fig-lens')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles:true })); }
  });

  /* ---------- boot ---------- */
  function boot() {
    (window.STATIONS || []).forEach(function (s) { S[s.id] = s; });
    ORDER = ORDER.filter(function (id) { return S[id]; });
    /* must run before anything reads a score: a record made against an older
       set of questions is cleared here rather than silently miscounted */
    var stale = reconcile();
    if (stale) console.info('Digestion Lab: ' + stale + ' station record(s) reset — the questions there have changed since they were answered.');

    var svg = document.getElementById('bodySvg');
    window.Anatomy.state.onPick = function (id) { open(id); };
    var tb = document.getElementById('tBody');
    if (tb) tb.addEventListener('click', function () { if (window.Zoom) window.Zoom.reset(); });
    ORDER.forEach(function (id) {
      var s = stationScore(id);
      if (s.total && s.done === s.total) window.Anatomy.state.done[id] = true;
    });
    window.Anatomy.render(svg);
    if (window.Zoom) window.Zoom.init(svg);

    document.getElementById('tLabels').addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') !== 'true';
      this.setAttribute('aria-pressed', on);
      window.Anatomy.state.showLabels = on;
      window.Anatomy.render(svg);
      if (window.Zoom) window.Zoom.refresh();
    });
    document.getElementById('tBeyond').addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') !== 'true';
      this.setAttribute('aria-pressed', on);
      window.Anatomy.state.showBeyond = on;
      window.Anatomy.render(svg);
      if (window.Zoom) window.Zoom.refresh();
    });
    tourBtn().addEventListener('click', function () {
      if (this.dataset.running === '1') stopTourUI(true); else startTour();
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
      if (window.Zoom) window.Zoom.refresh();
      paintHeader(); paintRail(); paintPanel();
      toast('Progress cleared.');
    });

    var start = canon((location.hash || '').slice(1));
    open(S[start] ? start : ORDER[0]);
    paintHeader();
    window.addEventListener('hashchange', function () {
      var id = canon(location.hash.slice(1));
      if (S[id] && id !== current) open(id);
    });
  }

  /* GitHub Pages caches the HTML for ten minutes, so a student can sit on an old copy
     without knowing. The page's own stamp is read from its script tags — the deploy bumps
     those — never from a constant here (a constant went stale and the banner never left).
     And the stamp file and the page are cached separately, so the banner only shows once
     the server's index.html itself carries a newer stamp: then a reload really helps. */
  var pageVersion = (function () {
    var sc = document.querySelector('script[src*="stations.js"]');
    var m = sc && (sc.getAttribute('src') || '').match(/[?&]v=(\d+)/);
    return m ? m[1] : null;
  })();
  var updateShown = false;
  function checkForUpdate() {
    if (!pageVersion || updateShown || document.hidden) return;
    fetch('version.txt', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (v) {
        v = v && v.trim();
        if (!v || v === pageVersion) return;
        return fetch(location.pathname, { cache: 'reload' })
          .then(function (r) { return r.ok ? r.text() : ''; })
          .then(function (html) {
            var m = html.match(/stations\.js\?v=(\d+)/);
            if (!m || m[1] === pageVersion) return;
            updateShown = true;
            var t = document.getElementById('toast');
            t.innerHTML = 'A newer version of this page is available. ' +
              '<button class="btn btn--ghost" style="margin-left:8px;padding:3px 12px;font-size:13px" ' +
              'onclick="location.reload()">Reload</button>';
            t.style.pointerEvents = 'auto';
            t.classList.add('show');
          });
      }).catch(function () {});
  }
  setTimeout(checkForUpdate, 4000);
  setInterval(checkForUpdate, 10 * 60 * 1000);
  window.LabUpdateCheck = checkForUpdate;                 /* for testing the banner logic */
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(checkForUpdate, 800); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
