/* ============================================================
   plateanim.js — animations drawn on the body plate itself.

   Each function returns SVG markup in PLATE coordinates for the detail
   layer of the plate (see zoom.js). ctx carries: box — the organ's box on
   the plate; img — the placed illustration {x,y,W,H} if the step has one;
   fs — a label font size in plate units that renders at ~12px; u — stroke
   scale (1 at a 200-unit-wide camera frame).

   The wall-morphing technique is the one from figures.js: a tube is sampled
   down its length, the wall bulges at the bolus, grips just behind it and
   relaxes just ahead, and SMIL interpolates the frames — the wall moves,
   not a blob on a pipe.
   ============================================================ */
(function (global) {
  'use strict';
  var A = '<animate attributeName=';
  var f1 = function (v) { return (+v).toFixed(1); };

  function gauss(x, s) { return Math.exp(-(x * x) / (2 * s * s)); }
  function tubeFrame(o, bolusY) {
    var n = 46, left = [], right = [], i, y, w, cx;
    for (i = 0; i <= n; i++) {
      y = o.y0 + (o.y1 - o.y0) * (i / n);
      cx = o.cxAt ? o.cxAt(y) : o.cx;                      /* the tube may lean: see spineOf */
      w = o.w + o.bulge * gauss(y - bolusY, o.sBulge)
              - o.squeeze * gauss(y - (bolusY - o.behind), o.sSq)
              + o.open * gauss(y - (bolusY + o.ahead), o.sOpen);
      w = Math.max(o.w * 0.28, w);
      left.push(f1(cx - w) + ',' + f1(y)); right.push(f1(cx + w) + ',' + f1(y));
    }
    right.reverse();
    return 'M' + left.join(' L') + ' L' + right.join(' L') + ' Z';
  }
  function tubeFrames(o, from, to, steps) {
    var out = [], i;
    for (i = 0; i <= steps; i++) out.push(tubeFrame(o, from + (to - from) * (i / steps)));
    return out.join(';');
  }
  function seq(from, to, steps) {
    var out = [], i;
    for (i = 0; i <= steps; i++) out.push(f1(from + (to - from) * (i / steps)));
    return out.join(';');
  }
  function ease(steps) { var s = [], i; for (i = 0; i < steps; i++) s.push('0.42 0 0.58 1'); return s.join(';'); }

  /* a label in the plate's detail style: text with a halo, a leader, a dot */
  /* The frame the station is currently zoomed to. A label written for the wide desktop
     frame can sit a hundred units outside the narrow one a phone shows, so every label
     is slid back inside before it is drawn — the leader is then measured from where the
     text actually ended up, so it still points at its dot. */
  var FRAME = null, MOVING = false, TIGHT = false;

  /* Labels the clamp must leave alone: one that travel() will translate afterwards (the
     clamp only sees where it starts, so sliding it moves the whole journey), and one whose
     place was chosen against the measured organ, where a nudge would break the leader. */
  function mlabel() { MOVING = true; try { return label.apply(null, arguments); } finally { MOVING = false; } }

  /* `a2` is a second target: one word, two leaders — the structure on the drawing and the
     same structure in the photograph beside it, so the eye reads them as one thing. */
  function label(t, tx, ty, ax, ay, fs, anchor, a2) {
    var lines = String(t).split('\n');
    var wmax = 0; lines.forEach(function (l) { wmax = Math.max(wmax, l.length); });
    var tw = wmax * fs * 0.52;
    var yTop = ty - fs * 0.85, yBot = ty + (lines.length - 1) * fs * 1.15 + fs * 0.25;
    var x0 = anchor === 'end' ? tx - tw : anchor === 'middle' ? tx - tw / 2 : tx;

    if (FRAME && !MOVING) {
      var m = FRAME.w * 0.025;
      var L = FRAME.x + m, R = FRAME.x + FRAME.w - m;
      var nx = tw > R - L ? L + (R - L - tw) / 2 : Math.max(L, Math.min(R - tw, x0));
      /* the key cards sit a little above the bottom edge; keep text clear of that band */
      var T = FRAME.y + m, B = FRAME.y + FRAME.h * 0.80, th = yBot - yTop;
      var ny = th > B - T ? T : Math.max(T, Math.min(B - th, yTop));
      /* on a phone the Whole body button floats over the frame's top right corner and
         paints above the plate, so nothing legible may be left underneath it */
      if (TIGHT) {
        var bx = FRAME.x + FRAME.w * 0.60, by = FRAME.y + FRAME.h * 0.13;
        /* only a label that actually sits in the corner: the test was true for any label
           whose right edge merely reached the button's column, which caught a wide centred
           caption starting far to the left and dropped it onto the labels below. */
        if (nx + tw / 2 > bx && ny < by && by + th <= B) ny = by;
      }
      tx += nx - x0; ty += ny - yTop;
      x0 = nx; yTop = ny; yBot = ny + th;
    }

    var out = '<text class="dl__t" x="' + f1(tx) + '" y="' + f1(ty) + '" font-size="' + f1(fs) + '" text-anchor="' + (anchor || 'start') + '">';
    lines.forEach(function (l, i) { out += '<tspan x="' + f1(tx) + '" dy="' + (i ? '1.15em' : '0') + '">' + l + '</tspan>'; });
    out += '</text>';
    if (ax != null) {
      var sx = Math.max(x0, Math.min(x0 + tw, ax)), sy = Math.max(yTop, Math.min(yBot, ay));
      if (sx === x0) sx -= fs * 0.25; else if (sx === x0 + tw) sx += fs * 0.25;
      if (sy === yTop) sy -= fs * 0.15; else if (sy === yBot) sy += fs * 0.15;
      out = '<line class="dl__l" x1="' + f1(sx) + '" y1="' + f1(sy) + '" x2="' + f1(ax) + '" y2="' + f1(ay) + '" stroke-width="' + f1(fs * 0.09) + '"/>' +
            '<circle class="dl__d" cx="' + f1(ax) + '" cy="' + f1(ay) + '" r="' + f1(fs * 0.22) + '" stroke-width="' + f1(fs * 0.08) + '"/>' + out;
      if (a2) {
        var bx = Math.max(x0, Math.min(x0 + tw, a2[0])), by = Math.max(yTop, Math.min(yBot, a2[1]));
        if (bx === x0) bx -= fs * 0.25; else if (bx === x0 + tw) bx += fs * 0.25;
        if (by === yTop) by -= fs * 0.15; else if (by === yBot) by += fs * 0.15;
        out = '<line class="dl__l" x1="' + f1(bx) + '" y1="' + f1(by) + '" x2="' + f1(a2[0]) + '" y2="' + f1(a2[1]) + '" stroke-width="' + f1(fs * 0.09) + '"/>' +
              '<circle class="dl__d" cx="' + f1(a2[0]) + '" cy="' + f1(a2[1]) + '" r="' + f1(fs * 0.22) + '" stroke-width="' + f1(fs * 0.08) + '"/>' + out;
      }
    }
    return out;
  }

  /* A label that travels with the thing it names. A leader line to a moving object is worse than
     useless — it points at where the object was — so the word goes alongside and moves with it. */
  function moving(t, xs, ys, K, dur, fs, anchor, op, opK) {
    var out = '<text class="dl__t" font-size="' + f1(fs) + '" text-anchor="' + (anchor || 'end') + '" x="' + f1(xs[0]) + '" y="' + f1(ys[0]) + '" opacity="0">' + t;
    out += A + '"x" values="' + xs.map(f1).join(';') + '" keyTimes="' + K + '" dur="' + dur + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(xs.length - 1) + '"/>';
    out += A + '"y" values="' + ys.map(f1).join(';') + '" keyTimes="' + K + '" dur="' + dur + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(ys.length - 1) + '"/>';
    out += A + '"opacity" values="' + op + '" keyTimes="' + opK + '" dur="' + dur + 's" repeatCount="indefinite"/>';
    return out + '</text>';
  }

  /* A whole label — text, leader and dot — that rides with the feature it names.
     The contraction and the relaxation travel down the tube, so a leader pinned to
     one height points at them for a single instant and lies for the rest of the cycle. */
  function travel(inner, dxs, dys, K, dur, op, opK) {
    return '<g opacity="0">' +
      '<animateTransform attributeName="transform" type="translate" values="' + dys.map(function (v, i) { return f1(dxs[i]) + ' ' + f1(v); }).join(';') +
      '" keyTimes="' + K + '" dur="' + dur + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(dys.length - 1) + '"/>' +
      A + '"opacity" values="' + op + '" keyTimes="' + opK + '" dur="' + dur + 's" repeatCount="indefinite"/>' +
      inner + '</g>';
  }

  /* ---------------- peristalsis, on the plate's own oesophagus ---------------- */
  /* The centre line is read off the plate's own drawing, not taken as the middle of
     the box. The drawn oesophagus drifts left through the chest and then leans right
     into the cardia, at the top of the stomach's lesser curvature. A straight tube
     down the box misses that: it runs on past the stomach and meets the artwork at
     the pylorus, so the food looks as if it skips the stomach and enters the gut. */
  function cardiaOf(ctx) {
    var s = ctx.outline && ctx.outline('stomach', 2), best = null;
    if (!s || !s.length) return null;
    /* the upper-left shoulder of the stomach: the leftmost point along the top edge,
       above the antrum (y < 480) and below the fundus dome (y > 440) */
    s.forEach(function (q) { if (q[1] < 480 && q[1] > 440 && (!best || q[0] < best[0])) best = q; });
    if (!best) return null;
    return { x: Math.min(214, Math.max(188, best[0] + 9)), y: Math.min(482, Math.max(452, best[1] + 8)) };
  }
  function spineOf(ctx) {
    var pts = ctx.outline && ctx.outline('oesophagus', 2);
    if (!pts || pts.length < 20) return null;
    var band = {}, S = [];
    pts.forEach(function (q) {
      var k = Math.round(q[1] / 8) * 8;
      if (!band[k]) band[k] = [q[0], q[0]];
      band[k][0] = Math.min(band[k][0], q[0]); band[k][1] = Math.max(band[k][1], q[0]);
    });
    Object.keys(band).map(Number).sort(function (a, b) { return a - b; }).forEach(function (y) {
      if (band[y][1] - band[y][0] > 6) S.push([y, (band[y][0] + band[y][1]) / 2]);   /* skip the tapered ends */
    });
    if (S.length < 3) return null;
    var c = cardiaOf(ctx), last = S[S.length - 1];          /* spine entries are [y, centre x] */
    if (c && c.y > last[0] + 8) {                           /* the stretch hidden behind the liver */
      S.push([last[0] + (c.y - last[0]) * 0.55, last[1] + (c.x - last[1]) * 0.3]);
      S.push([c.y, c.x]);
    }
    return S;
  }
  function peristalsis(ctx) {
    var b = ctx.box, fs = ctx.fs, u = ctx.u;
    var S = spineOf(ctx);
    var cx0 = b.x + b.w / 2, y0 = b.y + 6, y1 = S ? S[S.length - 1][0] : b.y + b.h;
    function cxAt(y) {
      if (!S) return cx0;
      if (y <= S[0][0]) return S[0][1];
      for (var i = 1; i < S.length; i++) {
        if (y <= S[i][0]) return S[i - 1][1] + (S[i][1] - S[i - 1][1]) * (y - S[i - 1][0]) / (S[i][0] - S[i - 1][0]);
      }
      return S[S.length - 1][1];
    }
    var hw = b.w * 0.34;                                   /* half-width of the tube at rest */
    var TUBE = { cx:cx0, cxAt:cxAt, y0:y0, y1:y1, w:hw, bulge:hw * 0.55, sBulge:hw * 1.1,
                 squeeze:hw * 0.62, behind:hw * 2.6, sSq:hw * 0.9, open:hw * 0.22, ahead:hw * 3.4, sOpen:hw * 1.3 };
    var STEPS = 24, DUR = 7.6, from = y0 - hw * 1.2, to = y1 + hw * 1.6;
    var wall = tubeFrames(TUBE, from, to, STEPS), by = seq(from, to, STEPS);
    var ys = by.split(';').map(Number);
    var marks = '', k, n = 12;
    for (k = 0; k < n; k++) {
      var y = y0 + (y1 - y0) * (k + 0.5) / n, cxm = cxAt(y), ph = ((y - from) / (to - from) - 0.5) * DUR;
      [[cxm - hw * 2.3, cxm - hw * 1.55], [cxm + hw * 1.55, cxm + hw * 2.3]].forEach(function (s) {
        marks += '<line x1="' + f1(s[0]) + '" y1="' + f1(y) + '" x2="' + f1(s[1]) + '" y2="' + f1(y) +
          '" stroke="#B4614A" stroke-width="' + f1(0.9 * u) + '" stroke-linecap="round" opacity=".28">' +
          A + '"opacity" values=".25;1;.25" dur="' + DUR + 's" begin="' + f1(ph) + 's" repeatCount="indefinite"/>' +
          A + '"stroke-width" values="' + f1(0.9 * u) + ';' + f1(2.2 * u) + ';' + f1(0.9 * u) + '" dur="' + DUR + 's" begin="' + f1(ph) + 's" repeatCount="indefinite"/></line>';
      });
    }
    var cxTop = cxAt(from), cxEnd = cxAt(y1), rx = cxTop + hw * 2.9;
    /* base positions are read at the first frame (bolus at `from`); the group is then
       translated along the tube, so each dot stays on its own feature */
    var yBehind = from - TUBE.behind, yAhead = from + TUBE.ahead;
    var dys = ys.map(function (v) { return v - from; });
    var dxs = ys.map(function (v) { return cxAt(v) - cxTop; });
    var KT = Array.apply(null, Array(STEPS + 1)).map(function (_, i) { return (i / STEPS).toFixed(3); }).join(';');
    var ENV = '0;1;1;0;0', ENVK = '0;0.14;0.72;0.82;1';
    return marks +
      '<path fill="#F6E3DD" stroke="#C4776A" stroke-width="' + f1(1.5 * u) + '" stroke-linejoin="round" d="' + tubeFrame(TUBE, from) + '">' +
        A + '"d" values="' + wall + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(STEPS) + '"/></path>' +
      '<ellipse cx="' + f1(cxTop) + '" cy="' + f1(from) + '" rx="' + f1(hw * 0.95) + '" ry="' + f1(hw * 0.78) + '" fill="#E8A33D" stroke="#A96B18" stroke-width="' + f1(0.9 * u) + '">' +
        A + '"cx" values="' + ys.map(function (v) { return f1(cxAt(v)); }).join(';') + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(STEPS) + '"/>' +
        A + '"cy" values="' + by + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(STEPS) + '"/>' +
        A + '"ry" values="' + f1(hw * .78) + ';' + f1(hw * .9) + ';' + f1(hw * .72) + ';' + f1(hw * .9) + ';' + f1(hw * .78) + '" dur="' + DUR + 's" repeatCount="indefinite"/></ellipse>' +
      label('from the mouth', cxTop, y0 - hw * 2.2, null, null, fs * 0.85, 'middle') +
      label('to the stomach', cxEnd - hw * 2.8, y1 - hw * 1.1, cxEnd - hw * 0.9, y1 - hw * 0.5, fs * 0.85, 'end') +
      travel(mlabel(ctx.compact ? 'muscle\ncontracts\nbehind' : 'circular muscle contracts\nbehind the bolus and\nsqueezes it along',
                    rx, yBehind - fs * 1.15, cxTop + hw * 0.55, yBehind, fs * 0.92), dxs, dys, KT, DUR, ENV, ENVK) +
      travel(mlabel(ctx.compact ? 'wall\nrelaxes\nahead' : 'the wall ahead relaxes\nto receive it',
                    rx, yAhead - fs * 0.3, cxTop + hw * 1.35, yAhead, fs * 0.92), dxs, dys, KT, DUR, ENV, ENVK) +
      moving('the bolus', ys.map(function (v) { return cxAt(v) - hw * 1.5; }), ys.map(function (v) { return v + fs * 0.35; }),
             KT, DUR, fs, 'end', '0;1;1;0;0', '0;0.06;0.72;0.80;1');   /* clear of the label at the cardia */
  }

  /* ---------------- swallowing, drawn on the head section ---------------- */
  function swallow(ctx) {
    var im = ctx.img, fs = ctx.fs, u = ctx.u;
    if (!im) return '';
    function P(nx, ny) { return [im.x + nx * im.W, im.y + ny * im.H]; }
    var DUR = 7.6;
    /* the bolus: along the oral cavity (the dark space between palate and
       tongue), driven back, down the pharynx behind the folded epiglottis,
       then on down the oesophagus — where it lengthens to fit the tube.
       Every point was read off the picture's pixels. */
    var route = [P(.26, .569), P(.34, .565), P(.42, .577), P(.47, .615), P(.50, .67), P(.52, .75), P(.518, .82), P(.540, .86), P(.556, .90), P(.573, .95), P(.583, 1.0), P(.583, 1.05)];
    var K = '0;0.09;0.18;0.27;0.36;0.45;0.53;0.6;0.66;0.72;0.77;0.8;1';
    var xs = route.map(function (q) { return f1(q[0]); }); xs.push(xs[xs.length - 1]);
    var ys = route.map(function (q) { return f1(q[1]); }); ys.push(ys[ys.length - 1]);
    var rxW = im.W * 0.018, rxN = im.W * 0.011, ryM = im.H * 0.012, ryT = im.H * 0.022;
    var bolus = '<ellipse rx="' + f1(rxW) + '" ry="' + f1(ryM) + '" fill="#C98A45" stroke="#8A5A2B" stroke-width="' + f1(0.7 * u) + '">' +
      A + '"cx" values="' + xs.join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(12) + '"/>' +
      A + '"cy" values="' + ys.join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(12) + '"/>' +
      A + '"rx" values="' + [rxW, rxW, rxW, rxW * .95, rxW * .9, rxW * .85, rxN * 1.2, rxN, rxN, rxN, rxN, rxN, rxW].map(f1).join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite"/>' +
      A + '"ry" values="' + [ryM, ryM, ryM, ryM * 1.1, ryM * 1.2, ryM * 1.3, ryT * .9, ryT, ryT, ryT, ryT, ryT, ryM].map(f1).join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite"/>' +
      A + '"opacity" values="0;1;1;1;1;1;1;1;1;1;1;0;0" keyTimes="0;0.05;0.18;0.27;0.36;0.45;0.53;0.6;0.66;0.72;0.76;0.8;1" dur="' + DUR + 's" repeatCount="indefinite"/></ellipse>';
    /* the epiglottis, traced from the picture: a leaf leaning up and back
       from its base at the top of the larynx. It is hinged at the base and
       bends a little along its length as it folds down over the opening of
       the windpipe (the dark ellipse), then springs back. */
    var H = P(.467, .812);
    var leafN = [[.459,.812],[.461,.800],[.463,.788],[.466,.778],[.470,.770],[.474,.762],[.478,.754],[.483,.746],[.4885,.7395],[.4925,.745],[.4938,.753],[.4935,.761],[.4915,.769],[.4895,.777],[.4875,.784],[.485,.790],[.481,.798],[.4775,.806],[.474,.812]];
    var leaf = leafN.map(function (q) { var a = P(q[0], q[1]); return [a[0] - H[0], a[1] - H[1]]; });
    var Lmax = 0; leaf.forEach(function (q) { Lmax = Math.max(Lmax, Math.hypot(q[0], q[1])); });
    function leafPath(phi) {
      var rad = phi * Math.PI / 180;
      return 'M' + leaf.map(function (q) {
        var s = Math.hypot(q[0], q[1]) / Lmax, a = rad * (0.85 + 0.3 * s);   /* the tip bends a little further than the base */
        var c = Math.cos(a), sn = Math.sin(a);
        return f1(H[0] + q[0] * c - q[1] * sn) + ',' + f1(H[1] + q[0] * sn + q[1] * c);
      }).join(' L') + ' Z';
    }
    var PHI = 105, fr = [], kt = [];
    function seg(t0, t1, from, to, n) { for (var i = 0; i < n; i++) { var k = i / (n - 1); fr.push(leafPath(from + (to - from) * k)); kt.push(t0 + (t1 - t0) * k); } }
    fr.push(leafPath(0)); kt.push(0);
    seg(0.28, 0.42, 0, PHI, 8);
    seg(0.62, 0.76, PHI, 0, 8);
    fr.push(leafPath(0)); kt.push(1);
    var inlet = P(.50, .83);
    var opening = '<ellipse cx="' + f1(inlet[0]) + '" cy="' + f1(inlet[1]) + '" rx="' + f1(im.W * .02) + '" ry="' + f1(im.H * .012) + '" fill="#4A1F1E" opacity=".65"/>';
    var flap = '<g><animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,' + f1(-Lmax * .16) + ';0,' + f1(-Lmax * .16) + ';0,0;0,0" keyTimes="0;0.28;0.42;0.62;0.76;1" dur="' + DUR + 's" repeatCount="indefinite"/>' +
      '<path d="' + fr[0] + '" fill="#EFD7B8" stroke="#A9743C" stroke-width="' + f1(0.7 * u) + '" stroke-linejoin="round">' +
      A + '"d" values="' + fr.join(';') + '" keyTimes="' + kt.map(function (t) { return t.toFixed(3); }).join(';') + '" dur="' + DUR + 's" repeatCount="indefinite"/></path></g>';
    var e = P(.4885, .742), tr = P(.46, .93), oe = P(.558, .93), ph = P(.515, .66), tg = P(.33, .60);
    return opening + bolus + flap +
      label('epiglottis', e[0] + im.W * .09, e[1] - fs * 1.1, e[0] + im.W * .004, e[1], fs) +
      label(ctx.compact ? 'windpipe' : 'trachea (windpipe)\nto the lungs', tr[0] - im.W * .06, tr[1], tr[0], tr[1] - fs * .3, fs, 'end') +
      label(ctx.compact ? 'oesophagus' : 'oesophagus\nto the stomach', oe[0] + im.W * .14, oe[1] + fs * .3, oe[0], oe[1], fs) +
      label('pharynx', ph[0] + im.W * .07, ph[1], ph[0], ph[1], fs) +
      (ctx.compact ? '' : moving('the bolus', route.map(function (q) { return q[0] - im.W * 0.03; }).concat([route[route.length - 1][0] - im.W * 0.03]),
                                  route.map(function (q) { return q[1] + im.H * 0.012; }).concat([route[route.length - 1][1] + im.H * 0.012]),
                                  K, DUR, fs, 'end',
                                  /* the word takes hold as the tongue drives the bolus back (before that it would sit off
                                     the left of the picture) and lets go once the bolus is in the oesophagus (below the picture) */
                                  '0;0;1;1;0;0', '0;0.12;0.19;0.55;0.63;1'));
  }

  /* ---------------- churning, on the plate's stomach ---------------- */
  /* The stomach here IS the plate's stomach: its outline is taken from the
     plate's own path, cut at the pylorus (the artwork carries stomach and
     duodenum in one path). Each wall point moves along its own inward
     normal, so the wall deforms smoothly. On it: a muscular wall with a
     rugae-lined lumen, peristaltic waves that start in the body and deepen
     towards the pyloric antrum, chyme mixing inside, and a squirt of chyme
     through the pyloric sphincter into the duodenum with each wave. The
     plate's own oesophagus meets the outline at the cardia. */
  function churn(ctx) {
    var fs = ctx.fs, u = ctx.u, DUR = 4.4, STEPS = 32;
    if (!ctx.outline) return '';
    var raw = ctx.outline('stomach', 2);
    if (raw.length < 40) return '';
    function nearest(px, py) { var b = 0, bd = 1e9; raw.forEach(function (q, i) { var d = (q[0] - px) * (q[0] - px) + (q[1] - py) * (q[1] - py); if (d < bd) { bd = d; b = i; } }); return b; }
    var iA = nearest(173, 507), iB = nearest(166, 523), n = raw.length, pts = [], i;
    for (i = iA; ; i = (i + 1) % n) { pts.push(raw[i]); if (i === iB) break; if (pts.length > n) break; }
    if (!pts.some(function (q) { return q[1] < 445; })) { pts = []; for (i = iA; ; i = (i - 1 + n) % n) { pts.push(raw[i]); if (i === iB) break; if (pts.length > n) break; } }
    /* the pyloric opening closes with a few points, so the closure is as smooth as the rest */
    var pA = pts[0], pB = pts[pts.length - 1];
    [0.25, 0.5, 0.75].forEach(function (t) { pts.push([pB[0] + (pA[0] - pB[0]) * t, pB[1] + (pA[1] - pB[1]) * t]); });
    var N = pts.length;
    /* centroid, for orienting normals inward */
    var cx = 0, cy = 0; pts.forEach(function (q) { cx += q[0]; cy += q[1]; }); cx /= N; cy /= N;
    /* the long axis, fundus to pylorus, gives each point its position v (0..1) */
    var AX = [[246,436],[240,462],[238,490],[232,515],[215,538],[192,540],[172,518]];
    var cum = [0]; for (i = 1; i < AX.length; i++) cum.push(cum[i - 1] + Math.hypot(AX[i][0] - AX[i - 1][0], AX[i][1] - AX[i - 1][1]));
    var total = cum[cum.length - 1];
    function axisV(q) {
      var best = null;
      for (var k = 0; k < AX.length - 1; k++) {
        var a = AX[k], b = AX[k + 1], vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy;
        var t = Math.max(0, Math.min(1, ((q[0] - a[0]) * vx + (q[1] - a[1]) * vy) / L2));
        var d = Math.hypot(q[0] - (a[0] + vx * t), q[1] - (a[1] + vy * t));
        if (!best || d < best.d) best = { d:d, v:(cum[k] + t * Math.sqrt(L2)) / total };
      }
      return best;
    }
    var W = pts.map(function (q, k) {
      var pv = pts[(k - 2 + N) % N], nx = pts[(k + 2) % N];
      var tx = nx[0] - pv[0], ty = nx[1] - pv[1], L = Math.hypot(tx, ty) || 1;
      var nX = -ty / L, nY = tx / L;                       /* left normal of the tangent */
      if ((cx - q[0]) * nX + (cy - q[1]) * nY < 0) { nX = -nX; nY = -nY; }   /* point it inward */
      var ax = axisV(q);
      return { x:q[0], y:q[1], nx:nX, ny:nY, d:ax.d, v:ax.v };
    });
    /* smooth v and d along the wall so neighbours never disagree */
    function smoothKey(key, w) { var out = W.map(function (p) { return p[key]; }); for (var pass = 0; pass < 3; pass++) out = out.map(function (val, k) { var s = 0, c = 0; for (var j = -w; j <= w; j++) { var idx = k + j; if (idx < 0 || idx >= N) continue; s += out[idx]; c++; } return s / c; }); W.forEach(function (p, k) { p[key] = out[k]; }); }
    smoothKey('v', 3); smoothKey('d', 3); smoothKey('nx', 3); smoothKey('ny', 3);
    W.forEach(function (w) { var L = Math.hypot(w.nx, w.ny) || 1; w.nx /= L; w.ny /= L; });
    /* a closed Catmull-Rom curve through the points, as cubic Béziers */
    function curve(P) {
      var n = P.length, d = 'M' + f1(P[0][0]) + ',' + f1(P[0][1]);
      for (var i = 0; i < n; i++) {
        var p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
        d += ' C' + f1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + f1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
                    f1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + f1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f1(p2[0]) + ',' + f1(p2[1]);
      }
      return d + ' Z';
    }
    function smoothPts(P, w) { return P.map(function (q, k) { var sx = 0, sy = 0, c = 0; for (var j = -w; j <= w; j++) { var r = P[(k + j + N) % N]; sx += r[0]; sy += r[1]; c++; } return [sx / c, sy / c]; }); }
    function smoothArr(arr, w) { for (var pass = 0; pass < 2; pass++) arr = arr.map(function (val, k) { var s = 0, c = 0; for (var j = -w; j <= w; j++) { s += arr[(k + j + N) % N]; c++; } return s / c; }); return arr; }
    function ringAll(rings) {
      var s = W.map(function (w) {
        if (w.v < 0.24) return 0;
        var g = 0; rings.forEach(function (r) { g += gauss(w.v - r, 0.085); });
        return Math.min(w.d * 0.5, (3 + 18 * w.v) * g);
      });
      return smoothArr(s, 3);
    }
    function outerPts(rings) {
      var s = ringAll(rings);
      return smoothPts(W.map(function (w, k) { return [w.x + w.nx * s[k], w.y + w.ny * s[k]]; }), 1);
    }
    function outer(rings) { return curve(outerPts(rings)); }
    var fo = [], f;
    for (f = 0; f <= STEPS; f++) { var r1 = 0.26 + (f / STEPS) * 0.8, r2 = r1 - 0.42, rings = [r1]; if (r2 > 0.24) rings.push(r2); fo.push(outer(rings)); }
    var T = 5;                                   /* wall thickness, plate units */
    function animD() { return A + '"d" values="' + fo.join(';') + '" dur="' + DUR + 's" repeatCount="indefinite"/>'; }
    function bit(bx, by, rad, r, dur, delay, col) {
      var path = 'M' + f1(bx - rad) + ',' + f1(by) + ' a' + f1(rad) + ',' + f1(rad * .7) + ' 0 1,0 ' + f1(rad * 2) + ',0 a' + f1(rad) + ',' + f1(rad * .7) + ' 0 1,0 ' + f1(-rad * 2) + ',0';
      return '<ellipse rx="' + f1(r) + '" ry="' + f1(r * .8) + '" fill="' + col + '" opacity=".9"><animateMotion dur="' + dur + 's" begin="' + delay + 's" repeatCount="indefinite" path="' + path + '"/>' +
        A + '"rx" values="' + f1(r) + ';' + f1(r * .75) + ';' + f1(r) + '" dur="' + (dur * .5).toFixed(1) + 's" repeatCount="indefinite"/></ellipse>';
    }
    var food = bit(244, 462, 9, 2.2, 6.5, 0, '#A86B2D') + bit(232, 478, 8, 1.9, 5.5, -2, '#8F5A2B') + bit(252, 490, 7, 1.7, 7, -4, '#B57A3A') +
               bit(236, 506, 8, 2, 6, -1, '#A86B2D') + bit(224, 522, 6, 1.6, 5, -3, '#8F5A2B') + bit(250, 470, 5, 1.4, 4.8, -2.5, '#C08A45') +
               bit(238, 494, 5, 1.5, 5.8, -1.5, '#C08A45') + bit(212, 532, 5, 1.3, 4.6, -.8, '#A86B2D');
    var squirt = '';
    [[0, 2.6], [0.45, 1.6], [0.9, 2.1]].forEach(function (s) {
      var b = (-DUR * (1 - 0.86) + s[0]).toFixed(2);
      squirt += '<circle r="' + f1(s[1]) + '" fill="#C8A05A" opacity="0"><animateMotion dur="' + DUR + 's" begin="' + b + 's" repeatCount="indefinite" path="M196,536 L182,527 L168,516 L152,513 L140,522 L135,540" keyPoints="0;0;1" keyTimes="0;0.86;1" calcMode="linear"/>' +
        A + '"opacity" values="0;0;0.95;0.95;0" keyTimes="0;0.84;0.88;0.97;1" dur="' + DUR + 's" begin="' + b + 's" repeatCount="indefinite"/></circle>';
    });
    var gc = null; W.forEach(function (w) { if (!gc || w.x > gc.x) gc = w; });
    var top = null; W.forEach(function (w) { if (!top || w.y < top.y) top = w; });
    var mid = { x:0, y:0 }; W.forEach(function (w) { mid.x += w.x; mid.y += w.y; }); mid.x /= W.length; mid.y /= W.length;
    return '<defs><radialGradient id="chymeG" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="#F1D6B0"/><stop offset="1" stop-color="#E4BE93"/></radialGradient>' +
      '<clipPath id="stomachClip"><path d="' + fo[0] + '">' + animD() + '</path></clipPath></defs>' +
      /* the lumen fills the whole shape; the wall is the inner half of a thick stroke clipped to the shape */
      '<path fill="url(#chymeG)" d="' + fo[0] + '">' + animD() + '</path>' +
      '<g clip-path="url(#stomachClip)">' +
        '<path fill="none" stroke="#C4875C" stroke-width="' + f1(2 * T + 1.4) + '" stroke-linejoin="round" d="' + fo[0] + '">' + animD() + '</path>' +
        '<path fill="none" stroke="#E4B896" stroke-width="' + f1(2 * T) + '" stroke-linejoin="round" d="' + fo[0] + '">' + animD() + '</path>' +
      '</g>' +
      '<path fill="none" stroke="#9E5D3A" stroke-width="' + f1(1.6 * u) + '" stroke-linejoin="round" d="' + fo[0] + '">' + animD() + '</path>' +
      food + squirt +
      (ctx.compact
        ? label('peristaltic waves\nsqueeze towards\nthe pylorus', 178, 380, null, null, fs, 'start') +
          label('gastric juice:\nHCl + pepsin', mid.x, mid.y + fs * .4, null, null, fs, 'middle') +
          label('chyme through the\npyloric sphincter', 146, 574, 168, 519, fs, 'start')
        : label('peristaltic waves\nsqueeze towards the\npylorus — this is\nphysical digestion', 236, 396, null, null, fs, 'start') +
          label('gastric juice\n(hydrochloric acid\n+ pepsin)', mid.x, mid.y - fs * .2, null, null, fs, 'middle') +
          label('with each wave a little chyme is\nsquirted through the pyloric\nsphincter into the duodenum', 142, 576, 168, 519, fs, 'start'));
  }

  /* ---------------- the bile ducts, named as in the 7.4 deck, with bile flowing ---------------- */
  /* Drawn cleanly over the plate (its own branchy duct artwork is hidden for
     these stations): right and left hepatic ducts join as the common hepatic
     duct; the cystic duct from the gall bladder joins it to form the common
     bile duct, which runs down behind the head of the pancreas to the
     duodenum, where the pancreatic duct meets it. */
  function drops(route, col, r, dur, n, phase) {
    var d = 'M' + route.map(function (q) { return q[0] + ',' + q[1]; }).join(' L'), out = '';
    for (var i = 0; i < n; i++) {
      var b = (-(i / n) * dur + (phase || 0)).toFixed(2);
      out += '<circle r="' + f1(r) + '" fill="' + col + '" stroke="#fff" stroke-width="' + f1(r * .25) + '" opacity=".95"><animateMotion dur="' + dur + 's" begin="' + b + 's" repeatCount="indefinite" path="' + d + '" calcMode="linear"/>' +
             A + '"opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" dur="' + dur + 's" begin="' + b + 's" repeatCount="indefinite"/></circle>';
    }
    return out;
  }
  function tube(pts, w, col) {
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) { var a = pts[i], b = pts[i + 1]; d += ' Q' + a[0] + ',' + a[1] + ' ' + (a[0] + b[0]) / 2 + ',' + (a[1] + b[1]) / 2; }
    var last = pts[pts.length - 1]; d += ' L' + last[0] + ',' + last[1];
    return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + f1(w) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  /* The bile duct is green because bile is; the pancreatic duct must NOT be, or a student
     reads green leaving the pancreas and concludes the pancreas makes bile. Brown. */
  var BILE = '#8DB43A', JUICE = '#E8C95A', DUCT = '#3F8A55', PDUCT = '#A0561F';   /* chestnut: #9A6A34 read olive beside the green bile duct */
  var RHD = [[108, 444], [122, 458], [140, 470]], LHD = [[180, 448], [162, 462], [140, 470]];
  var CHD = [[140, 470], [150, 480], [156, 490]], CYST = [[156, 490], [150, 489], [144, 488]];
  var CBD = [[156, 490], [156, 508], [153, 526], [148, 543], [142, 558], [137, 568], [134, 576]];
  /* the pancreatic duct, read off the plate's own artwork */
  var PANC = [[258, 504], [247, 510], [236, 515], [224, 520], [212, 524], [200, 528], [188, 534], [177, 539], [168, 546], [159, 556], [149, 561], [142, 568], [136, 575]];
  function sacOf(ctx) {
    var pts = ctx.outlineIn ? ctx.outlineIn('gall-bladder', [94, 477, 147, 498], 2) : [];
    var hull = hullCurve(pts); if (!hull) return null;
    var cx = 0, cy = 0, minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    pts.forEach(function (q) { cx += q[0]; cy += q[1]; minX = Math.min(minX, q[0]); maxX = Math.max(maxX, q[0]); minY = Math.min(minY, q[1]); maxY = Math.max(maxY, q[1]); });
    return { hull:hull, cx:cx / pts.length, cy:cy / pts.length, minX:minX, maxX:maxX, minY:minY, maxY:maxY };
  }
  function hullCurve(P) {
    if (P.length < 3) return '';
    P = P.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var cross = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
    var lo = [], up = [], i;
    for (i = 0; i < P.length; i++) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], P[i]) <= 0) lo.pop(); lo.push(P[i]); }
    for (i = P.length - 1; i >= 0; i--) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], P[i]) <= 0) up.pop(); up.push(P[i]); }
    var H = lo.slice(0, -1).concat(up.slice(0, -1)), n = H.length, d = 'M' + f1(H[0][0]) + ',' + f1(H[0][1]);
    for (i = 0; i < n; i++) { var p0 = H[(i - 1 + n) % n], p1 = H[i], p2 = H[(i + 1) % n], p3 = H[(i + 2) % n]; d += ' C' + f1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + f1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + f1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f1(p2[0]) + ',' + f1(p2[1]); }
    return d + ' Z';
  }
  function bileflow(ctx) {
    var fs = ctx.fs, u = ctx.u, focus = ctx.focus, r = 1.5 * u, g = '', w = 2.4 * u;
    if (focus === 'pancreas') {
      /* the pancreas: its own duct system, in its own colour, with side branches as on the plate */
      g += tube(PANC, w * 1.1, PDUCT);
      for (var k = 1; k < PANC.length - 1; k += 1) {
        var a = PANC[k], b = PANC[k + 1], tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1, nx = -ty / L, ny = tx / L, side = (k % 2 ? 1 : -1), len = 7 + (k % 3) * 2;
        g += tube([a, [a[0] + nx * side * len * .6 + tx / L * 3, a[1] + ny * side * len * .6 + ty / L * 3], [a[0] + nx * side * len + tx / L * 6, a[1] + ny * side * len + ty / L * 6]], w * .55, PDUCT);
      }
      g += drops(PANC, JUICE, r, 4, 4, 0);
      /* Each word points twice: at the drawing and at the same structure in the
         photograph on the left, so the two read as one picture. */
      if (ctx.compact) return g +
        label('pancreas', 230, 452, 230, 492, fs, 'middle') +
        label('pancreatic duct', 196, 596, 177, 539, fs, 'start') +
        label('duodenum', 52, 622, 142, 578, fs, 'start');
      return g +
        label('pancreas — makes\npancreatic juice', 230, 444, 230, 492, fs, 'middle') +
        label('pancreatic duct\ncarries the juice', 196, 590, 177, 539, fs, 'start') +
        label('the bile duct\njoins it here', 196, 628, 140, 566, fs, 'start') +
        label('duodenum', 52, 622, 142, 578, fs, 'start');
    }
    /* the bile ducts, drawn cleanly: hepatic ducts -> common hepatic duct -> cystic duct -> gall
       bladder (storage), and gall bladder -> cystic duct -> common bile duct -> duodenum (release) */
    g += tube(RHD, w, DUCT) + tube(LHD, w, DUCT) + tube(CHD, w * 1.15, DUCT) + tube(CYST, w, DUCT) + tube(CBD, w * 1.3, DUCT);
    /* One story, three ways of telling it as the text is scrolled:
         liver-fill    — between meals: the way into the duodenum is shut, so the bile the liver keeps
                         making backs up into the gall bladder, which visibly fills;
         liver         — the whole cycle: fill (8 s), then a meal — the gall bladder squeezes and empties,
                         and the fresh bile from the liver runs straight down as well (8 s);
         liver-release — a meal in progress: release only, from both.
       The gall bladder is the plate's own outline, painted here so that it can swell and squeeze. */
    var mode = focus === 'liver-fill' ? 'fill' : focus === 'liver-release' ? 'release' : 'cycle';
    var S = sacOf(ctx);
    if (S) {
      /* the sac swells as it fills and squeezes as it empties, and the bile level inside it rises and falls */
      var T = 16, sc = mode === 'fill' ? '0.82;1.1;1.1' : mode === 'release' ? '1.08;0.84;0.84' : '0.82;1.1;1.1;0.84;0.84';
      var kt = mode === 'cycle' ? '0;0.4;0.5;0.8;1' : '0;0.65;1', dur = mode === 'cycle' ? T : 8;
      var top = S.minY - S.cy - 3, bot = S.maxY - S.cy + 3, lv = mode === 'fill' ? [bot, top, top] : mode === 'release' ? [top, bot, bot] : [bot, top, top, bot, bot];
      var tr = 'translate(' + f1(-S.cx) + ',' + f1(-S.cy) + ')';
      g += '<g transform="translate(' + f1(S.cx) + ',' + f1(S.cy) + ')"><g><animateTransform attributeName="transform" type="scale" values="' + sc + '" keyTimes="' + kt + '" dur="' + dur + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(kt.split(';').length - 1) + '"/>' +
           '<clipPath id="gbSac"><path d="' + S.hull + '" transform="' + tr + '"/></clipPath>' +
           '<path d="' + S.hull + '" transform="' + tr + '" fill="#EAF3DF"/>' +
           '<rect clip-path="url(#gbSac)" x="' + f1(S.minX - S.cx - 6) + '" width="' + f1(S.maxX - S.minX + 12) + '" y="' + f1(lv[0]) + '" height="' + f1(bot - top + 8) + '" fill="' + BILE + '" opacity=".92">' +
             A + '"y" values="' + lv.map(f1).join(';') + '" keyTimes="' + kt + '" dur="' + dur + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(kt.split(';').length - 1) + '"/></rect>' +
           '<path d="' + S.hull + '" transform="' + tr + '" fill="none" stroke="#E8A33D" stroke-width="' + f1(2.2 * u) + '" stroke-linejoin="round"/></g></g>';
    }
    var FILL = drops(RHD.concat(CHD.slice(1), CYST.slice(1)), BILE, r, 4.6, 4, 0) + drops(LHD.concat(CHD.slice(1), CYST.slice(1)), BILE, r * .9, 4.6, 3, 1.5);
    var REL = drops([[144, 488], [150, 489], [156, 490]].concat(CBD.slice(1)), BILE, r, 4.2, 5, 0) + drops(RHD.concat(CHD.slice(1), CBD.slice(1)), BILE, r * .85, 5.6, 3, 1.2) + drops(LHD.concat(CHD.slice(1), CBD.slice(1)), BILE, r * .8, 5.6, 2, 2.9);
    var phase = function (first) { return A + '"opacity" values="' + (first ? '1;1;0;0' : '0;0;1;1') + '" keyTimes="0;0.5;0.5;1" dur="16s" repeatCount="indefinite"/>'; };
    /* The phase used to be written on the plate here, at (150,578) — three lines that landed
       on the duodenum's own label, and that said word for word what the caption strip under
       the plate already says. The strip does it better and has room for it. */
    if (mode === 'fill') g += FILL;
    else if (mode === 'release') g += REL;
    else g += '<g opacity="1">' + phase(true) + FILL + '</g>' +
              '<g opacity="0">' + phase(false) + REL + '</g>';
    if (ctx.compact) return g +
      label('liver', 60, 400, 122, 436, fs, 'start') +
      mlabel('gall\nbladder', 45, 517, 121, 487, fs, 'start') +
      label('common\nbile duct', 186, 542, 152, 530, fs, 'start') +
      label('duodenum', 58, 578, 134, 576, fs, 'start');
    return g +
      label('liver — makes bile', 74, 410, 120, 438, fs, 'start') +
      label('right hepatic duct', 78, 456, 112, 448, fs, 'end') +
      label('left hepatic duct', 186, 436, 176, 450, fs, 'start') +
      label('common hepatic duct', 158, 470, 149, 479, fs, 'start') +
      label('cystic duct', 126, 470, 148, 488, fs, 'end') +
      label('gall bladder —\nstores bile', 56, 486, 118, 486, fs, 'start') +
      label('common bile duct —\nbile to the duodenum', 180, 540, 149, 538, fs, 'start') +
      label('duodenum', 58, 578, 134, 576, fs, 'start');
  }

  /* ---------------- maltase, embedded in the membrane of a microvillus ---------------- */
  /* Drawn in the step's box: the lumen above, the cytoplasm below, a phospholipid
     bilayer between them with maltase sitting in it. A maltose molecule drifts down
     from the lumen, binds to the active site, and leaves as two glucose molecules
     that pass into the cytoplasm. */
  function maltase(ctx) {
    var b = ctx.box, fs = ctx.fs, u = ctx.u, x0 = b.x, y0 = b.y, W = b.w, H = b.h;
    var my = y0 + H * 0.52, th = H * 0.2, hr = th * 0.17, mx = x0 + W * 0.50, pw = th * 1.7, D = 7;
    var g = '<rect x="' + f1(x0) + '" y="' + f1(y0) + '" width="' + f1(W) + '" height="' + f1(my - y0) + '" fill="#E3F1F7"/>' +
            '<rect x="' + f1(x0) + '" y="' + f1(my) + '" width="' + f1(W) + '" height="' + f1(y0 + H - my) + '" fill="#FBEBD3"/>';
    /* the bilayer: heads on the outside, tails to the middle */
    var pitch = hr * 2.3, n = Math.floor(W / pitch);
    for (var i = 0; i < n; i++) {
      var cx = x0 + pitch * (i + 0.5);
      if (cx > mx - pw / 2 - hr && cx < mx + pw / 2 + hr) continue;
      [[my - th / 2 + hr, 1], [my + th / 2 - hr, -1]].forEach(function (row) {
        var cy = row[0], dir = row[1], ty = cy + dir * hr, tl = th / 2 - hr * 1.3;
        g += '<path d="M' + f1(cx - hr * .45) + ',' + f1(ty) + ' q' + f1(-hr * .5) + ',' + f1(dir * tl * .5) + ' 0,' + f1(dir * tl) + ' M' + f1(cx + hr * .45) + ',' + f1(ty) + ' q' + f1(hr * .5) + ',' + f1(dir * tl * .5) + ' 0,' + f1(dir * tl) + '" fill="none" stroke="#C9963B" stroke-width="' + f1(hr * .28) + '" stroke-linecap="round"/>' +
             '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(hr) + '" fill="#B7A7E0" stroke="#7C6BB5" stroke-width="' + f1(hr * .18) + '"/>';
      });
    }
    /* maltase: a protein sitting through the membrane, with its active site open to the lumen */
    var pt = my - th * 0.95, pb = my + th * 0.85, r = hr * 0.95;
    g += '<path d="M' + f1(mx - pw / 2) + ',' + f1(pt + th * .3) + ' Q' + f1(mx - pw / 2) + ',' + f1(pt) + ' ' + f1(mx - pw / 2 + th * .3) + ',' + f1(pt) +
         ' L' + f1(mx - r * 1.35) + ',' + f1(pt) + ' A' + f1(r * 1.4) + ',' + f1(r * 1.4) + ' 0 0 0 ' + f1(mx + r * 1.35) + ',' + f1(pt) +
         ' L' + f1(mx + pw / 2 - th * .3) + ',' + f1(pt) + ' Q' + f1(mx + pw / 2) + ',' + f1(pt) + ' ' + f1(mx + pw / 2) + ',' + f1(pt + th * .3) +
         ' L' + f1(mx + pw / 2) + ',' + f1(pb - th * .3) + ' Q' + f1(mx + pw / 2) + ',' + f1(pb) + ' ' + f1(mx + pw / 2 - th * .3) + ',' + f1(pb) +
         ' L' + f1(mx - pw / 2 + th * .3) + ',' + f1(pb) + ' Q' + f1(mx - pw / 2) + ',' + f1(pb) + ' ' + f1(mx - pw / 2) + ',' + f1(pb - th * .3) + ' Z" fill="#EE8FA6" stroke="#B94B6A" stroke-width="' + f1(hr * .22) + '" stroke-linejoin="round"/>';
    /* maltose arrives from the lumen, sits in the active site, and leaves as two glucose molecules */
    var sy = y0 + H * 0.17, ay = pt + r * .05, ey = y0 + H * 0.84, dx = r * 1.05;   /* lanes: the riding words clear both captions */
    function sugar(sign, endX, endY) {
      var xs = [mx + sign * dx * .9, mx + sign * dx * .9, mx + sign * dx * .9, mx + sign * dx * .9, endX, endX].map(f1).join(';');
      var ys = [sy, sy, ay, ay, endY, endY].map(f1).join(';');
      return '<circle r="' + f1(r) + '" fill="#E8A33D" stroke="#9A6512" stroke-width="' + f1(r * .2) + '">' +
        A + '"cx" values="' + xs + '" keyTimes="0;0.05;0.4;0.55;0.9;1" dur="' + D + 's" repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"/>' +
        A + '"cy" values="' + ys + '" keyTimes="0;0.05;0.4;0.55;0.9;1" dur="' + D + 's" repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"/>' +
        A + '"opacity" values="0;1;1;1;1;0" keyTimes="0;0.05;0.4;0.55;0.9;1" dur="' + D + 's" repeatCount="indefinite"/></circle>';
    }
    /* the bond between the two halves of maltose, gone once the enzyme has cut it */
    g += '<line x1="' + f1(mx - dx * .3) + '" x2="' + f1(mx + dx * .3) + '" y1="' + f1(sy) + '" y2="' + f1(sy) + '" stroke="#9A6512" stroke-width="' + f1(r * .5) + '" stroke-linecap="round">' +
         A + '"y1" values="' + [sy, sy, ay, ay, ay, ay].map(f1).join(';') + '" keyTimes="0;0.05;0.4;0.55;0.9;1" dur="' + D + 's" repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"/>' +
         A + '"y2" values="' + [sy, sy, ay, ay, ay, ay].map(f1).join(';') + '" keyTimes="0;0.05;0.4;0.55;0.9;1" dur="' + D + 's" repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"/>' +
         A + '"opacity" values="0;1;1;1;0;0" keyTimes="0;0.05;0.4;0.55;0.56;1" dur="' + D + 's" repeatCount="indefinite"/></line>';
    g += sugar(-1, mx - dx * 2.2, ey) + sugar(1, mx + dx * 2.2, ey);
    var L = fs * 0.92;
    /* the names ride with the molecules: "maltose" follows the pair down and vanishes as the enzyme
       cuts it; "glucose" appears on each half as it leaves for the cytoplasm */
    var KT = '0;0.05;0.4;0.55;0.9;1', SPL = 'calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"';
    function rider(t, xs, ys, op, opK, anchor) {
      return '<text class="dl__t" font-size="' + f1(L) + '" text-anchor="' + anchor + '" x="' + f1(xs[0]) + '" y="' + f1(ys[0]) + '" opacity="0">' + t +
        A + '"x" values="' + xs.map(f1).join(';') + '" keyTimes="' + KT + '" dur="' + D + 's" repeatCount="indefinite" ' + SPL + '/>' +
        A + '"y" values="' + ys.map(f1).join(';') + '" keyTimes="' + KT + '" dur="' + D + 's" repeatCount="indefinite" ' + SPL + '/>' +
        A + '"opacity" values="' + op + '" keyTimes="' + opK + '" dur="' + D + 's" repeatCount="indefinite"/></text>';
    }
    var mlx = mx - dx * .9 - r * 2.4, yOff = L * .38;
    g += rider('maltose', [mlx, mlx, mlx, mlx, mlx, mlx], [sy + yOff, sy + yOff, ay + yOff, ay + yOff, ay + yOff, ay + yOff], '0;1;1;1;0;0', '0;0.05;0.4;0.52;0.57;1', 'end');
    var gl = [mx - dx * 2.2 - r * 1.5, mx - dx * 2.2 - r * 1.5, mx - dx * 2.2 - r * 1.5, mx - dx * 2.2 - r * 1.5, mx - dx * 2.2 - r * 1.5, mx - dx * 2.2 - r * 1.5];
    var gr = [mx + dx * .9 + r * 1.5, mx + dx * .9 + r * 1.5, mx + dx * .9 + r * 1.5, mx + dx * .9 + r * 1.5, mx + dx * 2.2 + r * 1.5, mx + dx * 2.2 + r * 1.5];
    var gy = [sy + yOff, sy + yOff, ay + yOff, ay + yOff, ey + yOff, ey + yOff];
    /* the two glucose names ride out with their own halves, and start clear of where "maltose"
       was, so the crossfade never puts two words in the same place */
    var gyL = gy.map(function (v, i) { return i < 4 ? v + L * 1.2 : v + yOff; });
    g += rider('glucose', gl, gyL, '0;0;0;1;1;0', '0;0.56;0.58;0.64;0.9;1', 'end') + rider('glucose', gr, gy, '0;0;0;1;1;0', '0;0.56;0.58;0.64;0.9;1', 'start');
    if (ctx.compact) return g +
      label('lumen', x0 + W * .03, y0 + L * 1.1, null, null, L, 'start') +
      label('maltase in\nthe membrane', mx + pw / 2 + L * 1.4, my - th * 1.05, mx + pw / 2 - th * .1, my - th * .55, L, 'start') +
      label('cytoplasm', x0 + W * .03, y0 + H - L * .5, null, null, L, 'start');
    return g +
      label('lumen of the small intestine', x0 + W * .03, y0 + L * 1.1, null, null, L, 'start') +
      label('maltase — embedded\nin the membrane', mx + pw / 2 + L * 2.2, my - th * 1.05, mx + pw / 2 - th * .1, my - th * .55, L, 'start') +
      label('cell membrane\nof a microvillus', x0 + W * .03, my - th * 1.55, x0 + W * .1, my - th / 2 + hr * .2, L, 'start') +
      label('cytoplasm of the epithelial cell', x0 + W * .03, y0 + H - L * .5, null, null, L, 'start');
  }

  /* ---------------- the mesentery and the hepatic portal vein ---------------- */
  /* What the picture has to say: the absorbed food does not float to the liver. Every loop of the
     small intestine is held in the mesentery — one sheet of tissue fanning out from the back wall —
     and the veins that run inside that sheet collect the food from the gut wall, join into the
     hepatic portal vein, and carry it to the liver. So the sheet is drawn over the whole coil mass,
     its veins converge, the nutrients travel along them, and a photograph of the mesentery on its
     own sits beside it, because a fan drawn over an intestine is not obvious the first time.

     The liver is NOT outlined here: its silhouette runs on behind the stomach in this artwork, so
     tracing it drew a line across the stomach. It is lit instead, on the plate itself (is-spot). */
  var PORTAL = [[200, 646], [205, 626], [204, 602], [197, 578], [186, 550], [172, 520], [160, 498], [152, 486]];
  var MESO_APEX = [196, 588];
  var MESO_EDGE = [[116, 600], [104, 644], [110, 690], [136, 718], [178, 732], [224, 726], [258, 700], [272, 664], [274, 624], [256, 600]];
  var TRIBS = [
    [[112, 618], [150, 626], [200, 644]],
    [[108, 676], [150, 664], [199, 648]],
    [[142, 714], [172, 686], [200, 650]],
    [[200, 730], [204, 692], [201, 656]],
    [[250, 706], [226, 678], [204, 654]],
    [[270, 650], [238, 646], [204, 640]],
    [[262, 606], [232, 614], [205, 624]]
  ];
  function portal(ctx) {
    var fs = ctx.fs, u = ctx.u, w = 3 * u, r = 1.7 * u, g = '';

    /* the sheet, over the whole of the coils it holds */
    var fan = 'M' + MESO_APEX.join(',');
    for (var i = 0; i < MESO_EDGE.length; i++) {
      var p0 = MESO_EDGE[Math.max(0, i - 1)], p1 = MESO_EDGE[i], p2 = MESO_EDGE[Math.min(MESO_EDGE.length - 1, i + 1)];
      fan += (i ? ' Q' + f1(p1[0]) + ',' + f1(p1[1]) + ' ' + f1((p1[0] + p2[0]) / 2) + ',' + f1((p1[1] + p2[1]) / 2)
                : ' L' + f1(p1[0]) + ',' + f1(p1[1]));
    }
    fan += ' L' + MESO_EDGE[MESO_EDGE.length - 1].join(',') + ' Z';
    g += '<path d="' + fan + '" fill="#F7E9C2" opacity=".5" stroke="#B8912F" stroke-width="' + f1(1.3 * u) +
         '" stroke-dasharray="' + f1(3.4 * u) + ' ' + f1(2.2 * u) + '" stroke-linejoin="round"/>';
    /* a few creases across the sheet, so it reads as a sheet and not as a tint */
    [0.28, 0.5, 0.72].forEach(function (k) {
      var i = Math.floor(k * (MESO_EDGE.length - 1)), e = MESO_EDGE[i];
      g += '<path d="M' + MESO_APEX.join(',') + ' Q' + f1((MESO_APEX[0] + e[0]) / 2 + 6) + ',' + f1((MESO_APEX[1] + e[1]) / 2) +
           ' ' + f1(e[0]) + ',' + f1(e[1]) + '" fill="none" stroke="#B8912F" stroke-width="' + f1(0.5 * u) + '" opacity=".55"/>';
    });

    /* the veins inside it, gathering from every loop into the one trunk */
    TRIBS.forEach(function (t) { g += tube(t, w * 0.7, '#2F3E8F'); });
    g += tube(PORTAL, w * 1.5, '#2F3E8F') + tube(PORTAL, w * 0.5, '#6F7FD1');

    /* the absorbed food, travelling: glucose and amino acids, from the gut wall to the liver */
    TRIBS.forEach(function (t, i) {
      g += drops(t.concat(PORTAL.slice(1)), i % 2 ? '#BC235B' : '#E8A33D', r, 6.6, 2, -i * 0.9);
    });

    /* the mesentery on its own, so the fan above is recognisable — click it to see it full size */
    var ix = 304, iy = 548, iw = 96, ih = iw * 821 / 903;      /* beside the mesentery: clear of the colon at 301, inside the tour's frame at 405 */
    g += '<g class="dl__shot" data-lightbox="photos/mesentery-render.jpg" ' +
         'data-cap="The mesentery: one sheet of membrane fanning out from the back wall of the abdomen, holding the six to seven metres of small intestine. The veins running inside it collect the absorbed food and join the hepatic portal vein.">' +
         '<rect x="' + f1(ix - 1.8) + '" y="' + f1(iy - 1.8) + '" width="' + f1(iw + 3.6) + '" height="' + f1(ih + 3.6) +
         '" rx="2.4" fill="#FFFDF9" stroke="#B9AE9B" stroke-width="' + f1(0.5 * u) + '"/>' +
         '<image href="assets/photos/mesentery-render.jpg" xlink:href="assets/photos/mesentery-render.jpg" x="' + f1(ix) +
         '" y="' + f1(iy) + '" width="' + f1(iw) + '" height="' + f1(ih) + '" preserveAspectRatio="xMidYMid slice"/>' +
         '<circle cx="' + f1(ix + iw - fs * 0.9) + '" cy="' + f1(iy + fs * 0.9) + '" r="' + f1(fs * 0.62) + '" fill="#FFFDF9" stroke="#B9AE9B" stroke-width="0.4"/>' +
         '<text class="dl__t" x="' + f1(ix + iw - fs * 0.9) + '" y="' + f1(iy + fs * 1.18) + '" font-size="' + f1(fs * 0.78) + '" text-anchor="middle">\u2922</text>' +
         '</g>' +
         label('the mesentery on its own\nclick to see it full size', ix + iw / 2, iy + ih + fs * 1.3, null, null, fs * 0.82, 'middle');

    if (ctx.compact) return g +
      label('liver', 64, 452, 108, 470, fs, 'start') +
      label('hepatic portal vein', 60, 560, 176, 540, fs, 'start') +
      label('mesentery', 96, 726, 140, 706, fs, 'start');
    return g +
      label('liver — the food is\ndelivered here first', 58, 448, 106, 470, fs, 'start') +
      label('hepatic portal vein —\ncarries the absorbed glucose\nand amino acids to the liver', 40, 548, 172, 532, fs, 'start') +
      label('mesentery — the sheet that holds\nthe intestine; the veins inside it\ncollect the food from every loop', 60, 716, 130, 700, fs, 'start');
  }

  /* Saliva running into the mouth, the same idea as bile into the duodenum: along the
     parotid duct across the cheek, and up from the submandibular and sublingual glands into
     the floor of the mouth. The routes follow where those ducts are actually drawn on the
     plate, so the drops travel down the artwork rather than across it. */
  function saliva(ctx) {
    var r = Math.max(1.6, ctx.u * 1.6);
    return drops([[158, 131], [148, 130], [138, 129], [130, 131], [124, 134], [120, 139]],
                 '#8FC7E8', r, 3.2, 4, 0) +
           drops([[146, 171], [140, 166], [134, 161], [128, 156], [124, 151]],
                 '#8FC7E8', r, 3.2, 4, -1.6);
  }


  /* ---------------- the visking tubing experiment ----------------
     Drawn rather than photographed, because the point of the practical is a
     comparison — what leaves the bag and what stays in it — and a photograph of a
     boiling tube shows neither. The apparatus is drawn to the plate's own grid so the
     camera frames it like any other station.

     phases, from ctx.focus:
       set-up  — the apparatus, labelled, nothing moving yet
       run     — maltose diffusing out through the pores while starch stays in
       tests   — the two test tubes of the surrounding water, before and after       */
  /* Laid out against the frame the camera gives this station — x 30..310, y 116..564 — with
     the apparatus down the middle and a clear column each side for the labels. */
  /* The tubing is longer than the tube it hangs in: it is knotted at both ends and the top
     knot sits above the rim, which is how it is actually held. Drawn entirely inside, as it
     was, it looked like something sealed in rather than something lowered in. */
  var VK = {
    tube:  { x:132, y:186, w:96, h:322, r:48 },        /* the boiling tube */
    water: 228,                                        /* the water line inside it */
    bag:   { x:158, y:152, w:44, h:316 },              /* the tubing, from above the rim down */
    left:  124,                                        /* labels anchored end here */
    right: 236                                         /* labels anchored start here */
  };

  /* what each drawn thing is, said once: the animation is unreadable without it */
  function viskingKey(ctx) {
    var fs = ctx.fs * 0.8, x = 36, y = 496, g = '', row = 0;
    function line(art, word) {
      var yy = y + row * (fs * 1.5);
      g += '<g transform="translate(' + f1(x) + ',' + f1(yy) + ')">' + art + '</g>' +
           '<text class="dl__t" x="' + f1(x + 26) + '" y="' + f1(yy + fs * 0.34) + '" font-size="' + f1(fs) + '">' + word + '</text>';
      row++;
    }
    line(starchBlob(9, 0, 0.62, 0), 'starch');
    line('<circle cx="4" cy="0" r="3.4" fill="#D98F2E"/><circle cx="13" cy="0" r="3.4" fill="#D98F2E"/>', 'maltose');
    return g;
  }

  function beaker(o, waterY) {
    var g = '';
    /* the water, then the glass over it, so the meniscus reads as glass not paint */
    g += '<path fill="#CFE4EE" opacity=".55" d="M' + f1(o.x + 3) + ',' + f1(waterY) +
         ' H' + f1(o.x + o.w - 3) + ' V' + f1(o.y + o.h - o.r * 0.55) +
         ' a' + f1(o.w / 2 - 3) + ',' + f1(o.r * 0.55) + ' 0 0 1 ' + f1(-(o.w - 6)) + ',0 Z"/>';
    g += '<ellipse cx="' + f1(o.x + o.w / 2) + '" cy="' + f1(waterY) + '" rx="' + f1(o.w / 2 - 3) +
         '" ry="4.4" fill="#BBD8E6" opacity=".75"/>';
    g += '<path fill="none" stroke="#9FB3BD" stroke-width="2.1" stroke-linejoin="round" d="M' + f1(o.x) + ',' + f1(o.y) +
         ' V' + f1(o.y + o.h - o.r * 0.55) + ' a' + f1(o.w / 2) + ',' + f1(o.r * 0.55) + ' 0 0 0 ' + f1(o.w) + ',0 V' + f1(o.y) + '"/>';
    g += '<ellipse cx="' + f1(o.x + o.w / 2) + '" cy="' + f1(o.y) + '" rx="' + f1(o.w / 2) +
         '" ry="5" fill="none" stroke="#9FB3BD" stroke-width="2.1"/>';
    return g;
  }

  /* the bag: a knot, a body that bulges a little, a knot */
  function viskingBag(b) {
    var cx = b.x + b.w / 2, top = b.y, bot = b.y + b.h, bw = b.w / 2;
    var d = 'M' + f1(cx - bw * 0.34) + ',' + f1(top) +
            ' C' + f1(cx - bw * 1.12) + ',' + f1(top + b.h * 0.16) + ' ' + f1(cx - bw * 1.12) + ',' + f1(bot - b.h * 0.16) + ' ' + f1(cx - bw * 0.34) + ',' + f1(bot) +
            ' L' + f1(cx + bw * 0.34) + ',' + f1(bot) +
            ' C' + f1(cx + bw * 1.12) + ',' + f1(bot - b.h * 0.16) + ' ' + f1(cx + bw * 1.12) + ',' + f1(top + b.h * 0.16) + ' ' + f1(cx + bw * 0.34) + ',' + f1(top) + ' Z';
    var g = '<path d="' + d + '" fill="#F3E6C8" opacity=".92" stroke="#C9AE72" stroke-width="1.8"/>';
    /* the knots */
    [top, bot].forEach(function (y) {
      g += '<ellipse cx="' + f1(cx) + '" cy="' + f1(y) + '" rx="' + f1(bw * 0.42) + '" ry="4.6" fill="#E4D2A4" stroke="#B99C5E" stroke-width="1.5"/>';
    });
    return { d:d, g:g, cx:cx, bw:bw };
  }

  /* a starch molecule: a short coil, drawn big enough to read as "too large for the pores" */
  function starchBlob(x, y, s, seed) {
    var d = 'M' + f1(x - 7 * s) + ',' + f1(y);
    for (var i = 0; i < 4; i++) {
      var sx = x - 7 * s + (14 * s / 4) * (i + 0.5), dy = (i % 2 ? 1 : -1) * 3.4 * s;
      d += ' Q' + f1(sx) + ',' + f1(y + dy) + ' ' + f1(x - 7 * s + (14 * s / 4) * (i + 1)) + ',' + f1(y);
    }
    return '<path d="' + d + '" fill="none" stroke="#5B7FA6" stroke-width="' + f1(2.6 * s) + '" stroke-linecap="round" opacity=".9"/>' +
           '<circle cx="' + f1(x - 7 * s) + '" cy="' + f1(y) + '" r="' + f1(1.9 * s) + '" fill="#5B7FA6"/>' +
           '<circle cx="' + f1(x + 7 * s) + '" cy="' + f1(y) + '" r="' + f1(1.9 * s) + '" fill="#5B7FA6"/>';
  }

  function visking(ctx) {
    var fs = ctx.fs, focus = ctx.focus || 'set-up', g = '';
    var T = VK.tube, B = VK.bag, bag = viskingBag(B);
    var running = focus !== 'set-up';

    g += beaker(T, VK.water);
    g += bag.g;

    /* The pores. Drawn as gaps punched along the wall itself rather than as dots beside it:
       dots placed at an approximation of the edge drift off the curve and read as loose
       particles floating in the water, which is the opposite of what they are. */
    g += '<path d="' + bag.d + '" fill="none" stroke="#FFFDF9" stroke-width="2.6" ' +
         'stroke-dasharray="1.6 7" stroke-linecap="round"/>';

    /* starch stays in: four coils drifting inside the bag and never leaving it */
    [[0.22, 0.30], [0.62, 0.24], [0.36, 0.58], [0.70, 0.74]].forEach(function (p, i) {
      var x = B.x + 6 + p[0] * (B.w - 12), y = B.y + 20 + p[1] * (B.h - 40);
      g += '<g>' + starchBlob(x, y, 1, i) +
           (running ? '<animateTransform attributeName="transform" type="translate" values="0 0;' +
             (i % 2 ? '3 -4' : '-3 4') + ';0 0" dur="' + (5.5 + i * 0.7) + 's" repeatCount="indefinite"/>' : '') +
           '</g>';
    });

    /* maltose leaves: small pairs that cross the wall and spread into the water */
    if (running) {
      var OUT = [[0.10, 0.22, 0], [0.90, 0.34, 1], [0.08, 0.52, 2], [0.92, 0.62, 3], [0.10, 0.78, 4], [0.90, 0.16, 5]];
      OUT.forEach(function (o) {
        var side = o[0] < 0.5 ? -1 : 1;
        var y0 = B.y + 18 + o[1] * (B.h - 36);
        var x0 = bag.cx + side * bag.bw * 0.45, x1 = bag.cx + side * bag.bw * 1.05, x2 = bag.cx + side * (bag.bw + 26 + o[2] * 3);
        g += '<g opacity="0">' +
             '<circle cx="-2.4" cy="0" r="2.5" fill="#D98F2E"/><circle cx="2.4" cy="0" r="2.5" fill="#D98F2E"/>' +
             '<animateMotion dur="6s" begin="' + f1(o[2] * 0.85) + 's" repeatCount="indefinite" path="M' +
               f1(x0) + ',' + f1(y0) + ' L' + f1(x1) + ',' + f1(y0 + 3) + ' L' + f1(x2) + ',' + f1(y0 + 14 + o[2] * 2) + '"/>' +
             A + '"opacity" values="0;1;1;0" keyTimes="0;0.12;0.72;1" dur="6s" begin="' + f1(o[2] * 0.85) + 's" repeatCount="indefinite"/>' +
             '</g>';
      });
    }
    return g + viskingKey(ctx) + viskingLabels(ctx, T, B, bag, focus);
  }

  /* The words. On a phone the frame is narrow, so each label is shorter and the two that
     name what is in the bag are stacked rather than set either side of it. */
  function viskingLabels(ctx, T, B, bag, focus) {
    var fs = ctx.fs, c = ctx.compact, g = '', L = VK.left, R = VK.right;
    /* one label to a line down each side, so nothing has to share a row with anything else */
    g += label('37 °C', R, 236, T.x + T.w - 6, VK.water + 10, fs, 'start');
    g += label(c ? 'distilled\nwater' : 'distilled water',
               L, 286, T.x + 10, 268, fs, 'end');
    g += label(c ? 'visking\ntubing' : 'visking tubing —\npartially permeable',
               R, 172, bag.cx + bag.bw * 0.7, 162, fs, 'start');
    g += label(c ? 'starch and\namylase' : 'inside: starch\nand amylase',
               L, 348, bag.cx - bag.bw * 0.55, 336, fs, 'end');
    if (focus !== 'set-up') {
      g += label(c ? 'maltose diffuses\nout through\nthe pores' : 'maltose diffuses out\nthrough the pores',
                 R, 396, bag.cx + bag.bw + 14, 404, fs, 'start');
      g += label(c ? 'starch cannot\ndiffuse out —\ntoo large' : 'starch cannot diffuse out —\nits molecules are too large\nfor the pores',
                 L, 442, bag.cx - bag.bw * 0.55, 430, fs, 'end');
    }
    return g;
  }

  /* The two tests, drawn as the tubes a student actually ends up holding. Only the water
     from outside the tubing is tested: that is the whole result. */
  function viskingTests(ctx) {
    var fs = ctx.fs, g = '', c = ctx.compact;
    /* one line to a row, and the shared note well above the two captions: at the phone's
       label size they were landing on each other */
    var TUBES = [
      { x:112, cap:c ? 'iodine' : 'iodine solution',
        res:c ? 'stays\norange-brown' : 'stays orange-brown —\nno starch got out', col:'#C77B34', top:'#C77B34' },
      { x:212, cap:c ? "Benedict's" : "Benedict's, heated",
        res:c ? 'turns\nbrick-red' : 'turns brick-red —\nreducing sugar got out', col:'#B6412A', top:'#3E6FA8' }
    ];
    TUBES.forEach(function (t) {
      var x = t.x, y = 210, w = 46, h = 168, r = 23;
      g += '<path fill="' + t.col + '" opacity=".72" d="M' + f1(x + 3) + ',' + f1(y + 46) +
           ' H' + f1(x + w - 3) + ' V' + f1(y + h - r * 0.6) +
           ' a' + f1(w / 2 - 3) + ',' + f1(r * 0.6) + ' 0 0 1 ' + f1(-(w - 6)) + ',0 Z"/>';
      if (t.top !== t.col) {
        g += '<path fill="' + t.top + '" opacity=".55" d="M' + f1(x + 3) + ',' + f1(y + 46) +
             ' H' + f1(x + w - 3) + ' V' + f1(y + 84) + ' H' + f1(x + 3) + ' Z">' +
             A + '"opacity" values=".55;0" dur="4s" repeatCount="indefinite"/></path>';
      }
      g += '<path fill="none" stroke="#9FB3BD" stroke-width="2.1" stroke-linejoin="round" d="M' + f1(x) + ',' + f1(y) +
           ' V' + f1(y + h - r * 0.6) + ' a' + f1(w / 2) + ',' + f1(r * 0.6) + ' 0 0 0 ' + f1(w) + ',0 V' + f1(y) + '"/>';
      g += '<ellipse cx="' + f1(x + w / 2) + '" cy="' + f1(y) + '" rx="' + f1(w / 2) + '" ry="4.4" fill="none" stroke="#9FB3BD" stroke-width="2.1"/>';
      g += label(t.cap, x + w / 2, y - 16, null, null, fs * 0.92, 'middle');
      g += label(t.res, x + w / 2, y + h + 22, null, null, fs * 0.86, 'middle');
    });
    g += label(ctx.compact ? 'both tubes hold water\nfrom outside the tubing'
                           : 'both tubes hold a sample of the water from outside the tubing',
               170, 100, null, null, fs * 0.86, 'middle');
    return g;
  }

  var ANIMS = { peristalsis:peristalsis, swallow:swallow, churn:churn, bileflow:bileflow, maltase:maltase, portal:portal, saliva:saliva, visking:visking, viskingTests:viskingTests };
  /* every animation goes through here so the frame is known before any label is written */
  global.PlateAnim = {};
  Object.keys(ANIMS).forEach(function (k) {
    global.PlateAnim[k] = function (ctx) { FRAME = (ctx && ctx.frame) || null; TIGHT = !!(ctx && ctx.compact); try { return ANIMS[k](ctx); } finally { FRAME = null; TIGHT = false; } };
  });
})(window);
