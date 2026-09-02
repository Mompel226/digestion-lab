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
  function churn(ctx) {
    var fs = ctx.fs, u = ctx.u, DUR = 5.5, STEPS = 30;
    if (!ctx.inFill) return '';
    var inside = ctx.inFill('stomach');
    /* The silhouette is read off the plate's own artwork, row by row: the
       stomach proper lies right of x = 197 (left of that the same path
       carries the duodenum) and above y = 567, where the antrum ends at the pylorus. So the animated shape IS the
       plate's stomach, not a drawing of one. */
    var rows = [], y, x, x0, x1;
    for (y = 436; y <= 566; y += 2) {
      x0 = null; x1 = null;
      for (x = 197; x <= 292; x++) if (inside(x, y)) { if (x0 === null) x0 = x; x1 = x; }
      if (x0 !== null && x1 - x0 > 4) rows.push({ y:y, x0:x0, x1:x1 });
    }
    if (rows.length < 8) return '';
    /* smooth the sampled edges */
    function smooth(k) { var out = rows.map(function (r) { return r[k]; }); for (var pass = 0; pass < 4; pass++) for (var i = 1; i < out.length - 1; i++) out[i] = (out[i - 1] + 2 * out[i] + out[i + 1]) / 4; return out; }
    var L = smooth('x0'), Rr = smooth('x1'), n = rows.length, yTop = rows[0].y, yBot = rows[n - 1].y;
    /* the oesophagus enters at the notch on the left (y ~ 465): its lower
       part is drawn as a tube from the plate's oesophagus down to the cardia */
    var cardia = 0; for (var i = 1; i < n; i++) if (rows[i].y >= 462 && rows[i].y <= 472) { cardia = i; break; }
    var oes = { top:[176, 418, 192, 418], bot:[L[cardia] - 8, rows[cardia].y - 6, L[cardia] + 4, rows[cardia].y + 6] };
    function shape(rings) {
      var pts = [];
      /* down the left edge of the oesophagus to the cardia */
      pts.push([oes.top[0], oes.top[1]], [oes.bot[0], oes.bot[1]]);
      /* down the lesser curvature and antrum */
      for (var i = cardia; i < n; i++) pts.push([L[i] + d(i, rings), rows[i].y]);
      /* across the bottom, then up the greater curvature */
      for (var j = n - 1; j >= 0; j--) pts.push([Rr[j] - d(j, rings), rows[j].y]);
      /* along the fundus and down to the notch */
      for (var k = 0; k < cardia; k++) pts.push([L[k] + d(k, rings), rows[k].y]);
      pts.push([oes.bot[2], oes.bot[3]], [oes.top[2], oes.top[3]]);
      return 'M' + pts.map(function (q) { return f1(q[0]) + ',' + f1(q[1]); }).join(' L') + ' Z';
    }
    /* rings of contraction: they start in the body, travel to the antrum and
       deepen as they go (antral waves are the strong ones); never in the fundus */
    function d(i, rings) {
      var v = (rows[i].y - yTop) / (yBot - yTop), hw = (Rr[i] - L[i]) / 2, g = 0;
      rings.forEach(function (rr) { g += gauss(v - rr, .07) * (3 + 16 * v); });
      return Math.min(hw * 0.45, g) * (v > .28 ? 1 : 0);
    }
    var frames = [], f;
    for (f = 0; f <= STEPS; f++) { var a = .34 + (f / STEPS) * .66, b = a - .33, rings = [a]; if (b > .3) rings.push(b); frames.push(shape(rings)); }
    frames.push(frames[0]);
    /* food kept inside: pieces circle on small loops in the body of the stomach */
    function bit(cx, cy, rad, r, dur, delay) {
      var path = 'M' + f1(cx - rad) + ',' + f1(cy) + ' a' + f1(rad) + ',' + f1(rad * .8) + ' 0 1,0 ' + f1(rad * 2) + ',0 a' + f1(rad) + ',' + f1(rad * .8) + ' 0 1,0 ' + f1(-rad * 2) + ',0';
      return '<circle r="' + f1(r) + '" fill="#B5762F" opacity=".85"><animateMotion dur="' + dur + 's" begin="' + delay + 's" repeatCount="indefinite" path="' + path + '"/>' +
        A + '"r" values="' + f1(r) + ';' + f1(r * .7) + ';' + f1(r) + '" dur="' + (dur * .6).toFixed(1) + 's" repeatCount="indefinite"/></circle>';
    }
    function mid(yy) { var i = Math.max(0, Math.min(n - 1, Math.round((yy - yTop) / 2))); return { x:(L[i] + Rr[i]) / 2, hw:(Rr[i] - L[i]) / 2, y:rows[i].y }; }
    var m1 = mid(470), m2 = mid(486), m3 = mid(500), m4 = mid(514), m5 = mid(456);
    var food = bit(m1.x + 8, m1.y, 8, 2, 7, 0) + bit(m2.x - 10, m2.y, 7, 1.7, 6, -2) + bit(m3.x + 12, m3.y, 6, 1.5, 8, -4) +
               bit(m4.x - 4, m4.y, 6, 1.5, 6.5, -1) + bit(m5.x - 6, m5.y + 4, 5, 1.3, 7.5, -3) + bit(m2.x + 16, m2.y + 6, 5, 1.2, 5.5, -5);
    var fun = mid(452), body = mid(492), ant = mid(536);
    return '<path fill="#F6E6D2" stroke="#B07E4A" stroke-width="' + f1(2.4 * u) + '" stroke-linejoin="round" d="' + frames[0] + '">' +
        A + '"d" values="' + frames.join(';') + '" dur="' + DUR + 's" repeatCount="indefinite"/></path>' +
      food +
      (ctx.compact
        ? label('wall squeezes\nin waves', fun.x + fun.hw + fs * 1.2, fun.y - fs * .5, fun.x + fun.hw - 1, fun.y, fs) +
          label('gastric juice:\nHCl + pepsin', body.x + body.hw + fs * 1.2, body.y + fs * 1.4, body.x + body.hw * .55, body.y, fs) +
          label('chyme out', ant.x - ant.hw - fs * 1.2, ant.y + fs * 1.6, ant.x - ant.hw + 2, ant.y, fs, 'end')
        : label('the muscular wall squeezes\nin waves towards the exit —\nthis is physical digestion', fun.x + fun.hw + fs * 1.4, fun.y - fs * 1.4, fun.x + fun.hw - 1, fun.y, fs) +
          label('gastric juice: hydrochloric\nacid + pepsin', body.x + body.hw + fs * 1.4, body.y + fs * 2.2, body.x + body.hw * .55, body.y, fs) +
          label('chyme leaves through the\npylorus to the duodenum', ant.x - ant.hw - fs * 1.2, ant.y + fs * 2.4, ant.x - ant.hw + 2, ant.y, fs, 'end'));
  }

  global.PlateAnim = { peristalsis:peristalsis, swallow:swallow, churn:churn };
})(window);
