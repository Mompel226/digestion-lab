/* ============================================================
   bench.js — the visking tubing practical as a bench you work at.

   Not an animation that plays: nothing happens unless the student does it. Pick up the
   pipette, draw a sample from inside or outside any tube, test it with iodine or with
   Benedict's, run the clock forward and test again. The colours are what those tests
   would actually give, and Benedict's is graded, because a reducing sugar test is not a
   yes or a no.
   ============================================================ */
(function (global) {
  'use strict';

  var f1 = function (v) { return (+v).toFixed(1); };
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* ---------- what is true, and why (see the comment block in the commit) ---------- */
  var TUBES = [
    { id:'A', name:'negative control', has:'starch, no amylase',  starch:true,  amylase:false, malt:false },
    { id:'B', name:'the experiment',   has:'starch and amylase',  starch:true,  amylase:true,  malt:false },
    { id:'C', name:'positive control', has:'maltose only',        starch:false, amylase:false, malt:true  }
  ];
  var TRUTH = {
    A: { inside:{ before:{ starch:true,  malt:0 }, after:{ starch:true,  malt:0 } },
         outside:{ before:{ starch:false, malt:0 }, after:{ starch:false, malt:0 } } },
    B: { inside:{ before:{ starch:true,  malt:0 }, after:{ starch:true,  malt:4 } },
         outside:{ before:{ starch:false, malt:0 }, after:{ starch:false, malt:3 } } },
    C: { inside:{ before:{ starch:false, malt:4 }, after:{ starch:false, malt:2 } },
         outside:{ before:{ starch:false, malt:0 }, after:{ starch:false, malt:3 } } }
  };

  /* Benedict's is semi-quantitative: the colour says how much, not merely whether. */
  var BEN = [
    { col:'#3E6FA8', word:'stays blue',   sub:'no reducing sugar' },
    { col:'#4E9A6A', word:'green',        sub:'a trace of reducing sugar' },
    { col:'#C9B23A', word:'yellow',       sub:'a little reducing sugar' },
    { col:'#D98F2E', word:'orange',       sub:'a lot of reducing sugar' },
    { col:'#B6412A', word:'brick-red',    sub:'a great deal of reducing sugar' }
  ];
  var IOD = { yes:{ col:'#21203A', word:'blue-black', sub:'starch is present' },
              no: { col:'#C77B34', word:'orange-brown', sub:'no starch' } };

  var S = { ran:false, sample:null, result:null, log:{} };
  global.BenchState = S;

  /* ---------- geometry ---------- */
  var F = { x:30, y:116, w:280, h:448 };
  var RACK = { y:196, h:132, w:44 };
  var CX = [78, 170, 262];

  function tubeArt(i) {
    var t = TUBES[i], x = CX[i] - RACK.w / 2, y = RACK.y, w = RACK.w, h = RACK.h, g = '';
    var bagW = 20, bx = CX[i] - bagW / 2, by = y - 16, bh = h - 26;
    g += '<path fill="#CFE4EE" opacity=".5" d="M' + f1(x + 2) + ',' + f1(y + 16) +
         ' H' + f1(x + w - 2) + ' V' + f1(y + h - 11) + ' a' + f1(w / 2 - 2) + ',11 0 0 1 ' + f1(-(w - 4)) + ',0 Z"/>';
    g += '<path fill="none" stroke="#9FB3BD" stroke-width="1.6" stroke-linejoin="round" d="M' + f1(x) + ',' + f1(y) +
         ' V' + f1(y + h - 11) + ' a' + f1(w / 2) + ',11 0 0 0 ' + f1(w) + ',0 V' + f1(y) + '"/>';
    g += '<ellipse cx="' + f1(CX[i]) + '" cy="' + f1(y) + '" rx="' + f1(w / 2) + '" ry="3.4" fill="none" stroke="#9FB3BD" stroke-width="1.6"/>';
    /* the tubing, knotted above the rim */
    g += '<rect x="' + f1(bx) + '" y="' + f1(by + 6) + '" width="' + f1(bagW) + '" height="' + f1(bh - 12) +
         '" rx="' + f1(bagW / 2) + '" fill="#F3E6C8" opacity=".95" stroke="#C9AE72" stroke-width="1.4"/>';
    g += '<path d="M' + f1(bx) + ',' + f1(by + 6) + ' v' + f1(bh - 12) + ' M' + f1(bx + bagW) + ',' + f1(by + 6) + ' v' + f1(bh - 12) +
         '" stroke="#FFFDF9" stroke-width="1.8" stroke-dasharray="1.3 5" stroke-linecap="round"/>';
    [by + 6, by + bh - 6].forEach(function (ky) {
      g += '<ellipse cx="' + f1(CX[i]) + '" cy="' + f1(ky) + '" rx="7" ry="3.2" fill="#E4D2A4" stroke="#B99C5E" stroke-width="1.2"/>'; });
    /* contents */
    var inside = TRUTH[t.id].inside[S.ran ? 'after' : 'before'];
    if (inside.starch) [0.3, 0.62].forEach(function (k) { g += coil(CX[i], by + 18 + k * (bh - 40), 0.5); });
    var n = Math.min(3, inside.malt);
    for (var m = 0; m < n; m++) g += pair(CX[i] - 5 + (m % 2) * 10, by + 30 + m * 22);
    /* what has crossed into the water */
    var out = TRUTH[t.id].outside[S.ran ? 'after' : 'before'];
    for (var o = 0; o < Math.min(3, out.malt); o++)
      g += pair(CX[i] + (o % 2 ? 14 : -14), y + 34 + o * 26);
    return g;
  }
  function coil(cx, cy, s) {
    var d = 'M' + f1(cx - 6 * s) + ',' + f1(cy);
    for (var i = 0; i < 3; i++) d += ' Q' + f1(cx - 6 * s + 4 * s * i + 2 * s) + ',' + f1(cy + (i % 2 ? 3 : -3) * s) +
      ' ' + f1(cx - 6 * s + 4 * s * (i + 1)) + ',' + f1(cy);
    return '<path d="' + d + '" fill="none" stroke="#5B7FA6" stroke-width="' + f1(2.2 * s) + '" stroke-linecap="round"/>';
  }
  function pair(cx, cy) {
    return '<circle cx="' + f1(cx - 2.6) + '" cy="' + f1(cy) + '" r="2.4" fill="#D98F2E"/>' +
           '<circle cx="' + f1(cx + 2.6) + '" cy="' + f1(cy) + '" r="2.4" fill="#D98F2E"/>';
  }
  /* ---------- the bench ---------- */
  function btn(id, x, y, w, h, label, on, sub) {
    return '<g class="bn' + (on ? ' is-on' : '') + '" data-bench="' + esc(id) + '" role="button" tabindex="0">' +
           '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + f1(h / 2) + '"/>' +
           '<text x="' + f1(x + w / 2) + '" y="' + f1(y + h / 2 + (sub ? -1 : 3.4)) + '" text-anchor="middle">' + esc(label) + '</text>' +
           (sub ? '<text class="bn__sub" x="' + f1(x + w / 2) + '" y="' + f1(y + h / 2 + 9) + '" text-anchor="middle">' + esc(sub) + '</text>' : '') +
           '</g>';
  }

  function draw(ctx) {
    var g = '', fs = 11;
    /* what to do, in one line that changes with what has been done */
    var say = !S.sample ? 'Take the pipette to a tube — inside the tubing, or the water outside it.'
            : !S.result ? 'Now test that sample: iodine for starch, Benedict\u2019s for reducing sugar.'
            : 'Test another place, or run the clock and see what has changed.';
    g += '<text class="bn__say" x="' + f1(F.x + F.w / 2) + '" y="142" text-anchor="middle">' + esc(say) + '</text>';

    /* the three tubes, each with two places you can sample */
    TUBES.forEach(function (t, i) {
      g += tubeArt(i);
      var picked = S.sample && S.sample.tube === t.id;
      ['outside', 'inside'].forEach(function (side) {
        var sel = picked && S.sample.side === side;
        var x = CX[i] + (side === 'inside' ? -13 : 13), y = RACK.y + (side === 'inside' ? 40 : 96);
        g += '<circle class="bn__spot' + (sel ? ' is-sel' : '') + '" data-bench="take:' + t.id + ':' + side +
             '" role="button" tabindex="0" cx="' + f1(x) + '" cy="' + f1(y) + '" r="7"/>';
      });
      g += '<text class="bn__id" x="' + f1(CX[i]) + '" y="' + f1(RACK.y + RACK.h + 18) + '" text-anchor="middle">' + t.id + '</text>';
      g += '<text class="bn__nm" x="' + f1(CX[i]) + '" y="' + f1(RACK.y + RACK.h + 31) + '" text-anchor="middle">' + esc(t.name) + '</text>';
      g += '<text class="bn__nm" x="' + f1(CX[i]) + '" y="' + f1(RACK.y + RACK.h + 42) + '" text-anchor="middle">' + esc(t.has) + '</text>';
    });
    /* the bench top */
    g += '<path d="M' + f1(F.x + 6) + ',' + f1(RACK.y + RACK.h + 2) + ' H' + f1(F.x + F.w - 6) +
         '" stroke="#C3B69C" stroke-width="2" stroke-linecap="round"/>';

    /* the controls, one row to a job, each button sized to the words it holds */
    var clock = S.ran ? 'at 30 minutes' : 'at the start';
    g += '<text class="bn__samp" x="' + f1(F.x + 10) + '" y="382">The clock: ' + clock +
         (S.sample ? '  \u00b7  in the pipette: ' +
            esc(S.sample.side === 'inside' ? 'inside tube ' + S.sample.tube : 'water outside tube ' + S.sample.tube) : '') +
         '</text>';
    g += btn('run', F.x + 10, 390, 104, 24, S.ran ? 'clock has run' : 'Run 30 minutes', S.ran);
    if (S.sample) {
      g += btn('test:iodine', F.x + 122, 390, 64, 24, 'iodine', S.result && S.result.kind === 'iodine');
      g += btn('test:benedict', F.x + 194, 390, 76, 24, 'Benedict\u2019s', S.result && S.result.kind === 'benedict');
    }
    g += btn('reset', F.x + 10, 422, 62, 20, 'Start again', false);

    /* the result: the colour that test would actually give, and what it means */
    if (S.result) {
      var r = S.result;
      g += '<rect x="' + f1(F.x + 82) + '" y="421" width="24" height="22" rx="4" fill="' + r.col + '" stroke="#9FB3BD" stroke-width="1"/>';
      g += '<text class="bn__res" x="' + f1(F.x + 112) + '" y="432">' + esc(r.word) + '</text>';
      g += '<text class="bn__sub2" x="' + f1(F.x + 112) + '" y="443">' + esc(r.sub) + '</text>';
    }
    /* the key */
    g += coil(F.x + 14, 466, 0.62) + '<text class="bn__key" x="' + f1(F.x + 26) + '" y="469">starch</text>';
    g += pair(F.x + 74, 466) + '<text class="bn__key" x="' + f1(F.x + 84) + '" y="469">maltose</text>';
    g += '<circle class="bn__spot" cx="' + f1(F.x + 140) + '" cy="466" r="5"/>' +
         '<text class="bn__key" x="' + f1(F.x + 150) + '" y="469">a place you can sample</text>';
    return g;
  }

  /* every click goes through here, so what the bench shows is always what the science says */
  function hit(id) {
    if (id === 'run')   { S.ran = true;  S.result = null; return true; }
    if (id === 'reset') { S.ran = false; S.sample = null; S.result = null; S.log = {}; return true; }
    var m = /^take:([ABC]):(inside|outside)$/.exec(id);
    if (m) { S.sample = { tube:m[1], side:m[2] }; S.result = null; return true; }
    m = /^test:(iodine|benedict)$/.exec(id);
    if (m && S.sample) {
      var truth = TRUTH[S.sample.tube][S.sample.side][S.ran ? 'after' : 'before'];
      S.result = m[1] === 'iodine'
        ? { kind:'iodine', col:(truth.starch ? IOD.yes : IOD.no).col,
            word:(truth.starch ? IOD.yes : IOD.no).word, sub:(truth.starch ? IOD.yes : IOD.no).sub }
        : { kind:'benedict', col:BEN[truth.malt].col, word:BEN[truth.malt].word, sub:BEN[truth.malt].sub };
      S.log[S.sample.tube + ':' + S.sample.side + ':' + (S.ran ? 'after' : 'before') + ':' + m[1]] = S.result.word;
      return true;
    }
    return false;
  }

  global.Bench = { TUBES:TUBES, TRUTH:TRUTH, BEN:BEN, IOD:IOD, S:S, F:F, RACK:RACK, CX:CX,
                   tubeArt:tubeArt, coil:coil, pair:pair, f1:f1, esc:esc, draw:draw, hit:hit };
})(window);
