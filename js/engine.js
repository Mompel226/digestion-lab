/* ============================================================
   engine.js — the activity engine.
   Types: blank · drag · mcq · order · match · sort · ph
   Every type renders into a .act card and reports back
   {correct:Boolean} exactly once per "Check answer".
   ============================================================ */
(function (global) {
  'use strict';

  var KIND_NAME = { blank:'Fill the gaps', drag:'Drag & drop', mcq:'Multiple choice',
                    order:'Put in order', match:'Match up', sort:'Sort into groups', ph:'Set the pH' };

  /* ---------- utilities ---------- */
  function h(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().trim()
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ').replace(/[.,;:!?]+$/, '')
      .replace(/^(the|a|an)\s+/, '');
  }
  function shuffle(a) {
    var r = a.slice(), i, j, t;
    for (i = r.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = r[i]; r[i] = r[j]; r[j] = t; }
    /* never hand back the original order for ordering tasks */
    return r;
  }
  function shuffleDifferent(a) {
    if (a.length < 2) return a.slice();
    var r = shuffle(a), guard = 0;
    while (r.join('|') === a.join('|') && guard++ < 20) r = shuffle(a);
    return r;
  }

  /* ---------- pointer drag: one implementation for drag / sort / order ---------- */
  function makeDraggable(node, opts) {
    var ghost = null, startX = 0, startY = 0, dragging = false, pid = null;

    node.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      if (node.dataset.locked === '1') return;
      pid = e.pointerId; startX = e.clientX; startY = e.clientY; dragging = false;
      node.setPointerCapture(pid);
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', up);
      node.addEventListener('pointercancel', up);
    });

    function move(e) {
      if (e.pointerId !== pid) return;
      if (!dragging) {
        if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) return;
        dragging = true;
        ghost = node.cloneNode(true);
        ghost.classList.add('is-ghost');
        ghost.style.width = node.offsetWidth + 'px';
        document.body.appendChild(ghost);
        node.classList.add('is-drag');
        opts.onStart && opts.onStart(node);
      }
      e.preventDefault();
      ghost.style.left = e.clientX + 'px';
      ghost.style.top = e.clientY + 'px';
      opts.onOver && opts.onOver(e.clientX, e.clientY);
    }

    function up(e) {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', up);
      node.removeEventListener('pointercancel', up);
      try { node.releasePointerCapture(pid); } catch (_) {}
      if (ghost) { ghost.remove(); ghost = null; }
      node.classList.remove('is-drag');
      if (dragging) opts.onDrop && opts.onDrop(node, e.clientX, e.clientY);
      else opts.onTap && opts.onTap(node);
      dragging = false; pid = null;
    }
  }
  function underPoint(zones, x, y) {
    for (var i = 0; i < zones.length; i++) {
      var r = zones[i].getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return zones[i];
    }
    return null;
  }

  /* ---------- shell ---------- */
  function shell(a, idx) {
    var card = h('div', 'act');
    card.dataset.idx = idx;
    var top = h('div', 'act__top');
    var kind = h('span', 'act__kind', KIND_NAME[a.type] || a.type);
    kind.dataset.k = a.type;
    top.appendChild(kind);
    top.appendChild(h('span', 'act__n', 'Question ' + (idx + 1)));
    card.appendChild(top);
    if (a.prompt) card.appendChild(h('p', 'act__prompt', a.prompt));
    return card;
  }
  function foot(card, onCheck, onReset) {
    var f = h('div', 'act__foot');
    var check = h('button', 'btn', 'Check answer');
    var again = h('button', 'btn btn--quiet', 'Try again');
    again.style.display = 'none';
    var verdict = h('span', 'verdict');
    f.appendChild(check); f.appendChild(again); f.appendChild(verdict);
    card.appendChild(f);
    var fb = h('div', 'feedback'); fb.style.display = 'none'; card.appendChild(fb);

    check.addEventListener('click', function () {
      var res = onCheck();
      if (res == null) return;
      card.classList.toggle('is-right', res.correct);
      card.classList.toggle('is-wrong', !res.correct);
      verdict.className = 'verdict ' + (res.correct ? 'ok' : 'no');
      verdict.textContent = res.correct ? '✓ Correct' : '✗ Not yet';
      check.style.display = 'none';
      again.style.display = res.correct ? 'none' : '';
      if (res.message) { fb.className = 'feedback ' + (res.correct ? 'ok' : 'no'); fb.style.display = ''; fb.innerHTML = res.message; }
      card.dispatchEvent(new CustomEvent('result', { bubbles:true, detail:res }));
    });
    again.addEventListener('click', function () {
      onReset && onReset();
      card.classList.remove('is-right', 'is-wrong');
      verdict.textContent = ''; verdict.className = 'verdict';
      check.style.display = ''; again.style.display = 'none';
      fb.style.display = 'none';
    });
    return { check:check, again:again, verdict:verdict, fb:fb };
  }

  /* ============================= BLANK ============================= */
  function blank(a, idx) {
    var card = shell(a, idx);
    var wrap = h('div', 'cloze');
    var inputs = {};
    var parts = String(a.text).split(/(\{\d+\})/);
    parts.forEach(function (p) {
      var m = p.match(/^\{(\d+)\}$/);
      if (!m) { wrap.appendChild(document.createTextNode(p)); return; }
      var key = m[1], spec = (a.answers || {})[key] || { accept:[] };
      var inp = h('input', 'gap');
      inp.type = 'text';
      inp.setAttribute('aria-label', 'Gap ' + key);
      inp.autocomplete = 'off'; inp.spellcheck = false;
      inp.size = Math.max(9, Math.round((spec.accept && spec.accept[0] ? spec.accept[0].length : 10) * 0.95));
      inputs[key] = inp;
      wrap.appendChild(inp);
      if (spec.hint) {
        var hb = h('button', 'hintbtn', '?');
        hb.type = 'button';
        hb.title = 'Show a hint for this gap';
        hb.setAttribute('aria-label', 'Hint for gap ' + key);
        hb.addEventListener('click', function () {
          if (hb.dataset.shown === '1') return;
          hb.dataset.shown = '1';
          var t = h('span', 'hinttext', 'Hint (gap ' + key + '): ' + spec.hint);
          card.insertBefore(t, card.querySelector('.act__foot'));
        });
        wrap.appendChild(hb);
      }
    });
    card.appendChild(wrap);

    foot(card, function () {
      var wrong = [], total = 0, right = 0;
      Object.keys(inputs).forEach(function (k) {
        total++;
        var spec = a.answers[k] || { accept:[] };
        var v = norm(inputs[k].value);
        var ok = (spec.accept || []).some(function (x) { return norm(x) === v; });
        inputs[k].classList.toggle('ok', ok);
        inputs[k].classList.toggle('no', !ok);
        if (ok) right++; else wrong.push('Gap <b>' + k + '</b> → ' + (spec.accept || [''])[0]);
      });
      return { correct:right === total, score:right, total:total,
               message: right === total ? null : 'Correct answers: ' + wrong.join(' &nbsp;·&nbsp; ') };
    }, function () {
      Object.keys(inputs).forEach(function (k) { inputs[k].classList.remove('ok', 'no'); inputs[k].value = ''; });
    });
    return card;
  }

  /* ============================= DRAG ============================= */
  function drag(a, idx) {
    var card = shell(a, idx);
    var pool = h('div', 'tokens');
    var slotsWrap = h('div', 'slots');
    var wells = [];

    (a.slots || []).forEach(function (s) {
      var row = h('div', 'slot');
      row.appendChild(h('span', 'slot__lab', s.label));
      var well = h('div', 'slot__well', 'drop here');
      well.dataset.accept = s.accept;
      row.appendChild(well);
      wells.push(well);
      slotsWrap.appendChild(row);
    });

    var zones = wells.concat([pool]);
    function mkTok(text) {
      var t = h('span', 'tok', text);
      makeDraggable(t, {
        onOver:function (x, y) {
          zones.forEach(function (z) { z.classList.remove('over'); });
          var z = underPoint(zones, x, y);
          if (z && z !== pool) z.classList.add('over');
        },
        onDrop:function (node, x, y) {
          zones.forEach(function (z) { z.classList.remove('over'); });
          var z = underPoint(zones, x, y) || pool;
          if (z !== pool && z.querySelector('.tok') && z.querySelector('.tok') !== node)
            pool.appendChild(z.querySelector('.tok'));
          if (z !== pool) z.textContent = '';
          z.appendChild(node);
          tidy();
        },
        onTap:function (node) {
          /* tap-to-place fallback: send to the first empty well, or home */
          if (node.parentElement !== pool) { pool.appendChild(node); tidy(); return; }
          for (var i = 0; i < wells.length; i++)
            if (!wells[i].querySelector('.tok')) { wells[i].textContent = ''; wells[i].appendChild(node); tidy(); return; }
        }
      });
      return t;
    }
    function tidy() {
      wells.forEach(function (w) { if (!w.querySelector('.tok') && !w.textContent) w.textContent = 'drop here'; });
      pool.dataset.empty = pool.querySelector('.tok') ? '' : '1';
    }

    shuffleDifferent((a.tokens || []).concat(a.distractors || [])).forEach(function (t) { pool.appendChild(mkTok(t)); });
    card.appendChild(pool);
    card.appendChild(slotsWrap);
    tidy();

    foot(card, function () {
      var right = 0, miss = [];
      wells.forEach(function (w, i) {
        var tok = w.querySelector('.tok');
        var ok = tok && tok.textContent === w.dataset.accept;
        w.parentElement.classList.toggle('ok', !!ok);
        w.parentElement.classList.toggle('no', !ok);
        if (ok) right++; else miss.push('<b>' + a.slots[i].label + '</b> → ' + w.dataset.accept);
      });
      return { correct:right === wells.length, score:right, total:wells.length,
               message: right === wells.length ? null : 'Correct pairings: ' + miss.join(' &nbsp;·&nbsp; ') };
    }, function () {
      wells.forEach(function (w) {
        w.parentElement.classList.remove('ok', 'no');
        var t = w.querySelector('.tok'); if (t) pool.appendChild(t);
      });
      tidy();
    });
    return card;
  }

  /* ============================= MCQ ============================= */
  function mcq(a, idx) {
    var card = shell(a, idx);
    var box = h('div', 'opts');
    var multi = (a.correct || []).length > 1;
    var picked = {};
    var btns = (a.options || []).map(function (txt, i) {
      var b = h('button', 'opt');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      var k = h('span', 'opt__k', String.fromCharCode(65 + i));
      var body = h('span'); body.appendChild(document.createTextNode(txt));
      b.appendChild(k); b.appendChild(body);
      b.addEventListener('click', function () {
        if (b.dataset.locked === '1') return;
        if (!multi) { btns.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); }); picked = {}; }
        var on = b.getAttribute('aria-pressed') === 'true';
        b.setAttribute('aria-pressed', on ? 'false' : 'true');
        if (on) delete picked[i]; else picked[i] = 1;
      });
      box.appendChild(b);
      return b;
    });
    card.appendChild(box);

    foot(card, function () {
      var sel = Object.keys(picked).map(Number).sort();
      if (!sel.length) return null;
      var want = (a.correct || []).slice().sort();
      var ok = sel.join(',') === want.join(',');
      btns.forEach(function (b, i) {
        b.dataset.locked = '1';
        var isC = want.indexOf(i) >= 0, isS = sel.indexOf(i) >= 0;
        if (isC) b.classList.add('ok'); else if (isS) b.classList.add('no');
        var why = (a.why || {})[i] || (a.why || {})[String(i)];
        if (why && (isC || isS)) b.lastChild.appendChild(h('span', 'opt__why', why));
      });
      return { correct:ok, score:ok ? 1 : 0, total:1 };
    }, function () {
      picked = {};
      btns.forEach(function (b) {
        b.dataset.locked = ''; b.classList.remove('ok', 'no'); b.setAttribute('aria-pressed', 'false');
        var w = b.querySelector('.opt__why'); if (w) w.remove();
      });
    });
    return card;
  }

  /* ============================= ORDER ============================= */
  function order(a, idx) {
    var card = shell(a, idx);
    var list = h('div', 'order');
    function build(items) {
      list.innerHTML = '';
      items.forEach(function (txt) {
        var row = h('div', 'oitem');
        row.dataset.txt = txt;
        row.appendChild(h('span', 'oitem__n', ''));
        row.appendChild(h('span', 'oitem__grip', '⋮⋮'));
        row.appendChild(h('span', null, txt));
        makeDraggable(row, {
          onOver:function (x, y) {
            var rows = Array.prototype.slice.call(list.children);
            var target = null;
            rows.forEach(function (r) {
              if (r === row) return;
              var b = r.getBoundingClientRect();
              if (y > b.top && y < b.bottom) target = { r:r, before:y < b.top + b.height / 2 };
            });
            if (target) list.insertBefore(row, target.before ? target.r : target.r.nextSibling);
          },
          onDrop:renumber
        });
        list.appendChild(row);
      });
      renumber();
    }
    function renumber() {
      Array.prototype.forEach.call(list.children, function (r, i) { r.querySelector('.oitem__n').textContent = i + 1; });
    }
    build(shuffleDifferent(a.items || []));
    card.appendChild(list);
    if (!card.querySelector('.act__prompt'))
      card.insertBefore(h('p', 'act__prompt', 'Drag the steps into the correct order.'), list);

    foot(card, function () {
      var got = Array.prototype.map.call(list.children, function (r) { return r.dataset.txt; });
      var right = 0;
      got.forEach(function (t, i) {
        var ok = t === a.items[i];
        list.children[i].classList.toggle('ok', ok);
        list.children[i].classList.toggle('no', !ok);
        if (ok) right++;
      });
      return { correct:right === a.items.length, score:right, total:a.items.length,
               message: right === a.items.length ? null :
                 'Correct order: ' + a.items.map(function (t, i) { return (i + 1) + '. ' + t; }).join(' &nbsp;·&nbsp; ') };
    }, function () { build(shuffleDifferent(a.items || [])); });
    return card;
  }

  /* ============================= MATCH ============================= */
  function match(a, idx) {
    var card = shell(a, idx);
    var grid = h('div', 'match');
    var L = h('div', 'mcol'), R = h('div', 'mcol');
    L.appendChild(h('div', 'mcol__h', a.leftHead || 'Match these…'));
    R.appendChild(h('div', 'mcol__h', a.rightHead || '…to these'));
    var sel = { side:null, i:null }, links = {};
    var rIndex = shuffleDifferent((a.right || []).map(function (_, i) { return i; }).map(String)).map(Number);

    function badge(i) { return links[i] != null ? String.fromCharCode(65 + i) : ''; }
    function repaint() {
      lbtn.forEach(function (b, i) {
        b.querySelector('.mitem__b').textContent = badge(i);
        b.classList.toggle('paired', links[i] != null);
        b.setAttribute('aria-pressed', sel.side === 'L' && sel.i === i ? 'true' : 'false');
      });
      rbtn.forEach(function (b, k) {
        var ri = rIndex[k], owner = null;
        Object.keys(links).forEach(function (li) { if (links[li] === ri) owner = Number(li); });
        b.querySelector('.mitem__b').textContent = owner != null ? String.fromCharCode(65 + owner) : '';
        b.classList.toggle('paired', owner != null);
        b.setAttribute('aria-pressed', sel.side === 'R' && sel.i === ri ? 'true' : 'false');
      });
    }
    var lbtn = (a.left || []).map(function (txt, i) {
      var b = h('button', 'mitem'); b.type = 'button';
      b.appendChild(h('span', 'mitem__b', ''));
      b.appendChild(h('span', null, txt));
      b.addEventListener('click', function () {
        if (b.dataset.locked === '1') return;
        if (sel.side === 'R') { links[i] = sel.i; sel = { side:null, i:null }; }
        else if (sel.side === 'L' && sel.i === i) sel = { side:null, i:null };
        else sel = { side:'L', i:i };
        repaint();
      });
      L.appendChild(b); return b;
    });
    var rbtn = rIndex.map(function (ri) {
      var b = h('button', 'mitem'); b.type = 'button';
      b.appendChild(h('span', 'mitem__b', ''));
      b.appendChild(h('span', null, a.right[ri]));
      b.addEventListener('click', function () {
        if (b.dataset.locked === '1') return;
        if (sel.side === 'L') { links[sel.i] = ri; sel = { side:null, i:null }; }
        else if (sel.side === 'R' && sel.i === ri) sel = { side:null, i:null };
        else sel = { side:'R', i:ri };
        repaint();
      });
      R.appendChild(b); return b;
    });
    grid.appendChild(L); grid.appendChild(R);
    card.appendChild(grid);
    card.insertBefore(h('p', 'hinttext', 'Click one on the left, then its partner on the right.'), grid);
    repaint();

    foot(card, function () {
      var want = {}; (a.pairs || []).forEach(function (p) { want[p[0]] = p[1]; });
      var keys = Object.keys(want), right = 0, miss = [];
      keys.forEach(function (k) {
        var ok = links[k] === want[k];
        lbtn[k].dataset.locked = '1';
        lbtn[k].classList.add(ok ? 'ok' : 'no');
        if (ok) right++; else miss.push('<b>' + a.left[k] + '</b> → ' + a.right[want[k]]);
      });
      rbtn.forEach(function (b) { b.dataset.locked = '1'; });
      return { correct:right === keys.length, score:right, total:keys.length,
               message: right === keys.length ? null : 'Correct: ' + miss.join(' &nbsp;·&nbsp; ') };
    }, function () {
      links = {}; sel = { side:null, i:null };
      lbtn.concat(rbtn).forEach(function (b) { b.dataset.locked = ''; b.classList.remove('ok', 'no', 'paired'); });
      repaint();
    });
    return card;
  }

  /* ============================= SORT ============================= */
  function sort(a, idx) {
    var card = shell(a, idx);
    var pool = h('div', 'tokens');
    var binsWrap = h('div', 'bins');
    var bins = (a.bins || []).map(function (name, i) {
      var b = h('div', 'bin');
      b.appendChild(h('div', 'bin__h', name));
      b.dataset.bin = i;
      binsWrap.appendChild(b);
      return b;
    });
    var zones = bins.concat([pool]);
    function mkTok(item) {
      var t = h('span', 'tok', item.text);
      t.dataset.bin = item.bin;
      makeDraggable(t, {
        onOver:function (x, y) {
          zones.forEach(function (z) { z.classList.remove('over'); });
          var z = underPoint(zones, x, y);
          if (z && z !== pool) z.classList.add('over');
        },
        onDrop:function (node, x, y) {
          zones.forEach(function (z) { z.classList.remove('over'); });
          (underPoint(zones, x, y) || pool).appendChild(node);
        },
        onTap:function (node) {
          var here = bins.indexOf(node.parentElement);
          var next = here < 0 ? 0 : (here + 1 < bins.length ? here + 1 : -1);
          (next < 0 ? pool : bins[next]).appendChild(node);
        }
      });
      return t;
    }
    shuffleDifferent((a.items || []).map(function (x) { return JSON.stringify(x); }))
      .map(function (s) { return JSON.parse(s); })
      .forEach(function (it) { pool.appendChild(mkTok(it)); });
    card.appendChild(pool);
    card.appendChild(binsWrap);

    foot(card, function () {
      var right = 0, total = (a.items || []).length, unplaced = 0;
      bins.forEach(function (b, bi) {
        Array.prototype.forEach.call(b.querySelectorAll('.tok'), function (t) {
          var ok = Number(t.dataset.bin) === bi;
          t.classList.toggle('ok', ok); t.classList.toggle('no', !ok);
          if (ok) right++;
        });
      });
      Array.prototype.forEach.call(pool.querySelectorAll('.tok'), function (t) { t.classList.add('no'); unplaced++; });
      return { correct:right === total, score:right, total:total,
               message: right === total ? null :
                 (unplaced ? unplaced + ' item(s) left unsorted. ' : '') +
                 'Correct groups: ' + (a.items || []).map(function (it) {
                   return it.text + ' → <b>' + a.bins[it.bin] + '</b>'; }).join(' &nbsp;·&nbsp; ') };
    }, function () {
      bins.forEach(function (b) {
        Array.prototype.forEach.call(b.querySelectorAll('.tok'), function (t) { pool.appendChild(t); });
      });
      Array.prototype.forEach.call(pool.querySelectorAll('.tok'), function (t) { t.classList.remove('ok', 'no'); });
    });
    return card;
  }

  /* ============================= pH ============================= */
  function ph(a, idx) {
    var card = shell(a, idx);
    var box = h('div', 'ph');
    var scale = h('div', 'ph__scale');
    var marks = h('div', 'ph__marks');
    for (var i = 0; i <= 14; i += 2) marks.appendChild(h('span', null, String(i)));
    var slider = h('input');
    slider.type = 'range'; slider.min = '0'; slider.max = '14'; slider.step = '0.5'; slider.value = '7';
    slider.setAttribute('aria-label', 'pH');
    var read = h('div', 'ph__read');
    var val = h('span', 'ph__val', '7.0');
    var stateChip = h('span', 'ph__state off', 'Enzyme inactive');
    read.appendChild(val); read.appendChild(stateChip);
    var svgWrap = h('div');
    svgWrap.innerHTML =
      '<svg class="ph__enz" viewBox="0 0 300 88" role="img" aria-label="Enzyme active site">' +
      '<g id="enz' + idx + '">' +
      '<path class="enzBody" d="M20,66 L20,34 C20,26 26,20 34,20 L82,20 C90,20 96,26 96,34 L96,40 ' +
      'L112,40 L112,26 L140,26 L140,40 L156,40 L156,34 C156,26 162,20 170,20 L218,20 C226,20 232,26 232,34 L232,66 Z" ' +
      'fill="#DDEDE2" stroke="#14572B" stroke-width="2" stroke-linejoin="round"/>' +
      '<rect class="sub" x="112" y="4" width="28" height="22" rx="4" fill="#A16207"/>' +
      '<text class="phMsg" x="252" y="46" font-size="12" fill="#6B6B6B" font-family="Calibri,sans-serif">idle</text>' +
      '</g></svg>';
    box.appendChild(scale); box.appendChild(marks); box.appendChild(slider); box.appendChild(read); box.appendChild(svgWrap);
    card.appendChild(box);

    var body = svgWrap.querySelector('.enzBody'), sub = svgWrap.querySelector('.sub'), msg = svgWrap.querySelector('.phMsg');
    function update() {
      var v = parseFloat(slider.value);
      val.textContent = v.toFixed(1);
      var d = Math.abs(v - a.optimum), tol = a.tolerance == null ? 0.6 : a.tolerance;
      var fits = d <= tol, near = d <= tol + 1.5;
      stateChip.className = 'ph__state ' + (fits ? 'on' : 'off');
      stateChip.textContent = fits ? (a.enzyme || 'Enzyme') + ' is working'
                  : near ? (a.enzyme || 'Enzyme') + ' is slow' : (a.enzyme || 'Enzyme') + ' is denatured';
      /* the active site distorts as pH moves away from the optimum */
      var warp = Math.min(1, d / 5);
      body.setAttribute('d', fits
        ? 'M20,66 L20,34 C20,26 26,20 34,20 L82,20 C90,20 96,26 96,34 L96,40 L112,40 L112,26 L140,26 L140,40 L156,40 L156,34 C156,26 162,20 170,20 L218,20 C226,20 232,26 232,34 L232,66 Z'
        : 'M20,66 L20,' + (34 + warp * 6) + ' C20,26 26,20 34,20 L82,20 C90,20 ' + (96 - warp * 14) + ',26 ' + (96 - warp * 12) + ',34 L' + (96 - warp * 10) + ',' + (40 + warp * 10) +
          ' L' + (112 + warp * 16) + ',' + (40 + warp * 14) + ' L' + (112 + warp * 20) + ',26 L' + (140 + warp * 8) + ',' + (26 - warp * 8) +
          ' L' + (140 + warp * 4) + ',' + (40 - warp * 12) + ' L' + (156 + warp * 12) + ',40 L156,' + (34 - warp * 5) +
          ' C156,26 162,20 170,20 L218,20 C226,20 232,26 232,34 L232,66 Z');
      body.setAttribute('fill', fits ? '#DDEDE2' : near ? '#F6EEDC' : '#F7E2DD');
      body.setAttribute('stroke', fits ? '#14572B' : near ? '#A16207' : '#B03A2E');
      sub.setAttribute('y', fits ? 8 : 4);
      sub.setAttribute('fill', fits ? '#1E7A3E' : '#A16207');
      msg.textContent = fits ? 'substrate fits' : near ? 'a poor fit' : 'active site changed shape';
      msg.setAttribute('fill', fits ? '#1E7A3E' : near ? '#A16207' : '#B03A2E');
    }
    slider.addEventListener('input', update);
    update();

    foot(card, function () {
      var v = parseFloat(slider.value), tol = a.tolerance == null ? 0.6 : a.tolerance;
      var ok = Math.abs(v - a.optimum) <= tol;
      return { correct:ok, score:ok ? 1 : 0, total:1,
               message:(ok ? '' : 'The optimum pH for ' + (a.enzyme || 'this enzyme') + ' is about <b>' + a.optimum + '</b>. ') + (a.explain || '') };
    }, function () { slider.value = '7'; update(); });
    return card;
  }

  var MAKERS = { blank:blank, drag:drag, mcq:mcq, order:order, match:match, sort:sort, ph:ph };

  global.Engine = {
    render:function (a, idx) {
      var maker = MAKERS[a.type];
      if (!maker) { var e = h('div', 'act'); e.textContent = 'Unknown activity type: ' + a.type; return e; }
      return maker(a, idx);
    },
    KIND_NAME:KIND_NAME
  };
})(window);
