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
    var DUR = 6;
    /* the bolus: on the tongue, driven back, down the pharynx behind the
       epiglottis, into the oesophagus */
    var route = [P(.29, .655), P(.37, .625), P(.44, .64), P(.505, .69), P(.545, .76), P(.548, .84), P(.548, .95), P(.548, 1.04)];
    var K = '0;0.12;0.22;0.32;0.42;0.52;0.64;0.72;1';
    var xs = route.map(function (p) { return f1(p[0]); }); xs.push(xs[xs.length - 1]);
    var ys = route.map(function (p) { return f1(p[1]); }); ys.push(ys[ys.length - 1]);
    var r = im.W * 0.015;
    var bolus = '<ellipse rx="' + f1(r * 1.25) + '" ry="' + f1(r) + '" fill="#C98A45" stroke="#8A5A2B" stroke-width="' + f1(0.7 * u) + '">' +
      A + '"cx" values="' + xs.join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(8) + '"/>' +
      A + '"cy" values="' + ys.join(';') + '" keyTimes="' + K + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(8) + '"/>' +
      A + '"opacity" values="0;1;1;1;1;1;1;0;0" keyTimes="0;0.06;0.22;0.32;0.42;0.52;0.66;0.72;1" dur="' + DUR + 's" repeatCount="indefinite"/></ellipse>';
    /* the epiglottis: a leaf hinged at its base, standing up behind the
       tongue; as the larynx rises it tips back and down over the opening of
       the windpipe, so the bolus is guided past it into the oesophagus */
    var B = P(.478, .797), T = P(.489, .752);
    var L = Math.hypot(T[0] - B[0], T[1] - B[1]), a0 = Math.atan2(T[1] - B[1], T[0] - B[0]) * 180 / Math.PI;
    L = L * 0.9; var w = L * 0.34;
    var leaf = 'M0,' + f1(-w * .45) + ' Q' + f1(L * .55) + ',' + f1(-w) + ' ' + f1(L) + ',0 Q' + f1(L * .55) + ',' + f1(w) + ' 0,' + f1(w * .45) + ' Z';
    var KT = '0;0.24;0.36;0.58;0.7;1';
    var flap = '<g transform="translate(' + f1(B[0]) + ',' + f1(B[1]) + ')">' +
      '<animateTransform attributeName="transform" type="translate" additive="sum" values="0,0;0,0;0,' + f1(-L * .18) + ';0,' + f1(-L * .18) + ';0,0;0,0" keyTimes="' + KT + '" dur="' + DUR + 's" repeatCount="indefinite"/>' +
      '<path d="' + leaf + '" fill="#F0C79F" stroke="#A9743C" stroke-width="' + f1(0.8 * u) + '" stroke-linejoin="round" transform="rotate(' + f1(a0) + ')">' +
      '<animateTransform attributeName="transform" type="rotate" values="' + f1(a0) + ';' + f1(a0) + ';' + f1(a0 + 118) + ';' + f1(a0 + 118) + ';' + f1(a0) + ';' + f1(a0) + '" keyTimes="' + KT + '" dur="' + DUR + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + ease(5) + '"/></path></g>';
    var e = P(.487, .755), tr = P(.47, .93), oe = P(.55, .93), to = P(.33, .63), ph = P(.53, .62);
    return bolus + flap +
      label('epiglottis', e[0] + im.W * .09, e[1] - fs * 1.2, e[0] + im.W * .006, e[1], fs) +
      label(ctx.compact ? 'trachea' : 'trachea (windpipe)\nto the lungs', tr[0] - im.W * .06, tr[1], tr[0], tr[1] - fs * .3, fs, 'end') +
      label(ctx.compact ? 'oesophagus' : 'oesophagus\nto the stomach', oe[0] + im.W * .07, oe[1] + fs * .3, oe[0], oe[1], fs) +
      label('bolus on the tongue', to[0] - im.W * .05, to[1] - fs * 1.2, to[0] - im.W * .02, to[1] + fs * .5, fs, 'end') +
      label('pharynx', ph[0] + im.W * .07, ph[1], ph[0], ph[1], fs);
  }

  /* ---------------- churning, on the plate's stomach ---------------- */
  function churn(ctx) {
    var fs = ctx.fs, u = ctx.u, DUR = 5.5, N = 96, STEPS = 30;
    /* one tube from the oesophagus, round the J, out to the duodenum — in
       plate coordinates, so it lies on the plate's own stomach */
    var MID = [[184,402],[187,424],[204,439],[234,437],[262,449],[279,477],[268,506],[240,517],[214,514],[197,523],[189,538]];
    function at(v) {
      var p = crPoint(MID, v), q = crPoint(MID, Math.min(1, v + 0.004));
      var dx = q[0] - p[0], dy = q[1] - p[1], Lh = Math.hypot(dx, dy) || 1;
      return { x:p[0], y:p[1], nx:dy / Lh, ny:-dx / Lh };
    }
    function prof(v, keys) {
      var i = 0; while (i < keys.length - 2 && v > keys[i + 1][0]) i++;
      var a = keys[i], b = keys[i + 1], f = (v - a[0]) / (b[0] - a[0] || 1);
      f = Math.max(0, Math.min(1, f)); f = f * f * (3 - 2 * f);
      return a[1] + (b[1] - a[1]) * f;
    }
    var OUT = [[0,4.5],[0.10,5.5],[0.22,16],[0.36,23],[0.52,21],[0.68,13],[0.80,7],[0.90,5],[1,4.5]];
    var INN = [[0,4.5],[0.10,5],[0.24,8.5],[0.42,11],[0.60,9],[0.74,6],[0.86,5],[1,4.5]];
    function wall(rings) {
      var i, v, s, wo, wi, Lo = [], Li = [];
      for (i = 0; i <= N; i++) {
        v = i / N; s = at(v); wo = prof(v, OUT); wi = prof(v, INN);
        rings.forEach(function (rr) { var g = gauss(v - rr, .045) * (5 + 5 * rr) * (v > .12 && v < .84 ? 1 : 0); wo -= g; wi -= g * .75; });
        wo = Math.max(3, wo); wi = Math.max(2.8, wi);
        Lo.push(f1(s.x + s.nx * wo) + ',' + f1(s.y + s.ny * wo));
        Li.push(f1(s.x - s.nx * wi) + ',' + f1(s.y - s.ny * wi));
      }
      Li.reverse();
      return 'M' + Lo.join(' L') + ' L' + Li.join(' L') + ' Z';
    }
    var frames = [], i;
    for (i = 0; i <= STEPS; i++) { var a = .24 + (i / STEPS) * .56, b = a - .26, rings = [a]; if (b > .18) rings.push(b); frames.push(wall(rings)); }
    frames.push(frames[0]);
    /* food, kept inside: each piece circles on a small closed path that lies
       well within the lumen, so nothing can ever sit outside the wall */
    function bit(cx, cy, rad, r, dur, delay) {
      var p = 'M' + f1(cx - rad) + ',' + f1(cy) + ' a' + f1(rad) + ',' + f1(rad * .8) + ' 0 1,0 ' + f1(rad * 2) + ',0 a' + f1(rad) + ',' + f1(rad * .8) + ' 0 1,0 ' + f1(-rad * 2) + ',0';
      return '<circle r="' + f1(r) + '" fill="#B5762F" opacity=".85"><animateMotion dur="' + dur + 's" begin="' + delay + 's" repeatCount="indefinite" path="' + p + '"/>' +
        A + '"r" values="' + f1(r) + ';' + f1(r * .7) + ';' + f1(r) + '" dur="' + (dur * .6).toFixed(1) + 's" repeatCount="indefinite"/></circle>';
    }
    var c = at(.44), d = at(.56), e2 = at(.34), g2 = at(.64);
    var food = bit(c.x + c.nx * 4, c.y + c.ny * 4, 6, 1.8, 7, 0) + bit(d.x + d.nx * 3, d.y + d.ny * 3, 5, 1.5, 6, -2) +
               bit(e2.x + e2.nx * 2, e2.y + e2.ny * 2, 4, 1.4, 8, -4) + bit(g2.x, g2.y, 3.5, 1.3, 6.5, -1) +
               bit(c.x - c.nx * 2, c.y - c.ny * 2, 4.5, 1.2, 7.5, -3) + bit(d.x + d.nx * 8, d.y + d.ny * 8, 4, 1.1, 5.5, -5);
    var fun = at(.40), py = at(.86);
    return '<path fill="#F6E6D2" stroke="#B07E4A" stroke-width="' + f1(2.2 * u) + '" stroke-linejoin="round" d="' + frames[0] + '">' +
        A + '"d" values="' + frames.join(';') + '" dur="' + DUR + 's" repeatCount="indefinite"/></path>' +
      food +
      (ctx.compact
        ? label('wall squeezes\nin waves', fun.x + fun.nx * 30 + fs * .6, fun.y - fs * 1.2, fun.x + fun.nx * 23, fun.y, fs) +
          label('gastric juice:\nHCl + pepsin', c.x + c.nx * 2 + fs * 4.5, c.y + fs * 3.6, c.x + c.nx * 2 + fs * 2.2, c.y + fs * 1.6, fs) +
          label('chyme out', py.x - fs * 1.6, py.y + fs * 2.4, py.x - fs * .2, py.y + fs * .3, fs, 'end')
        : label('the muscular wall squeezes\nin waves towards the exit —\nthis is physical digestion', fun.x + fun.nx * 30 + fs * .8, fun.y - fs * 2.2, fun.x + fun.nx * 23, fun.y, fs) +
          label('gastric juice: hydrochloric\nacid + pepsin', c.x + c.nx * 2 + fs * 6.5, c.y + fs * 4.6, c.x + c.nx * 2 + fs * 2.2, c.y + fs * 1.6, fs) +
          label('chyme leaves through the\npylorus to the duodenum', py.x - fs * 2.2, py.y + fs * 2.8, py.x - fs * .2, py.y + fs * .3, fs, 'end'));
  }

  global.PlateAnim = { peristalsis:peristalsis, swallow:swallow, churn:churn };
})(window);
