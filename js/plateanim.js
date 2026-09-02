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
    var route = [P(.26, .565), P(.34, .563), P(.42, .575), P(.46, .615), P(.49, .67), P(.52, .75), P(.535, .82), P(.55, .88), P(.56, .95), P(.565, 1.04)];
    var K = '0;0.1;0.2;0.3;0.4;0.5;0.58;0.66;0.74;0.8;1';
    var xs = route.map(function (q) { return f1(q[0]); }); xs.push(xs[xs.length - 1]);
    var ys = route.map(function (q) { return f1(q[1]); }); ys.push(ys[ys.length - 1]);
    var rx = im.W * 0.02, ry = im.H * 0.013;
    var bolus = '<ellipse rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="#C98A45" stroke="#8A5A2B" stroke-width="' + f1(0.7 * u) + '">' +
      A + '"cx" values="' + xs.join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(10) + '"/>' +
      A + '"cy" values="' + ys.join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(10) + '"/>' +
      A + '"opacity" values="0;1;1;1;1;1;1;1;1;0;0" keyTimes="0;0.05;0.2;0.3;0.4;0.5;0.58;0.66;0.76;0.8;1" dur="' + DUR + 's" repeatCount="indefinite"/></ellipse>';
    /* the epiglottis: a leaf hinged at its base, standing up behind the
       tongue. As the larynx rises it tips back and down over the opening of
       the windpipe (the dark ellipse), so the bolus is guided past it into
       the oesophagus. */
    var B = P(.475, .80), T = P(.485, .755);
    var L = Math.hypot(T[0] - B[0], T[1] - B[1]), a0 = Math.atan2(T[1] - B[1], T[0] - B[0]) * 180 / Math.PI;
    var w = L * 0.4;
    var leaf = 'M0,' + f1(-w * .45) + ' Q' + f1(L * .55) + ',' + f1(-w) + ' ' + f1(L) + ',0 Q' + f1(L * .55) + ',' + f1(w) + ' 0,' + f1(w * .45) + ' Z';
    var KT = '0;0.28;0.42;0.62;0.74;1';
    var inlet = P(.492, .815);
    var opening = '<ellipse cx="' + f1(inlet[0]) + '" cy="' + f1(inlet[1]) + '" rx="' + f1(im.W * .016) + '" ry="' + f1(im.H * .009) + '" fill="#4A1F1E" opacity=".6"/>';
    var flap = '<g transform="translate(' + f1(B[0]) + ',' + f1(B[1]) + ')">' +
      '<animateTransform attributeName="transform" type="translate" additive="sum" values="0,0;0,0;0,' + f1(-L * .2) + ';0,' + f1(-L * .2) + ';0,0;0,0" keyTimes="' + KT + '" dur="' + DUR + 's" repeatCount="indefinite"/>' +
      '<path d="' + leaf + '" fill="#F0C79F" stroke="#A9743C" stroke-width="' + f1(0.8 * u) + '" stroke-linejoin="round" transform="rotate(' + f1(a0) + ')">' +
      '<animateTransform attributeName="transform" type="rotate" values="' + f1(a0) + ';' + f1(a0) + ';' + f1(a0 + 122) + ';' + f1(a0 + 122) + ';' + f1(a0) + ';' + f1(a0) + '" keyTimes="' + KT + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(5) + '"/></path></g>';
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
    var fs = ctx.fs, u = ctx.u, DUR = 5.5, N = 110, STEPS = 30;
    /* One tube from the oesophagus, through the stomach, out into the
       duodenum — traced over the plate's own stomach outline (sampled from
       its path), so the animation lies on the organ the reader sees. */
    var MID = [[186,412],[194,428],[208,441],[228,452],[236,472],[234,494],[229,514],[219,531],[205,544],[193,551],[187,563]];
    function at(v) {
      var q = crPoint(MID, v), q2 = crPoint(MID, Math.min(1, v + 0.004));
      var dx = q2[0] - q[0], dy = q2[1] - q[1], Lh = Math.hypot(dx, dy) || 1;
      return { x:q[0], y:q[1], nx:dy / Lh, ny:-dx / Lh };
    }
    function prof(v, keys) {
      var i = 0; while (i < keys.length - 2 && v > keys[i + 1][0]) i++;
      var a = keys[i], b = keys[i + 1], f = (v - a[0]) / (b[0] - a[0] || 1);
      f = Math.max(0, Math.min(1, f)); f = f * f * (3 - 2 * f);
      return a[1] + (b[1] - a[1]) * f;
    }
    /* half-widths each side of the centre line: greater curvature (OUT, the
       reader's right) and lesser curvature (INN) */
    var OUT = [[0,6],[0.1,8],[0.2,17],[0.28,27],[0.36,35],[0.45,41],[0.55,43],[0.62,41],[0.7,29],[0.8,15],[0.9,9],[1,6]];
    var INN = [[0,6],[0.1,8],[0.2,11],[0.3,22],[0.4,44],[0.5,41],[0.6,31],[0.7,21],[0.8,12],[0.9,8],[1,6]];
    function wall(rings) {
      var i, v, s, wo, wi, Lo = [], Li = [];
      for (i = 0; i <= N; i++) {
        v = i / N; s = at(v); wo = prof(v, OUT); wi = prof(v, INN);
        rings.forEach(function (rr) { var g = gauss(v - rr, .05) * (6 + 7 * rr) * (v > .25 && v < .88 ? 1 : 0); wo -= g; wi -= g * .8; });
        wo = Math.max(3.5, wo); wi = Math.max(3.5, wi);
        Lo.push(f1(s.x + s.nx * wo) + ',' + f1(s.y + s.ny * wo));
        Li.push(f1(s.x - s.nx * wi) + ',' + f1(s.y - s.ny * wi));
      }
      Li.reverse();
      return 'M' + Lo.join(' L') + ' L' + Li.join(' L') + ' Z';
    }
    /* waves start in the body and travel to the pylorus, deepening as they go */
    var frames = [], i;
    for (i = 0; i <= STEPS; i++) { var a = .38 + (i / STEPS) * .5, b = a - .25, rings = [a]; if (b > .3) rings.push(b); frames.push(wall(rings)); }
    frames.push(frames[0]);
    function bit(cx, cy, rad, r, dur, delay) {
      var path = 'M' + f1(cx - rad) + ',' + f1(cy) + ' a' + f1(rad) + ',' + f1(rad * .8) + ' 0 1,0 ' + f1(rad * 2) + ',0 a' + f1(rad) + ',' + f1(rad * .8) + ' 0 1,0 ' + f1(-rad * 2) + ',0';
      return '<circle r="' + f1(r) + '" fill="#B5762F" opacity=".85"><animateMotion dur="' + dur + 's" begin="' + delay + 's" repeatCount="indefinite" path="' + path + '"/>' +
        A + '"r" values="' + f1(r) + ';' + f1(r * .7) + ';' + f1(r) + '" dur="' + (dur * .6).toFixed(1) + 's" repeatCount="indefinite"/></circle>';
    }
    var c = at(.44), d = at(.54), e2 = at(.36), g2 = at(.64);
    var food = bit(c.x + c.nx * 10, c.y + c.ny * 10, 8, 2, 7, 0) + bit(d.x - d.nx * 8, d.y - d.ny * 8, 7, 1.7, 6, -2) +
               bit(e2.x + e2.nx * 6, e2.y + e2.ny * 6, 6, 1.5, 8, -4) + bit(g2.x, g2.y, 6, 1.5, 6.5, -1) +
               bit(c.x - c.nx * 14, c.y - c.ny * 14, 7, 1.4, 7.5, -3) + bit(d.x + d.nx * 16, d.y + d.ny * 16, 6, 1.3, 5.5, -5);
    var fun = at(.42), py = at(.88);
    return '<path fill="#F6E6D2" stroke="#B07E4A" stroke-width="' + f1(2.2 * u) + '" stroke-linejoin="round" d="' + frames[0] + '">' +
        A + '"d" values="' + frames.join(';') + '" dur="' + DUR + 's" repeatCount="indefinite"/></path>' +
      food +
      (ctx.compact
        ? label('wall squeezes\nin waves', fun.x + 47 + fs * .6, fun.y - fs * 1.2, fun.x + 42, fun.y, fs) +
          label('gastric juice:\nHCl + pepsin', c.x + fs * 5, c.y + fs * 4.6, c.x + fs * 2.4, c.y + fs * 1.8, fs) +
          label('chyme out', py.x - fs * 1.6, py.y + fs * 2.4, py.x - fs * .2, py.y + fs * .3, fs, 'end')
        : label('the muscular wall squeezes\nin waves towards the exit —\nthis is physical digestion', fun.x + 47 + fs * .8, fun.y - fs * 2.2, fun.x + 42, fun.y, fs) +
          label('gastric juice: hydrochloric\nacid + pepsin', c.x + fs * 5.5, c.y + fs * 5.2, c.x + fs * 2.4, c.y + fs * 2.2, fs) +
          label('chyme leaves through the\npylorus to the duodenum', py.x - fs * 2.2, py.y + fs * 2.8, py.x - fs * .2, py.y + fs * .3, fs, 'end'));
  }

  global.PlateAnim = { peristalsis:peristalsis, swallow:swallow, churn:churn };
})(window);
