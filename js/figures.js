/* ============================================================
   figures.js — animated SVG diagrams for the "See it" tab.
   Each figure returns an SVG string; label positions are fixed
   and hand-checked so nothing overlaps at any width.
   ============================================================ */
(function (global) {
  'use strict';

  function svg(vb, inner, cls, hide) {
    return '<svg class="figbox__stage ' + (cls || '') + '" viewBox="' + vb + '" ' +
           (hide && hide.length ? 'data-hide="' + hide.join(',') + '" ' : '') +
           'preserveAspectRatio="xMidYMid meet" role="img">' +
           '<style>' +
           '.fl{font:600 12px Calibri,Carlito,sans-serif;fill:#1A1A1A}' +
           '.fs{font:500 10.5px Calibri,Carlito,sans-serif;fill:#6B6B6B}' +
           '.fb{font:700 13px Calibri,Carlito,sans-serif;fill:#14572B}' +
           '.ld{stroke:#9C8E77;stroke-width:1;fill:none}' +
           /* NOTE: these classes set fill, and a CSS rule beats a presentation
              attribute. To recolour one of these labels use style="fill:…",
              never fill="…" — the attribute is silently ignored. */
           '</style>' + inner + '</svg>';
  }
  var A = '<animate attributeName=';

  /* Arrows, in one place and one size.

     SVG scales a marker by the line's stroke width unless told otherwise —
     markerUnits defaults to strokeWidth — so a 9-unit head on a 2.5-wide line
     was drawn 22 units long. That is why every arrowhead in here looked
     oversized. userSpaceOnUse pins the head to the figure's own coordinates,
     so it is the same modest size whatever the line weight. */
  function arrowDefs(id, colour) {
    return '<defs><marker id="' + id + '" markerUnits="userSpaceOnUse" ' +
           'markerWidth="9" markerHeight="7" refX="8.6" refY="3.5" orient="auto">' +
           '<path d="M0,0 L9,3.5 L0,7 Z" fill="' + colour + '"/></marker></defs>';
  }
  function arrow(id, colour, d, width) {
    return '<path d="' + d + '" stroke="' + colour + '" stroke-width="' + (width || 2.2) +
           '" fill="none" stroke-linecap="round" marker-end="url(#' + id + ')"/>';
  }


  /* ---------------------------------------------------------------
     Muscle movement, done by morphing the wall itself.

     A tube is drawn by sampling its half-width down its length. Where
     the bolus is, the wall bulges; just behind it the circular muscle
     squeezes the wall in; just ahead the wall relaxes open to receive
     it. Advancing that pattern one step at a time gives a set of
     keyframes, and SMIL interpolates between them — so what you see is
     the wall itself moving, the way a real gut does, not a blob sliding
     down a fixed pipe.

     Easing is a slow-in/slow-out spline: real muscle does not move at
     constant speed.
     --------------------------------------------------------------- */
  function gauss(x, s) { return Math.exp(-(x * x) / (2 * s * s)); }

  /* One frame of a vertical tube. cx = centre line, y0..y1 = extent. */
  function tubeFrame(o, bolusY) {
    var n = 46, left = [], right = [], i, y, w;
    for (i = 0; i <= n; i++) {
      y = o.y0 + (o.y1 - o.y0) * (i / n);
      w = o.w
        + o.bulge   * gauss(y - bolusY, o.sBulge)              /* the bolus stretches the wall */
        - o.squeeze * gauss(y - (bolusY - o.behind), o.sSq)    /* circular muscle grips behind it */
        + o.open    * gauss(y - (bolusY + o.ahead), o.sOpen);  /* the tube relaxes open in front */
      w = Math.max(2.5, w);
      left.push([(o.cx - w).toFixed(1), y.toFixed(1)]);
      right.push([(o.cx + w).toFixed(1), y.toFixed(1)]);
    }
    right.reverse();
    return 'M' + left.map(function (p) { return p.join(','); }).join(' L') +
           ' L' + right.map(function (p) { return p.join(','); }).join(' L') + ' Z';
  }

  /* A whole travelling wave, as a semicolon-separated list of frames. */
  function tubeFrames(o, from, to, steps) {
    var out = [], i;
    for (i = 0; i <= steps; i++) out.push(tubeFrame(o, from + (to - from) * (i / steps)));
    return out.join(';');
  }
  function bolusFrames(from, to, steps, key) {
    var out = [], i;
    for (i = 0; i <= steps; i++) out.push((from + (to - from) * (i / steps)).toFixed(1));
    return out.join(';');
  }
  /* slow in, slow out — one spline per gap between frames */
  function ease(steps) {
    var s = [], i;
    for (i = 0; i < steps; i++) s.push('0.42 0 0.58 1');
    return s.join(';');
  }


  /* ---------------------------------------------------------------
     plateFig — draws a public-domain anatomical plate and puts our own
     labels around it. Labels in a column are pushed apart so two of
     them can never overlap, and the leader lines are drawn by us, so
     nothing depends on the source file's own label placement.
     --------------------------------------------------------------- */
  function layout(items, minGap, top, bottom) {
    if (!items.length) return items;
    items.sort(function (a, b) { return a.y - b.y; });
    var i, n = items.length;
    for (i = 1; i < n; i++)
      if (items[i].y - items[i - 1].y < minGap) items[i].y = items[i - 1].y + minGap;
    var over = items[n - 1].y - bottom;
    if (over > 0) for (i = n - 1; i >= 0; i--) items[i].y -= over;
    if (items[0].y < top) { var d = top - items[0].y; for (i = 0; i < n; i++) items[i].y += d; }
    for (i = 1; i < n; i++)
      if (items[i].y - items[i - 1].y < minGap) items[i].y = items[i - 1].y + minGap;
    return items;
  }

  function plateFig(art, o) {
    var hide = (o.hide || []).map(Number);
    var body = '<g class="plate">' + art.svg + '</g>';

    var out = '';
    ['left', 'right'].forEach(function (side) {
      var col = (o.labels || []).filter(function (l) { return l.side === side; })
                                .map(function (l) { return { l:l, y:l.ly }; });
      layout(col, o.minGap || 24, o.top || 12, o.bottom || 400).forEach(function (it) {
        var l = it.l,
            tx = side === 'left' ? o.leftX : o.rightX,
            gx = side === 'left' ? tx + 6 : tx - 6,
            ax = l.at[0], ay = l.at[1], mid = (gx + ax) / 2;
        out += '<path class="ld" d="M' + gx + ',' + it.y + ' C' + mid + ',' + it.y + ' ' +
               mid + ',' + ay + ' ' + ax + ',' + ay + '"/>' +
               '<circle cx="' + ax + '" cy="' + ay + '" r="2.8" fill="#7E7259"/>' +
               '<text class="fl" x="' + tx + '" y="' + (it.y + 4.6) + '" text-anchor="' +
               (side === 'left' ? 'end' : 'start') + '">' + l.text + '</text>' +
               (l.sub ? '<text class="fs" x="' + tx + '" y="' + (it.y + 18) + '" text-anchor="' +
                        (side === 'left' ? 'end' : 'start') + '">' + l.sub + '</text>' : '');
      });
    });
    (o.brackets || []).forEach(function (b) {
      var x = b.x, y0 = b.y0, y1 = b.y1, t = b.tick || 9;
      out += '<path class="ld" d="M' + (x + t) + ',' + y0 + ' L' + x + ',' + y0 +
             ' L' + x + ',' + y1 + ' L' + (x + t) + ',' + y1 + '"/>' +
             '<text class="fl" x="' + (x - 8) + '" y="' + ((y0 + y1) / 2 + 4.6) + '" text-anchor="end">' + b.text + '</text>';
    });
    if (o.note)
      out += '<text class="fs" x="' + o.note[0] + '" y="' + o.note[1] + '"' +
             (o.note[3] ? ' text-anchor="' + o.note[3] + '"' : '') + '>' + o.note[2] + '</text>';
    return svg(o.viewBox, body + out, null, hide);
  }


  /* ---------------- physical digestion: surface area ---------------- */
  /* An enzyme, drawn as a mouth that has to reach the food: a disc with a
     wedge cut out of it, turned to face the piece it is working on. Drawn
     rather than described because the whole argument is a counting argument
     — the reader is meant to count them. */
  function pac(cx, cy, r, faceDeg) {
    var rad = Math.PI / 180, a1 = (faceDeg + 34) * rad, a2 = (faceDeg - 34) * rad;
    return '<path d="M' + (cx + r * Math.cos(a1)).toFixed(1) + ',' + (cy + r * Math.sin(a1)).toFixed(1) +
           ' A' + r + ',' + r + ' 0 1,1 ' + (cx + r * Math.cos(a2)).toFixed(1) + ',' +
           (cy + r * Math.sin(a2)).toFixed(1) + ' L' + cx + ',' + cy + ' Z" ' +
           'fill="#0F6E8C" opacity=".92"/>';
  }

  function chewing() {
    /* The numbers have to survive being checked, because a reader can count
       them. One 72-unit square has a perimeter of 288. Cut it into four
       36-unit squares and the mass is identical — 4 x 1296 = 5184 — while the
       perimeter doubles to 576. Space the enzymes evenly along the edge and
       their number doubles too, 16 to 32. Every figure on the page agrees
       with every other one. (The previous version drew sixteen pieces and
       claimed twice the area; sixteen pieces is four times, not twice.) */
    var R = 4.6, OFF = 13, STEP = 18;

    function block(x0, y0, s) {
      var out = '<rect x="' + x0 + '" y="' + y0 + '" width="' + s + '" height="' + s +
                '" rx="' + (s > 50 ? 9 : 5) + '" fill="#E8B98A" stroke="#B07E4A" stroke-width="2"/>';
      var n = Math.round(s / STEP), i, t;
      for (i = 0; i < n; i++) {
        t = x0 + STEP / 2 + i * (s / n);
        out += pac(t, y0 - OFF, R, 90);            /* above, facing down  */
        out += pac(t, y0 + s + OFF, R, -90);       /* below, facing up    */
        t = y0 + STEP / 2 + i * (s / n);
        out += pac(x0 - OFF, t, R, 0);             /* left,  facing right */
        out += pac(x0 + s + OFF, t, R, 180);       /* right, facing left  */
      }
      return { svg:out, count:n * 4 };
    }

    var one = block(79, 70, 72);
    var four = [block(255, 70, 36), block(335, 70, 36), block(255, 150, 36), block(335, 150, 36)];
    var manySvg = four.map(function (b) { return b.svg; }).join('');
    var manyN = four.reduce(function (a, b) { return a + b.count; }, 0);

    return {
      svg: svg('0 0 460 292',
        '<text class="fb" x="115" y="28" text-anchor="middle">One large piece</text>' +
        '<text class="fb" x="317" y="28" text-anchor="middle">Four smaller pieces</text>' +
        one.svg + manySvg +
        arrowDefs('ar', '#14572B') + arrow('ar', '#14572B', 'M186,126 L228,126', 2.4) +
        '<text class="fs" x="207" y="112" text-anchor="middle">teeth</text>' +
        '<text class="fs" x="115" y="232" text-anchor="middle">same food: 72 &#215; 72</text>' +
        '<text class="fs" x="317" y="232" text-anchor="middle">same food: 4 &#215; (36 &#215; 36)</text>' +
        '<text class="fb" x="115" y="252" text-anchor="middle" style="fill:#0F6E8C">' + one.count + ' enzymes fit round it</text>' +
        '<text class="fb" x="317" y="252" text-anchor="middle" style="fill:#0F6E8C">' + manyN + ' enzymes fit</text>' +
        '<text class="fl" x="230" y="278" text-anchor="middle">Same amount of food. Twice the edge, so twice as many enzymes work at once.</text>'),
      cap:'<b>Physical digestion increases surface area.</b> The mass of food does not change &#8212; both sides here are the same amount of food. What changes is how much <i>edge</i> there is for enzymes to attach to, and you can count it: ' + one.count + ' enzymes fit around the whole piece, ' + manyN + ' around the four smaller ones. That is the whole point of chewing.'
    };
  }

  /* ---------------- tooth cross-section ---------------- */
  function tooth() {
    var art = (global.FIGURE_ART || {}).tooth;
    if (!art) return { svg:'', cap:'' };
    return {
      svg: plateFig(art, {
        viewBox:'-132 44 660 602', leftX:-14, rightX:384, minGap:26, top:66, bottom:598,
        /* the plate's own leader lines and brackets are hidden: we draw our own,
           so the labels are laid out by us and cannot collide */
        hide:[55,56,57,58,59,60,61,62,68,69,70,71],
        labels:[
          { side:'right', ly:116, at:[281,116], text:'Enamel',  sub:'hardest substance in the body' },
          { side:'right', ly:172, at:[260,167], text:'Dentine', sub:'softer, and it senses pain' },
          { side:'right', ly:224, at:[203,214], text:'Pulp cavity' },
          { side:'right', ly:262, at:[323,236], text:'Gum' },
          { side:'right', ly:330, at:[279,400], text:'Cement',  sub:'thin layer on the root surface' },
          { side:'right', ly:436, at:[308,435], text:'Jaw bone' },
          { side:'right', ly:520, at:[290,560], text:'Blood vessel' },
          { side:'right', ly:576, at:[290,570], text:'Nerve' }
        ],
        brackets:[
          { x:26, y0:62,  y1:262, text:'Crown' },
          { x:26, y0:274, y1:556, text:'Root' }
        ],
        note:[190, 632, 'The pulp holds the blood vessels and nerves — which is why a deep cavity hurts.', 'middle']
      }),
      cap:'<b>Enamel</b> is the hardest substance in the body and protects the tooth. <b>Dentine</b> lies beneath it and can sense pain. The <b>pulp cavity</b> holds the blood vessels and nerves. <b>Cement</b> and the periodontal fibres anchor the root in the jaw bone.'
    };
  }

  /* ---------------- four tooth types ---------------- */

  /* ---------------- peristalsis ---------------- */
  function peristalsis() {
    var TUBE = { cx:150, y0:24, y1:268, w:25, bulge:15, sBulge:15,
                 squeeze:17, behind:34, sSq:15, open:7, ahead:44, sOpen:20 };
    var STEPS = 22, DUR = '4.4s';
    var wallD = tubeFrames(TUBE, 10, 288, STEPS);
    var by    = bolusFrames(10, 288, STEPS);

    /* the muscle layers, drawn as short marks that thicken where they contract */
    var marks = '';
    for (var k = 0; k < 13; k++) {
      var y = 34 + k * 18;
      marks += '<g>' +
        '<line x1="' + (TUBE.cx - 44) + '" y1="' + y + '" x2="' + (TUBE.cx - 30) + '" y2="' + y +
        '" stroke="#B4614A" stroke-width="3" stroke-linecap="round" opacity=".35">' +
        A + '"opacity" values=".3;1;.3" dur="' + DUR + '" begin="' + (-4.4 + k * 0.32) + 's" repeatCount="indefinite"/>' +
        A + '"stroke-width" values="3;6;3" dur="' + DUR + '" begin="' + (-4.4 + k * 0.32) + 's" repeatCount="indefinite"/></line>' +
        '<line x1="' + (TUBE.cx + 30) + '" y1="' + y + '" x2="' + (TUBE.cx + 44) + '" y2="' + y +
        '" stroke="#B4614A" stroke-width="3" stroke-linecap="round" opacity=".35">' +
        A + '"opacity" values=".3;1;.3" dur="' + DUR + '" begin="' + (-4.4 + k * 0.32) + 's" repeatCount="indefinite"/>' +
        A + '"stroke-width" values="3;6;3" dur="' + DUR + '" begin="' + (-4.4 + k * 0.32) + 's" repeatCount="indefinite"/></line>' +
        '</g>';
    }

    return {
      svg: svg('-4 8 452 292',
        marks +
        /* the wall itself deforms — that is the whole point */
        '<path fill="#F6E3DD" stroke="#C4776A" stroke-width="2.6" stroke-linejoin="round" d="' +
          tubeFrame(TUBE, 10) + '">' +
          A + '"d" values="' + wallD + '" dur="' + DUR + '" repeatCount="indefinite" ' +
          'calcMode="spline" keySplines="' + ease(STEPS) + '"/></path>' +
        /* the bolus, squashed by the grip behind it */
        '<ellipse cx="150" cy="10" rx="21" ry="17" fill="#E8A33D" stroke="#A96B18" stroke-width="2">' +
          A + '"cy" values="' + by + '" dur="' + DUR + '" repeatCount="indefinite" ' +
          'calcMode="spline" keySplines="' + ease(STEPS) + '"/>' +
          A + '"ry" values="17;20;16;20;17" dur="' + DUR + '" repeatCount="indefinite"/>' +
          A + '"rx" values="21;19;22;19;21" dur="' + DUR + '" repeatCount="indefinite"/></ellipse>' +
        '<text class="fs" x="150" y="20" text-anchor="middle">from the mouth</text>' +
        '<text class="fs" x="150" y="286" text-anchor="middle">to the stomach</text>' +
        /* labels */
        '<g class="fl">' +
        '<path class="ld" d="M300,86 L196,104"/><text x="304" y="90">Circular muscle</text>' +
        '<text class="fs" x="304" y="104">contracts <tspan font-weight="700">behind</tspan> the bolus</text>' +
        '<text class="fs" x="304" y="117">and squeezes it forward</text>' +
        '<path class="ld" d="M300,166 L182,158"/><text x="304" y="170">The bolus</text>' +
        '<text class="fs" x="304" y="184">a ball of chewed food</text>' +
        '<path class="ld" d="M300,228 L188,214"/><text x="304" y="232">The tube ahead relaxes</text>' +
        '<text class="fs" x="304" y="246">opening to receive it</text>' +
        '</g>'),
      cap:'<b>Peristalsis.</b> Watch the wall, not the food. Circular muscle contracts <b>behind</b> the bolus and the tube relaxes <b>in front</b> of it, and that travelling wave squeezes the food along. It happens the whole way from oesophagus to rectum, and it works even lying down — which is why you can swallow upside down. Fibre gives the muscle bulk to grip.'
    };
  }

  /* ---------------- emulsification (animated) ---------------- */
  function emulsify() {
    var CYCLE = '9s';
    /* a bile salt: one water-liking head, one fat-liking tail */
    function salt(x, y, rot, delay) {
      return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')" opacity="0">' +
             '<line x1="0" y1="0" x2="0" y2="9" stroke="#4E7D4A" stroke-width="2.2" stroke-linecap="round"/>' +
             '<circle cx="0" cy="0" r="3.6" fill="#6FA36B" stroke="#3F6B3C" stroke-width="1"/>' +
             A + '"opacity" values="0;1;1;1" keyTimes="0;0.18;0.9;1" dur="' + CYCLE +
             '" begin="' + delay + '" repeatCount="indefinite"/></g>';
    }
    /* bile salts arriving and settling on the big droplet's surface */
    var arriving = '';
    for (var i = 0; i < 10; i++) {
      var a = (i / 10) * Math.PI * 2;
      var sx = (96 + Math.cos(a) * 52).toFixed(1), sy = (104 + Math.sin(a) * 52).toFixed(1);
      var fx = (96 + Math.cos(a) * 150).toFixed(1), fy = (104 + Math.sin(a) * 150).toFixed(1);
      var deg = (a * 180 / Math.PI + 90).toFixed(0);
      arriving +=
        '<g opacity="0">' +
        '<g transform="translate(' + fx + ',' + fy + ')">' +
        '<animateTransform attributeName="transform" type="translate" ' +
        'values="' + fx + ',' + fy + ';' + sx + ',' + sy + ';' + sx + ',' + sy + ';' + fx + ',' + fy + '" ' +
        'keyTimes="0;0.24;0.5;1" dur="' + CYCLE + '" repeatCount="indefinite"/>' +
        '<g transform="rotate(' + deg + ')">' +
        '<line x1="0" y1="0" x2="0" y2="10" stroke="#4E7D4A" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="0" cy="0" r="3.8" fill="#6FA36B" stroke="#3F6B3C" stroke-width="1"/></g></g>' +
        A + '"opacity" values="0;1;1;0;0" keyTimes="0;0.12;0.46;0.56;1" dur="' + CYCLE + '" repeatCount="indefinite"/>' +
        '</g>';
    }
    /* the small droplets it becomes, each already coated */
    var small = '', pos = [[262,66],[318,58],[368,74],[252,112],[306,104],[362,116],
                           [274,152],[330,148],[382,150],[300,182]];
    pos.forEach(function (pt, k) {
      var coats = '';
      for (var j = 0; j < 6; j++) {
        var b = (j / 6) * Math.PI * 2;
        coats += '<g transform="translate(' + (Math.cos(b) * 13).toFixed(1) + ',' + (Math.sin(b) * 13).toFixed(1) +
                 ') rotate(' + (b * 180 / Math.PI + 90).toFixed(0) + ')">' +
                 '<line x1="0" y1="0" x2="0" y2="6" stroke="#4E7D4A" stroke-width="1.7" stroke-linecap="round"/>' +
                 '<circle cx="0" cy="0" r="2.6" fill="#6FA36B"/></g>';
      }
      small += '<g transform="translate(' + pt[0] + ',' + pt[1] + ')" opacity="0">' +
               '<circle r="13" fill="#F2C14E" stroke="#B98A16" stroke-width="1.5"/>' + coats +
               A + '"opacity" values="0;0;1;1;0" keyTimes="0;0.52;0.62;0.92;1" dur="' + CYCLE +
               '" begin="' + (k * 0.03) + 's" repeatCount="indefinite"/></g>';
    });

    return {
      svg: svg('-6 0 470 276',
        '<text class="fs" x="96" y="20" text-anchor="middle">one large fat droplet</text>' +
        '<text class="fs" x="320" y="20" text-anchor="middle">many small droplets</text>' +
        /* the droplet: intact, then squeezed apart */
        '<g><circle cx="96" cy="104" r="46" fill="#F2C14E" stroke="#B98A16" stroke-width="2">' +
        A + '"r" values="46;46;46;10;10" keyTimes="0;0.24;0.5;0.62;1" dur="' + CYCLE + '" repeatCount="indefinite"/>' +
        A + '"opacity" values="1;1;1;0;0" keyTimes="0;0.5;0.56;0.62;1" dur="' + CYCLE + '" repeatCount="indefinite"/>' +
        '</circle></g>' +
        arriving + small +
        /* the arrow and its label only appear while the splitting happens */
        '<g opacity="0">' +
        arrow('arB', '#4E7D4A', 'M160,104 L214,104', 2.6) +
        '<text class="fb" x="187" y="92" text-anchor="middle" style="fill:#4E7D4A">bile</text>' +
        A + '"opacity" values="0;0;1;1;0" keyTimes="0;0.4;0.5;0.92;1" dur="' + CYCLE + '" repeatCount="indefinite"/></g>' +
        arrowDefs('arB', '#4E7D4A') +
        /* what a bile salt is */
        '<g transform="translate(24,214)">' +
        '<line x1="0" y1="0" x2="0" y2="11" stroke="#4E7D4A" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="0" cy="0" r="4" fill="#6FA36B" stroke="#3F6B3C" stroke-width="1"/></g>' +
        '<text class="fs" x="38" y="218">a bile salt (bile is not an enzyme)</text>' +
        '<text class="fl" x="228" y="250" text-anchor="middle">Same amount of fat. Far more surface for <tspan class="fb" style="fill:#BC235B">lipase</tspan> to work on.</text>' +
        '<text class="fs" x="228" y="265" text-anchor="middle">No bonds are broken here — this is <tspan font-weight="700">physical</tspan>, not chemical.</text>'),
      cap:'<b>Emulsification.</b> Bile salts crowd onto the surface of a large fat droplet, and the churning of the gut then breaks it into many small ones that cannot re-join, because each is coated. Bile is <b>not</b> an enzyme: the fat molecules are unchanged, there is simply far more surface for lipase to attack. Bile is also alkaline, so it neutralises the acid arriving from the stomach.'
    };
  }

  /* ---------------- villus ---------------- */
  function villus() {
    var art = (global.FIGURE_ART || {}).villus;
    if (!art) return { svg:'', cap:'' };
    /* molecules moving out of the lumen and into the blood and the lacteal */
    function mol(x, y, dx, dy, fill, dur, delay) {
      return '<circle cx="' + x + '" cy="' + y + '" r="4.6" fill="' + fill + '">' +
        A + '"cx" values="' + x + ';' + (x + dx) + '" dur="' + dur + '" begin="' + delay + '" repeatCount="indefinite"/>' +
        A + '"cy" values="' + y + ';' + (y + dy) + '" dur="' + dur + '" begin="' + delay + '" repeatCount="indefinite"/>' +
        A + '"opacity" values="0;.95;.95;0" dur="' + dur + '" begin="' + delay + '" repeatCount="indefinite"/></circle>';
    }
    var flow =
      mol(8, 150, 96, -30, '#A16207', '3.4s', '0s') +
      mol(292, 150, -128, -34, '#A16207', '3.4s', '1.2s') +
      mol(10, 250, 92, 12, '#BC235B', '3.6s', '0.6s') +
      mol(290, 250, -140, -16, '#0F6E8C', '3.8s', '1.9s') +
      mol(12, 90, 88, 18, '#0F6E8C', '3.6s', '2.7s');
    var base = plateFig(art, {
      viewBox:'-158 -18 646 500', leftX:-24, rightX:296, minGap:26, top:20, bottom:410,
      hide:[19,20,21,22,23,24,25,26],
      labels:[
        { side:'left',  ly:96,  at:[82,104], text:'Microvilli', sub:'the brush border' },
        { side:'left',  ly:210, at:[77,215], text:'Epithelium', sub:'one cell thick' },
        { side:'left',  ly:330, at:[92,330], text:'Villus' },
        { side:'right', ly:96,  at:[150,93], text:'Capillaries', sub:'glucose + amino acids' },
        { side:'right', ly:216, at:[136,215], text:'Lacteal', sub:'fatty acids + glycerol' },
        { side:'right', ly:360, at:[179,364], text:'Blood vessel', sub:'on to the hepatic portal vein' }
      ],
      note:[164, 428, 'Large surface area · short diffusion distance · steep concentration gradient', 'middle']
    });
    /* A magnifying lens on the wall of the villus: click it and one of the "little squares" —
       an enterocyte, the epithelial cell — opens enlarged beside the villus, with its brush
       border of microvilli, its mitochondria and its nucleus named. */
    var lens =
      '<g class="fig-lens" role="button" tabindex="0" aria-expanded="false">' +
        '<title>Zoom in on one cell of the wall (an enterocyte)</title>' +
        '<circle class="lens__glass" cx="206" cy="132" r="12.5" fill="#FFFDF9" stroke="#14572B" stroke-width="2"/>' +
        '<circle cx="206" cy="132" r="6.4" fill="none" stroke="#14572B" stroke-width="1.6"/>' +
        '<line x1="210.6" y1="136.6" x2="216" y2="142" stroke="#14572B" stroke-width="2.8" stroke-linecap="round"/>' +
        '<text class="fs" x="206" y="156" text-anchor="middle" style="fill:#14572B;font-weight:700">one cell</text>' +
      '</g>';
    function mito(x, y, a) {
      return '<g transform="translate(' + x + ',' + y + ') rotate(' + a + ')"><ellipse rx="10" ry="5.2" fill="#F3C98A" stroke="#B57A2A" stroke-width="1.1"/>' +
             '<path d="M-5,-3 q2,3 0,6 M0,-3.5 q2,3.5 0,7 M5,-3 q2,3 0,6" fill="none" stroke="#B57A2A" stroke-width="0.9"/></g>';
    }
    var villi = '';
    for (var k = 0; k < 20; k++) { var vx = 250.5 + k * 4.2; villi += '<line x1="' + vx + '" y1="66" x2="' + vx + '" y2="44" stroke="#B94B6A" stroke-width="1.9" stroke-linecap="round"/>'; }
    var cell =
      '<g class="fig-cell">' +
        '<line x1="218" y1="132" x2="228" y2="132" stroke="#14572B" stroke-width="1.4" stroke-dasharray="3 2"/>' +
        '<rect x="228" y="-12" width="256" height="490" rx="10" fill="#FFFDF9" stroke="#C9C0AE" stroke-width="1"/>' +
        '<text class="fb" x="240" y="8">One enterocyte</text>' +
        '<text class="fs" x="240" y="23">an epithelial cell of the villus wall, enlarged</text>' +
        '<g class="fig-cell__close" role="button" tabindex="0"><title>Close</title><circle cx="470" cy="6" r="9" fill="#F1EDE3" stroke="#B9AE9B" stroke-width="1"/>' +
          '<text x="470" y="10.5" text-anchor="middle" style="font:700 13px Calibri,Carlito,sans-serif;fill:#3A3A3A">×</text></g>' +
        /* the cell body with its brush border */
        '<rect x="246" y="66" width="88" height="222" rx="9" fill="#FBEAE2" stroke="#8A4B5E" stroke-width="1.7"/>' +
        villi +
        mito(266, 116, -20) + mito(316, 136, 25) + mito(268, 170, 15) + mito(314, 192, -30) +
        '<ellipse cx="290" cy="248" rx="21" ry="25" fill="#CFA6C6" stroke="#7A4E7A" stroke-width="1.4"/>' +
        '<ellipse cx="284" cy="241" rx="6" ry="7" fill="#9E6E9A"/>' +
        /* labels beside it */
        '<text class="fl" x="344" y="52">microvilli</text>' +
        '<text class="fs" x="344" y="66">its own membrane, folded —</text>' +
        '<text class="fs" x="344" y="79">the brush border</text>' +
        '<path class="ld" d="M340,55 L336,55"/>' +
        '<text class="fl" x="344" y="106">cell membrane</text>' +
        '<path class="ld" d="M340,102 L334,102"/>' +
        '<text class="fl" x="344" y="146">mitochondria</text>' +
        '<text class="fs" x="344" y="160">energy from respiration</text>' +
        '<text class="fs" x="344" y="173">for active transport</text>' +
        '<path class="ld" d="M340,142 L326,141"/>' +
        '<text class="fl" x="344" y="212">cytoplasm</text>' +
        '<path class="ld" d="M340,208 L300,208"/>' +
        '<text class="fl" x="344" y="252">nucleus</text>' +
        '<path class="ld" d="M340,248 L311,248"/>' +
        '<text class="fs" x="240" y="303">Food crosses this one cell, then it is in the</text>' +
        '<text class="fs" x="240" y="316">capillaries or the lacteal just beneath it.</text>' +
        /* the real thing: a transmission electron micrograph of the same border */
        /* the same brush border, for real: a gold box on the schematic's microvilli, joined to the
           micrograph, which is labelled so nobody takes the fringe for villi */
        '<rect x="244" y="40" width="92" height="30" rx="3" fill="none" stroke="#E8A33D" stroke-width="1.6"/>' +
        '<line x1="244" y1="70" x2="246" y2="324" stroke="#E8A33D" stroke-width="1.1"/>' +
        '<line x1="336" y1="70" x2="476" y2="324" stroke="#E8A33D" stroke-width="1.1"/>' +
        '<image href="assets/zoom/microvilli-tem-band.jpg" x="246" y="324" width="230" height="92" preserveAspectRatio="xMidYMid slice"/>' +
        '<rect x="246" y="324" width="230" height="92" fill="none" stroke="#E8A33D" stroke-width="1.6"/>' +
        '<path d="M262,330 L262,352 M262,341 L300,341" stroke="#FFFDF9" stroke-width="3.2" fill="none"/><path d="M262,330 L262,352 M262,341 L300,341" stroke="#1A1A1A" stroke-width="1.2" fill="none"/>' +
        '<text class="fs" x="304" y="345" style="fill:#fff;font-weight:700;paint-order:stroke;stroke:#1A1A1A;stroke-width:2.4px">microvilli — the brush border</text>' +
        '<text class="fs" x="304" y="404" style="fill:#fff;font-weight:700;paint-order:stroke;stroke:#1A1A1A;stroke-width:2.4px">cytoplasm of the same cell</text>' +
        '<text class="fs" x="240" y="430" style="fill:#1A1A1A;font-weight:600">The box above, photographed: a transmission</text>' +
        '<text class="fs" x="240" y="442" style="fill:#1A1A1A;font-weight:600">electron micrograph of the top of one cell.</text>' +
        '<text class="fs" x="240" y="454" style="fill:#1A1A1A;font-weight:600">Black and white because it uses electrons,</text>' +
        '<text class="fs" x="240" y="466" style="fill:#1A1A1A;font-weight:600">not light — so there is no colour to record.</text>' +
      '</g>';
    return {
      svg: base.replace('</svg>', '<text class="fs" x="-150" y="6">lumen of the small intestine</text>' + flow + lens + cell + '</svg>'),
      cap:'<b>The villus.</b> Four adaptations, each with a reason: villi and microvilli give a <b>large surface area</b>; the wall is <b>one cell thick</b> so the diffusion distance is short; a <b>dense capillary network</b> carries nutrients away and keeps the concentration gradient steep; a <b>lacteal</b> takes the fatty acids and glycerol. The little squares of the wall are the epithelial cells — <b>enterocytes</b>: click the lens to see one enlarged.'
    };
  }

  /* ---------------- surface-area multiplier ---------------- */
  function surfaceArea() {
    return {
      svg: svg('0 0 440 200',
        '<g><rect x="20" y="44" width="110" height="72" rx="8" fill="#F6E2CE" stroke="#C98E76" stroke-width="2"/>' +
        '<path d="M20,104 C36,80 52,128 68,96 C84,66 100,124 116,92 C124,76 128,86 130,92" fill="none" stroke="#C98E76" stroke-width="3"/>' +
        '<text class="fb" x="75" y="34" text-anchor="middle">Circular folds</text>' +
        '<text class="fs" x="75" y="134" text-anchor="middle">×3</text></g>' +
        '<g><rect x="165" y="44" width="110" height="72" rx="8" fill="#F6E2CE" stroke="#C98E76" stroke-width="2"/>' +
        '<path d="M172,116 C172,80 180,66 188,66 C196,66 204,80 204,116 M208,116 C208,80 216,66 224,66 C232,66 240,80 240,116 M244,116 C244,80 252,66 260,66 C268,66 270,80 270,116" fill="none" stroke="#C98E76" stroke-width="3"/>' +
        '<text class="fb" x="220" y="34" text-anchor="middle">Villi</text>' +
        '<text class="fs" x="220" y="134" text-anchor="middle">×10 more</text></g>' +
        '<g><rect x="310" y="44" width="110" height="72" rx="8" fill="#F6E2CE" stroke="#C98E76" stroke-width="2"/>' +
        '<path d="M316,110 l0,-42 M324,110 l0,-42 M332,110 l0,-42 M340,110 l0,-42 M348,110 l0,-42 M356,110 l0,-42 M364,110 l0,-42 M372,110 l0,-42 M380,110 l0,-42 M388,110 l0,-42 M396,110 l0,-42 M404,110 l0,-42 M412,110 l0,-42" stroke="#C98E76" stroke-width="2.4" stroke-linecap="round"/>' +
        '<text class="fb" x="365" y="34" text-anchor="middle">Microvilli</text>' +
        '<text class="fs" x="365" y="134" text-anchor="middle">×20 more</text></g>' +
        arrowDefs('ar3', '#14572B') + arrow('ar3', '#14572B', 'M138,80 L158,80') + arrow('ar3', '#14572B', 'M283,80 L303,80') +
        '<text class="fl" x="220" y="168" text-anchor="middle">Together they raise the surface area up to <tspan class="fb">600×</tspan> that of a flat tube.</text>' +
        '<text class="fs" x="220" y="188" text-anchor="middle">About 250 m² of absorbing surface — roughly a tennis court.</text>'),
      cap:'Three levels of folding multiply together: <b>circular folds</b> (×3), <b>villi</b> (×10) and <b>microvilli</b> (×20). More surface area means more sites for small soluble molecules to be absorbed.'
    };
  }

  /* ---------------- egestion vs excretion ---------------- */
  function egestVsExcrete() {
    var f1 = function (v) { return (+v).toFixed(1); };
    /* Two panels. The gut follows the orientation of the body plate beside it —
       descending colon down the viewer's RIGHT, sigmoid bending left, rectum and
       anus at the bottom — because drawing it the other way round teaches a
       second, contradictory picture of the same organ.

       The cell is drawn as a proper cell, not a decoration: a partially permeable
       membrane, cytoplasm, a nucleus with its double envelope, pores, chromatin and
       nucleolus, mitochondria with cristae, rough ER studded with ribosomes, free
       ribosomes, a Golgi stack and a vesicle leaving it for the membrane. The point
       of the panel is that excretion removes what these organelles made, so they
       have to be recognisable — and clicking any label opens what that part does,
       because this is Year 7 work being used again two years later. */
    var LX = 12, LW = 216, RX = 244, RW = 364, PT = 26, PB = 382;
    /* the cell sits a little left of the panel's centre: the labels on its right
       ("Golgi apparatus", "mitochondrion") are the long ones and must stay inside */
    var DX = -12;

    /* --- the last of the gut, oriented like the plate --- */
    var gutPath = 'M168,192 L168,244 Q168,272 144,284 L118,290 Q96,296 96,320';
    var gut =
      '<path d="' + gutPath + '" fill="none" stroke="#B07E4A" stroke-width="26" stroke-linecap="round"/>' +
      '<path d="' + gutPath + '" fill="none" stroke="#EFDFCB" stroke-width="19" stroke-linecap="round"/>' +
      [[168,206],[168,240],[146,282],[118,290]].map(function (p) {
        return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="6.6" ry="5" fill="#A9713C" opacity=".85"/>';
      }).join('') +
      '<ellipse cx="96" cy="326" rx="12" ry="5.2" fill="#C08B57" stroke="#8A5A2B" stroke-width="2"/>' +
      '<ellipse cx="96" cy="326" rx="4.6" ry="2.1" fill="#6E4423"/>' +
      '<path class="ld" d="M154,210 L146,210"/>' +
      '<text class="fs" x="142" y="213" text-anchor="end">colon</text>' +
      '<path class="ld" d="M126,298 L136,306"/>' +
      '<text class="fs" x="140" y="309">rectum</text>' +
      '<path class="ld" d="M83,326 L72,326"/>' +
      '<text class="fs" x="68" y="329" text-anchor="end">anus</text>';

    /* --- a body cell, drawn to be read --- */
    var CELL = 'M436,116 C468,113 494,125 506,147 C518,169 516,197 508,217 ' +
               'C498,241 476,258 450,264 C424,270 396,264 378,248 C360,232 352,208 354,186 ' +
               'C356,160 372,138 396,126 C408,120 420,117 436,116 Z';
    function mito(x, y, rot) {
      return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')">' +
        '<rect x="-23" y="-11" width="46" height="22" rx="11" fill="#F7D6B4" stroke="#B5713A" stroke-width="1.9"/>' +
        '<rect x="-19.5" y="-7.5" width="39" height="15" rx="7.5" fill="none" stroke="#D89A63" stroke-width="1"/>' +
        '<path d="M-14,-7.5 q7,7.5 0,15 M-6,-7.5 q7,7.5 0,15 M2,-7.5 q7,7.5 0,15 M10,-7.5 q7,7.5 0,15" ' +
        'fill="none" stroke="#B5713A" stroke-width="1.4" stroke-linecap="round"/></g>';
    }
    /* a flattened sac: a thick line for the membrane, a pale one for the lumen */
    function sac(d, w) {
      return '<path d="' + d + '" fill="none" stroke="#0F6E8C" stroke-width="' + (w || 4.6) + '" stroke-linecap="round"/>' +
             '<path d="' + d + '" fill="none" stroke="#DCEBF3" stroke-width="' + ((w || 4.6) - 2.6) + '" stroke-linecap="round"/>';
    }
    function dots(list, r, attrs) {
      return list.map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r || 2) + '" ' + (attrs || 'fill="#14415A"') + '/>';
      }).join('');
    }
    var HALO = 'fill="none" stroke="#E8A33D" stroke-width="1.8"';
    var ERD = ['M370,198 q26,-12 52,-4', 'M368,209 q26,-12 52,-4', 'M370,220 q26,-12 52,-4'];
    var ERDOTS = [[372,194],[382,190],[392,189],[402,190],[412,192],[422,195],
                  [370,205],[380,201],[390,200],[400,201],[410,203],[420,206],
                  [372,216],[382,212],[392,211],[402,212],[412,214],[422,217]];
    var FREE = [[396,238],[412,250],[430,234],[378,182],[444,128]];
    var NX = 455, NY = 162;
    var cell =
      /* cytoplasm and membrane: an outer line and a thin inner one — the bilayer */
      '<path d="' + CELL + '" fill="#FBFDFE" stroke="#0F6E8C" stroke-width="3.2"/>' +
      '<path d="M436,121 C466,118 490,130 501,150 C512,170 511,196 503,215 ' +
      'C494,237 474,253 450,259 C426,264 399,259 382,244 C365,229 357,207 359,187 ' +
      'C361,163 376,142 398,131 C409,125 421,122 436,121 Z" ' +
      'fill="none" stroke="#9CC6DA" stroke-width="1.3"/>' +
      /* rough ER, studded with ribosomes */
      ERD.map(function (d) { return sac(d); }).join('') + dots(ERDOTS, 1.9) +
      /* Golgi stack, with a vesicle budding off the end */
      '<g transform="translate(478,206)">' +
      sac('M-22,-13 q22,-12 42,-2', 4.4) + sac('M-21,-5 q21,-11 40,-2', 4.4) +
      sac('M-20,3 q20,-10 38,-2', 4.4) + sac('M-18,11 q19,-9 36,-2', 4.4) +
      '<circle cx="24" cy="-14" r="4.2" fill="#DCEBF3" stroke="#0F6E8C" stroke-width="1.4"/>' +
      '<circle cx="-25" cy="11" r="3.6" fill="#DCEBF3" stroke="#0F6E8C" stroke-width="1.3"/>' +
      '<circle cx="21" cy="17" r="3.2" fill="#DCEBF3" stroke="#0F6E8C" stroke-width="1.3"/></g>' +
      /* a vesicle on its way to the membrane */
      '<circle cx="498" cy="176" r="8.8" fill="#DCEBF3" stroke="#0F6E8C" stroke-width="1.7"/>' +
      dots([[498,176]], 2.4, 'fill="#9CC6DA"') +
      '<path d="M489,190 q5,-7 6,-9" fill="none" stroke="#0F6E8C" stroke-width="1.2" stroke-dasharray="2.5 2.5"/>' +
      '<path d="M505,168 q4,-4 6,-6" fill="none" stroke="#0F6E8C" stroke-width="1.2" stroke-dasharray="2.5 2.5"/>' +
      /* mitochondria */
      mito(390, 162, -20) + mito(462, 244, 10) +
      /* nucleus: double envelope with pores, chromatin, nucleolus */
      '<ellipse cx="' + NX + '" cy="' + NY + '" rx="33" ry="28" fill="#BAD6E7" stroke="#0F6E8C" stroke-width="2.1"/>' +
      '<ellipse cx="' + NX + '" cy="' + NY + '" rx="29" ry="24" fill="none" stroke="#7FB2CE" stroke-width="1.2"/>' +
      [200, 250, 330, 20, 80, 140].map(function (a) {
        var r = a * Math.PI / 180, x1 = NX + 33 * Math.cos(r), y1 = NY + 28 * Math.sin(r);
        var x2 = NX + 28.4 * Math.cos(r), y2 = NY + 24.1 * Math.sin(r);
        return '<line x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) +
               '" stroke="#EAF4F9" stroke-width="3" stroke-linecap="round"/>';
      }).join('') +
      '<path d="M431,150 q9,-7 18,-1 q9,6 18,-3 M429,163 q11,7 22,1 q9,-5 17,2 ' +
      'M434,175 q10,5 20,0 q8,-4 15,1 M441,141 q9,-4 17,0" ' +
      'fill="none" stroke="#79A5BF" stroke-width="1.5" stroke-linecap="round"/>' +
      '<ellipse cx="466" cy="167" rx="9.5" ry="7.6" fill="#3F6F94"/>' +
      /* free ribosomes */
      dots(FREE, 2) +
      /* what the cell made, leaving it */
      arrowDefs('exc', '#0F6E8C') +
      arrow('exc', '#0F6E8C', 'M470,254 L505,270', 1.6) +
      '<text class="fs" x="508" y="274" style="fill:#0F6E8C">carbon dioxide</text>' +
      arrow('exc', '#0F6E8C', 'M416,258 L378,272', 1.6) +
      '<text class="fs" x="374" y="276" text-anchor="end" style="fill:#0F6E8C">urea</text>';

    /* --- the labels, and what each part does --- */
    var ORG = [
      { k:'cytoplasm', t:'cytoplasm', side:'L', ly:142, ax:388, ay:132, core:1,
        ring:'<path d="' + CELL + ' M422,162 a33,28 0 1,0 66,0 a33,28 0 1,0 -66,0" ' +
             'fill-rule="evenodd" fill="#E8A33D" opacity=".16"/>',
        body:'The jelly-like fluid that fills the cell. Most of the cell’s chemical ' +
             'reactions happen in it, and the organelles sit in it. Urea is made by reactions like these in a liver cell.' },
      { k:'membrane', t:'cell membrane', side:'L', ly:176, ax:346, ay:168, core:1,
        ring:'<path d="' + CELL + '" fill="none" stroke="#E8A33D" stroke-width="4.6"/>',
        body:'A thin, partially permeable skin around the whole cell. It holds the cell ' +
             'together and controls what enters and leaves — the waste made inside passes out through it.' },
      { k:'er', t:'rough\nendoplasmic\nreticulum', side:'L', ly:198, ax:366, ay:206, core:0,
        ring:ERD.map(function (d) { return '<path d="' + d + '" fill="none" stroke="#E8A33D" stroke-width="7.6" opacity=".55" stroke-linecap="round"/>'; }).join(''),
        body:'Folded sheets of membrane covered in ribosomes. Proteins made on them are ' +
             'folded here and passed on to the Golgi apparatus.' },
      { k:'ribosomes', t:'ribosomes', side:'L', ly:258, ax:384, ay:238, core:1,
        ring:dots(FREE, 4.6, HALO) + dots(ERDOTS, 3.8, 'fill="none" stroke="#E8A33D" stroke-width="1.3"'),
        body:'Tiny grains where proteins are made — enzymes among them. Some float free in ' +
             'the cytoplasm; others are attached to the rough endoplasmic reticulum.' },
      { k:'nucleus', t:'nucleus', side:'R', ly:146, ax:464, ay:150, core:1,
        ring:'<ellipse cx="' + NX + '" cy="' + NY + '" rx="36" ry="31" fill="none" stroke="#E8A33D" stroke-width="3.2"/>',
        body:'The control centre. It holds the chromosomes — the DNA carrying the instructions ' +
             'for every protein the cell makes. The dark spot inside it is the nucleolus.' },
      { k:'vesicle', t:'vesicle', side:'R', ly:180, ax:486, ay:176, core:0,
        ring:'<circle cx="498" cy="176" r="12.5" fill="none" stroke="#E8A33D" stroke-width="2.6"/>',
        body:'A small bag of membrane. It carries a finished substance to the cell membrane ' +
             'and releases it outside the cell.' },
      { k:'golgi', t:'Golgi apparatus', side:'R', ly:212, ax:484, ay:206, core:0,
        ring:'<ellipse cx="478" cy="206" rx="30" ry="21" fill="none" stroke="#E8A33D" stroke-width="2.6"/>',
        body:'The packing department. It finishes proteins, packs them into vesicles and ' +
             'sends them to the cell membrane.' },
      { k:'mito', t:'mitochondrion', side:'R', ly:252, ax:466, ay:248, core:1,
        ring:'<ellipse cx="390" cy="162" rx="28" ry="18" fill="none" stroke="#E8A33D" stroke-width="2.6" transform="rotate(-20 390 162)"/>' +
             '<ellipse cx="462" cy="244" rx="28" ry="18" fill="none" stroke="#E8A33D" stroke-width="2.6" transform="rotate(10 462 244)"/>',
        body:'Where aerobic respiration happens: it releases energy from glucose. The carbon ' +
             'dioxide that has to be excreted is made here. (Plural: mitochondria.)' }
    ];

    /* wrap a sentence to the width of the card */
    function wrap(t, max) {
      var out = [], line = '';
      t.split(' ').forEach(function (w) {
        if (line && (line + ' ' + w).length > max) { out.push(line); line = w; }
        else line = line ? line + ' ' + w : w;
      });
      if (line) out.push(line);
      return out;
    }
    var LTX = 334, RTX = 514, CARD = { x:256, y:286, w:340, h:92 };
    var labels = ORG.map(function (o) {
      var lines = o.t.split('\n'), left = o.side === 'L';
      var tx = left ? LTX : RTX, sx = left ? LTX + 4 : RTX - 4;
      var wmax = 0; lines.forEach(function (l) { wmax = Math.max(wmax, l.length); });
      var w = wmax * 6 + 8, hx = left ? tx - w : tx - 8;
      return '<g class="fig-lens orglab orglab--' + o.k + '" data-view="' + o.k + '" role="button" tabindex="0" ' +
             'aria-expanded="false"><title>What does it do?</title>' +
             '<rect class="hit" x="' + f1(hx) + '" y="' + (o.ly - 12) + '" width="' + f1(w) + '" height="' + Math.max(20, lines.length * 13 + 8) + '" rx="4"/>' +
             '<path class="ld" d="M' + sx + ',' + (o.ly - 4) + ' L' + o.ax + ',' + o.ay + '"/>' +
             '<circle class="dot" cx="' + o.ax + '" cy="' + o.ay + '" r="2.1"/>' +
             '<text x="' + tx + '" y="' + o.ly + '" text-anchor="' + (left ? 'end' : 'start') + '">' +
             lines.map(function (l, i) { return '<tspan x="' + tx + '" dy="' + (i ? '13' : '0') + '">' + l + '</tspan>'; }).join('') +
             '</text></g>';
    }).join('');
    var rings = ORG.map(function (o) { return '<g class="orgring orgring--' + o.k + '">' + o.ring + '</g>'; }).join('');
    var cards = ORG.map(function (o) {
      var body = wrap(o.body, 57);
      return '<g class="orgcard orgcard--' + o.k + '">' +
        '<rect x="' + CARD.x + '" y="' + CARD.y + '" width="' + CARD.w + '" height="' + CARD.h + '" rx="10" ' +
        'fill="#FFFFFF" stroke="#0F6E8C" stroke-width="1.6"/>' +
        '<text class="cardt" x="' + (CARD.x + 14) + '" y="' + (CARD.y + 20) + '">' + o.t.replace('\n', ' ') + '</text>' +
        '<rect x="' + (CARD.x + CARD.w - (o.core ? 96 : 118)) + '" y="' + (CARD.y + 8) + '" width="' + (o.core ? 62 : 84) + '" height="15" rx="7.5" ' +
        'fill="' + (o.core ? '#E4F1E8' : '#F3EEE2') + '" stroke="' + (o.core ? '#2E7D46' : '#B9A87E') + '" stroke-width="1"/>' +
        '<text class="cardtag" x="' + (CARD.x + CARD.w - (o.core ? 65 : 76)) + '" y="' + (CARD.y + 19) + '" text-anchor="middle" ' +
        'style="fill:' + (o.core ? '#2E7D46' : '#8A7647') + '">' + (o.core ? 'in 0610' : 'beyond 0610') + '</text>' +
        '<text class="cardb" x="' + (CARD.x + 14) + '" y="' + (CARD.y + 38) + '">' +
        body.map(function (l, i) { return '<tspan x="' + (CARD.x + 14) + '" dy="' + (i ? '15' : '0') + '">' + l + '</tspan>'; }).join('') +
        '</text>' +
        '<g class="fig-lens orgclose" data-view="' + o.k + '" role="button" tabindex="0"><title>Close</title>' +
        '<circle cx="' + (CARD.x + CARD.w - 16) + '" cy="' + (CARD.y + 16) + '" r="9" fill="#F1EDE3" stroke="#B9AE9B" stroke-width="1"/>' +
        '<path d="M' + (CARD.x + CARD.w - 20) + ',' + (CARD.y + 12) + ' l8,8 M' + (CARD.x + CARD.w - 12) + ',' + (CARD.y + 12) +
        ' l-8,8" stroke="#6B6B6B" stroke-width="1.6" stroke-linecap="round"/></g></g>';
    }).join('');
    var css = '<style>' +
      '.fig-cellmap .orgcard,.fig-cellmap .orgring{display:none}' +
      ORG.map(function (o) {
        return '.fig-cellmap[data-view="' + o.k + '"] .orgcard--' + o.k + ',' +
               '.fig-cellmap[data-view="' + o.k + '"] .orgring--' + o.k + '{display:block}' +
               '.fig-cellmap[data-view="' + o.k + '"] .orglab--' + o.k + ' text{fill:#0B4F66;font-weight:700}';
      }).join('') +
      '.fig-cellmap[data-view] .excnote{display:none}' +
      '.fig-cellmap .orglab{cursor:pointer}' +
      '.fig-cellmap .orglab .hit{fill:#FFFFFF;fill-opacity:0}' +
      '.fig-cellmap .orglab text{font:600 11px Calibri,Carlito,sans-serif;fill:#0F6E8C;' +
      'text-decoration:underline;text-decoration-style:dotted;text-underline-offset:2px}' +
      '.fig-cellmap .orglab .dot{fill:#0F6E8C}' +
      '.fig-cellmap .orglab .ld{stroke:#7FA9BB;stroke-width:1.1}' +
      '.fig-cellmap .orglab:hover text,.fig-cellmap .orglab:focus-visible text{fill:#0B4F66}' +
      '.fig-cellmap .orglab:hover .hit,.fig-cellmap .orglab:focus-visible .hit{fill-opacity:.55}' +
      '.fig-cellmap .orglab:focus{outline:none}' +
      '.fig-cellmap .orgclose{cursor:pointer}' +
      '.fig-cellmap .cardt{font:700 12.5px Calibri,Carlito,sans-serif;fill:#0F6E8C}' +
      '.fig-cellmap .cardtag{font:700 9px Calibri,Carlito,sans-serif;letter-spacing:.04em}' +
      '.fig-cellmap .cardb{font:500 11px Calibri,Carlito,sans-serif;fill:#26414B}' +
      '</style>';

    return {
      svg: svg('0 0 620 430',
        css +
        '<rect x="' + LX + '" y="' + PT + '" width="' + LW + '" height="' + (PB - PT) + '" rx="14" fill="#FCF4E7" stroke="#B07E4A" stroke-width="2.4"/>' +
        '<rect x="' + RX + '" y="' + PT + '" width="' + RW + '" height="' + (PB - PT) + '" rx="14" fill="#E8F3F8" stroke="#0F6E8C" stroke-width="2.4"/>' +
        '<text class="fb" x="120" y="52" text-anchor="middle" style="fill:#8A5A2B;font-size:15px">EGESTION</text>' +
        '<text class="fs" x="120" y="70" text-anchor="middle">never entered a cell</text>' +
        '<text class="fb" x="426" y="52" text-anchor="middle" style="fill:#0F6E8C;font-size:15px">EXCRETION</text>' +
        '<text class="fs" x="426" y="70" text-anchor="middle">made inside cells</text>' +
        '<text class="fb" x="26" y="102" style="fill:#8A5A2B">Fibre / roughage</text>' +
        '<text class="fb" x="26" y="126" style="fill:#8A5A2B">Undigested food</text>' +
        '<text class="fb" x="26" y="150" style="fill:#8A5A2B">Dead gut cells</text>' +
        gut +
        '<text class="fs" x="120" y="360" text-anchor="middle">passed out as faeces</text>' +
        '<g transform="translate(' + DX + ',0)">' + cell + rings + '</g>' + labels + cards +
        '<g class="excnote">' +
        '<text class="fs" x="426" y="302" text-anchor="middle">Urea from the liver leaves in urine.</text>' +
        '<text class="fs" x="426" y="318" text-anchor="middle">Carbon dioxide from respiration leaves in the breath.</text>' +
        '<text class="fs" x="426" y="340" text-anchor="middle" style="fill:#26414B">The five 0610 asks for: cell membrane, cytoplasm, nucleus,</text>' +
        '<text class="fs" x="426" y="354" text-anchor="middle" style="fill:#26414B">mitochondria and ribosomes. The other three are Year 7 background.</text>' +
        '<text class="fs" x="426" y="374" text-anchor="middle" style="fill:#0F6E8C;font-weight:700">Click any label to see what that part does.</text>' +
        '</g>' +
        '<text class="fl" x="310" y="404" text-anchor="middle">Food in the gut is still ' +
        '<tspan style="fill:#14572B" font-weight="700">outside</tspan> your cells, so getting rid of it is egestion.</text>' +
        '<text class="fl" x="310" y="422" text-anchor="middle">Excretion removes waste the cells themselves made.</text>', 'fig-cellmap'),
      cap:'The alimentary canal is a tube running <i>through</i> the body, and what is in the tube has never been inside a cell. <b>Egestion</b> passes that out. <b>Excretion</b> removes waste the cells made &#8212; urea from the liver, carbon dioxide from respiration in the mitochondria. Different processes, and 0610 asks you to tell them apart. <b>Click any label on the cell</b> to remind yourself what that part does.'
    };
  }

  /* ---------------- stomach churning ---------------- */
  /* Sample a smooth centre line through a list of points (Catmull-Rom). Used to
     sweep one continuous tube: oesophagus, stomach and duodenum are the same
     tube, so drawing them as three pieces and then trying to hide the joins was
     always going to look like three pieces. */
  function crPoint(P, u) {
    var n = P.length - 1, i = Math.min(Math.floor(u * n), n - 1), t = u * n - i;
    var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
    var t2 = t * t, t3 = t2 * t;
    return [0.5 * ((2*p1[0]) + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
            0.5 * ((2*p1[1]) + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)];
  }

  function churn() {
    /* One continuous tube, swept along a centre line that starts up in the
       oesophagus and ends out in the duodenum, with a different width on each
       side. The asymmetry is what makes the J: a long greater curvature on the
       outside, a short lesser one on the inside. Orientation follows the body
       plate beside it — liver on the viewer's left, so the stomach's fundus
       domes to the right and the pylorus leaves to the left. Contraction rings
       then travel towards the pylorus, squeezing the wall as they pass and
       getting stronger as they go, which is what gastric waves do. */
    var DUR = '5.5s', N = 96, STEPS = 30;
    var MID = [[190,20],[190,64],[224,96],[240,140],[228,182],[186,210],[132,218],[92,224],[64,246],[54,276]];

    function at(u) {
      var p = crPoint(MID, u), q = crPoint(MID, Math.min(1, u + 0.004));
      var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      return { x:p[0], y:p[1], nx:dy / L, ny:-dx / L };
    }
    /* width each side: oesophagus narrow, stomach wide and lopsided, pylorus
       narrow again, duodenum narrow */
    function prof(u, keys) {
      var i = 0;
      while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
      var a = keys[i], b = keys[i + 1], f = (u - a[0]) / (b[0] - a[0] || 1);
      f = Math.max(0, Math.min(1, f));
      f = f * f * (3 - 2 * f);                                  /* ease, so no kinks */
      return a[1] + (b[1] - a[1]) * f;
    }
    var OUT = [[0,9],[0.10,13],[0.20,40],[0.34,56],[0.50,50],[0.66,30],[0.78,15],[0.88,10],[1,9]];
    var INN = [[0,9],[0.10,11],[0.22,20],[0.40,24],[0.58,20],[0.72,13],[0.84,10],[1,9]];

    function wall(rings) {
      var i, u, s, wo, wi, Lo = [], Li = [];
      for (i = 0; i <= N; i++) {
        u = i / N; s = at(u);
        wo = prof(u, OUT); wi = prof(u, INN);
        rings.forEach(function (r) {
          var g = gauss(u - r, .045) * (13 + 12 * r) * (u > .12 && u < .84 ? 1 : 0);
          wo -= g; wi -= g * .75;
        });
        wo = Math.max(6, wo); wi = Math.max(5.5, wi);
        Lo.push([(s.x + s.nx * wo).toFixed(1), (s.y + s.ny * wo).toFixed(1)]);
        Li.push([(s.x - s.nx * wi).toFixed(1), (s.y - s.ny * wi).toFixed(1)]);
      }
      Li.reverse();
      return 'M' + Lo.map(function (q) { return q.join(','); }).join(' L') +
             ' L' + Li.map(function (q) { return q.join(','); }).join(' L') + ' Z';
    }

    var frames = [], i;
    for (i = 0; i <= STEPS; i++) {
      var a = .24 + (i / STEPS) * .56, b = a - .26;
      var rings = [a]; if (b > .18) rings.push(b);
      frames.push(wall(rings));
    }
    frames.push(frames[0]);

    function bit(cx, cy, r, delay, dx, dy) {
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#B5762F" opacity=".9">' +
        '<animateTransform attributeName="transform" type="translate" ' +
        'values="0,0; ' + dx + ',' + dy + '; ' + (-dx) + ',' + (dy / 2) + '; 0,0" ' +
        'dur="' + DUR + '" begin="' + delay + 's" repeatCount="indefinite"/>' +
        A + '"r" values="' + r + ';' + (r * .55).toFixed(1) + ';' + r + '" dur="' + DUR + '" repeatCount="indefinite"/></circle>';
    }
    var food = bit(226,118,7,0,-12,26) + bit(240,150,6,.5,-16,-12) + bit(212,168,6.5,1.1,10,18) +
               bit(204,132,5.5,1.7,-8,28) + bit(214,196,5,2.2,-18,-8) + bit(178,204,6,2.8,12,-20);

    return {
      svg: svg('0 0 540 300',
        '<path fill="#F3DFCB" stroke="#B07E4A" stroke-width="3" stroke-linejoin="round" d="' + frames[0] + '">' +
        A + '"d" values="' + frames.join(';') + '" dur="' + DUR + '" repeatCount="indefinite"/></path>' +
        food +
        '<path class="ld" d="M312,98 L276,124"/><text class="fb" x="318" y="96">Muscular wall</text>' +
        '<text class="fs" x="318" y="112">rings of muscle squeeze and</text>' +
        '<text class="fs" x="318" y="126">travel towards the exit &#8212; this</text>' +
        '<text class="fs" x="318" y="140">is physical digestion</text>' +
        '<path class="ld" d="M312,172 L244,168"/><text class="fb" x="318" y="170">Gastric juice</text>' +
        '<text class="fs" x="318" y="186">hydrochloric acid + pepsin</text>' +
        '<path class="ld" d="M312,234 L104,236"/><text class="fb" x="318" y="232">Chyme</text>' +
        '<text class="fs" x="318" y="248">the soupy, acidic mixture</text>' +
        '<text class="fs" x="318" y="262">that leaves the stomach</text>' +
        '<path class="ld" d="M156,36 L180,32"/>' +
        '<text class="fs" x="150" y="39" text-anchor="end">from the oesophagus</text>' +
        '<text class="fs" x="52" y="292" text-anchor="middle">to the duodenum</text>'),
      cap:'<b>Churning is physical digestion.</b> Three layers of muscle in the stomach wall run in different directions, so it can squeeze in more than one plane at once. Rings of contraction travel towards the pylorus about three times a minute, breaking the food into smaller pieces and mixing it thoroughly with the gastric juice. Nothing is broken chemically by the squeezing itself &#8212; that is pepsin&#8217;s job. What leaves is <b>chyme</b>.'
    };
  }

  /* ---------------- starch pathway ---------------- */
  function starchPath() {
    /* Laid out as one left-to-right pathway, because that is what it is:
       starch, then the enzyme that acts on it, then the product. The arrow
       used to hang in the space beside the starch chain, pointing at nothing
       and connecting nothing. Each arrow now starts at the molecule it acts
       on and ends at what that molecule becomes. */
    var Y = 74;
    function chain(x, n, fill, stroke, gap) {
      var s = '', i;
      for (i = 0; i < n; i++)
        s += '<circle cx="' + (x + i * (gap || 15)) + '" cy="' + Y + '" r="7" fill="' + fill +
             '" stroke="' + stroke + '" stroke-width="1.2"/>';
      return s;
    }
    /* three maltose molecules: two joined units, spaced apart */
    var maltose = [190, 231, 272].map(function (x) { return chain(x, 2, '#E8C063', '#7A5B12'); }).join('');
    return {
      svg: svg('0 0 448 210',
        arrowDefs('arS', '#4A4A4A') +
        '<text class="fb" x="8" y="40">Starch</text>' +
        '<text class="fs" x="8" y="56">many units joined</text>' +
        chain(10, 8, '#E8C063', '#7A5B12') +

        arrow('arS', '#4A4A4A', 'M132,' + Y + ' L172,' + Y, 2.2) +
        '<text class="fb" x="152" y="' + (Y - 16) + '" text-anchor="middle" style="fill:#A16207">amylase</text>' +
        '<text class="fs" x="152" y="' + (Y + 22) + '" text-anchor="middle">mouth and</text>' +
        '<text class="fs" x="152" y="' + (Y + 35) + '" text-anchor="middle">duodenum</text>' +

        '<text class="fb" x="190" y="40">Maltose</text>' +
        '<text class="fs" x="190" y="56">two units</text>' +
        maltose +

        arrow('arS', '#4A4A4A', 'M300,' + Y + ' L340,' + Y, 2.2) +
        '<text class="fb" x="320" y="' + (Y - 16) + '" text-anchor="middle" style="fill:#0F6E8C">maltase</text>' +
        '<text class="fs" x="320" y="' + (Y + 22) + '" text-anchor="middle">on the epithelium</text>' +
        '<text class="fs" x="320" y="' + (Y + 35) + '" text-anchor="middle">of the small intestine</text>' +

        '<text class="fb" x="356" y="40">Glucose</text>' +
        '<text class="fs" x="356" y="56">one unit</text>' +
        chain(360, 4, '#7DBE45', '#4A7A25', 21) +

        '<text class="fs" x="224" y="164" text-anchor="middle">Only glucose is small enough &#8212; and soluble enough &#8212; to be absorbed.</text>' +
        '<text class="fs" x="224" y="182" text-anchor="middle">Amylase stops at maltose. It never makes glucose on its own.</text>'),
      cap:'<b>Two enzymes, two steps.</b> Amylase breaks starch down to <b>maltose</b> &#8212; it does <i>not</i> produce glucose. Maltase, on the membranes of the epithelium lining the small intestine, then breaks maltose into <b>glucose</b>. Writing "amylase turns starch into glucose" loses the mark.'
    };
  }


  /* ---------------- swallowing: the epiglottis ---------------- */
  function swallow() {
    /* A mid-sagittal section of the mouth and throat, facing left, with the
       four things that actually happen in a swallow animated on it: the soft
       palate lifts and closes off the nose, the tongue drives the bolus back,
       the larynx rises so the epiglottis tips down over its own opening, and
       the bolus passes behind it into the oesophagus.

       Drawn from landmarks rather than freehand — nose, lips, chin, hard
       palate, tongue, pharynx, larynx and oesophagus each have fixed
       coordinates — because the first attempt read as a box with a flap in
       it and you could not tell it was a mouth. */
    var DUR = '6s';

    /* the face in profile: forehead, nose, lips, chin, jaw, neck */
    /* Built from landmarks — brow, nose bridge, nose tip, lips, chin, jaw —
       with the corners rounded, rather than guessed as long curves. Guessing
       produced a blob with no nose on it twice. */
    var profile = 'M170,24 L121.9,34.7 Q116,36 113.0,41.2 L95.0,72.8 Q92,78 88.1,82.6 ' +
      'L83.9,87.4 Q80,92 75.9,96.4 L56.1,117.6 Q52,122 57.9,123.3 L75.6,127.1 Q80,128 78.0,132.0 ' +
      'Q76,136 80.0,138.0 L82.6,139.3 Q88,142 82.6,144.7 L79.4,146.3 Q74,149 79.2,152.0 ' +
      'L82.8,154.0 Q88,157 84.0,161.5 Q80,166 84.0,170.5 L90.0,177.5 Q94,182 99.1,185.2 ' +
      'L110.9,192.8 Q116,196 121.7,197.9 L140.3,204.1 Q146,206 146.2,212.0 L150,316 ' +
      'L276,316 L276,150 C276,88 236,34 170,24 Z';

    var face =
      '<path d="' + profile + '" fill="#F7E2D4" stroke="#C79A83" stroke-width="2.2"/>' +
      /* skull base, so the top of the head is not empty */
      '<path d="M168,32 C224,40 258,84 262,140 L228,140 C224,96 202,58 162,44 Z" fill="#EEE1CE"/>' +
      /* nasal cavity */
      '<path d="M84,102 C110,86 152,78 190,80 C214,82 226,88 230,100 L230,122 ' +
      'C204,116 150,114 116,120 C102,122 90,114 84,108 Z" fill="#DDEFF6" stroke="#8CB5C6" stroke-width="1.6"/>' +
      '<path d="M108,96 q18,5 34,2 M112,106 q20,5 36,2 M120,116 q16,3 30,1" ' +
      'fill="none" stroke="#8CB5C6" stroke-width="1.4" stroke-linecap="round"/>' +
      /* hard palate */
      '<path d="M90,124 L210,120 L210,132 L90,136 Z" fill="#F1E7D3" stroke="#B79E77" stroke-width="1.6"/>' +
      /* pharynx: the shared space, joining mouth above to both tubes below */
      '<path d="M210,120 C240,124 252,142 252,168 L252,214 L196,214 L196,178 C196,150 200,132 210,124 Z" fill="#FAF3EA"/>' +
      /* lower jaw */
      '<path d="M90,158 C112,170 146,178 176,178 L176,192 C142,192 106,184 88,172 Z" ' +
      'fill="#F1E7D3" stroke="#B79E77" stroke-width="1.6"/>' +
      /* trachea in front, cartilage rings, running to the bottom edge */
      '<path d="M186,214 C182,244 182,276 184,308 L216,308 C214,276 214,244 218,214 Z" ' +
      'fill="#E4F0F6" stroke="#6E9CB0" stroke-width="2"/>' +
      [0,1,2,3].map(function (i) {
        return '<path d="M188,' + (228 + i * 20) + ' q14,5 27,0" fill="none" stroke="#6E9CB0" stroke-width="2.4" stroke-linecap="round"/>';
      }).join('') +
      /* oesophagus behind it */
      '<path d="M228,214 C226,244 226,276 228,308 L254,308 C252,276 252,244 254,214 Z" ' +
      'fill="#F3E4D7" stroke="#B07E4A" stroke-width="2"/>';

    /* ---- moving parts ---- */
    var palDown = 'M212,126 C228,134 238,148 240,166 C234,168 228,164 224,157 C218,146 212,136 206,131 Z';
    var palUp   = 'M212,126 C230,120 246,112 254,106 C257,113 255,121 248,125 C236,132 220,133 206,131 Z';
    var tonLow  = 'M92,152 C116,140 152,134 182,140 C204,145 214,160 214,180 ' +
                  'C214,194 200,200 176,200 C142,200 108,192 90,180 Z';
    var tonHigh = 'M92,150 C116,128 154,120 184,130 C206,137 216,156 216,178 ' +
                  'C216,194 198,198 172,198 C138,198 106,190 90,178 Z';
    var epiUp   = 'M192,214 C190,198 195,184 204,177 C212,184 212,201 204,211 Z';
    /* folded: a lid over the opening of the trachea, and no further. The
       oesophagus is behind it and must stay open — the bolus goes past the
       epiglottis, not through it. */
    var epiDown = 'M186,212 C196,206 210,205 221,209 C216,218 198,220 188,218 Z';

    var soft = '<path fill="#E7BCAB" stroke="#B4796A" stroke-width="1.6" d="' + palDown + '">' +
      A + '"d" values="' + [palDown,palDown,palUp,palUp,palUp,palDown].join(';') +
      '" dur="' + DUR + '" repeatCount="indefinite" keyTimes="0;0.2;0.34;0.62;0.8;1"/></path>';
    var tongue = '<path fill="#DE8480" stroke="#A45653" stroke-width="1.8" d="' + tonLow + '">' +
      A + '"d" values="' + [tonLow,tonLow,tonHigh,tonHigh,tonLow,tonLow].join(';') +
      '" dur="' + DUR + '" repeatCount="indefinite" keyTimes="0;0.18;0.34;0.58;0.74;1"/></path>';
    var epi = '<path fill="#F0C79F" stroke="#A9743C" stroke-width="1.8" d="' + epiUp + '">' +
      A + '"d" values="' + [epiUp,epiUp,epiDown,epiDown,epiUp,epiUp].join(';') +
      '" dur="' + DUR + '" repeatCount="indefinite" keyTimes="0;0.26;0.4;0.66;0.78;1"/></path>';
    var laryn = '<g><animateTransform attributeName="transform" type="translate" ' +
      'values="0,0; 0,0; 0,-11; 0,-11; 0,0; 0,0" keyTimes="0;0.26;0.4;0.66;0.78;1" ' +
      'dur="' + DUR + '" repeatCount="indefinite"/>' + epi + '</g>';

    var K = '0;0.2;0.36;0.5;0.62;0.88;1';
    var bolus = '<ellipse rx="14" ry="10.5" fill="#C98A45" stroke="#8A5A2B" stroke-width="1.6">' +
      A + '"cx" values="126;158;204;238;241;241;241" keyTimes="' + K + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      A + '"cy" values="162;152;150;188;232;300;300" keyTimes="' + K + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      A + '"rx" values="14;14;13;12;11;11;14" keyTimes="' + K + '" dur="' + DUR + '" repeatCount="indefinite"/>' +
      A + '"opacity" values="0;.96;.96;.96;.96;.96;0" keyTimes="0;0.06;0.36;0.5;0.62;0.9;1" dur="' + DUR + '" repeatCount="indefinite"/>' +
      '</ellipse>';

    function lab(x, y, t, ax) {
      return '<text class="fs" x="' + x + '" y="' + y + '"' + (ax ? ' text-anchor="' + ax + '"' : '') + '>' + t + '</text>';
    }
    var leaders =
      '<path class="ld" d="M300,100 L226,100"/>' + lab(306, 103, 'nasal cavity') +
      '<path class="ld" d="M300,128 L212,127"/>' + lab(306, 131, 'hard palate') +
      '<path class="ld" d="M300,156 L240,154"/>' + lab(306, 159, 'soft palate') +
      '<path class="ld" d="M300,196 L214,198"/>' + lab(306, 199, 'epiglottis') +
      '<path class="ld" d="M300,250 L242,250"/>' + lab(306, 253, 'oesophagus') +
      '<path class="ld" d="M124,286 L192,270"/>' + lab(118, 289, 'trachea', 'end') +
      '<path class="ld" d="M104,206 L146,188"/>' + lab(98, 209, 'tongue', 'end');

    return {
      svg: svg('0 0 470 322',
        face + soft + tongue + bolus + laryn + leaders +
        '<text class="fl" x="235" y="20" text-anchor="middle">One swallow, seen from the side</text>'),
      cap:'Watch the order. The <b>soft palate</b> lifts and seals off the nose. The <b>tongue</b> humps up and drives the <b>bolus</b> backwards. The larynx rises as it goes, so the <b>epiglottis</b> tips down over the opening of the <b>trachea</b> and the bolus is guided past it into the <b>oesophagus</b>. Breathing stops for about a second while this happens &#8212; which is why talking while eating is how food goes down the wrong way.'
    };
  }

  /* ---------------- water reabsorption in the colon ---------------- */
  function waterColon() {
    /* The colon does not do the smooth travelling wave the oesophagus does.
       It segments: neighbouring pouches (haustra) squeeze alternately, which
       kneads the contents back and forth against the wall so the water has
       time to be absorbed. Contents enter watery on the left and leave solid. */
    var DUR = '5s';
    function wallFrame(phase) {
      var n = 60, top = [], bot = [], i, x, k, y;
      for (i = 0; i <= n; i++) {
        x = 44 + (400 - 44) * (i / n);
        /* three haustra, squeezing out of step with each other */
        k = Math.sin((x - 44) / 34 + phase);
        y = 26 * (1 - 0.34 * Math.max(0, k));
        top.push([x.toFixed(1), (104 - y).toFixed(1)]);
        bot.push([x.toFixed(1), (104 + y).toFixed(1)]);
      }
      bot.reverse();
      return 'M' + top.map(function (p) { return p.join(','); }).join(' L') +
             ' L' + bot.map(function (p) { return p.join(','); }).join(' L') + ' Z';
    }
    var frames = [], i;
    for (i = 0; i <= 16; i++) frames.push(wallFrame((i / 16) * Math.PI * 2));
    var eas = []; for (i = 0; i < 16; i++) eas.push('0.42 0 0.58 1');

    /* water leaving through the wall and entering the blood vessel above */
    var drops = '';
    for (i = 0; i < 9; i++) {
      var dx = 66 + i * 40;
      drops += '<circle cx="' + dx + '" cy="90" r="4.4" fill="#1D4E89" opacity="0">' +
        A + '"cy" values="92;58" dur="2.6s" begin="' + (i * 0.28) + 's" repeatCount="indefinite"/>' +
        A + '"opacity" values="0;.9;.9;0" dur="2.6s" begin="' + (i * 0.28) + 's" repeatCount="indefinite"/>' +
        A + '"r" values="4.4;2.6" dur="2.6s" begin="' + (i * 0.28) + 's" repeatCount="indefinite"/></circle>';
    }
    /* the contents, kneaded along and drying out as they go */
    var mass = '';
    var cols = ['#C9A57E', '#BC9469', '#AC8153', '#9A6E42', '#886036', '#7C5A3C'];
    for (i = 0; i < 6; i++) {
      mass += '<ellipse cx="' + (86 + i * 54) + '" cy="104" rx="' + (25 - i * 1.6) + '" ry="' + (17 - i * 1.4) +
              '" fill="' + cols[i] + '" opacity=".92">' +
              A + '"cx" values="' + (86 + i * 54) + ';' + (86 + i * 54 + 10) + ';' + (86 + i * 54) +
              '" dur="' + DUR + '" begin="' + (i * 0.4) + 's" repeatCount="indefinite"/>' +
              A + '"ry" values="' + (17 - i * 1.4) + ';' + (13 - i * 1.2) + ';' + (17 - i * 1.4) +
              '" dur="' + DUR + '" begin="' + (i * 0.4) + 's" repeatCount="indefinite"/></ellipse>';
    }

    return {
      svg: svg('-16 6 486 204',
        /* the blood vessel that takes the water away */
        '<rect x="34" y="30" width="376" height="24" rx="12" fill="#FAE0DC" stroke="#C0392B" stroke-width="1.8"/>' +
        '<text class="fs" x="222" y="46" text-anchor="middle" style="fill:#8A2A20">blood — water and mineral salts are carried away</text>' +
        /* the colon wall, segmenting */
        '<path fill="#F3E1D3" stroke="#C08A72" stroke-width="2.6" stroke-linejoin="round" d="' + frames[0] + '">' +
        A + '"d" values="' + frames.join(';') + '" dur="' + DUR + '" repeatCount="indefinite" ' +
        'calcMode="spline" keySplines="' + eas.join(';') + '"/></path>' +
        mass + drops +
        '<text class="fs" x="44" y="150">watery, from the</text><text class="fs" x="44" y="163">small intestine</text>' +
        '<text class="fs" x="400" y="150" text-anchor="end">solid faeces,</text>' +
        '<text class="fs" x="400" y="163" text-anchor="end">stored in the rectum</text>' +
        '<text class="fl" x="222" y="186" text-anchor="middle">The pouches squeeze in turn, kneading the contents</text>' +
        '<text class="fl" x="222" y="205" text-anchor="middle">against the wall so the water has time to leave.</text>'),
      cap:'<b>The colon.</b> It does not push with one smooth wave like the oesophagus — neighbouring pouches squeeze in turn, working the contents against the wall so water and mineral salts have time to be absorbed. What arrives watery leaves solid. Watch the trap though: <b>most</b> of the water is absorbed in the <b>small</b> intestine, not here.'
    };
  }


  /* ---------------- pie chart, for the diet questions ---------------- */
  /* Seven slices need seven colours that stay apart from each other, including
     for a colour-blind reader: minerals was a green almost identical to fibre,
     and water a blue almost identical to vitamins. They are now a purple and a
     pale blue, which separate on hue and on lightness. */
  var DIET_COL = { carbohydrate:'#A15C07', fat:'#C9A227', protein:'#9B2C6F',
                   fibre:'#5E7A3A', vitamins:'#0F6480', minerals:'#7B4FA8',
                   water:'#7FB2CE', other:'#8A8A8A' };
  function pie(slices, size) {
    var R = (size || 96) / 2, cx = R, cy = R, a0 = -Math.PI / 2, out = '';
    slices.forEach(function (s) {
      var a1 = a0 + (s.pct / 100) * Math.PI * 2;
      var big = (a1 - a0) > Math.PI ? 1 : 0;
      var x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
      var x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
      out += '<path d="M' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' L' + x0.toFixed(1) + ',' + y0.toFixed(1) +
             ' A' + R + ',' + R + ' 0 ' + big + ',1 ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Z" ' +
             'fill="' + (DIET_COL[s.cat] || '#999') + '" stroke="#fff" stroke-width="1.6"/>';
      a0 = a1;
    });
    return '<svg class="pie" viewBox="0 0 ' + (size || 96) + ' ' + (size || 96) + '" role="img">' + out + '</svg>';
  }
  function pieKey(slices) {
    return '<ul class="piekey">' + slices.map(function (s) {
      return '<li><i style="background:' + (DIET_COL[s.cat] || '#999') + '"></i>' +
             s.label + ' <b>' + s.pct + '%</b></li>';
    }).join('') + '</ul>';
  }


  /* ---------------- same balance, different amount ---------------- */
  function sameBalance() {
    /* The point of "requirements vary" is NOT calories in against calories out —
       that is energy balance, a different idea, and not on 0610. The point is
       "same recipe, different plate size" either: a growing child needs
       proportionally more protein and more calcium, and someone digging all
       day needs proportionally more carbohydrate and fat. Three plates, three
       mixes, three sizes. */
    /* Seven slices, because the sentence above them says seven components.
       Vitamins and mineral ions are separate components of the diet, and
       water is one too — merging them into "vitamins and minerals" and
       leaving water out made the figure contradict its own heading. */
    /* Vitamins and water are held level across all three on purpose: they are
       the anchor that shows not everything changes. Each array totals 100. */
    var SL_CHILD  = [{label:'Carbohydrate',pct:28,cat:'carbohydrate'},{label:'Protein',pct:22,cat:'protein'},
                     {label:'Fats and oils',pct:15,cat:'fat'},{label:'Fibre',pct:8,cat:'fibre'},
                     {label:'Vitamins',pct:6,cat:'vitamins'},{label:'Mineral ions',pct:9,cat:'minerals'},
                     {label:'Water',pct:12,cat:'water'}];
    var SL_DESK   = [{label:'Carbohydrate',pct:33,cat:'carbohydrate'},{label:'Protein',pct:17,cat:'protein'},
                     {label:'Fats and oils',pct:16,cat:'fat'},{label:'Fibre',pct:10,cat:'fibre'},
                     {label:'Vitamins',pct:6,cat:'vitamins'},{label:'Mineral ions',pct:6,cat:'minerals'},
                     {label:'Water',pct:12,cat:'water'}];
    var SL_LABOUR = [{label:'Carbohydrate',pct:36,cat:'carbohydrate'},{label:'Protein',pct:15,cat:'protein'},
                     {label:'Fats and oils',pct:18,cat:'fat'},{label:'Fibre',pct:7,cat:'fibre'},
                     {label:'Vitamins',pct:6,cat:'vitamins'},{label:'Mineral ions',pct:6,cat:'minerals'},
                     {label:'Water',pct:12,cat:'water'}];
    var who = [{x:82,  r:34, sl:SL_CHILD,  t:'A 7-year-old',     s:'growing \u2014 most protein'},
               {x:228, r:48, sl:SL_DESK,   t:'An office worker', s:'sitting most of the day'},
               {x:388, r:64, sl:SL_LABOUR, t:'A builder',        s:'heavy work \u2014 most energy'}];
    var g = who.map(function (w) {
      var inner = pie(w.sl, w.r * 2);
      inner = inner.replace('<svg class="pie" viewBox', '<svg viewBox');
      return '<g transform="translate(' + (w.x - w.r) + ',' + (118 - w.r) + ')">' +
             '<svg width="' + (w.r * 2) + '" height="' + (w.r * 2) + '" ' +
             inner.slice(inner.indexOf('viewBox')) + '</g>' +
             '<text class="fb" x="' + w.x + '" y="200" text-anchor="middle">' + w.t + '</text>' +
             '<text class="fs" x="' + w.x + '" y="215" text-anchor="middle">' + w.s + '</text>';
    }).join('');
    var key = SL_DESK.map(function (sl, i) {
      return '<g transform="translate(' + (16 + (i % 4) * 116) + ',' + (238 + Math.floor(i / 4) * 18) + ')">' +
             '<rect width="10" height="10" rx="3" fill="' + DIET_COL[sl.cat] + '"/>' +
             '<text class="fs" x="15" y="9">' + sl.label + '</text></g>';
    }).join('');
    return {
      svg: svg('0 0 470 296',
        '<text class="fl" x="235" y="20" text-anchor="middle">The same seven components \u2014 but not in the same proportions.</text>' +
        '<text class="fl" x="235" y="36" text-anchor="middle">Both the <tspan font-weight="700">mix</tspan> and the <tspan font-weight="700">amount</tspan> change with age and activity.</text>' +
        g + key),
      cap:'A balanced diet is not one fixed menu \u2014 and not one fixed recipe either. The <b>mix</b> changes as well as the <b>amount</b>. The growing 7-year-old needs the largest share of <b>protein</b> and <b>mineral ions</b> (calcium, for bones and teeth); the builder needs the largest share of <b>carbohydrate and fat</b>, because heavy work needs energy; the office worker sits between them. Watch the trap: a smaller <b>slice</b> is not less food. Fibre is a 7% slice for the builder and an 8% slice for the child, but his whole plate is far bigger, so he still eats much more fibre. Requirements change with <b>age, activity, pregnancy and breastfeeding</b>.'
    };
  }

  /* The same plate, sized for half a row. A viewBox is only a coordinate
     system, so the way to keep labels readable in a narrower box is to make
     the box itself narrower — drop the explanatory sub-lines, pull the label
     column in, and the type comes back up to full size when the SVG is
     scaled to fit. The long-form version above is still the one used when a
     figure has the whole width to itself. */
  function toothCompact() {
    /* The pair version of the tooth plate. It lost its explanatory sub-lines
       when it was first cut down to fit half a row, and that made it a poorer
       diagram than the one it replaced — which is what he noticed. They are
       back. The way to keep them readable in a narrower box is to make the
       box itself narrower, not the type smaller: the viewBox is trimmed to
       what the artwork and labels actually occupy, so the same rendered width
       gives a bigger scale. */
    var art = (global.FIGURE_ART || {}).tooth;
    if (!art) return { svg:'', cap:'' };
    return {
      svg: plateFig(art, {
        viewBox:'-30 50 576 596', leftX:-14, rightX:384, minGap:30, top:74, bottom:606,
        hide:[55,56,57,58,59,60,61,62,68,69,70,71],
        labels:[
          { side:'right', ly:116, at:[281,116], text:'Enamel',      sub:'hardest substance in the body' },
          { side:'right', ly:178, at:[260,167], text:'Dentine',     sub:'softer, and it senses pain' },
          { side:'right', ly:236, at:[203,214], text:'Pulp cavity', sub:'blood vessels and nerves' },
          { side:'right', ly:288, at:[323,236], text:'Gum' },
          { side:'right', ly:344, at:[279,400], text:'Cement',      sub:'thin layer on the root surface' },
          { side:'right', ly:432, at:[308,435], text:'Jaw bone' },
          { side:'right', ly:508, at:[290,560], text:'Blood vessel' },
          { side:'right', ly:562, at:[290,570], text:'Nerve' }
        ],
        brackets:[
          { x:26, y0:62,  y1:262, text:'Crown' },
          { x:26, y0:274, y1:556, text:'Root' }
        ]
      }),
      cap:''
    };
  }

  var FIGS = { sameBalance:sameBalance, toothCompact:toothCompact, chewing:chewing, tooth:tooth, peristalsis:peristalsis,
               emulsify:emulsify, villus:villus, surfaceArea:surfaceArea,
               egestVsExcrete:egestVsExcrete, churn:churn, starchPath:starchPath,
               swallow:swallow, waterColon:waterColon };

  global.Figures = {
    pie:pie, pieKey:pieKey, dietColours:DIET_COL,
    get:function (name) { return FIGS[name] ? FIGS[name]() : null; },
    names:Object.keys(FIGS)
  };
})(window);
