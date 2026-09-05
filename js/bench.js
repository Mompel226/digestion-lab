/* ============================================================
   bench.js — the visking tubing practical as a bench you work at.

   Not an animation that plays: nothing happens unless the student does it. Tap a spot to
   draw a sample from inside or outside any tube, test it with iodine or with Benedict's,
   run the clock forward and test again. The colours are what those tests would actually
   give, and Benedict's is graded, because a reducing sugar test is not a yes or a no.
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
  /* sn = how many starch molecules are drawn; starch = what iodine would report.
     In B some starch is still there at 30 minutes, which is why iodine inside B is still
     blue-black: an enzyme does not finish the job in half an hour. */
  var TRUTH = {
    A: { inside:{ before:{ starch:true,  sn:3, malt:0 }, after:{ starch:true,  sn:3, malt:0 } },
         outside:{ before:{ starch:false, sn:0, malt:0 }, after:{ starch:false, sn:0, malt:0 } } },
    B: { inside:{ before:{ starch:true,  sn:3, malt:0 }, after:{ starch:true,  sn:2, malt:4 } },
         outside:{ before:{ starch:false, sn:0, malt:0 }, after:{ starch:false, sn:0, malt:4 } } },
    C: { inside:{ before:{ starch:false, sn:0, malt:4 }, after:{ starch:false, sn:0, malt:3 } },
         outside:{ before:{ starch:false, sn:0, malt:0 }, after:{ starch:false, sn:0, malt:2 } } }
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

  var AMY = 2;                             /* a tube holds enzyme molecules, not an enzyme */
  var SH = 21, AH = 14, MH = 8, TOPGAP = 26;   /* stack heights, and the clear band for the spot */

  var S = { ran:false, sample:null, result:null, log:{} };
  global.BenchState = S;

  /* ---------- geometry ----------
     The bench is laid out against the frame the camera actually gives us, not against fixed
     numbers: a phone and a laptop hand us different shapes, and the bench should fill either.
     R holds the baselines of the rows under the rack, worked upwards from the caption strip. */
  var F = { x:30, y:116, w:280, h:448 };
  var RACK = { y:182, h:170, w:56 };
  var CX = [74, 158, 242];
  var R = {};

  /* The viewBox is not what you can see. The plate is drawn with xMidYMid meet, so on a pane
     that is not the viewBox's shape the browser letterboxes and shows MORE than the viewBox on
     one axis: 412 units of width where the viewBox claims 280. Work it out from the pane's
     pixel shape and the frame we are heading for — NEVER from the live CTM, which during a
     camera flight still holds the viewBox we are flying away from. */
  function visibleBox(frame) {
    var svg = document.getElementById('bodySvg');
    if (!svg) return null;
    var r = svg.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return null;
    seenW = r.width; seenH = r.height; watchPane(svg);
    var paneA = r.height / r.width, vw, vh;
    if (paneA < frame.h / frame.w) { vh = frame.h; vw = frame.h / paneA; }   /* fitted by height */
    else { vw = frame.w; vh = frame.w * paneA; }                             /* fitted by width  */
    var cap = frame.w * 2.1;
    if (vw > cap) vw = cap;                    /* or the bench sprawls on a very wide pane */
    var box = { x:frame.x + frame.w / 2 - vw / 2, y:frame.y + frame.h / 2 - vh / 2, w:vw, h:vh };
    /* Reserve the caption strip. Ask it how TALL it is, never where its top is: the strip
       slides in after the bench is drawn, so its top at draw time is a number that will not
       be true a moment later — that is how Start again ended up underneath it. */
    var el = document.querySelector('.detailstrip'), scale = r.height / vh;
    /* The Whole body button floats over the plate's top-right corner. Ask it where it is,
       rather than guessing at a fraction of the frame — the frame's width changes with the
       pane, the button's position does not. */
    var wb = document.getElementById('tBody');
    if (wb && scale > 0) {
      var wr = wb.getBoundingClientRect();
      if (wr.width > 2 && wr.bottom > r.top && wr.top < r.top + r.height * 0.4)
        box.right = box.x + (wr.left - r.left) / scale - 6;
    }
    box.bottom = box.y + box.h * 0.82;
    if (el && scale > 0) {
      var ch = el.getBoundingClientRect().height;
      if (ch > 8) box.bottom = Math.min(box.y + box.h - ch / scale - 8, box.y + box.h * 0.90);
    }
    return box;
  }

  /* The bench is drawn once, from measurements taken while the page is still settling: the
     first draw here was laid out for a 408px pane that turned out to be 499px, leaving the
     bench two thirds of the room it had. Watch the plate and ask for one redraw when its size
     actually changes — Zoom.refresh() re-applies the step, and the bench keeps its own state,
     so redrawing costs the reader nothing. */
  var seenW = 0, seenH = 0, watching = false;
  function watchPane(svg) {
    if (watching || typeof ResizeObserver === 'undefined' || !svg) return;
    watching = true;
    new ResizeObserver(function () {
      var r = svg.getBoundingClientRect();
      /* Height, not just width: opening the detail panel leaves the plate the same width and
         takes its height away. Watching width alone meant the bench kept a layout worked out
         for a tall pane and used 280 units of the 580 a phone actually gives it. */
      if (!r.width || !r.height) return;
      if (Math.abs(r.width - seenW) < 2 && Math.abs(r.height - seenH) < 2) return;
      seenW = r.width; seenH = r.height;
      if (global.Zoom && global.Zoom.refresh) global.Zoom.refresh();
    }).observe(svg);
  }

  function layout(frame) {
    function setF(b) { F.x = b.x; F.y = b.y; F.w = b.w; F.h = b.h; }   /* in place: Bench.F is exported */
    if (frame && frame.w) setF(frame);
    var vis = frame && frame.w ? visibleBox(frame) : null, bottom = null;
    var topRight = null;
    if (vis) { bottom = typeof vis.bottom === 'number' ? vis.bottom : null;
               topRight = typeof vis.right === 'number' ? vis.right : null; setF(vis); }
    R.topRight = topRight !== null ? topRight : F.x + F.w * 0.75;
    var strip = bottom !== null ? bottom : F.y + F.h * 0.82;   /* nothing may go below it */
    /* A phone gives the plate a landscape strip, so there is no vertical room to spend on
       margins: the writing closes up and everything saved goes into the height of the tubes. */
    var short = F.h < F.w;
    /* A phone renders the plate at about half the pixels per unit that a laptop does, so text
       set in user units comes out half the size. Scale the type there — but not the pills,
       which are 26 units tall and have the room already, so the tubes keep their height. */
    R.fs = short ? 1.3 : 1;
    R.say = F.y + F.h * (short ? 0.024 : 0.030);
    R.key = F.y + F.h * (short ? 0.062 : 0.076);
    var band = short ? 72 : 79;
    R.clock = strip - band; R.btn = strip - (band - 8); R.reset = strip - (band - 38);
    R.swatch = strip - (band - 37); R.res = strip - (band - 48); R.sub = strip - (band - 58);
    /* height first: the tubes take what vertical room is left, then the width follows from it,
       so a boiling tube always looks like a boiling tube and never like a beaker */
    RACK.y = F.y + F.h * (short ? 0.138 : 0.150);
    RACK.h = Math.max(120, R.clock - (short ? 63 : 66) - RACK.y);   /* the captions sit in here, with air below them */
    RACK.w = Math.min(F.w * 0.25, RACK.h * (F.h < F.w ? 0.55 : 0.44));
    /* the second figure keeps it a boiling tube; on a short, wide pane — a phone in portrait,
       where the plate gets a landscape strip — a slightly squatter tube is the only way the
       drawing is big enough to read at all */
    var sp = Math.min(F.w * 0.30, RACK.w * 1.5), tot = sp * 2 + RACK.w;
    R.left = F.x + Math.max(6, (F.w - tot) / 2);
    for (var c = 0; c < 3; c++) CX[c] = R.left + RACK.w / 2 + c * sp;
    R.right = R.left + tot;
    R.mid = R.left + tot / 2;   /* the writing belongs over the bench, centred on the rack */
    /* Molecules scale with the tube, but never past the point where the fullest tube it will
       ever have to draw stops fitting inside the tubing. Ask the truth table which tube that
       is rather than hard-coding a number that a later edit would quietly invalidate. */
    var worst = 0;
    TUBES.forEach(function (t) {
      ['before', 'after'].forEach(function (w) {
        var ins = TRUTH[t.id].inside[w];
        var need = (ins.sn || 0) * SH + (t.amylase ? AMY * AH : 0) + Math.min(4, ins.malt) * MH;
        if (need > worst) worst = need;
      });
    });
    R.mol = Math.min(RACK.w / 56, (RACK.h - 50) / (worst + TOPGAP));
    R.id = RACK.y + RACK.h + 15; R.nm = RACK.y + RACK.h + (short ? 28 : 26); R.has = RACK.y + RACK.h + (short ? 41 : 36);
  }

  /* ---------- what the molecules actually are ----------
     One glucose is one circle, and it is the SAME circle everywhere. Maltose is two of them
     joined; starch is a long branched chain of many. That is the whole experiment: the pores
     let maltose through and cannot let starch through, and a student can see why by counting.
     Amylase is not a carbohydrate at all, so it is drawn as a protein with an active site —
     and it stays inside the tubing, because a protein is far too large to cross as well. */
  var GLU = '#D98F2E', GLUE = '#A9651C', ENZ = '#7A5AA8';

  function glucose(cx, cy, r) {
    return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(r) +
           '" fill="' + GLU + '" stroke="' + GLUE + '" stroke-width=".7"/>';
  }
  /* maltose: two glucose, joined — small enough to pass through a pore */
  function pair(cx, cy, s) {
    s = s || 1;
    return '<line x1="' + f1(cx - 2.4 * s) + '" y1="' + f1(cy) + '" x2="' + f1(cx + 2.4 * s) + '" y2="' + f1(cy) +
           '" stroke="' + GLUE + '" stroke-width="' + f1(1.3 * s) + '"/>' +
           glucose(cx - 2.4 * s, cy, 2.4 * s) + glucose(cx + 2.4 * s, cy, 2.4 * s);
  }
  /* starch: a chain of seven of those same glucose, folded so it fits down a tube. Small
     enough that a tube holds several of them — a tube of starch is not one molecule. */
  function starch(cx, cy, s) {
    s = s || 1;
    var dx = 7 * s, dy = 6 * s, r = 2.4 * s, pts = [], g = '';
    [0, 1, 2].forEach(function (row) {
      [0, 1].forEach(function (col) {
        var c = row % 2 ? 1 - col : col;                       /* serpentine, so the chain is unbroken */
        pts.push([cx + (c - 0.5) * dx, cy + (row - 1) * dy]);
      });
    });
    g += '<polyline points="' + pts.map(function (q) { return f1(q[0]) + ',' + f1(q[1]); }).join(' ') +
         '" fill="none" stroke="' + GLUE + '" stroke-width="' + f1(1.3 * s) + '" stroke-linejoin="round" stroke-linecap="round"/>';
    var bx = cx + dx * 0.5, by = cy - dy;
    g += '<line x1="' + f1(bx) + '" y1="' + f1(by) + '" x2="' + f1(bx - dx * 0.8) + '" y2="' + f1(by - dy * 0.9) +
         '" stroke="' + GLUE + '" stroke-width="' + f1(1.3 * s) + '" stroke-linecap="round"/>';   /* a branch */
    pts.push([bx - dx * 0.8, by - dy * 0.9]);
    pts.forEach(function (q) { g += glucose(q[0], q[1], r); });
    return g;
  }
  /* amylase: a protein with a cleft — the active site the starch fits into */
  function amylase(cx, cy, s) {
    s = s || 1;
    return '<path d="M' + f1(cx - 6.5 * s) + ',' + f1(cy - 4 * s) +
           ' a' + f1(6.5 * s) + ',' + f1(6 * s) + ' 0 1 0 ' + f1(13 * s) + ',0' +
           ' l' + f1(-3.6 * s) + ',0 l' + f1(-2.9 * s) + ',' + f1(3.6 * s) + ' l' + f1(-2.9 * s) + ',' + f1(-3.6 * s) + ' Z"' +
           ' fill="' + ENZ + '" fill-opacity=".85" stroke="#5A3F84" stroke-width="1" stroke-linejoin="round"/>';
  }

  function starchFlat(cx, cy, s) {
    var d = 6.4 * s, g = '<line x1="' + f1(cx - 2 * d) + '" y1="' + f1(cy) + '" x2="' + f1(cx + 2 * d) + '" y2="' + f1(cy) +
            '" stroke="' + GLUE + '" stroke-width="' + f1(1.3 * s) + '"/>';
    for (var i = -2; i <= 2; i++) g += glucose(cx + i * d, cy, 2.4 * s);
    return g;
  }

  function tubeArt(i) {
    var t = TUBES[i], x = CX[i] - RACK.w / 2, y = RACK.y, w = RACK.w, h = RACK.h, g = '';
    var bagW = w * 0.52, bx = CX[i] - bagW / 2, by = y - 20, bh = h - 30;
    g += '<path fill="#CFE4EE" opacity=".5" d="M' + f1(x + 2) + ',' + f1(y + 16) +
         ' H' + f1(x + w - 2) + ' V' + f1(y + h - 11) + ' a' + f1(w / 2 - 2) + ',11 0 0 1 ' + f1(-(w - 4)) + ',0 Z"/>';
    g += '<path fill="none" stroke="#9FB3BD" stroke-width="1.6" stroke-linejoin="round" d="M' + f1(x) + ',' + f1(y) +
         ' V' + f1(y + h - 11) + ' a' + f1(w / 2) + ',11 0 0 0 ' + f1(w) + ',0 V' + f1(y) + '"/>';
    g += '<ellipse cx="' + f1(CX[i]) + '" cy="' + f1(y) + '" rx="' + f1(w / 2) + '" ry="3.4" fill="none" stroke="#9FB3BD" stroke-width="1.6"/>';
    /* the tubing, knotted above the rim and again at the bottom */
    g += '<rect x="' + f1(bx) + '" y="' + f1(by + 6) + '" width="' + f1(bagW) + '" height="' + f1(bh - 12) +
         '" rx="' + f1(bagW / 2) + '" fill="#F3E6C8" opacity=".95" stroke="#C9AE72" stroke-width="1.4"/>';
    g += '<path d="M' + f1(bx) + ',' + f1(by + 6) + ' v' + f1(bh - 12) + ' M' + f1(bx + bagW) + ',' + f1(by + 6) + ' v' + f1(bh - 12) +
         '" stroke="#FFFDF9" stroke-width="1.8" stroke-dasharray="1.3 5" stroke-linecap="round"/>';
    [by + 6, by + bh - 6].forEach(function (ky) {
      g += '<ellipse cx="' + f1(CX[i]) + '" cy="' + f1(ky) + '" rx="' + f1(bagW / 4 + 0.5) + '" ry="3.2" fill="#E4D2A4" stroke="#B99C5E" stroke-width="1.2"/>'; });

    /* Contents, stacked so nothing can ever land on top of anything else, and sized as a
       fraction of the tube so the picture means the same on a phone and on a laptop. */
    var mol = R.mol || 1;
    var inside = TRUTH[t.id].inside[S.ran ? 'after' : 'before'];
    var items = [];
    for (var q = 0; q < (inside.sn || 0); q++) items.push({ t:'s', h:SH * mol });
    if (t.amylase) for (var e = 0; e < AMY; e++) items.push({ t:'e', h:AH * mol });
    for (var m = 0; m < Math.min(4, inside.malt); m++) items.push({ t:'m', h:MH * mol });
    var top = by + 6 + TOPGAP * mol, bot = by + bh - 14, span = bot - top;
    var tot = items.reduce(function (a2, it) { return a2 + it.h; }, 0);
    var cy = top + Math.max(0, (span - tot) / 2), k = 0;
    items.forEach(function (it) {
      var mid = cy + it.h / 2;
      var off = (k % 2 ? 1 : -1) * bagW * 0.11; k++;
      if (it.t === 's') g += starch(CX[i] + off, mid, mol);
      else if (it.t === 'e') g += amylase(CX[i] + off, mid, 1.05 * mol);
      else g += pair(CX[i] + off * 1.4, mid, mol);
      cy += it.h;
    });
    /* what has crossed into the water: maltose only — starch and amylase are far too large */
    var out = TRUTH[t.id].outside[S.ran ? 'after' : 'before'];
    for (var o = 0; o < Math.min(4, out.malt); o++)
      g += pair(CX[i] + (o % 2 ? 1 : -1) * (bagW / 2 + 5 * mol), y + h * (0.20 + o * 0.19), mol);
    return g;
  }
  /* The sample, in a test tube. Nothing is dragged and nothing is carried: tap a spot and the
     tube appears holding what you drew, colourless until it is tested. Benedict's is only a
     Benedict's test if it has been mixed and heated, so when it is used the tube says so — in
     words, because a small orange flame under a tube reads as a drip. */
  function sampleTube(x, yTop, w, h, fill, note) {
    var r = w / 2, bot = yTop + h, lip = yTop + h * 0.26, g = '';
    var d = 'M' + f1(x) + ',' + f1(yTop) + ' V' + f1(bot - r) +
            ' a' + f1(r) + ',' + f1(r) + ' 0 0 0 ' + f1(w) + ',0 V' + f1(yTop);
    g += '<path d="' + d + '" fill="#FFFDF9" stroke="#8FA3AD" stroke-width="1.4" stroke-linejoin="round"/>';
    if (fill) {
      g += '<path d="M' + f1(x + 0.8) + ',' + f1(lip) + ' V' + f1(bot - r) +
           ' a' + f1(r - 0.8) + ',' + f1(r - 0.8) + ' 0 0 0 ' + f1(w - 1.6) + ',0 V' + f1(lip) + ' Z" fill="' + fill + '"/>';
      g += '<line x1="' + f1(x + 0.8) + '" y1="' + f1(lip) + '" x2="' + f1(x + w - 0.8) + '" y2="' + f1(lip) +
           '" stroke="#6E828C" stroke-width=".8"/>';
    }
    g += '<ellipse cx="' + f1(x + r) + '" cy="' + f1(yTop) + '" rx="' + f1(r) + '" ry="2.2" fill="none" stroke="#8FA3AD" stroke-width="1.4"/>';
    if (note) {
      g += '<text class="bn__note"' + sz(8.6) + ' x="' + f1(x + r) + '" y="' + f1(bot + 12) + '" text-anchor="middle">' + esc(note) + '</text>';
    }
    return g;
  }
  /* ---------- the bench ----------
     Pick the longest wording that actually fits the column. Measure it with the same font the
     pill will use rather than estimating from the character count: two guesses in a row were
     wrong in opposite directions, and a canvas measures what the SVG will really draw. */
  var mctx = null;
  function textW(label, px) {
    try {
      if (!mctx) mctx = document.createElement('canvas').getContext('2d');
      mctx.font = '600 ' + px + 'px Calibri, Carlito, sans-serif';
      var w = mctx.measureText(label).width;
      if (w > 0) return w;
    } catch (e) {}
    return label.length * px * 0.54;              /* only if there is no canvas to ask */
  }
  function fits(label, w) { return textW(label, 11) + 10 <= w; }
  function pick(list, w) {
    for (var i = 0; i < list.length; i++) if (fits(list[i], w)) return list[i];
    return list[list.length - 1];
  }

  function btn(id, x, y, w, h, label, on, sub, off) {
    return '<g class="bn' + (on ? ' is-on' : '') + '" data-bench="' + esc(id) + '" role="button" tabindex="0"' +
           (off ? ' opacity=".38"' : '') + '>' +
           '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + f1(h / 2) + '"/>' +
           '<text' + sz(11) + ' x="' + f1(x + w / 2) + '" y="' + f1(y + h / 2 + (sub ? -1 : 3.4)) + '" text-anchor="middle">' + esc(label) + '</text>' +
           (sub ? '<text class="bn__sub" x="' + f1(x + w / 2) + '" y="' + f1(y + h / 2 + 9) + '" text-anchor="middle">' + esc(sub) + '</text>' : '') +
           '</g>';
  }

  function sz(base) { return ' style="font-size:' + f1(base * (R.fs || 1)) + 'px"'; }

  function draw(ctx) {
    layout(ctx && ctx.frame);
    var g = '';
    /* what to do, in one line that changes with what has been done */
    var say = !S.sample ? 'Tap a dotted spot to take a sample.'
            : !S.result ? 'Your sample is in the test tube. Test it.'
            : S.result.kind === 'iodine' ? 'A few drops of iodine solution added to the sample.'
            : 'Benedict\u2019s solution added to the sample and heated in a water bath.';
    /* The Whole body button floats over the top-right corner, so the line is held off it
       rather than being allowed to run underneath and lose its last few words. */
    var sw = say.length * 3.6;
    var sx = Math.max(F.x + 6 + sw / 2, Math.min(R.mid, R.topRight - sw / 2));
    g += '<text class="bn__say"' + sz(10.5) + ' x="' + f1(sx) + '" y="' + f1(R.say) + '" text-anchor="middle">' + esc(say) + '</text>';

    /* the key, read before the bench rather than after the buttons. Starch sits next to
       maltose on purpose: both are made of the same glucose, and one is far bigger. */
    var KEY = [['starch', 34, 6], ['maltose', 12, 7], ['amylase', 14, 7], ['tap to sample', 10, 13]];
    var kf = R.fs || 1;
    var kw = KEY.reduce(function (a2, k) { return a2 + (k[1] + 5 + k[2] * 3.7) * kf + 16 * kf; }, 0) - 16 * kf;
    var ky = R.key, kx = Math.max(F.x + 4, Math.min(R.mid - kw / 2, R.topRight - kw));
    function keyItem(icon, word, w) {
      var t = icon + '<text class="bn__key"' + sz(9) + ' x="' + f1(kx + w + 4) + '" y="' + f1(ky + 3) + '">' + word + '</text>';
      kx += w + 4 + word.length * 3.7 + 18;
      return t;
    }
    g += keyItem(starchFlat(kx + 17 * kf, ky, 0.85 * kf), 'starch', 34);
    g += keyItem(pair(kx + 6 * kf, ky, 0.85 * kf), 'maltose', 12);
    g += keyItem(amylase(kx + 7 * kf, ky, 0.7 * kf), 'amylase', 14);
    g += keyItem('<circle class="bn__spot" cx="' + f1(kx + 5 * kf) + '" cy="' + f1(ky) + '" r="' + f1(5 * kf) + '"/>', 'tap to sample', 10);

    /* the three tubes, each with two places you can sample */
    TUBES.forEach(function (t, i) {
      g += tubeArt(i);
      var picked = S.sample && S.sample.tube === t.id;
      ['outside', 'inside'].forEach(function (side) {
        var sel = picked && S.sample.side === side;
        var bagBot = RACK.y - 20 + (RACK.h - 30) - 6, tubeBot = RACK.y + RACK.h - 11;
        var x = CX[i], y = side === 'inside' ? RACK.y - 20 + 6 + 13 * (R.mol || 1) : (bagBot + tubeBot) / 2;
        g += '<circle class="bn__spot' + (sel ? ' is-sel' : '') + '" data-bench="take:' + t.id + ':' + side +
             '" role="button" tabindex="0" cx="' + f1(x) + '" cy="' + f1(y) + '" r="9"/>';
      });
      g += '<text class="bn__id"' + sz(12) + ' x="' + f1(CX[i]) + '" y="' + f1(R.id) + '" text-anchor="middle">' + t.id + '</text>';
      g += '<text class="bn__nm"' + sz(8.6) + ' x="' + f1(CX[i]) + '" y="' + f1(R.nm) + '" text-anchor="middle">' + esc(t.name) + '</text>';
      g += '<text class="bn__nm"' + sz(8.6) + ' x="' + f1(CX[i]) + '" y="' + f1(R.has) + '" text-anchor="middle">' + esc(t.has) + '</text>';
    });
    /* the bench top */
    g += '<path d="M' + f1(F.x + 6) + ',' + f1(RACK.y + RACK.h + 2) + ' H' + f1(F.x + F.w - 6) +
         '" stroke="#C3B69C" stroke-width="2" stroke-linecap="round"/>';
    /* The controls are a grid exactly as wide as the rack above them: three equal actions in
       a row, Start again in the first column beneath, the reading in the second, and the
       sample tube as a narrow column of its own down the right. Everything shares an edge
       with something — that is all "organised" means here. */
    /* The sample tube stands in the margin the centred rack leaves at the right, not in a
       column carved out of the grid: that gives the three actions the rack's full width, and
       gives the reading room to sit under the test that produced it. */
    var GAP = 10, TUBEW = 22;
    var tubeX = Math.max(R.right + 6, F.x + F.w - TUBEW - 6);
    var pw = ((R.right - R.left) - GAP * 2) / 3;
    var col = [R.left, R.left + pw + GAP, R.left + 2 * (pw + GAP)];

    /* Each caption sits over the thing it describes: the clock over the button that moves it,
       and the sample over the two tests that will be run on it. One line for both would have to
       be centred somewhere that is over neither, and grows off the frame once a tube is named. */
    var clock = S.ran ? 'at 30 minutes' : 'at the start';
    g += '<text class="bn__samp"' + sz(10) + ' x="' + f1(col[0] + pw / 2) + '" y="' + f1(R.clock) +
         '" text-anchor="middle">Clock: ' + clock + '</text>';
    if (S.sample) {
      g += '<text class="bn__samp"' + sz(10) + ' x="' + f1(col[1] + pw + GAP / 2) + '" y="' + f1(R.clock) +
           '" text-anchor="middle">sample: ' +
           esc(S.sample.side === 'inside' ? 'inside ' + S.sample.tube : 'water outside ' + S.sample.tube) +
           '</text>';
    }

    g += btn('run', col[0], R.btn, pw, 26, S.ran
             ? pick(['the clock has run', 'clock has run', 'clock run', 'done'], pw)
             : pick(['Run 30 minutes', 'Run 30 min', 'Run 30'], pw), S.ran);
    /* the two tests keep their places whether or not there is anything to test, so the grid
       does not rearrange itself under the reader between one tap and the next */
    /* the two tests are a pair, so they take the long wording only if both of them can */
    var longT = fits('iodine solution', pw) && fits('Benedict\u2019s solution', pw);
    g += btn('test:iodine', col[1], R.btn, pw, 26, longT ? 'iodine solution' : 'iodine',
             !!(S.result && S.result.kind === 'iodine'), null, !S.sample);
    g += btn('test:benedict', col[2], R.btn, pw, 26, longT ? 'Benedict\u2019s solution' : 'Benedict\u2019s',
             !!(S.result && S.result.kind === 'benedict'), null, !S.sample);
    g += btn('reset', col[0], R.reset, pw, 22, pick(['Start again', 'Reset'], pw), false);

    /* The sample stands in its own column, spanning both rows, and shows the colour that test
       would actually produce — with a flame under it when it has been heated. */
    if (S.sample) {
      g += sampleTube(tubeX, R.btn, TUBEW, (R.reset + 16) - R.btn,
                      S.result ? S.result.col : '#EAF2F6',
                      S.result && S.result.kind === 'benedict' ? 'heated' : '');
    }
    /* The reading sits under the test that produced it. Both of its lines share one centre —
       the pill's — pulled left only as far as the longest of them needs to clear the tube,
       so the two lines stay aligned with each other whatever the wording. */
    if (S.result) {
      var r = S.result;
      var wide = Math.max(textW(r.word, 12), textW(r.sub, 9.5));
      var want = (r.kind === 'iodine' ? col[1] : col[2]) + pw / 2;
      var cx = Math.min(want, tubeX - 8 - wide / 2);
      cx = Math.max(cx, R.left + wide / 2);
      g += '<text class="bn__res"' + sz(12) + ' x="' + f1(cx) + '" y="' + f1(R.res) + '" text-anchor="middle">' + esc(r.word) + '</text>';
      g += '<text class="bn__sub2"' + sz(9.5) + ' x="' + f1(cx) + '" y="' + f1(R.sub) + '" text-anchor="middle">' + esc(r.sub) + '</text>';
    }
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

  global.Bench = { TUBES:TUBES, starch:starch, amylase:amylase, glucose:glucose, TRUTH:TRUTH, BEN:BEN, IOD:IOD, S:S, F:F, RACK:RACK, CX:CX,
                   layout:layout, tubeArt:tubeArt, starchFlat:starchFlat, pair:pair, f1:f1, esc:esc, draw:draw, hit:hit };
})(window);
