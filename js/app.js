/* ============================================================
   app.js — wiring: plate ⇄ panel ⇄ rail, progress, guided tour.
   ============================================================ */
(function () {
  'use strict';

  var ORDER = ['diet','overview','mouth','salivary-glands','epiglottis','oesophagus','stomach',
               'liver','pancreas','ileum-villi','colon',
               'rectum-anus','molecules-lab','practicals'];

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

  var progress = load();
  var current = null;
  var tab = 'learn';

  /* ---------- progress ---------- */
  function load() {
    var d;
    try { d = JSON.parse(localStorage.getItem('digestion-lab.v2') || '{}'); } catch (e) { d = {}; }
    /* One record. Earlier versions kept one per mode; if that is what is in the browser,
       keep the Mastery one — it is the only mode there is now. */
    if (d.mastery && !d.stations) d = d.mastery;
    return d;
  }
  var saveBroken = false;
  function save() {
    try { localStorage.setItem('digestion-lab.v2', JSON.stringify(progress)); }
    catch (e) {
      /* Private browsing, or a school profile with site data blocked. The work is still held
         in memory and the hand-in still works — but a reload loses everything, and staying
         silent lets a student find that out an hour later. Said once per session. */
      if (!saveBroken) { saveBroken = true; toast('This browser is not saving your work — finish and hand in before you reload.'); }
    }
  }
  function p(id) {
    if (!progress[id]) progress[id] = { done:{}, tried:{}, sig:(S[id] ? stationSig(S[id]) : '') };
    return progress[id];
  }
  /* A saved answer is filed under the question's position in the station, and
     positions are not stable: if a question is removed, everything after it
     shifts up one, and a record would silently credit a reader for a question
     they never saw. So each station's record carries a fingerprint of the
     question set it was made against — the number of questions and their
     types. If that changes, the record for that station is dropped and the
     station is answered again. Losing one station's progress is a far smaller
     harm than handing in a perfect score that was never earned. */
  /* FNV-1a, base 36. Small, stable, and it only has to notice a change, not resist an attack. */
  function hash36(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(36);
  }
  /* The fingerprint covers the number of questions AND everything a student reads in each one,
     in order — the prompt, the options, the items, the labels. Counting types alone was not
     enough: rewording a question, or reordering its options, left the fingerprint unchanged, so
     a student kept a tick against a question that had changed underneath them.

     Deliberately NOT the answer key `k`. It is salted afresh on every build, so hashing it
     would wipe every record on every deploy whether anything changed or not. Verified: across
     two rebuilds with no content change, every station's fingerprint is identical in both labs. */
  function stationSig(st) {
    var acts = st.activities || [];
    var body = acts.map(function (a) {
      var c = {};
      /* `k` holds the answer hashes and `anyOrder` is marking policy — neither is something a
         student reads, and both change when marking is made more generous. Leaving them out
         keeps a fixed question fingerprinted the same, so widening what an answer may say never
         wipes anybody's ticks, and snapshots already saved in the spreadsheet still restore. */
      Object.keys(a).sort().forEach(function (k) { if (k !== 'k' && k !== 'anyOrder') c[k] = a[k]; });
      return JSON.stringify(c);
    }).join('|');
    return acts.length + ':' + hash36(body);
  }
  function reconcile() {
    var dropped = 0;
    Object.keys(progress).forEach(function (id) {
      var st = S[id];
      if (!st) { delete progress[id]; dropped++; return; }   /* station itself is gone */
      var sig = stationSig(st);
      if (progress[id].sig && progress[id].sig !== sig) {
        progress[id] = { done:{}, tried:{}, sig:sig }; dropped++;
      } else progress[id].sig = sig;
    });
    if (dropped) save();
    return dropped;
  }

  function stationScore(id) {
    var st = S[id];
    if (!st) return { done:0, total:0, tried:0 };
    var rec = p(id), total = (st.activities || []).length, n = 0, t = 0;
    /* only positions that still exist may count, so a stale record can never
       push the score above the number of questions actually asked */
    Object.keys(rec.done).forEach(function (k) { if (rec.done[k] && +k < total) n++; });
    Object.keys(rec.tried).forEach(function (k) { if (rec.tried[k] && +k < total) t++; });
    return { done:n, total:total, tried:t };
  }
  function totals() {
    var done = 0, total = 0, tried = 0, checks = 0, first1 = 0, from = 0;
    ORDER.forEach(function (id) {
      var s = stationScore(id); done += s.done; total += s.total; tried += s.tried;
      var rec = p(id);
      Object.keys(rec.per || {}).forEach(function (k) { if (+k < s.total) checks += rec.per[k]; });
      Object.keys(rec.one || {}).forEach(function (k) { if (+k < s.total && rec.done[k]) first1++; });
      if (rec.first && (!from || rec.first < from)) from = rec.first;
    });
    return { done:done, total:total, tried:tried, checks:checks, first1:first1, from:from };
  }

  /* On a phone the "Whole body" button floats on the plate instead of sitting in the row of
     toggles above it. It cannot do that from inside the toggle row: the plate's <svg> paints
     above that row, so the button is drawn but every touch goes straight through it to the
     plate. So it moves house — into .bodywrap, after the svg — and back again on a wide
     screen, where it belongs in the row with the other toggles. */
  var mqPlate = window.matchMedia('(max-width:1000px)');
  function placeWholeBody() {
    var btn = document.getElementById('tBody');
    var wrap = document.querySelector('.bodywrap');
    var tools = document.querySelector('.bodycol__tools');
    if (!btn || !wrap || !tools) return;
    var home = mqPlate.matches ? wrap : tools;
    if (btn.parentElement !== home) home.appendChild(btn);
  }
  if (mqPlate.addEventListener) mqPlate.addEventListener('change', placeWholeBody);
  else if (mqPlate.addListener) mqPlate.addListener(placeWholeBody);
  placeWholeBody();

  /* ---------- header ---------- */
  function paintHeader() {
    var t = totals(), pct = t.total ? t.done / t.total : 0, C = 2 * Math.PI * 11;
    var sub = document.getElementById('btnSubmit');
    if (sub) {
      /* Finished means every question right. It can be handed in before that, though —
         the record of the work so far is worth having, and the row says it is progress. */
      var done = t.done === t.total;
      var ready = t.total > 0 && (done || t.tried > 0);
      sub.hidden = false;
      sub.disabled = !ready;
      sub.classList.toggle('hbtn--part', ready && !done);
      sub.textContent = done || !ready ? 'Hand in' : 'Hand in progress';
      sub.title = done ? 'Hand in your finished work'
        : ready ? 'Hand in what you have so far — ' + t.done + ' of ' + t.total + ' right'
                : 'Answer a question first';
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
    var sc0 = panelScroller();
    if (sc0) { var pb = sc0.style.scrollBehavior; sc0.style.scrollBehavior = 'auto'; sc0.scrollTop = 0; sc0.style.scrollBehavior = pb || ''; }
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
    var rooms = (window.Zoom && window.Zoom.rooms) ? window.Zoom.rooms(st.id) : {};
    (st.learn.exam || []).forEach(function (b, i) {
      var li = document.createElement('li');
      var txt = typeof b === 'string' ? b : b.text;
      var badge = '';
      /* typeof check matters: a JS string has a built-in .sup() method, so
         'b.sup' is truthy for every plain bullet. */
      if (typeof b === 'object' && b.sup) badge = '<span class="sup tip" tabindex="0" data-tip="Supplement — examined on Paper 4 (Extended) only. Core candidates can skip it.">S</span>';
      if (typeof b === 'object' && b.ext) badge = '<span class="sup sup--ext tip" tabindex="0" data-tip="Extension — not in the 2026–28 syllabus. Here to make sense of the rest; you will not be asked to write it.">extension</span>';
      li.innerHTML = badge + M(txt);
      /* Some sentences carry a view on the plate that deserves to be looked at. Those get extra
         room, so the reader scrolls through them at a pace where each picture is actually seen. */
      if (rooms[i]) li.style.minHeight = rooms[i] + 'px';
      list.appendChild(li);
      media.filter(function (x) { return !x.more && x.after === i; })
           .forEach(function (x) { li.appendChild(mediaBox(x)); });
      figs.filter(function (f) { return FIG_AFTER[st.id + ':' + f] === i; })
          .forEach(function (name) { var fb = figBox(name); if (fb) li.appendChild(fb); });
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
        var fw = Assets.size('photos/' + f.src);
        return '<figure><img src="' + esc(Assets.url('photos/' + f.src)) + '" alt="" loading="lazy" decoding="async"' +
               (fw ? ' width="' + fw[0] + '" height="' + fw[1] + '"' : '') + '><figcaption>' + rich(f.cap) + '</figcaption></figure>';
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
      /* Reading a definition you have just read again teaches almost nothing. The card shows
         the word and asks for the definition first; the answer is one tap away, and stays
         open once turned. Recall, then check — not check, then assume. */
      k.innerHTML = '<div class="card__h">Key words</div>' +
        '<p class="kw-hint">Say the definition to yourself first, then turn the card.</p>' +
        '<dl class="kw-grid">' +
        st.keywords.map(function (w) {
          var g = (window.GLOSSARY || []).filter(function (e) { return e.term.toLowerCase() === w.term.toLowerCase(); })[0] || {};
          var tag = g.ext ? ' <span class="tier tier--ext" title="Worth knowing, but 0610 will not ask you to name it">not asked in 0610</span>'
                  : g.sup ? ' <span class="tier tier--sup" title="Supplement — Paper 4 (Extended) only">Supplement</span>' : '';
          return '<div class="kw kw--flip" role="button" tabindex="0" aria-expanded="false">' +
                 '<dt>' + M(w.term) + tag + '</dt>' +
                 '<p class="kw__ask">Do you know it? Tap to check</p>' +
                 '<dd>' + M(w.def) + '</dd></div>';
        }).join('') + '</dl>';
      Array.prototype.forEach.call(k.querySelectorAll('.kw--flip'), function (c) {
        var turn = function () {
          var open = c.classList.toggle('is-open');
          c.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        c.addEventListener('click', function (e) {
          /* a glossary marker inside the word keeps its own job */
          if (e.target.closest('[data-peek],[data-jump]')) return;
          turn();
        });
        c.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); turn(); }
        });
      });
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

  /* ---------- the three drawings that arrive late ----------
     js/data/figure-art.js is 185 KB of traced path data — about a quarter of everything a
     student downloads — and only the tooth and the villus need it. It is no longer a script
     tag: the page paints without it and fetches it once, then fills in whatever is waiting.

     While it is on its way a box of the RIGHT SHAPE holds the place, so the paragraph under
     the figure does not jump when the drawing lands. The shape comes from the figure's own
     viewBox (Figures.needsArt), never a flat guess: toothCompact draws about 548 px tall, so
     a 220 px placeholder would leave exactly the jump it exists to prevent. */
  function figWaitBox(name, inPair) {
    var wh = ((window.Figures || {}).needsArt || {})[name];
    if (!wh) return null;
    var w = document.createElement('div');
    w.className = 'figwait';
    /* Two frames size a drawing differently, and guessing one for both leaves the jump the
       placeholder exists to prevent (measured: a paired tooth reserved 749 px for a drawing
       that lands at 548).
         · in a pair half nothing stretches the svg, so it settles at exactly the floor
           keepFigureReadable gives it: viewBox x FIG_MIN_SCALE, scrolling if the cell is narrower
         · on its own, .media--fig .figbox__stage is width:100%, so the height follows the
           column width through the aspect ratio, never smaller than that same floor */
    if (inPair) {
      w.style.width  = Math.round(FIG_MIN_SCALE * wh[0]) + 'px';
      w.style.maxWidth = '100%';
      w.style.height = Math.round(FIG_MIN_SCALE * wh[1]) + 'px';
    } else {
      w.style.aspectRatio = wh[0] + ' / ' + wh[1];
      w.style.minHeight = Math.round(FIG_MIN_SCALE * wh[1]) + 'px';
    }
    w.textContent = 'Drawing the diagram…';
    return w;
  }
  var figArt = null;
  function loadFigureArt() {
    if (figArt) return figArt;
    figArt = new Promise(function (done) {
      if (window.FIGURE_ART) return done(true);
      var sc = document.createElement('script');
      sc.src = 'js/data/figure-art.js' + (pageVersion ? '?v=' + pageVersion : '');
      sc.onload = function () { done(true); };
      /* null it again so a later station can try once more: one dropped fetch must not
         leave the placeholder stuck for the rest of the lesson. */
      sc.onerror = function () { figArt = null; done(false); };
      document.head.appendChild(sc);
    }).then(function (ok) { if (ok) fillWaitingFigures(); return ok; });
    return figArt;
  }
  function fillWaitingFigures() {
    var pane = document.getElementById('panelInner');
    Array.prototype.forEach.call(document.querySelectorAll('.is-waiting[data-fig]'), function (el) {
      var name = el.getAttribute('data-fig'), f = window.Figures.get(name);
      if (!f || !f.svg) return;
      var wait = el.querySelector('.figwait');
      if (wait) wait.remove();
      el.classList.remove('is-waiting');
      if (el.classList.contains('pair__half')) {
        /* NOT innerHTML: pairBox appends the "The same structures, drawn" label to this same
           cell after the figure, and innerHTML would delete it. */
        el.insertAdjacentHTML('afterbegin', f.svg);
      } else {
        el.insertAdjacentHTML('afterbegin', f.svg);
      }
      hidePlateParts(el);
      keepFigureReadable(el);          /* without this a 576-unit viewBox is squeezed into a
                                          340 px column and its labels shrink to ~5 px */
    });
    if (pane) hintScrollers(pane);     /* runs once per paint, so a late figure needs it again */
  }

  /* a drawn diagram, in the same frame as the photographs */
  function figBox(name) {
    var f = window.Figures.get(name);
    if (!f || !f.svg) {
      var hold = figWaitBox(name);
      if (!hold) return null;
      var wait = document.createElement('figure');
      wait.className = 'media media--fig is-waiting';
      wait.setAttribute('data-fig', name);
      wait.appendChild(hold);
      loadFigureArt();
      return wait;
    }
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
      var started = false, watched = [];
      var check = function () {
        var sc = scrollerFor(box);
        if (started || !box.isConnected) { if (!box.isConnected) unwatch(); return; }
        var pr = sc === document.scrollingElement || sc === document.documentElement
          ? { top: 0, bottom: window.innerHeight, height: window.innerHeight } : sc.getBoundingClientRect();
        var r = box.getBoundingClientRect();
        var seen = Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top);
        if (seen < Math.min(r.height, pr.height) * 0.4) return;
        started = true; unwatch();
        try { stage.setCurrentTime(0); stage.unpauseAnimations(); } catch (e) {}
      };
      function unwatch() { watched.forEach(function (n) { n.removeEventListener('scroll', check); }); watched = []; }
      /* watch every box that could be the scroller at this width, and the window with them */
      [document.getElementById('panel'), document.querySelector('.stage'), window].forEach(function (n) {
        if (n) { n.addEventListener('scroll', check, { passive:true }); watched.push(n); }
      });
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
        if (f && f.svg) { cell.innerHTML = f.svg; hidePlateParts(cell); }
        else {
          var hold = figWaitBox(half.fig, true);
          if (hold) { cell.className += ' is-waiting'; cell.appendChild(hold); loadFigureArt(); }
        }
      } else {
        var img = new Image();
        img.className = 'media__el media__el--img';
        img.alt = half.label || String(ph.cap).replace(/<[^>]+>/g, '');
        img.loading = 'lazy';
        img.decoding = 'async';
        Assets.box(img, 'photos/' + half.photo);
        img.src = Assets.url('photos/' + half.photo);
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
      img.decoding = 'async';
      Assets.box(img, 'photos/' + ph.src);
      img.src = Assets.url('photos/' + ph.src);
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
    var im = new Image(); im.alt = ''; im.decoding = 'async';
    Assets.box(im, Assets.relOf(src));
    im.src = src;
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
        var top = card.querySelector('.act__top');
        if (top) top.appendChild(tick);
      }
      card.addEventListener('result', function (e) {
        if (!e.detail) return;
        var rec = p(st.id);
        /* Count the work, not just the outcome: how many times this question was checked,
           and whether it was right first time. Handing in 113/113 says nothing about the
           hour it took; "214 checks, 71 right first time" is the evidence of grinding. */
        rec.per = rec.per || {};
        rec.per[i] = (rec.per[i] || 0) + 1;
        if (!rec.first) rec.first = Date.now();
        rec.last = Date.now();
        if (e.detail.correct && !rec.done[i] && rec.per[i] === 1) { rec.one = rec.one || {}; rec.one[i] = true; }
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

  /* Which box actually scrolls. Below 1000px the panel is overflow:visible and .stage takes
     over the scrolling, so scrolling #panel there moves nothing at all — which is why
     following a word did nothing on an iPad held upright or on a phone. Never assume. */
  function scrollerFor(el) {
    for (var n = el.parentNode; n && n.nodeType === 1 && n !== document.body; n = n.parentNode) {
      var oy = window.getComputedStyle(n).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 4) return n;
    }
    return document.scrollingElement || document.documentElement;
  }
  function panelScroller() {
    var inner = document.getElementById('panelInner');
    return inner ? scrollerFor(inner) : (document.scrollingElement || document.documentElement);
  }
  function topOfScroller(sc) {
    return sc === document.scrollingElement || sc === document.documentElement
      ? 0 : sc.getBoundingClientRect().top;
  }
  /* The tab bar sticks to the top of that same box, so the first line a reader can actually
     read starts below it, not at the box's top edge. */
  function stickyInset(sc) {
    var tabs = document.querySelector('#panelInner .tabs');
    if (!tabs || window.getComputedStyle(tabs).position !== 'sticky') return 0;
    var tr = tabs.getBoundingClientRect();
    return tr.height && tr.top <= topOfScroller(sc) + tr.height + 2 ? Math.round(tr.height) : 0;
  }
  /* A word can send a reader into a section that is folded shut — the "optimum pH" line lives
     inside a closed <details>, and scrolling to something behind a shut disclosure scrolls to
     nothing the reader can see. Open the way in first. */
  function revealAncestors(target) {
    for (var n = target.parentNode; n && n.nodeType === 1; n = n.parentNode) {
      if (n.tagName === 'DETAILS' && !n.open) n.open = true;
    }
  }
  function placeBlock(target, smooth, gap) {
    revealAncestors(target);
    var sc = scrollerFor(target);
    var inset = stickyInset(sc) + (gap == null ? 14 : gap);
    var prev = sc.style.scrollBehavior;
    sc.style.scrollBehavior = smooth ? 'smooth' : 'auto';
    sc.scrollTop += (target.getBoundingClientRect().top - topOfScroller(sc)) - inset;
    sc.style.scrollBehavior = prev || '';
  }
  /* Re-place on the next frame and again shortly after. This lab is full of figures, and one
     of them finishing its layout above the target pushes the paragraph down the page — on a
     laptop that left the word you followed more than two screens below the fold. */
  function landOn(target, smooth) {
    placeBlock(target, smooth);
    requestAnimationFrame(function () { placeBlock(target, false); });
    setTimeout(function () { placeBlock(target, false); }, 160);
    setTimeout(function () { placeBlock(target, false); }, 420);
  }
  function toStationTop() { var sc = panelScroller(); if (sc) sc.scrollTop = 0; }

  /* Plurals and forms English refuses to make regularly, and which this lab uses constantly. */
  var SAME_WORD = { villi: 'villus', microvilli: 'villus', lacteals: 'lacteal', enzymes: 'enzyme',
    catalysts: 'catalyst', capillaries: 'capillary', enterocytes: 'enterocyte', proteases: 'protease',
    carbohydrases: 'carbohydrase', nutrients: 'nutrient', faeces: 'faecal', denatures: 'denatured',
    denature: 'denatured', emulsifies: 'emulsification', emulsify: 'emulsification',
    emulsifying: 'emulsification', churns: 'churning', egested: 'egestion', undigested: 'digested',
    incisors: 'incisor', canines: 'canine', premolars: 'premolar', molars: 'molar',
    peristaltic: 'peristalsis', assimilated: 'assimilation', goblet: 'goblet cell' };

  /* An element's words, with a space at every child boundary. Read straight off textContent,
     the letter a chip prints in its own <i> glues itself to the first word — "Cchyme" — and a
     whole-word search then fails on a word that is plainly there. */
  function wordsOf(el) {
    var out = '', w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false), n;
    while ((n = w.nextNode())) out += ' ' + n.nodeValue;
    return out.replace(/\s+/g, ' ').trim();
  }

  /* Landing at the top of a long station and being told to go and find the
     word yourself is no better than not linking at all. Find where the term
     is actually explained, put it at the top of the screen, and flash it. */
  function focusOnTerm(term, cameFrom) {
    var low = String(term).toLowerCase().trim();
    var esc2 = function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    var whole = function (t) { return new RegExp('(?<![A-Za-z0-9-])' + esc2(t) + '(?![A-Za-z0-9-])', 'i'); };
    var starts = function (t) { return new RegExp('(?<![A-Za-z0-9-])' + esc2(t), 'i'); };

    /* Tried in order, most exact first. The word a reader clicks is often not the form the
       destination uses: they click "denatures" and the station says "denatured",
       "carbohydrases" and it says "carbohydrase", "nutrients" and it says "nutrient". */
    var tries = [whole(low)];
    if (SAME_WORD[low]) tries.push(whole(SAME_WORD[low]));
    var trimmed = low.replace(/(ies|es|ing|ed|al|ic|um|s|y)$/, '');
    if (trimmed.length >= 4 && trimmed !== low) tries.push(starts(trimmed));
    if (low.length >= 7) tries.push(starts(low.slice(0, 6)));
    if (/ /.test(low)) tries.push(whole(low.split(' ')[0]));

    /* Where to look, best first: the keyword card that defines it, then the lines a student
       reads, then a caption, then anything else on the station that names it. */
    var ORDER = [
      ['#panelInner .kw', function (el) { return el.querySelector('dt') || el; }],
      ['#panelInner .exam-list > li', null],
      ['#panelInner .media__cap, #panelInner .later__list li', null],
      ['#panelInner li', null],
      ['#panelInner .st-sub, #panelInner .card p, #panelInner .fineprint, #panelInner p', null],
      ['#panelInner td, #panelInner th', null]
    ];
    function firstIn(sel, re, pick) {
      var els = document.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++) {
        var probe = pick ? pick(els[i]) : els[i];
        if (probe && re.test(wordsOf(probe))) return els[i];
      }
      return null;
    }
    var target = null, t, k;
    for (t = 0; t < tries.length && !target; t++)
      for (k = 0; k < ORDER.length && !target; k++) target = firstIn(ORDER[k][0], tries[t], ORDER[k][1]);
    /* a table cell is not a paragraph: take the whole table, so the headings come with it */
    if (target && /^(TD|TH)$/.test(target.tagName)) target = target.closest('table') || target;

    if (!target) {
      /* nothing on this station names it. Start the reader at the beginning rather than
         leaving them wherever the previous scroll happened to be. */
      toStationTop();
      if (cameFrom && S[cameFrom]) showBackChip(cameFrom, term);
      return;
    }
    /* arriving from another station: there is nothing to animate from, so land instantly */
    landOn(target, cameFrom == null);

    target.classList.add('flash');
    setTimeout(function () { target.classList.remove('flash'); }, 2800);

    if (cameFrom && S[cameFrom]) showBackChip(cameFrom, term);
  }

  /* a way back, so following a link is not a one-way trip */
  var backChip = null;
  /* Following a word takes the reader somewhere else in a long page. Coming back to the top
     of the station they left is not coming back — the sentence they were reading is gone.
     The exact place is noted before the jump and restored with it. */
  var whereWeWere = null;
  /* Put a scroller exactly where it was, with no animation: coming back is not a journey. */
  function jumpTo(el, top) {
    var prev = el.style.scrollBehavior;
    el.style.scrollBehavior = 'auto';
    el.scrollTop = top;
    el.style.scrollBehavior = prev || '';
  }
  function markWhereWeAre() {
    var sc = panelScroller();
    whereWeWere = { id: current, top: sc ? sc.scrollTop : 0, tab: tab };
  }
  function goBackToMark(id) {
    var w = whereWeWere && whereWeWere.id === id ? whereWeWere : null;
    open(id);
    if (!w) return;
    /* after paintPanel has laid the station out again */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { var sc = panelScroller(); if (sc) jumpTo(sc, w.top); });
    });
  }

  function showBackChip(id, term) {
    if (backChip) backChip.remove();
    var b = document.createElement('button');
    b.className = 'backchip';
    b.innerHTML = '← back to ' + esc(S[id].name);
    b.title = 'You followed "' + term + '" from here';
    b.addEventListener('click', function () { b.remove(); backChip = null; goBackToMark(id); });
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



  /* ---------- who is handing in ----------
     The lab is public and stays public: anyone may work through it and hand in. Signing in
     is what lets a hand-in be attributed, so Dr Mompel's spreadsheet holds his own students
     and nobody else's. Everyone gets a completion code either way. */
  var SIGNIN_KEY = 'digestion-lab.signin';
  var signIn = null;
  try {
    var sv = JSON.parse(localStorage.getItem(SIGNIN_KEY) || 'null');
    if (sv && sv.exp * 1000 > Date.now() + 60000) signIn = sv;
  } catch (e) {}

  /* The token is Google's to vouch for; we read it only to show a name. */
  function readToken(jwt) {
    try {
      var b = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      var j = JSON.parse(decodeURIComponent(escape(atob(b))));
      return { token:jwt, name:j.name || j.email || '', email:j.email || '', exp:j.exp || 0 };
    } catch (e) { return null; }
  }
  function onCredential(res) {
    var who = res && res.credential ? readToken(res.credential) : null;
    if (!who) return;
    signIn = who;
    try { localStorage.setItem(SIGNIN_KEY, JSON.stringify(who)); } catch (e) {}
    var box = document.getElementById('subWho');
    if (box) fillSubmit();
    if (afterSignIn) { var go = afterSignIn; afterSignIn = null; go(); }
  }
  function signInReady() {
    return !!((window.LAB_CONFIG || {}).googleClientId) &&
           window.google && google.accounts && google.accounts.id;
  }
  function mountSignIn(el) {
    if (!signInReady()) return false;
    try {
      google.accounts.id.initialize({
        client_id: (window.LAB_CONFIG || {}).googleClientId,
        callback: onCredential,
        auto_select: true
      });
      google.accounts.id.renderButton(el, { theme:'outline', size:'large', text:'signin_with', width: 260 });
      return true;
    } catch (e) { return false; }
  }
  function signOut() {
    signIn = null;
    try { localStorage.removeItem(SIGNIN_KEY); } catch (e) {}
    try { if (signInReady()) google.accounts.id.disableAutoSelect(); } catch (e) {}
    fillSubmit();
  }


  /* ---------- carrying work between computers ----------
     Progress lives in this browser, so another computer starts from nothing. What was HANDED
     IN is in the teacher's spreadsheet, together with a note of which questions were right, so
     signing in here brings it back. js/sync.js does the folding-in and only ever adds: a
     question right on either machine stays right, so pressing Sync cannot lose anything. */
  var LAB_ID = 'digestion-lab';
  var afterSignIn = null;

  function snapshotNow() {
    return (window.LabSync && window.LabSync.snapshot)
      ? window.LabSync.snapshot(progress, S, ORDER, stationSig) : '';
  }

  function syncEnabled() { return !!((window.LAB_CONFIG || {}).submitUrl && window.LabSync); }

  function haveToken() { return !!(signIn && signIn.token && signIn.exp * 1000 > Date.now() + 60000); }
  /* A Google sign-in lasts about an hour and a lab takes longer than that, so by the time a
     student presses Hand in the token they hold is often dead. Try once for a fresh one. If
     Google will not give it, the hand-in goes anyway and the server's refusal is shown, which
     beats a dead end. */
  var askedAgain = false;

  /* Ask Google for a sign-in, then come back and finish. One Tap can be refused by the
     browser, so say what to do instead rather than leaving a dead button. */
  function signInThen(fn) {
    afterSignIn = fn;
    if (!signInReady()) { toast('Sign-in is not available here. Open Hand in and sign in there, then press Sync.'); return; }
    try {
      google.accounts.id.initialize({ client_id:(window.LAB_CONFIG || {}).googleClientId,
                                      callback:onCredential, auto_select:true });
      google.accounts.id.prompt(function (n) {
        if (n && (n.isNotDisplayed && n.isNotDisplayed() || n.isSkippedMoment && n.isSkippedMoment())) {
          toast('Google did not offer a sign-in. Open Hand in, sign in there, then press Sync.');
        }
      });
    } catch (e) { toast('Could not open sign-in. Open Hand in and sign in there instead.'); }
  }

  function applySnap(snap, quiet) {
    if (!snap) { if (!quiet) toast('Nothing has been handed in for this lab yet, so there is nothing to bring back.'); return; }
    var res = window.LabSync.merge(progress, snap, S, stationSig);
    if (res.added) { save(); reconcile(); paintHeader(); paintRail(); paintPanel(); refreshTabCount(); }
    if (!quiet || res.added) toast(window.LabSync.say(res));
  }

  /* quiet: after a hand-in, say nothing unless something actually came back. */
  function syncNow(quiet) {
    if (!syncEnabled()) { toast('This lab is not set up to keep marks, so there is nothing to sync with.'); return; }
    if (!haveToken()) { signInThen(function () { syncNow(quiet); }); return; }
    var btn = document.getElementById('btnSync');
    if (btn) { btn.disabled = true; btn.classList.add('is-busy'); }
    fetch((window.LAB_CONFIG || {}).submitUrl, {
      method:'POST', mode:'cors', headers:{ 'Content-Type':'text/plain;charset=utf-8' },
      body: JSON.stringify({ action:'progress', token: signIn.token })
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        /* `why:'not signed in'` comes from the token check, NOT the class list — the records
           are not consulted about who is on it here. Saying "you are not on the class list"
           sent students to their teacher over a sign-in that had simply run out. */
        if (!j || !j.ok) { toast(j && j.why === 'not signed in'
          ? 'Your sign-in has run out. Sign in again, then press Sync.'
          : 'Could not reach your teacher\u2019s records just now.'); return; }
        var mine = j.labs && j.labs[LAB_ID];
        applySnap(mine && mine.snap, quiet);
      })
      .catch(function () { if (!quiet) toast('Could not reach your teacher\u2019s records just now.'); })
      .then(function () { if (btn) { btn.disabled = false; btn.classList.remove('is-busy'); } });
  }

  (function () {
    var btn = document.getElementById('btnSync');
    if (!btn) return;
    if (!syncEnabled()) return;                 /* no spreadsheet behind this lab: stay hidden */
    btn.hidden = false;
    btn.addEventListener('click', function () { syncNow(false); });
    /* Already signed in and nothing done here yet? Bring their work back without being asked. */
    if (haveToken()) {
      var empty = true;
      for (var k in progress) { var r = progress[k]; if (r && r.done && Object.keys(r.done).length) { empty = false; break; } }
      if (empty) syncNow(true);
    }
  })();

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
    var dlg = document.getElementById('subDlg');
    fillSubmit();
    dlg.hidden = false;
    document.getElementById('subClose').onclick = function () { dlg.hidden = true; };
    dlg.onclick = function (e) { if (e.target === dlg) dlg.hidden = true; };
    setTimeout(function () {
      var n = document.getElementById('subName');
      if (n) n.focus();
    }, 30);
  }

  /* The dialog has two faces: signed in, where the name is settled and the button sends;
     and not, where it offers to sign in and explains what that is for. */
  function fillSubmit() {
    var t = totals();
    var cfg = window.LAB_CONFIG || {};
    var body = document.getElementById('subBody');
    var go = document.getElementById('subGo');
    var complete = t.done === t.total;
    var head = complete
      ? 'You have answered all <b>' + t.total + '</b> questions correctly.'
      : 'Not finished yet: <b>' + t.done + '</b> of <b>' + t.total + '</b> right so far. You can ' +
        'hand this in to show how far you have got, and hand in again when it is all right.';
    var work = '<p class="fineprint">It carries the work behind it too: <b>' + t.checks + '</b> check' +
               (t.checks === 1 ? '' : 's') + ', <b>' + t.first1 + '</b> right first time.</p>';

    if (!cfg.googleClientId) {                       /* nothing is being collected anywhere */
      body.innerHTML = '<p class="st-sub">' + head + '</p>' + work +
        '<label class="fld"><span>Your full name</span><input id="subName" type="text" autocomplete="name"></label>' +
        '<label class="fld"><span>Your class</span><select id="subForm">' +
        (cfg.classes || ['Other']).map(function (c) { return '<option>' + c + '</option>'; }).join('') +
        '</select></label><div id="subMsg" class="submsg"></div>';
      go.style.display = ''; go.textContent = 'Get my code'; go.onclick = doSubmit;
      return;
    }

    if (signIn) {
      body.innerHTML = '<p class="st-sub">' + head + '</p>' + work +
        '<div class="who">Handing in as <b>' + esc(signIn.name) + '</b>' +
        '<button type="button" class="tourcard__link" id="subOut">not you?</button></div>' +
        '<p class="fineprint">If you are on Dr&nbsp;Mompel\'s class list this goes into his records. ' +
        'If you are not — anyone in the world is welcome here — nothing is saved anywhere, and you still get your code.</p>' +
        '<div id="subMsg" class="submsg"></div>';
      go.style.display = ''; go.textContent = 'Hand in'; go.onclick = doSubmit;
      document.getElementById('subOut').onclick = signOut;
      return;
    }

    body.innerHTML = '<p class="st-sub">' + head + '</p>' + work +
      '<p class="fineprint">Sign in with your school Google account so Dr&nbsp;Mompel knows whose work this is. ' +
      'The lab is open to everyone; signing in is only how a result reaches his records.</p>' +
      '<div id="subWho" class="signinbox"></div>' +
      '<div id="subMsg" class="submsg"></div>';
    go.style.display = 'none';
    if (!mountSignIn(document.getElementById('subWho'))) {
      /* Sign-in did not load — the student is offline, or a school filter has blocked
         accounts.google.com. This branch used to show "Get my code" with NO name field, so
         pressing it answered "Please type your full name" with nowhere to type it and the
         student could never get a code. It now asks for the name itself. */
      document.getElementById('subWho').innerHTML =
        '<p class="fineprint">Google sign-in could not load, so this cannot go into Dr&nbsp;Mompel&rsquo;s records ' +
        'automatically. Type your name and you will still get your completion code.</p>' +
        '<label class="fld"><span>Your full name</span><input id="subName" type="text" autocomplete="name"></label>' +
        '<label class="fld"><span>Your class</span><select id="subForm">' +
        (cfg.classes || ['Other']).map(function (c) { return '<option>' + c + '</option>'; }).join('') +
        '</select></label>';
      go.style.display = ''; go.textContent = 'Get my code'; go.onclick = doSubmit;
      var nf = document.getElementById('subName'); if (nf) nf.focus();
    }
  }


  /* What the server says when it will not record a hand-in. Its own words are shown for
     anything not listed, so a new answer is never swallowed. */
  function whyNot(reply) {
    var r = String(reply || '').trim();
    if (/^not recorded: sign-in is not set up/.test(r))
      return 'Your work was sent, but the records are not set up to accept sign-ins yet, so nothing was saved. Show your teacher this message.';
    if (/^not recorded: not signed in/.test(r))
      return 'Your sign-in had run out, so nothing was saved. Sign in again and press Hand in once more.';
    if (/^not recorded: not on this class list/.test(r))
      return 'That account is not on the class list, so nothing was saved for it. Your code is still your receipt.';
    if (/^busy/.test(r))
      return 'The records were busy. Press Hand in once more.';
    if (/^rejected/.test(r))
      return 'The records would not accept this hand-in: ' + r.replace(/^rejected:\s*/, '') + '.';
    if (/^unknown lab/.test(r))
      return 'The records do not know this lab yet. Show your teacher this message.';
    return 'Nothing was saved. The records answered: \u201c' + r + '\u201d.';
  }

  function doSubmit() {
    var name = signIn ? signIn.name : ((document.getElementById('subName') || {}).value || '');
    var form = (document.getElementById('subForm') || {}).value || '';
    var msg = document.getElementById('subMsg');
    var go = document.getElementById('subGo');
    if (name.trim().length < 3) { msg.className = 'submsg no'; msg.textContent = 'Please type your full name.'; return; }
    if (signIn && !haveToken() && !askedAgain) {
      askedAgain = true;
      msg.className = 'submsg'; msg.textContent = 'Your sign-in has run out \u2014 asking Google for a new one\u2026';
      signInThen(doSubmit); return;
    }

    var t = totals();
    var code = completionCode(name, form, t.done + '/' + t.total);
    var perStation = {};
    ORDER.forEach(function (id) {
      var s = stationScore(id), rec = p(id), c = 0;
      Object.keys(rec.per || {}).forEach(function (k) { if (+k < s.total) c += rec.per[k]; });
      perStation[id] = s.done + '/' + s.total + (c ? ' in ' + c : '');
    });
    var payload = { app:'digestion-lab', token: signIn ? signIn.token : '',
                    name:name.trim(), form:form,
                    score:t.done, total:t.total, code:code,
                    complete: t.done === t.total,
                    checks:t.checks, firstTime:t.first1, tried:t.tried,
                    from: t.from ? new Date(t.from).toISOString() : '',
                    stations:perStation, snap:snapshotNow(), at:new Date().toISOString() };
    var url = (window.LAB_CONFIG || {}).submitUrl;
    go.disabled = true;
    msg.className = 'submsg'; msg.textContent = url ? 'Sending…' : 'Generating your code…';

    /* `why` is the server saying it would not record this, in words a student can act on;
       `blind` means the reply could not be read at all and nothing should be claimed. */
    function finish(sent, offline, why, blind) {
      go.disabled = false;
      go.style.display = 'none';
      msg.className = why ? 'submsg no' : 'submsg ok';
      var head = why ? '<b>Not saved.</b> '
               : sent ? '<b>Handed in.</b> '
               : offline ? '<b>You are offline — nothing was sent yet.</b> '
               : '<b>Could not reach the server.</b> ';
      var tail = why ? why
        : sent
        ? (blind ? 'Your work went out, but this device could not read the answer, so keep your code as the receipt.'
                 : (signIn ? 'It is now in Dr Mompel&rsquo;s records. Your code is your receipt — keep it.'
                           : 'Your code is your receipt — keep it.'))
        : offline ? 'Your work is saved on this device. Keep the code, and hand in again once you are back online.'
        : 'Paste this into the Google Classroom assignment to hand in.';
      msg.innerHTML = head + 'Your completion code is<div class="code">' + code + '</div>' + tail;
      var rec = { name:name.trim(), form:form, code:code, at:payload.at, sent:sent };
      try { localStorage.setItem('digestion-lab.submitted', JSON.stringify(rec)); } catch (e) {}
    }
    if (!url) { finish(false); return; }
    if (navigator.onLine === false) { finish(false, true); return; }
    /* The reply is read, not assumed. This used to go out with mode:'no-cors', which made the
       answer unreadable, so the page said "Handed in." whether the work had been recorded or
       refused — the one failure a student can do nothing about because they never hear of it.
       Sync already reads this same endpoint, so reading it here costs nothing. If the read
       itself fails, fall back to the old blind send rather than losing the hand-in. */
    fetch(url, { method:'POST', mode:'cors',
                 headers:{ 'Content-Type':'text/plain;charset=utf-8' },
                 body:JSON.stringify(payload) })
      .then(function (r) { return r.text(); })
      .then(function (reply) {
        if (/^recorded/.test(String(reply || '').trim())) { finish(true); return; }
        finish(true, false, whyNot(reply));
      })
      .catch(function () {
        fetch(url, { method:'POST', mode:'no-cors',
                     headers:{ 'Content-Type':'text/plain;charset=utf-8' },
                     body:JSON.stringify(payload) })
          .then(function () { finish(true, false, null, true); })
          .catch(function () { finish(false); });
      });
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
      var pw = Assets.size('photos/' + src);
      art = '<img src="' + Assets.url('photos/' + src) + '" alt=""' +
            (pw ? ' width="' + pw[0] + '" height="' + pw[1] + '"' : '') + '>';
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

  /* the word itself, never the category letter the chip prints beside it */
  function termOf(el) { return (el.getAttribute('data-word') || el.textContent).trim(); }

  function wireTermClicks(root) {
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-peek],[data-jump],[data-gloss]');
      if (t) markWhereWeAre();
      if (!t) { closePeek(); return; }
      e.preventDefault();
      if (t.hasAttribute('data-peek')) openPeek(t);
      else if (t.hasAttribute('data-gloss')) { closePeek(); window.LabGlossary(t.getAttribute('data-gloss')); }
      else { closePeek(); open(t.getAttribute('data-jump'), false, termOf(t), current); }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target.closest('[data-peek],[data-jump],[data-gloss]');
      if (t) markWhereWeAre();
      if (!t) return;
      e.preventDefault();
      if (t.hasAttribute('data-peek')) openPeek(t);
      else if (t.hasAttribute('data-gloss')) window.LabGlossary(t.getAttribute('data-gloss'));
      else open(t.getAttribute('data-jump'), false, termOf(t), current);
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
    if (e.key === 'Escape') {
      Array.prototype.forEach.call(document.querySelectorAll('.tip.is-open'), function (el) { el.classList.remove('is-open'); });
      Array.prototype.forEach.call(document.querySelectorAll('svg.figbox__stage[data-view]'), function (st) {
        st.removeAttribute('data-view');
        Array.prototype.forEach.call(st.querySelectorAll('.fig-lens[data-view]'), function (b) { b.setAttribute('aria-expanded', 'false'); });
      });
    }
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

    document.getElementById('btnSubmit').addEventListener('click', openSubmit);


    wireTermClicks(document.getElementById('panel'));
    window.addEventListener('resize', closePeek);

    var lb = document.getElementById('lightbox');
    lb.addEventListener('click', function () { lb.hidden = true; });
    /* ---------- Key words, in one place ----------
       Every definition on the site already lives on the station that introduces the term.
       The glossary reads those, so there is one wording to keep right, not two — and it
       groups by station, which is the order a reader met the words in. */
    (function () {
      var dlg = document.getElementById('glossDlg'), list = document.getElementById('glossList');
      var find = document.getElementById('glossFind'), count = document.getElementById('glossCount');
      var built = false;

      var pinTerm = null;
      function build() {
        if (built) return; built = true;
        /* The glossary is the shared list, not this lab's stations: it holds words the labs
           use in common that no single station introduces — "net movement", "soluble" — as
           well as every term a station does introduce. Each is filed under the station that
           introduces it, and the rest under a heading of their own. */
        var all = (window.GLOSSARY || []).slice();
        var where = {};
        ORDER.forEach(function (id) {
          var st = S[id]; if (!st) return;
          (st.keywords || []).forEach(function (w) { where[w.term.toLowerCase()] = id; });
        });
        var groups = [], byId = {};
        ORDER.forEach(function (id) {
          if (!S[id]) return;
          byId[id] = { name: S[id].name, rows: [] }; groups.push(byId[id]);
        });
        var general = { name: 'Words used across the labs', rows: [] };
        /* A tapped word goes to the top under its own heading. Without this it sinks below
           every entry whose definition merely mentions it, which is the opposite of what the
           reader asked for: they tapped a word, so that word is the answer. */
        var pinned = null;
        all.forEach(function (e) {
          if (pinTerm && e.term.toLowerCase() === pinTerm && !pinned) { pinned = e; return; }
          var g = byId[where[e.term.toLowerCase()]] || general;
          g.rows.push(e);
        });
        if (general.rows.length) groups.push(general);
        if (pinned) groups.unshift({ name: 'The word you tapped', rows: [pinned] });
        list.innerHTML = groups.filter(function (g) { return g.rows.length; }).map(function (g) {
          return '<section class="gloss__grp"><h3 class="gloss__h">' + esc(g.name) + '</h3><dl class="gloss__dl">' +
                 g.rows.map(function (w) {
                   /* the neighbours: a word is easier to hold on to next to the ones it belongs
                      with, and each is a way into its own entry */
                   var known = window.Terms && window.Terms.isKnown(w.term);
                   var got = '<button type="button" class="gloss__got' + (known ? ' is-known' : '') +
                             '" data-got="' + esc(w.term) + '">' +
                             (known ? '\u2713 you know this — show it again' : 'I know this one — stop marking it') + '</button>';
                   var also = (w.also || []).length
                     ? '<p class="gloss__also">See also: ' + w.also.map(function (t) {
                         return '<button type="button" class="gloss__see" data-see="' + esc(t) + '">' + esc(t) + '</button>';
                       }).join(' ') + '</p>' : '';
                   return '<div class="gloss__row" data-term="' + esc((w.term + ' ' + w.def).toLowerCase()) + '">' +
                          '<dt>' + esc(w.term) + tierTag(w) + '</dt><dd>' + esc(w.def) + also + got + '</dd></div>';
                 }).join('') + '</dl></section>';
        }).join('');
      }

      function filter() {
        var q = (find.value || '').trim().toLowerCase();
        var rows = list.querySelectorAll('.gloss__row'), shown = 0;
        Array.prototype.forEach.call(rows, function (r) {
          var hit = !q || r.getAttribute('data-term').indexOf(q) >= 0;
          r.hidden = !hit; if (hit) shown++;
        });
        Array.prototype.forEach.call(list.querySelectorAll('.gloss__grp'), function (g) {
          g.hidden = !g.querySelector('.gloss__row:not([hidden])');
        });
        count.textContent = q ? (shown ? shown + (shown === 1 ? ' word' : ' words') + ' match “' + find.value.trim() + '”'
                                       : 'Nothing matches “' + find.value.trim() + '”')
                              : rows.length + ' key words across ' + list.querySelectorAll('.gloss__grp').length + ' stations';
      }

      /* A word can be on the syllabus, on the Extended tier of it, or not on it at all. Saying
         which is not decoration: a Core candidate reading 'periodontal fibres' needs to know
         they are not expected to learn it, not to wonder why they have never seen it. */
      function tierTag(w) {
        if (w.ext) return ' <span class="tier tier--ext" title="Worth knowing, but 0610 will not ask you to name it">not asked in 0610</span>';
        if (w.sup) return ' <span class="tier tier--sup" title="Supplement — examined on Paper 4 (Extended) only">Supplement</span>';
        return '';
      }

      var atOpen = null;
      /* the page is redrawn so a word that has just been accepted goes quiet at once */
      function repaintText() { if (typeof paintPanel === 'function') paintPanel(); }
      function countKnown() {
        var n = window.Terms ? window.Terms.knownCount() : 0;
        var el = document.getElementById('glossKnown');
        if (!el) return;
        el.hidden = !n;
        el.innerHTML = n + (n === 1 ? ' word is' : ' words are') + ' marked as known. ' +
                       '<button type="button" id="glossForget">Mark them all as new again</button>';
        var f = document.getElementById('glossForget');
        if (f) f.addEventListener('click', function () {
          window.Terms.forgetAll(); build2(); filter(); countKnown(); repaintText();
        });
      }
      function build2() { built = false; build(); }

      function open(term) {
        var scg = panelScroller();
        atOpen = scg ? scg.scrollTop : null;          /* put the reader back where they were */
        pinTerm = term ? String(term).trim().toLowerCase() : null;
        build2(); find.value = term || ''; filter(); countKnown(); dlg.hidden = false;
        var box = dlg.querySelector('.modal__box');
        if (box) box.scrollTop = 0;
        /* Focus the box only when the reader came here to search. Arriving from a word they
           tapped, the answer is already on screen — and focusing an input on a phone raises
           the keyboard over half of it, hiding the definition they asked for. */
        var touch = false;
        try { touch = matchMedia('(pointer: coarse)').matches; } catch (e) {}
        if (!term && !touch) {
          setTimeout(function () { try { find.focus({ preventScroll: true }); } catch (e) { find.focus(); }
                                   if (box) box.scrollTop = 0; }, 30);
        }
      }
      window.LabGlossary = open;

      document.getElementById('btnGloss').addEventListener('click', function () { open(''); });
      function close() {
        dlg.hidden = true;
        var scc = panelScroller();
        if (scc && atOpen != null) jumpTo(scc, atOpen);
      }
      document.getElementById('glossClose').addEventListener('click', close);
      dlg.addEventListener('click', function (e) { if (e.target === this) close(); });
      find.addEventListener('input', filter);
      /* following a see-also is a search, so the reader can always get back with the box */
      list.addEventListener('click', function (e) {
        var got = e.target.closest('.gloss__got');
        if (got) {
          var term = got.getAttribute('data-got');
          var now = !(window.Terms && window.Terms.isKnown(term));
          window.Terms.setKnown(term, now);
          got.classList.toggle('is-known', now);
          got.textContent = now ? '\u2713 you know this — show it again' : 'I know this one — stop marking it';
          countKnown();
          repaintText();
          return;
        }
        var b = e.target.closest('.gloss__see'); if (!b) return;
        find.value = b.getAttribute('data-see'); filter();
        var box2 = dlg.querySelector('.modal__box'); if (box2) box2.scrollTop = 0;
      });
    })();

    document.getElementById('btnHelp').addEventListener('click', function () {
      document.getElementById('modal').hidden = false;
    });
    document.getElementById('modalClose').addEventListener('click', function () {
      document.getElementById('modal').hidden = true;
    });
    document.getElementById('modal').addEventListener('click', function (e) {
      if (e.target === this) this.hidden = true;
    });
    /* Escape closes whatever is open. It used to name a dialog that no longer exists in the
       page, which threw on the way past and left the hand-in dialog and the lightbox open;
       closing by id, and skipping what is not there, cannot fail that way again. */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closePeek();
      ['modal', 'glossDlg', 'subDlg'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.hidden = true;
      });
      lb.hidden = true;
    });
    document.getElementById('btnReset').addEventListener('click', function () {
      if (!confirm('Clear all your answers and start again? This cannot be undone.')) return;
      progress = {};
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
    /* The drawings arrive only once the browser has nothing better to do. A fixed timer was
       wrong: on a slow link it fired while the critical scripts were still arriving and 185 KB
       of path data competed with them for the wire. A figure that is actually on screen does
       not wait for this — figBox asks for the file itself the moment it needs it.
       Wrapped, or setTimeout would hand loadFigureArt the timer id as its first argument. */
    var warmArt = function () { loadFigureArt(); };
    if (window.requestIdleCallback) window.requestIdleCallback(warmArt, { timeout: 15000 });
    else setTimeout(warmArt, 6000);
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
            var t = document.getElementById('updBar') || document.getElementById('toast');
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
