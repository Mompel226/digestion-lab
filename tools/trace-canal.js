/* trace-canal.js — TEMPORARY development tool, not shipped.
   Builds each organ's interior as a mask straight from the plate's own paths
   (isPointInFill, so it is the artwork's own geometry, never an eyeballed
   curve), then walks a centreline through it: a distance transform gives how
   deep each point sits inside the tube, and Dijkstra prefers the deepest route
   from the entry to the exit. The result is a path that stays inside the drawn
   tube by construction. Loop walls inside the small intestine are carved out
   of the mask first, using the artwork's own dark outline strokes, so the route
   follows the corridors between the coils instead of cutting across them. */
(function (global) {
  'use strict';
  var svg = document.getElementById('bodySvg');
  var STEP = 1;                              /* plate units per mask cell */

  function organPaths(organ) {
    return Array.prototype.filter.call(svg.querySelectorAll('.art .op[data-organ="' + organ + '"]'),
      function (p) { return p.tagName === 'path'; });
  }
  /* plate point -> is it inside any of these paths? (each path carries its own transform) */
  function insideTester(paths) {
    var root = svg.getScreenCTM();
    var inv = paths.map(function (p) { return p.getScreenCTM().inverse(); });
    var P = svg.createSVGPoint();
    return function (x, y) {
      var sx = root.a * x + root.c * y + root.e, sy = root.b * x + root.d * y + root.f;
      for (var i = 0; i < paths.length; i++) {
        P.x = sx; P.y = sy;
        if (paths[i].isPointInFill(P.matrixTransform(inv[i]))) return true;
      }
      return false;
    };
  }
  function bboxOf(paths) {
    var inv = svg.getScreenCTM().inverse(), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    paths.forEach(function (p) {
      var r = p.getBoundingClientRect();
      var a = svg.createSVGPoint(); a.x = r.left; a.y = r.top; a = a.matrixTransform(inv);
      var b = svg.createSVGPoint(); b.x = r.right; b.y = r.bottom; b = b.matrixTransform(inv);
      x0 = Math.min(x0, a.x); y0 = Math.min(y0, a.y); x1 = Math.max(x1, b.x); y1 = Math.max(y1, b.y);
    });
    return { x0: x0, y0: y0, x1: x1, y1: y1 };
  }
  function mask(organ, pad) {
    var paths = organPaths(organ);
    if (!paths.length) return null;
    var b = bboxOf(paths); pad = pad || 2;
    var x0 = Math.floor(b.x0 - pad), y0 = Math.floor(b.y0 - pad);
    var w = Math.ceil((b.x1 + pad - x0) / STEP), h = Math.ceil((b.y1 + pad - y0) / STEP);
    var inside = insideTester(paths), m = new Uint8Array(w * h), n = 0;
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      if (inside(x0 + i * STEP, y0 + j * STEP)) { m[j * w + i] = 1; n++; }
    }
    return { m: m, w: w, h: h, x0: x0, y0: y0, n: n, bbox: b };
  }
  /* how deep each cell sits inside the mask (chamfer 3-4, two passes) */
  function depth(M) {
    var w = M.w, h = M.h, d = new Float32Array(w * h), BIG = 1e9, i, j, k;
    for (k = 0; k < d.length; k++) d[k] = M.m[k] ? BIG : 0;
    for (j = 0; j < h; j++) for (i = 0; i < w; i++) {
      k = j * w + i; if (!M.m[k]) continue;
      var v = d[k];
      if (j > 0) v = Math.min(v, d[k - w] + 3);
      if (i > 0) v = Math.min(v, d[k - 1] + 3);
      if (j > 0 && i > 0) v = Math.min(v, d[k - w - 1] + 4);
      if (j > 0 && i < w - 1) v = Math.min(v, d[k - w + 1] + 4);
      d[k] = v;
    }
    for (j = h - 1; j >= 0; j--) for (i = w - 1; i >= 0; i--) {
      k = j * w + i; if (!M.m[k]) continue;
      var u = d[k];
      if (j < h - 1) u = Math.min(u, d[k + w] + 3);
      if (i < w - 1) u = Math.min(u, d[k + 1] + 3);
      if (j < h - 1 && i < w - 1) u = Math.min(u, d[k + w + 1] + 4);
      if (j < h - 1 && i > 0) u = Math.min(u, d[k + w - 1] + 4);
      d[k] = u;
    }
    return d;
  }
  function cellOf(M, x, y) {
    return { i: Math.round((x - M.x0) / STEP), j: Math.round((y - M.y0) / STEP) };
  }
  /* nearest mask cell to a plate point, preferring deep ones */
  function anchor(M, d, x, y, r) {
    var c = cellOf(M, x, y), best = -1, bs = -1e9;
    r = r || 26;
    for (var dj = -r; dj <= r; dj++) for (var di = -r; di <= r; di++) {
      var i = c.i + di, j = c.j + dj;
      if (i < 0 || j < 0 || i >= M.w || j >= M.h) continue;
      var k = j * M.w + i; if (!M.m[k]) continue;
      var dist = Math.hypot(di, dj);
      var score = d[k] * 0.55 - dist * 1.6;          /* deep, but near where we asked */
      if (score > bs) { bs = score; best = k; }
    }
    return best;
  }
  /* Dijkstra from a to b, cost per step = length + a penalty for hugging the wall */
  function route(M, d, a, b) {
    var w = M.w, h = M.h, N = w * h, dist = new Float64Array(N), prev = new Int32Array(N), seen = new Uint8Array(N);
    var maxD = 0, k;
    for (k = 0; k < N; k++) if (d[k] > maxD) maxD = d[k];
    for (k = 0; k < N; k++) { dist[k] = Infinity; prev[k] = -1; }
    dist[a] = 0;
    var heap = [[0, a]];
    function push(p, v) { heap.push([p, v]); var c = heap.length - 1; while (c > 0) { var par = (c - 1) >> 1; if (heap[par][0] <= heap[c][0]) break; var t = heap[par]; heap[par] = heap[c]; heap[c] = t; c = par; } }
    function pop() { var top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; var c = 0; for (;;) { var l = 2 * c + 1, r = l + 1, s = c; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === c) break; var t = heap[s]; heap[s] = heap[c]; heap[c] = t; c = s; } } return top; }
    while (heap.length) {
      var top = pop(), u = top[1];
      if (seen[u]) continue; seen[u] = 1;
      if (u === b) break;
      var ui = u % w, uj = (u - ui) / w;
      for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        var i = ui + di, j = uj + dj;
        if (i < 0 || j < 0 || i >= w || j >= h) continue;
        var v = j * w + i; if (!M.m[v] || seen[v]) continue;
        var step = (di && dj) ? 1.4142 : 1;
        var wallPen = Math.pow(1 - Math.min(1, d[v] / (maxD || 1)), 2) * 9;   /* the middle is cheap */
        var nd = dist[u] + step * (1 + wallPen);
        if (nd < dist[v]) { dist[v] = nd; prev[v] = u; push(nd, v); }
      }
    }
    if (prev[b] < 0 && b !== a) return null;
    var out = [], cur = b, guard = 0;
    while (cur >= 0 && guard++ < 200000) { var ci = cur % w, cj = (cur - ci) / w; out.push([M.x0 + ci * STEP, M.y0 + cj * STEP]); if (cur === a) break; cur = prev[cur]; }
    return out.reverse();
  }
  /* carve the artwork's own dark outline strokes out of a mask, so the coils of the
     small intestine become corridors rather than one open field */
  function carveWalls(M, opts) {
    return new Promise(function (resolve) {
      var VIEW = svg.getAttribute('viewBox').split(/\s+/).map(Number);
      var art = svg.querySelector('.art');
      var scale = 3;
      var clone = art.cloneNode(true);
      var wrap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      wrap.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      wrap.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      wrap.setAttribute('viewBox', VIEW.join(' '));
      wrap.setAttribute('width', VIEW[2] * scale); wrap.setAttribute('height', VIEW[3] * scale);
      var defs = svg.querySelector('defs'); if (defs) wrap.appendChild(defs.cloneNode(true));
      wrap.appendChild(clone);
      var svgText = new XMLSerializer().serializeToString(wrap);
      var img = new Image();
      img.onload = function () {
        var cv = document.createElement('canvas');
        cv.width = VIEW[2] * scale; cv.height = VIEW[3] * scale;
        var g = cv.getContext('2d');
        g.drawImage(img, 0, 0);
        var px;
        try { px = g.getImageData(0, 0, cv.width, cv.height).data; }
        catch (e) { resolve({ carved: 0, error: 'tainted' }); return; }
        var carved = 0;
        for (var j = 0; j < M.h; j++) for (var i = 0; i < M.w; i++) {
          var k = j * M.w + i; if (!M.m[k]) continue;
          var px0 = Math.round((M.x0 + i * STEP - VIEW[0]) * scale), py0 = Math.round((M.y0 + j * STEP - VIEW[1]) * scale);
          var dark = 0, tot = 0;
          for (var sy = 0; sy < scale; sy++) for (var sx = 0; sx < scale; sx++) {
            var o = ((py0 + sy) * cv.width + (px0 + sx)) * 4;
            if (o < 0 || o + 2 >= px.length) continue;
            var r = px[o], gg = px[o + 1], b = px[o + 2];
            tot++;
            /* the loop outlines are a dark red line; the fill is pale salmon */
            if (r < opts.rMax && gg < opts.gMax && b < opts.bMax) dark++;
          }
          if (tot && dark / tot >= opts.frac) { M.m[k] = 0; carved++; }
        }
        resolve({ carved: carved });
      };
      img.onerror = function () { resolve({ carved: 0, error: 'load' }); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
    });
  }
  /* carve the organ's own outline strokes out of its mask: the loops of the small intestine are
     drawn as strokes, so the cells under them become walls and the route has to use the corridors */
  function carveStroke(M, organ, widen) {
    var paths = organPaths(organ), root = svg.getScreenCTM();
    var inv = paths.map(function (p) { return p.getScreenCTM().inverse(); });
    var oldW = paths.map(function (p) { return p.style.strokeWidth; });
    if (widen) paths.forEach(function (p) {
      var w = parseFloat(getComputedStyle(p).strokeWidth) || 1;
      p.style.strokeWidth = (w * widen) + '';
    });
    var P = svg.createSVGPoint(), carved = 0;
    for (var j = 0; j < M.h; j++) for (var i = 0; i < M.w; i++) {
      var k = j * M.w + i; if (!M.m[k]) continue;
      var x = M.x0 + i * STEP, y = M.y0 + j * STEP;
      var sx = root.a * x + root.c * y + root.e, sy = root.b * x + root.d * y + root.f;
      for (var q = 0; q < paths.length; q++) {
        P.x = sx; P.y = sy;
        if (paths[q].isPointInStroke(P.matrixTransform(inv[q]))) { M.m[k] = 0; carved++; break; }
      }
    }
    paths.forEach(function (p, n) { p.style.strokeWidth = oldW[n]; });
    return carved;
  }

  function simplify(pts, tol) {
    if (pts.length < 3) return pts;
    var keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
    (function rec(a, b) {
      if (b <= a + 1) return;
      var ax = pts[a][0], ay = pts[a][1], bx = pts[b][0], by = pts[b][1];
      var dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, worst = -1, wi = -1;
      for (var i = a + 1; i < b; i++) {
        var t = ((pts[i][0] - ax) * dx + (pts[i][1] - ay) * dy) / L2;
        t = Math.max(0, Math.min(1, t));
        var px = ax + t * dx - pts[i][0], py = ay + t * dy - pts[i][1];
        var dd = px * px + py * py;
        if (dd > worst) { worst = dd; wi = i; }
      }
      if (worst > tol * tol) { keep[wi] = 1; rec(a, wi); rec(wi, b); }
    })(0, pts.length - 1);
    var out = []; for (var i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
    return out;
  }
  function smooth(pts, passes) {
    for (var p = 0; p < (passes || 2); p++) {
      var out = [pts[0]];
      for (var i = 1; i < pts.length - 1; i++) out.push([(pts[i - 1][0] + 2 * pts[i][0] + pts[i + 1][0]) / 4, (pts[i - 1][1] + 2 * pts[i][1] + pts[i + 1][1]) / 4]);
      out.push(pts[pts.length - 1]); pts = out;
    }
    return pts;
  }

  /* rasterise the artwork once and report the commonest colours in a region, so the
     wall-carving thresholds are measured rather than guessed */
  function raster() {
    if (global.__raster) return Promise.resolve(global.__raster);
    var VIEW = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    var art = svg.querySelector('.art'), scale = 3;
    var wrap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    wrap.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    wrap.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    /* the artwork came from Inkscape and still carries its editor attributes; an <img> parses
       the serialised SVG as strict XML, so an undeclared prefix fails the load outright */
    wrap.setAttribute('xmlns:inkscape', 'http://www.inkscape.org/namespaces/inkscape');
    wrap.setAttribute('xmlns:sodipodi', 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.0.dtd');
    wrap.setAttribute('viewBox', VIEW.join(' '));
    wrap.setAttribute('width', VIEW[2] * scale); wrap.setAttribute('height', VIEW[3] * scale);
    var defs = svg.querySelector('defs'); if (defs) wrap.appendChild(defs.cloneNode(true));
    wrap.appendChild(art.cloneNode(true));
    var txt = new XMLSerializer().serializeToString(wrap);
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        var cv = document.createElement('canvas');
        cv.width = VIEW[2] * scale; cv.height = VIEW[3] * scale;
        var g = cv.getContext('2d'); g.drawImage(img, 0, 0);
        var px; try { px = g.getImageData(0, 0, cv.width, cv.height).data; } catch (e) { resolve({ error: 'tainted' }); return; }
        global.__raster = { px: px, w: cv.width, h: cv.height, scale: scale, VIEW: VIEW };
        resolve(global.__raster);
      };
      img.onerror = function () { resolve({ error: 'load' }); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt);
    });
  }
  function colourAt(R, x, y) {
    var cx = Math.round((x - R.VIEW[0]) * R.scale), cy = Math.round((y - R.VIEW[1]) * R.scale);
    var o = (cy * R.w + cx) * 4;
    return [R.px[o], R.px[o + 1], R.px[o + 2], R.px[o + 3]];
  }
  function probe(x0, y0, x1, y1) {
    return raster().then(function (R) {
      if (R.error) return R;
      var hist = {};
      for (var y = y0; y < y1; y++) for (var x = x0; x < x1; x++) {
        var c = colourAt(R, x, y); if (c[3] < 200) continue;
        var k = (Math.round(c[0] / 24) * 24) + ',' + (Math.round(c[1] / 24) * 24) + ',' + (Math.round(c[2] / 24) * 24);
        hist[k] = (hist[k] || 0) + 1;
      }
      return Object.keys(hist).sort(function (a, b) { return hist[b] - hist[a]; }).slice(0, 12)
        .map(function (k) { return k + ' x' + hist[k]; });
    });
  }

  /* the whole meal's route, leg by leg, with short bridges where one organ hands over to the
     next, then a check that every sampled point really is inside the artwork */
  function assemble() {
    var LEGS = [
      { organ: 'mouth',       from: [104, 126], to: [158, 180] },
      { organ: 'oesophagus',  from: [178, 188], to: [180, 424] },
      /* the stomach in three hops so the food enters at the cardia, swings round the body and
         leaves at the pylorus, instead of cutting the sac in a straight line; r keeps each
         anchor where it was asked for rather than letting it slide to the deepest cell */
      { organ: 'stomach',     from: [200, 462], to: [240, 486], carveStroke: 1.2, r: 10 },
      { organ: 'stomach',     from: [240, 486], to: [176, 516], carveStroke: 1.2, r: 10 },
      { organ: 'stomach',     from: [170, 515], to: [186, 592], carveStroke: 1.4 },
      { organ: 'ileum-villi', from: [188, 594], to: [112, 686], carveStroke: 1.6 },
      { organ: 'colon',       from: [106, 700], to: [178, 758] }
    ];
    var out = [], report = [], bounds = [];
    return LEGS.reduce(function (chain, L) {
      return chain.then(function () {
        return leg(L.organ, L.from, L.to, { tol: 1.0, smooth: 1, carveStroke: L.carveStroke, r: L.r });
      }).then(function (res) {
        if (res.error) { report.push(L.organ + ': ' + res.error); return; }
        report.push(L.organ + ': ' + res.pts.length + ' pts' + (res.carved ? ', ' + res.carved + ' wall cells carved' : ''));
        var start = out.length;
        res.pts.forEach(function (p) {
          if (!out.length || Math.hypot(p[0] - out[out.length - 1][0], p[1] - out[out.length - 1][1]) > 0.8) out.push(p);
        });
        bounds.push({ organ: L.organ, from: start ? start - 1 : 0, to: out.length - 1 });
      });
    }, Promise.resolve()).then(function () {
      out.push([176, 782]); out.push([176, 800]);          /* rectum and anus: a short straight run */
      out = smooth(out, 1);
      /* validation: is every point of the finished route inside the artwork's own organs? */
      var organs = ['mouth', 'epiglottis', 'oesophagus', 'stomach', 'ileum-villi', 'colon', 'rectum-anus', 'salivary-glands'];
      var tests = organs.map(function (o) { var ps = organPaths(o); return ps.length ? insideTester(ps) : null; }).filter(Boolean);
      var bad = [], n = 0;
      for (var i = 0; i < out.length - 1; i++) {
        for (var t = 0; t < 1; t += 0.25) {
          var x = out[i][0] + (out[i + 1][0] - out[i][0]) * t, y = out[i][1] + (out[i + 1][1] - out[i][1]) * t;
          n++;
          var ok = tests.some(function (f) { return f(x, y); });
          if (!ok) bad.push([Math.round(x), Math.round(y)]);
        }
      }
      var d = 'M' + out[0].map(f1).join(',');
      for (var k = 0; k < out.length - 1; k++) {
        var p0 = out[Math.max(0, k - 1)], p1 = out[k], p2 = out[k + 1], p3 = out[Math.min(out.length - 1, k + 2)];
        d += ' C' + f1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + f1(p1[1] + (p2[1] - p0[1]) / 6) +
             ' ' + f1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + f1(p2[1] - (p3[1] - p1[1]) / 6) +
             ' ' + f1(p2[0]) + ',' + f1(p2[1]);
      }
      /* fractions along the finished route, by arc length, so the stations and the tour scenes
         can be pinned to real places on it rather than to guessed numbers */
      var cum = [0], total = 0;
      for (var q = 1; q < out.length; q++) { total += Math.hypot(out[q][0] - out[q - 1][0], out[q][1] - out[q - 1][1]); cum.push(total); }
      var at = function (i) { return Math.round((cum[Math.min(i, cum.length - 1)] / total) * 1000) / 1000; };
      var mid = function (b, f) { return at(Math.round(b.from + (b.to - b.from) * f)); };
      var B = {}; bounds.forEach(function (b, i) { B[i] = b; });
      var MARKS = {
        mouth: mid(B[0], 0.35), pharynx: at(B[0].to), oesophagus: mid(B[1], 0.5),
        cardia: at(B[2].from), stomach: mid(B[2], 0.9), pylorus: at(B[3].to),
        duodenum: mid(B[4], 0.55), jejunum: mid(B[5], 0.12), ileum: mid(B[5], 0.82),
        caecum: at(B[5].to), colon: mid(B[6], 0.45), sigmoid: mid(B[6], 0.93), anus: 1
      };
      global.__canal = { d: d, pts: out, marks: MARKS };
      return { legs: report, points: out.length, sampled: n, outside: bad.length,
               worst: bad.slice(0, 12), marks: MARKS,
               flat: out.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' ') };
    });
  }
  function f1(v) { return Math.round(v * 10) / 10; }
  /* draw the finished route over the plate, to be looked at */
  function show(colour) {
    var old = document.getElementById('dbgCanal'); if (old) old.remove();
    if (!global.__canal) return 'no canal yet';
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.id = 'dbgCanal'; p.setAttribute('d', global.__canal.d);
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', colour || '#1240FF');
    p.setAttribute('stroke-width', '2'); p.setAttribute('opacity', '.95'); p.setAttribute('pointer-events', 'none');
    svg.appendChild(p);
    return 'drawn';
  }

  global.__trace = {
    assemble: assemble, show: show,
    mask: mask, depth: depth, anchor: anchor, route: route, carveWalls: carveWalls, carveStroke: carveStroke,
    raster: raster, probe: probe, colourAt: colourAt,
    simplify: simplify, smooth: smooth, cellOf: cellOf,
    leg: leg
  };
  function leg(organ, from, to, opts) {
      opts = opts || {};
      var M = mask(organ, opts.pad);
      if (!M) return Promise.resolve({ error: 'no paths for ' + organ });
      var pre = 0;
      if (opts.carveStroke) pre = carveStroke(M, organ, opts.carveStroke);
      var go = opts.carve ? carveWalls(M, opts.carve) : Promise.resolve({ carved: 0 });
      return go.then(function (info) {
        var d = depth(M);
        var a = anchor(M, d, from[0], from[1], opts.r), b = anchor(M, d, to[0], to[1], opts.r);
        if (a < 0 || b < 0) return { error: 'no anchor in ' + organ, mask: { w: M.w, h: M.h, n: M.n, x0: M.x0, y0: M.y0 } };
        var pts = route(M, d, a, b);
        if (!pts) return { error: 'no route in ' + organ };
        return { organ: organ, pts: smooth(simplify(pts, opts.tol || 1.2), opts.smooth == null ? 2 : opts.smooth),
                 raw: pts.length, carved: info.carved + pre, carveError: info.error,
                 mask: { w: M.w, h: M.h, n: M.n, x0: M.x0, y0: M.y0 } };
      });
  }
  return 'trace ready';
})(window);
