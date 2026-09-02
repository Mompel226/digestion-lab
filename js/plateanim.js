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
    var n = 46, left = [], right = [], i, y, w;
    for (i = 0; i <= n; i++) {
      y = o.y0 + (o.y1 - o.y0) * (i / n);
      w = o.w + o.bulge * gauss(y - bolusY, o.sBulge)
              - o.squeeze * gauss(y - (bolusY - o.behind), o.sSq)
              + o.open * gauss(y - (bolusY + o.ahead), o.sOpen);
      w = Math.max(o.w * 0.28, w);
      left.push(f1(o.cx - w) + ',' + f1(y)); right.push(f1(o.cx + w) + ',' + f1(y));
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
  function crPoint(P, u) {
    var n = P.length - 1, i = Math.min(Math.floor(u * n), n - 1), t = u * n - i;
    var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
    var t2 = t * t, t3 = t2 * t;
    return [0.5 * ((2*p1[0]) + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
            0.5 * ((2*p1[1]) + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)];
  }

  /* a label in the plate's detail style: text with a halo, a leader, a dot */
  function label(t, tx, ty, ax, ay, fs, anchor) {
    var lines = String(t).split('\n');
    var out = '<text class="dl__t" x="' + f1(tx) + '" y="' + f1(ty) + '" font-size="' + f1(fs) + '" text-anchor="' + (anchor || 'start') + '">';
    lines.forEach(function (l, i) { out += '<tspan x="' + f1(tx) + '" dy="' + (i ? '1.15em' : '0') + '">' + l + '</tspan>'; });
    out += '</text>';
    if (ax != null) {
      var sx = anchor === 'end' ? tx + fs * 0.25 : anchor === 'middle' ? tx : tx - fs * 0.25;
      out = '<line class="dl__l" x1="' + f1(sx) + '" y1="' + f1(ty - fs * 0.35) + '" x2="' + f1(ax) + '" y2="' + f1(ay) + '" stroke-width="' + f1(fs * 0.09) + '"/>' +
            '<circle class="dl__d" cx="' + f1(ax) + '" cy="' + f1(ay) + '" r="' + f1(fs * 0.22) + '" stroke-width="' + f1(fs * 0.08) + '"/>' + out;
    }
    return out;
  }

  /* ---------------- peristalsis, on the plate's own oesophagus ---------------- */
  function peristalsis(ctx) {
    var b = ctx.box, fs = ctx.fs, u = ctx.u;
    var cx = b.x + b.w / 2, y0 = b.y + 6, y1 = b.y + b.h;
    var hw = b.w * 0.34;                                   /* half-width of the tube at rest */
    var TUBE = { cx:cx, y0:y0, y1:y1, w:hw, bulge:hw * 0.55, sBulge:hw * 1.1,
                 squeeze:hw * 0.62, behind:hw * 2.6, sSq:hw * 0.9, open:hw * 0.22, ahead:hw * 3.4, sOpen:hw * 1.3 };
    var STEPS = 24, DUR = 4.8, from = y0 - hw * 1.2, to = y1 + hw * 1.6;
    var wall = tubeFrames(TUBE, from, to, STEPS), by = seq(from, to, STEPS);
    var marks = '', k, n = 12;
    for (k = 0; k < n; k++) {
      var y = y0 + (y1 - y0) * (k + 0.5) / n, ph = ((y - from) / (to - from) - 0.5) * DUR;
      [[cx - hw * 2.3, cx - hw * 1.55], [cx + hw * 1.55, cx + hw * 2.3]].forEach(function (s) {
        marks += '<line x1="' + f1(s[0]) + '" y1="' + f1(y) + '" x2="' + f1(s[1]) + '" y2="' + f1(y) +
          '" stroke="#B4614A" stroke-width="' + f1(0.9 * u) + '" stroke-linecap="round" opacity=".28">' +
          A + '"opacity" values=".25;1;.25" dur="' + DUR + 's" begin="' + f1(ph) + 's" repeatCount="indefinite"/>' +
          A + '"stroke-width" values="' + f1(0.9 * u) + ';' + f1(2.2 * u) + ';' + f1(0.9 * u) + '" dur="' + DUR + 's" begin="' + f1(ph) + 's" repeatCount="indefinite"/></line>';
      });
    }
    var ly = y0 + (y1 - y0) * 0.36, rx = cx + hw * 2.9;
    return marks +
      '<path fill="#F6E3DD" stroke="#C4776A" stroke-width="' + f1(1.5 * u) + '" stroke-linejoin="round" d="' + tubeFrame(TUBE, from) + '">' +
        A + '"d" values="' + wall + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(STEPS) + '"/></path>' +
      '<ellipse cx="' + f1(cx) + '" cy="' + f1(from) + '" rx="' + f1(hw * 0.95) + '" ry="' + f1(hw * 0.78) + '" fill="#E8A33D" stroke="#A96B18" stroke-width="' + f1(0.9 * u) + '">' +
        A + '"cy" values="' + by + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(STEPS) + '"/>' +
        A + '"ry" values="' + f1(hw * .78) + ';' + f1(hw * .9) + ';' + f1(hw * .72) + ';' + f1(hw * .9) + ';' + f1(hw * .78) + '" dur="' + DUR + 's" repeatCount="indefinite"/></ellipse>' +
      label('from the mouth', cx, y0 - hw * 2.2, null, null, fs * 0.85, 'middle') +
      label('to the stomach', cx, y1 + hw * 3.2, null, null, fs * 0.85, 'middle') +
      (ctx.compact
        ? label('muscle contracts\nbehind the bolus', rx, ly, cx + hw * 1.15, ly + fs * 0.6, fs) +
          label('relaxes ahead', rx, ly + fs * 4, cx + hw * 1.15, ly + fs * 4.2, fs)
        : label('circular muscle contracts\nbehind the bolus and\nsqueezes it along', rx, ly, cx + hw * 1.15, ly + fs * 0.6, fs) +
          label('the wall ahead relaxes\nto receive it', rx, ly + fs * 5.2, cx + hw * 1.15, ly + fs * 5.6, fs)) +
      label('the bolus', cx - hw * 2.9, y0 + (y1 - y0) * 0.62, cx - hw * 0.9, y0 + (y1 - y0) * 0.62 + fs * 0.3, fs, 'end');
  }

  /* ---------------- swallowing, drawn on the head section ---------------- */
  function swallow(ctx) {
    var im = ctx.img, fs = ctx.fs, u = ctx.u;
    if (!im) return '';
    function P(nx, ny) { return [im.x + nx * im.W, im.y + ny * im.H]; }
    var DUR = 6.5;
    /* the bolus travels in the oral cavity (the dark space between palate and
       tongue), is driven back, drops down the pharynx behind the folded
       epiglottis and on down the oesophagus. Points were read off the
       picture's pixels, not guessed. */
    var route = [P(.26, .565), P(.34, .563), P(.42, .575), P(.46, .615), P(.49, .67), P(.52, .75), P(.548, .82), P(.555, .88), P(.56, .95), P(.565, 1.04)];
    var K = '0;0.1;0.2;0.3;0.4;0.5;0.58;0.66;0.74;0.8;1';
    var xs = route.map(function (q) { return f1(q[0]); }); xs.push(xs[xs.length - 1]);
    var ys = route.map(function (q) { return f1(q[1]); }); ys.push(ys[ys.length - 1]);
    var rx = im.W * 0.018, ry = im.H * 0.012;
    var bolus = '<ellipse rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="#C98A45" stroke="#8A5A2B" stroke-width="' + f1(0.7 * u) + '">' +
      A + '"cx" values="' + xs.join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(10) + '"/>' +
      A + '"cy" values="' + ys.join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(10) + '"/>' +
      A + '"opacity" values="0;1;1;1;1;1;1;1;1;0;0" keyTimes="0;0.05;0.2;0.3;0.4;0.5;0.58;0.66;0.76;0.8;1" dur="' + DUR + 's" repeatCount="indefinite"/></ellipse>';
    /* the epiglottis: a leaf hinged at its base, standing up behind the
       tongue. As the larynx rises it tips back and down over the opening of
       the windpipe (the dark ellipse), so the bolus is guided past it into
       the oesophagus. */
    var B = P(.472, .81), T = P(.485, .755);
    var L = Math.hypot(T[0] - B[0], T[1] - B[1]), a0 = Math.atan2(T[1] - B[1], T[0] - B[0]) * 180 / Math.PI;
    var w = L * 0.42;
    var leaf = 'M0,' + f1(-w * .45) + ' Q' + f1(L * .55) + ',' + f1(-w) + ' ' + f1(L) + ',0 Q' + f1(L * .55) + ',' + f1(w) + ' 0,' + f1(w * .45) + ' Z';
    var KT = '0;0.28;0.42;0.62;0.74;1';
    var inlet = P(.50, .83);
    var opening = '<ellipse cx="' + f1(inlet[0]) + '" cy="' + f1(inlet[1]) + '" rx="' + f1(im.W * .019) + '" ry="' + f1(im.H * .010) + '" fill="#4A1F1E" opacity=".6"/>';
    var flap = '<g transform="translate(' + f1(B[0]) + ',' + f1(B[1]) + ')">' +
      '<animateTransform attributeName="transform" type="translate" additive="sum" values="0,0;0,0;0,' + f1(-L * .2) + ';0,' + f1(-L * .2) + ';0,0;0,0" keyTimes="' + KT + '" dur="' + DUR + 's" repeatCount="indefinite"/>' +
      '<path d="' + leaf + '" fill="#F0C79F" stroke="#A9743C" stroke-width="' + f1(0.8 * u) + '" stroke-linejoin="round" transform="rotate(' + f1(a0) + ')">' +
      '<animateTransform attributeName="transform" type="rotate" values="' + f1(a0) + ';' + f1(a0) + ';' + f1(a0 + 113) + ';' + f1(a0 + 113) + ';' + f1(a0) + ';' + f1(a0) + '" keyTimes="' + KT + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(5) + '"/></path></g>';
    var e = T, tr = P(.46, .93), oe = P(.565, .93), ph = P(.515, .66), tg = P(.33, .60);
    return opening + bolus + flap +
      label('epiglottis', e[0] + im.W * .09, e[1] - fs * 1.1, e[0] + im.W * .004, e[1], fs) +
      label(ctx.compact ? 'windpipe' : 'trachea (windpipe)\nto the lungs', tr[0] - im.W * .06, tr[1], tr[0], tr[1] - fs * .3, fs, 'end') +
      label(ctx.compact ? 'oesophagus' : 'oesophagus\nto the stomach', oe[0] + im.W * .06, oe[1] + fs * .3, oe[0], oe[1], fs) +
      label('pharynx', ph[0] + im.W * .07, ph[1], ph[0], ph[1], fs) +
      (ctx.compact ? '' : label('the bolus, in the mouth', tg[0] + fs * 0.6, tg[1] + fs * 3.2, tg[0] + fs * 0.3, tg[1] - fs * .4, fs, 'start'));
  }

  /* ---------------- churning, on the plate's stomach ---------------- */
  /* The stomach here IS the plate's stomach: its outline is taken from the
     plate's own path, cut at the pylorus (the artwork carries stomach and
     duodenum in one path). On it: a muscular wall with a rugae-lined lumen,
     rings of contraction that start in the body and deepen as they travel
     to the antrum (gastric peristalsis), chyme mixing inside, and a squirt
     of chyme through the pylorus into the duodenum with each wave. */
  function churn(ctx) {
    var fs = ctx.fs, u = ctx.u, DUR = 4.4, STEPS = 32;
    if (!ctx.outline) return '';
    var raw = ctx.outline('stomach', 2);
    if (raw.length < 40) return '';
    /* the stomach part of the outline: from the top of the pylorus, round the
       lesser curvature, the cardiac notch and the fundus, down the greater
       curvature to the bottom of the pylorus */
    function nearest(px, py) { var b = 0, bd = 1e9; raw.forEach(function (q, i) { var d = (q[0] - px) * (q[0] - px) + (q[1] - py) * (q[1] - py); if (d < bd) { bd = d; b = i; } }); return b; }
    var iA = nearest(173, 507), iB = nearest(166, 523), n = raw.length, pts = [], i;
    for (i = iA; ; i = (i + 1) % n) { pts.push(raw[i]); if (i === iB) break; if (pts.length > n) break; }
    var throughFundus = pts.some(function (q) { return q[1] < 445; });
    if (!throughFundus) { pts = []; for (i = iA; ; i = (i - 1 + n) % n) { pts.push(raw[i]); if (i === iB) break; if (pts.length > n) break; } }
    /* the long axis, fundus to pylorus; every wall point knows its place on it */
    var AX = [[246,436],[240,462],[238,490],[232,515],[215,538],[192,540],[172,518]];
    var cum = [0]; for (i = 1; i < AX.length; i++) cum.push(cum[i - 1] + Math.hypot(AX[i][0] - AX[i - 1][0], AX[i][1] - AX[i - 1][1]));
    var total = cum[cum.length - 1];
    function axisOf(q) {
      var best = null;
      for (var k = 0; k < AX.length - 1; k++) {
        var a = AX[k], b = AX[k + 1], vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy;
        var t = Math.max(0, Math.min(1, ((q[0] - a[0]) * vx + (q[1] - a[1]) * vy) / L2));
        var fx = a[0] + vx * t, fy = a[1] + vy * t, d = Math.hypot(q[0] - fx, q[1] - fy);
        if (!best || d < best.d) best = { d:d, fx:fx, fy:fy, v:(cum[k] + t * Math.sqrt(L2)) / total };
      }
      return best;
    }
    var W = pts.map(function (q) { var ax = axisOf(q); var dx = ax.fx - q[0], dy = ax.fy - q[1], d = Math.hypot(dx, dy) || 1; return { x:q[0], y:q[1], nx:dx / d, ny:dy / d, d:d, v:ax.v }; });
    /* the oesophagus joins at the cardiac notch */
    var notch = 0, bestN = 1e9; W.forEach(function (w, k) { var d = Math.hypot(w.x - 197, w.y - 466); if (d < bestN) { bestN = d; notch = k; } });
    var oes = [[178, 416], [193, 416]];
    /* a ring of contraction at axis position r indents the wall toward the axis */
    function ring(w, rings) {
      if (w.v < 0.24) return 0;
      var g = 0; rings.forEach(function (r) { g += gauss(w.v - r, 0.065); });
      var amp = 4 + 22 * w.v;
      return Math.min(w.d * 0.55, amp * g);
    }
    function outer(rings) {
      var o = [];
      o.push(oes[0]);
      o.push([W[notch].x - 9, W[notch].y + 3]);
      for (var k = notch; k < W.length; k++) { var w = W[k], s = ring(w, rings); o.push([w.x + w.nx * s, w.y + w.ny * s]); }
      /* the pylorus opening */
      for (k = 0; k < notch; k++) { w = W[k]; s = ring(w, rings); o.push([w.x + w.nx * s, w.y + w.ny * s]); }
      o.push([W[notch].x + 5, W[notch].y - 6]);
      o.push(oes[1]);
      return 'M' + o.map(function (q) { return f1(q[0]) + ',' + f1(q[1]); }).join(' L') + ' Z';
    }
    /* the lumen: the same wall, offset inward by the wall thickness, with rugae folds */
    function inner(rings, phase) {
      var o = [], T = 5.2;
      o.push([oes[0][0] + 4, oes[0][1]]);
      o.push([W[notch].x - 5, W[notch].y + 1]);
      var order = []; for (var k = notch; k < W.length; k++) order.push(k); for (k = 0; k < notch; k++) order.push(k);
      order.forEach(function (k, j) {
        var w = W[k], s = ring(w, rings), fold = (w.v > 0.15 ? 1.4 * Math.sin(j * 0.9 + phase) : 0);
        var t = Math.min(w.d * 0.55, T + fold + s);
        o.push([w.x + w.nx * t, w.y + w.ny * t]);
      });
      o.push([W[notch].x + 1, W[notch].y - 4]);
      o.push([oes[1][0] - 4, oes[1][1]]);
      return 'M' + o.map(function (q) { return f1(q[0]) + ',' + f1(q[1]); }).join(' L') + ' Z';
    }
    var fo = [], fi = [], f;
    for (f = 0; f <= STEPS; f++) { var r1 = 0.26 + (f / STEPS) * 0.8, r2 = r1 - 0.42, rings = [r1]; if (r2 > 0.24) rings.push(r2); fo.push(outer(rings)); fi.push(inner(rings, 0)); }
    /* food: pieces circling in the body of the stomach, always inside the lumen */
    function bit(cx, cy, rad, r, dur, delay, col) {
      var path = 'M' + f1(cx - rad) + ',' + f1(cy) + ' a' + f1(rad) + ',' + f1(rad * .7) + ' 0 1,0 ' + f1(rad * 2) + ',0 a' + f1(rad) + ',' + f1(rad * .7) + ' 0 1,0 ' + f1(-rad * 2) + ',0';
      return '<ellipse rx="' + f1(r) + '" ry="' + f1(r * .8) + '" fill="' + col + '" opacity=".9"><animateMotion dur="' + dur + 's" begin="' + delay + 's" repeatCount="indefinite" path="' + path + '"/>' +
        A + '"rx" values="' + f1(r) + ';' + f1(r * .75) + ';' + f1(r) + '" dur="' + (dur * .5).toFixed(1) + 's" repeatCount="indefinite"/></ellipse>';
    }
    var food = bit(244, 462, 9, 2.2, 6.5, 0, '#A86B2D') + bit(232, 478, 8, 1.9, 5.5, -2, '#8F5A2B') + bit(252, 490, 7, 1.7, 7, -4, '#B57A3A') +
               bit(236, 506, 8, 2, 6, -1, '#A86B2D') + bit(224, 522, 6, 1.6, 5, -3, '#8F5A2B') + bit(250, 470, 5, 1.4, 4.8, -2.5, '#C08A45') +
               bit(238, 494, 5, 1.5, 5.8, -1.5, '#C08A45') + bit(212, 532, 5, 1.3, 4.6, -.8, '#A86B2D');
    /* the squirt: with each wave a little chyme passes the pylorus into the duodenum */
    var squirt = '';
    [[0, 2.6], [0.45, 1.6], [0.9, 2.1]].forEach(function (s) {
      squirt += '<circle r="' + f1(s[1]) + '" fill="#C8A05A" opacity="0"><animateMotion dur="' + DUR + 's" begin="' + (-DUR * (1 - 0.86) + s[0]).toFixed(2) + 's" repeatCount="indefinite" path="M196,536 L182,527 L168,516 L152,513 L140,522 L135,540" keyPoints="0;0;1" keyTimes="0;0.86;1" calcMode="linear"/>' +
        A + '"opacity" values="0;0;0.95;0.95;0" keyTimes="0;0.84;0.88;0.97;1" dur="' + DUR + 's" begin="' + (-DUR * (1 - 0.86) + s[0]).toFixed(2) + 's" repeatCount="indefinite"/></circle>';
    });
    var wall = W[Math.round(W.length * 0.38)], body = W[Math.round(W.length * 0.5)], pyl = W[W.length - 3];
    var gc = null; W.forEach(function (w) { if (!gc || (w.x > gc.x)) gc = w; });
    return '<defs><radialGradient id="chymeG" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="#F1D6B0"/><stop offset="1" stop-color="#E4BE93"/></radialGradient></defs>' +
      '<path fill="#E4B896" stroke="#9E5D3A" stroke-width="' + f1(1.6 * u) + '" stroke-linejoin="round" d="' + fo[0] + '">' +
        A + '"d" values="' + fo.join(';') + '" dur="' + DUR + 's" repeatCount="indefinite"/></path>' +
      '<path fill="url(#chymeG)" stroke="#C4875C" stroke-width="' + f1(0.7 * u) + '" stroke-linejoin="round" d="' + fi[0] + '">' +
        A + '"d" values="' + fi.join(';') + '" dur="' + DUR + 's" repeatCount="indefinite"/></path>' +
      food + squirt +
      (ctx.compact
        ? label('muscular wall:\nwaves squeeze\ntowards the exit', gc.x + fs * 1.2, gc.y - fs * 4.2, gc.x - 1, gc.y - fs * 2, fs) +
          label('chyme squirted\ninto the duodenum', 146, 574, 168, 519, fs, 'start')
        : label('the muscular wall squeezes in\nwaves towards the exit —\nthis is physical digestion', gc.x + fs * 1.4, gc.y - fs * 5.2, gc.x - 1, gc.y - fs * 2.4, fs) +
          label('gastric juice: hydrochloric\nacid + pepsin, mixed in', gc.x + fs * 1.4, gc.y + fs * 3.6, 248, 486, fs) +
          label('with each wave a little chyme is\nsquirted through the pylorus\ninto the duodenum', 142, 576, 168, 519, fs, 'start'));
  }

  global.PlateAnim = { peristalsis:peristalsis, swallow:swallow, churn:churn };
})(window);
