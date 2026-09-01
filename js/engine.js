/* ============================================================
   engine.js — the activity engine.

   Types: blank · drag · mcq · order · match · sort · ph

   Three modes, set per session:
     test      one attempt, then the card locks. Right or wrong only.
     mastery   check as often as you like. Right or wrong only —
               you have to think, not read the answer off the screen.
     practice  check, and see the correct answer and why. Password only.

   Marking goes through Marking.check(), which compares hashes, so in
   test and mastery the correct answer is not present in the page at all.
   ============================================================ */
(function (global) {
  'use strict';

  var KIND_NAME = { blank:'Fill the gaps', drag:'Drag & drop', mcq:'Multiple choice',
                    order:'Put in order', match:'Match up', sort:'Sort into groups', ph:'Set the pH' };

  var MODE = 'mastery';
  function mode() { return MODE; }
  function reveals() { return MODE === 'practice' && window.Marking.isUnlocked(); }
  function oneShot() { return MODE === 'test'; }

  /* ---------- utilities ---------- */
  function h(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function shuffle(a) {
    var r = a.slice(), i, j, t;
    for (i = r.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = r[i]; r[i] = r[j]; r[j] = t; }
    return r;
  }

  /* ---------- pointer drag, shared by drag / sort / order ---------- */
  function makeDraggable(node, opts) {
    var ghost = null, sx = 0, sy = 0, dragging = false, pid = null;
    node.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      if (node.dataset.locked === '1') return;
      pid = e.pointerId; sx = e.clientX; sy = e.clientY; dragging = false;
      node.setPointerCapture(pid);
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', up);
      node.addEventListener('pointercancel', up);
    });
    function move(e) {
      if (e.pointerId !== pid) return;
      if (!dragging) {
        if (Math.abs(e.clientX - sx) < 5 && Math.abs(e.clientY - sy) < 5) return;
        dragging = true;
        ghost = node.cloneNode(true);
        ghost.classList.add('is-ghost');
        ghost.style.width = node.offsetWidth + 'px';
        document.body.appendChild(ghost);
        node.classList.add('is-drag');
      }
      e.preventDefault();
      ghost.style.left = e.clientX + 'px';
      ghost.style.top = e.clientY + 'px';
      if (opts.onOver) opts.onOver(e.clientX, e.clientY);
    }
    function up(e) {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', up);
      node.removeEventListener('pointercancel', up);
      try { node.releasePointerCapture(pid); } catch (_) {}
      if (ghost) { ghost.remove(); ghost = null; }
      node.classList.remove('is-drag');
      if (dragging) { if (opts.onDrop) opts.onDrop(node, e.clientX, e.clientY); }
      else if (opts.onTap) opts.onTap(node);
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

  /* ---------- card shell ---------- */
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

  /* onCheck() must return a Promise of {correct,...} or null to abort */
  function foot(card, onCheck, onReset, onShow) {
    var f = h('div', 'act__foot');
    var check = h('button', 'btn', 'Check answer');
    var again = h('button', 'btn btn--quiet', 'Try again');
    var verdict = h('span', 'verdict');
    again.style.display = 'none';
    f.appendChild(check); f.appendChild(again); f.appendChild(verdict);
    card.appendChild(f);
    var fb = h('div', 'feedback'); fb.style.display = 'none'; card.appendChild(fb);

    check.addEventListener('click', function () {
      check.disabled = true;
      Promise.resolve(onCheck()).then(function (res) {
        check.disabled = false;
        if (res == null) return;
        card.classList.toggle('is-right', res.correct);
        card.classList.toggle('is-wrong', !res.correct);
        verdict.className = 'verdict ' + (res.correct ? 'ok' : 'no');
        verdict.textContent = res.correct ? '✓ Correct'
          : (res.total > 1 ? '✗ ' + res.score + ' of ' + res.total + ' right' : '✗ Not yet');
        check.style.display = 'none';
        /* test mode: one attempt only. mastery/practice: keep trying. */
        again.style.display = (!res.correct && !oneShot()) ? '' : 'none';
        if (oneShot()) card.dataset.locked = '1';
        if (reveals() && onShow) {
          var msg = onShow(res);
          if (msg) { fb.className = 'feedback ' + (res.correct ? 'ok' : 'no'); fb.style.display = ''; fb.innerHTML = msg; }
        } else if (!res.correct) {
          fb.className = 'feedback no'; fb.style.display = '';
          fb.innerHTML = oneShot()
            ? 'Not right. In test mode you get one attempt per question.'
            : 'Not right yet — look again at the ones marked in red, and try once more.';
        }
        card.dispatchEvent(new CustomEvent('result', { bubbles:true, detail:res }));
      });
    });
    again.addEventListener('click', function () {
      if (onReset) onReset();
      card.classList.remove('is-right', 'is-wrong');
      verdict.textContent = ''; verdict.className = 'verdict';
      check.style.display = ''; again.style.display = 'none';
      fb.style.display = '';
      fb.style.display = 'none';
    });
    return { check:check, again:again, verdict:verdict, fb:fb };
  }

  /* ============================= BLANK ============================= */
  function blank(a, idx, id) {
    var card = shell(a, idx);
    var wrap = h('div', 'cloze');
    var inputs = {};
    String(a.text).split(/(\{\d+\})/).forEach(function (p) {
      var m = p.match(/^\{(\d+)\}$/);
      if (!m) { wrap.appendChild(document.createTextNode(p)); return; }
      var key = m[1];
      var inp = h('input', 'gap');
      inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
      inp.setAttribute('aria-label', 'Gap ' + key);
      inp.size = 12;
      inputs[key] = inp;
      wrap.appendChild(inp);
      var hint = (a.hints || {})[key];
      if (hint) {
        var hb = h('button', 'hintbtn', '?');
        hb.type = 'button';
        hb.title = 'Show a hint for this gap';
        hb.setAttribute('aria-label', 'Hint for gap ' + key);
        hb.addEventListener('click', function () {
          if (hb.dataset.shown === '1') return;
          hb.dataset.shown = '1';
          card.insertBefore(h('span', 'hinttext', 'Hint (gap ' + key + '): ' + hint), card.querySelector('.act__foot'));
        });
        wrap.appendChild(hb);
      }
    });
    card.appendChild(wrap);

    foot(card, function () {
      var vals = {};
      Object.keys(inputs).forEach(function (k) { vals[k] = inputs[k].value; });
      return window.Marking.check(a, id, vals).then(function (res) {
        Object.keys(inputs).forEach(function (k) {
          inputs[k].classList.toggle('ok', !!res.gaps[k]);
          inputs[k].classList.toggle('no', !res.gaps[k]);
          if (oneShot()) inputs[k].disabled = true;
        });
        return res;
      });
    }, function () {
      Object.keys(inputs).forEach(function (k) { inputs[k].classList.remove('ok', 'no'); });
    }, function (res) {
      var v = window.Marking.answer(id);
      if (!v || res.correct) return null;
      return 'Correct answers: ' + Object.keys(v.answers).map(function (k) {
        return 'gap <b>' + k + '</b> → ' + esc(v.answers[k]);
      }).join(' &nbsp;·&nbsp; ');
    });
    return card;
  }

  /* ============================= MCQ ============================= */
  function mcq(a, idx, id) {
    var card = shell(a, idx);
    var box = h('div', 'opts');
    var picked = {};
    var btns = (a.options || []).map(function (txt, i) {
      var b = h('button', 'opt');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.appendChild(h('span', 'opt__k', String.fromCharCode(65 + i)));
      var body = h('span'); body.appendChild(document.createTextNode(txt));
      b.appendChild(body);
      b.addEventListener('click', function () {
        if (b.dataset.locked === '1') return;
        if (!a.multi) { btns.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); }); picked = {}; }
        var on = b.getAttribute('aria-pressed') === 'true';
        b.setAttribute('aria-pressed', on ? 'false' : 'true');
        if (on) delete picked[i]; else picked[i] = 1;
      });
      box.appendChild(b);
      return b;
    });
    card.appendChild(box);

    foot(card, function () {
      var sel = Object.keys(picked).map(Number).sort(function (x, y) { return x - y; });
      if (!sel.length) return null;
      return window.Marking.check(a, id, sel).then(function (res) {
        if (reveals()) {
          var v = window.Marking.answer(id) || {};
          btns.forEach(function (b, i) {
            b.dataset.locked = '1';
            var isC = (v.correct || []).indexOf(i) >= 0, isS = sel.indexOf(i) >= 0;
            if (isC) b.classList.add('ok'); else if (isS) b.classList.add('no');
            var why = (v.why || {})[i] != null ? v.why[i] : (v.why || {})[String(i)];
            if (why && (isC || isS)) b.lastChild.appendChild(h('span', 'opt__why', why));
          });
        } else {
          /* only what THEY chose is marked — the right answer stays hidden */
          btns.forEach(function (b, i) {
            if (oneShot()) b.dataset.locked = '1';
            if (sel.indexOf(i) >= 0) b.classList.add(res.correct ? 'ok' : 'no');
          });
        }
        return res;
      });
    }, function () {
      picked = {};
      btns.forEach(function (b) {
        b.dataset.locked = ''; b.classList.remove('ok', 'no'); b.setAttribute('aria-pressed', 'false');
        var w = b.querySelector('.opt__why'); if (w) w.remove();
      });
    }, function () { return null; });
    return card;
  }

  /* ============================= ORDER ============================= */
  function order(a, idx, id) {
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
            var target = null;
            Array.prototype.forEach.call(list.children, function (r) {
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
    build(shuffle(a.items || []));
    card.appendChild(list);

    foot(card, function () {
      var got = Array.prototype.map.call(list.children, function (r) { return r.dataset.txt; });
      return window.Marking.check(a, id, got).then(function (res) {
        Array.prototype.forEach.call(list.children, function (r) {
          if (oneShot()) r.dataset.locked = '1';
          r.classList.toggle('ok', res.correct);
          r.classList.toggle('no', !res.correct);
        });
        return res;
      });
    }, function () {
      build(shuffle(a.items || []));
    }, function (res) {
      var v = window.Marking.answer(id);
      if (!v || res.correct) return null;
      return 'Correct order: ' + v.items.map(function (t, i) { return (i + 1) + '. ' + esc(t); }).join(' &nbsp;·&nbsp; ');
    });
    return card;
  }

  /* ============================= MATCH ============================= */
  function match(a, idx, id) {
    var card = shell(a, idx);
    var grid = h('div', 'match');
    var L = h('div', 'mcol'), R = h('div', 'mcol');
    L.appendChild(h('div', 'mcol__h', a.leftHead || 'Match these…'));
    R.appendChild(h('div', 'mcol__h', a.rightHead || '…to these'));
    var sel = { side:null, i:null }, links = {};
    var rIndex = shuffle((a.right || []).map(function (_, i) { return i; }));

    function repaint() {
      lbtn.forEach(function (b, i) {
        b.querySelector('.mitem__b').textContent = links[i] != null ? String.fromCharCode(65 + i) : '';
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
      if (a.leftNotes) b.classList.add('mitem--person');
      b.appendChild(h('span', 'mitem__b', ''));
      var body = h('span');
      body.appendChild(h('b', 'mitem__who', txt));
      if (a.leftNotes && a.leftNotes[i]) body.appendChild(h('span', 'mitem__note', a.leftNotes[i]));
      b.appendChild(body);
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
      if (a.rightCharts && a.rightCharts[ri] && window.Figures) b.classList.add('mitem--chart');
      b.appendChild(h('span', 'mitem__b', ''));
      if (a.rightCharts && a.rightCharts[ri] && window.Figures) {
        var ch = document.createElement('span');
        ch.className = 'mitem__chart';
        ch.innerHTML = window.Figures.pie(a.rightCharts[ri], 104) +
                       window.Figures.pieKey(a.rightCharts[ri]);
        b.appendChild(ch);
      }
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
    card.appendChild(h('p', 'hinttext', 'Click one on the left, then its partner on the right.'));
    card.appendChild(grid);
    repaint();

    foot(card, function () {
      var pairs = Object.keys(links).map(function (k) { return [Number(k), links[k]]; });
      if (pairs.length < (a.left || []).length) return null;
      return window.Marking.check(a, id, pairs).then(function (res) {
        if (reveals()) {
          var v = window.Marking.answer(id) || { pairs: [] };
          var want = {}; v.pairs.forEach(function (p) { want[p[0]] = p[1]; });
          lbtn.forEach(function (b, i) { b.dataset.locked = '1'; b.classList.add(links[i] === want[i] ? 'ok' : 'no'); });
        } else {
          lbtn.forEach(function (b) { if (oneShot()) b.dataset.locked = '1'; b.classList.add(res.correct ? 'ok' : 'no'); });
        }
        rbtn.forEach(function (b) { if (oneShot() || reveals()) b.dataset.locked = '1'; });
        return res;
      });
    }, function () {
      links = {}; sel = { side:null, i:null };
      lbtn.concat(rbtn).forEach(function (b) { b.dataset.locked = ''; b.classList.remove('ok', 'no', 'paired'); });
      repaint();
    }, function (res) {
      var v = window.Marking.answer(id);
      if (!v || res.correct) return null;
      return 'Correct pairs: ' + v.pairs.map(function (p) {
        return '<b>' + esc(a.left[p[0]]) + '</b> → ' + esc(a.right[p[1]]);
      }).join(' &nbsp;·&nbsp; ');
    });
    return card;
  }

  /* ============================= SORT ============================= */
  function sort(a, idx, id) {
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
    shuffle(a.items || []).forEach(function (t) { pool.appendChild(mkTok(t)); });
    card.appendChild(pool);
    card.appendChild(binsWrap);

    foot(card, function () {
      var placed = [];
      bins.forEach(function (b, bi) {
        Array.prototype.forEach.call(b.querySelectorAll('.tok'), function (t) { placed.push([t.textContent, bi]); });
      });
      var left = pool.querySelectorAll('.tok').length;
      if (left) return null;
      return window.Marking.check(a, id, placed).then(function (res) {
        Array.prototype.forEach.call(card.querySelectorAll('.tok'), function (t) {
          if (oneShot()) t.dataset.locked = '1';
          t.classList.add(res.correct ? 'ok' : 'no');
        });
        return res;
      });
    }, function () {
      bins.forEach(function (b) {
        Array.prototype.forEach.call(b.querySelectorAll('.tok'), function (t) { pool.appendChild(t); });
      });
      Array.prototype.forEach.call(pool.querySelectorAll('.tok'), function (t) { t.classList.remove('ok', 'no'); });
    }, function (res) {
      var v = window.Marking.answer(id);
      if (!v || res.correct) return null;
      return 'Correct groups: ' + v.items.map(function (it) {
        return esc(it.text) + ' → <b>' + esc(a.bins[it.bin]) + '</b>';
      }).join(' &nbsp;·&nbsp; ');
    });
    return card;
  }

  /* ============================= DRAG ============================= */
  function drag(a, idx, id) {
    var card = shell(a, idx);
    var pool = h('div', 'tokens');
    var slotsWrap = h('div', 'slots');
    var wells = (a.slots || []).map(function (s) {
      var row = h('div', 'slot');
      row.appendChild(h('span', 'slot__lab', s.label));
      var well = h('div', 'slot__well', 'drop here');
      row.appendChild(well);
      slotsWrap.appendChild(row);
      return well;
    });
    var zones = wells.concat([pool]);
    function tidy() {
      wells.forEach(function (w) { if (!w.querySelector('.tok') && !w.textContent) w.textContent = 'drop here'; });
    }
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
          if (z !== pool) {
            var sitting = z.querySelector('.tok');
            if (sitting && sitting !== node) pool.appendChild(sitting);
            z.textContent = '';
          }
          z.appendChild(node);
          tidy();
        },
        onTap:function (node) {
          if (node.parentElement !== pool) { pool.appendChild(node); tidy(); return; }
          for (var i = 0; i < wells.length; i++)
            if (!wells[i].querySelector('.tok')) { wells[i].textContent = ''; wells[i].appendChild(node); tidy(); return; }
        }
      });
      return t;
    }
    shuffle((a.tokens || []).concat(a.distractors || [])).forEach(function (t) { pool.appendChild(mkTok(t)); });
    card.appendChild(pool);
    card.appendChild(slotsWrap);
    tidy();

    foot(card, function () {
      var got = wells.map(function (w) { var t = w.querySelector('.tok'); return t ? t.textContent : ''; });
      if (got.some(function (x) { return !x; })) return null;
      return window.Marking.check(a, id, got).then(function (res) {
        wells.forEach(function (w) {
          w.parentElement.classList.toggle('ok', res.correct);
          w.parentElement.classList.toggle('no', !res.correct);
          var t = w.querySelector('.tok'); if (t && oneShot()) t.dataset.locked = '1';
        });
        return res;
      });
    }, function () {
      wells.forEach(function (w) {
        w.parentElement.classList.remove('ok', 'no');
        var t = w.querySelector('.tok'); if (t) pool.appendChild(t);
      });
      tidy();
    }, function (res) {
      var v = window.Marking.answer(id);
      if (!v || res.correct) return null;
      return 'Correct pairings: ' + v.slots.map(function (tok, j) {
        return '<b>' + esc(a.slots[j].label) + '</b> → ' + esc(tok);
      }).join(' &nbsp;·&nbsp; ');
    });
    return card;
  }

  /* ============================= pH ============================= */
  function ph(a, idx, id) {
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
    var stateChip = h('span', 'ph__state off', 'Move the slider, then check');
    read.appendChild(val); read.appendChild(stateChip);
    var wrap = h('div');
    wrap.innerHTML =
      '<svg class="ph__enz" viewBox="0 0 300 88" role="img" aria-label="Enzyme active site">' +
      '<path class="enzBody" d="M20,66 L20,34 C20,26 26,20 34,20 L82,20 C90,20 96,26 96,34 L96,40 ' +
      'L112,40 L112,26 L140,26 L140,40 L156,40 L156,34 C156,26 162,20 170,20 L218,20 C226,20 232,26 232,34 L232,66 Z" ' +
      'fill="#DDEDE2" stroke="#14572B" stroke-width="2" stroke-linejoin="round"/>' +
      '<rect class="sub" x="112" y="4" width="28" height="22" rx="4" fill="#A16207"/>' +
      '<text class="phMsg" x="252" y="46" font-size="12" fill="#6B6B6B" font-family="Calibri,sans-serif"></text></svg>';
    box.appendChild(scale); box.appendChild(marks); box.appendChild(slider); box.appendChild(read); box.appendChild(wrap);
    card.appendChild(box);

    var body = wrap.querySelector('.enzBody'), sub = wrap.querySelector('.sub'), msg = wrap.querySelector('.phMsg');
    var FIT = 'M20,66 L20,34 C20,26 26,20 34,20 L82,20 C90,20 96,26 96,34 L96,40 L112,40 L112,26 L140,26 L140,40 L156,40 L156,34 C156,26 162,20 170,20 L218,20 C226,20 232,26 232,34 L232,66 Z';

    /* Live feedback would give the answer away by sliding, so outside practice
       mode the enzyme only reacts once the student has committed to a value. */
    function show(fits, near, d) {
      stateChip.className = 'ph__state ' + (fits ? 'on' : 'off');
      stateChip.textContent = fits ? (a.enzyme || 'Enzyme') + ' is working'
        : near ? (a.enzyme || 'Enzyme') + ' is slow' : (a.enzyme || 'Enzyme') + ' is denatured';
      var w = Math.min(1, d / 5);
      body.setAttribute('d', fits ? FIT :
        'M20,66 L20,' + (34 + w * 6) + ' C20,26 26,20 34,20 L82,20 C90,20 ' + (96 - w * 14) + ',26 ' + (96 - w * 12) +
        ',34 L' + (96 - w * 10) + ',' + (40 + w * 10) + ' L' + (112 + w * 16) + ',' + (40 + w * 14) + ' L' + (112 + w * 20) +
        ',26 L' + (140 + w * 8) + ',' + (26 - w * 8) + ' L' + (140 + w * 4) + ',' + (40 - w * 12) + ' L' + (156 + w * 12) +
        ',40 L156,' + (34 - w * 5) + ' C156,26 162,20 170,20 L218,20 C226,20 232,26 232,34 L232,66 Z');
      body.setAttribute('fill', fits ? '#DDEDE2' : near ? '#F6EEDC' : '#F7E2DD');
      body.setAttribute('stroke', fits ? '#14572B' : near ? '#A16207' : '#B03A2E');
      sub.setAttribute('y', fits ? 8 : 4);
      msg.textContent = fits ? 'substrate fits' : near ? 'a poor fit' : 'active site changed shape';
      msg.setAttribute('fill', fits ? '#1E7A3E' : near ? '#A16207' : '#B03A2E');
    }
    slider.addEventListener('input', function () {
      val.textContent = parseFloat(slider.value).toFixed(1);
      if (!reveals()) return;
      var v = window.Marking.answer(id);
      if (!v) return;
      var d = Math.abs(parseFloat(slider.value) - v.optimum);
      show(d <= v.tolerance, d <= v.tolerance + 1.5, d);
    });

    foot(card, function () {
      return window.Marking.check(a, id, parseFloat(slider.value)).then(function (res) {
        if (oneShot()) slider.disabled = true;
        var v = window.Marking.answer(id);
        if (v) {
          var d = Math.abs(parseFloat(slider.value) - v.optimum);
          show(d <= v.tolerance, d <= v.tolerance + 1.5, d);
        } else {
          stateChip.className = 'ph__state ' + (res.correct ? 'on' : 'off');
          stateChip.textContent = res.correct ? (a.enzyme || 'Enzyme') + ' is working'
                                              : (a.enzyme || 'Enzyme') + ' is not at its best here';
          if (res.correct) { body.setAttribute('d', FIT); body.setAttribute('fill', '#DDEDE2');
                             body.setAttribute('stroke', '#14572B'); sub.setAttribute('y', 8);
                             msg.textContent = 'substrate fits'; msg.setAttribute('fill', '#1E7A3E'); }
        }
        return res;
      });
    }, function () {
      slider.value = '7'; val.textContent = '7.0';
      stateChip.className = 'ph__state off'; stateChip.textContent = 'Move the slider, then check';
      body.setAttribute('d', FIT); body.setAttribute('fill', '#DDEDE2'); body.setAttribute('stroke', '#14572B');
      msg.textContent = '';
    }, function (res) {
      var v = window.Marking.answer(id);
      if (!v) return null;
      return (res.correct ? '' : 'The optimum pH for ' + (a.enzyme || 'this enzyme') + ' is about <b>' + v.optimum + '</b>. ') + (v.explain || '');
    });
    return card;
  }

  var MAKERS = { blank:blank, drag:drag, mcq:mcq, order:order, match:match, sort:sort, ph:ph };

  global.Engine = {
    render: function (a, idx, id) {
      var maker = MAKERS[a.type];
      if (!maker) { var e = h('div', 'act'); e.textContent = 'Unknown activity type: ' + a.type; return e; }
      return maker(a, idx, id);
    },
    setMode: function (m) { MODE = m; },
    getMode: mode,
    KIND_NAME: KIND_NAME
  };
})(window);
