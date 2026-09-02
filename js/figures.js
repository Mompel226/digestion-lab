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
          { side:'right', ly:330, at:[201,296], text:'Cement',  sub:'anchors the root' },
          { side:'right', ly:436, at:[308,435], text:'Jaw bone' },
          { side:'right', ly:520, at:[288,556], text:'Blood vessel' },
          { side:'right', ly:576, at:[288,580], text:'Nerve' }
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
      viewBox:'-158 -18 646 452', leftX:-24, rightX:296, minGap:26, top:20, bottom:410,
      hide:[19,20,21,22,23,24,25,26],
      labels:[
        { side:'left',  ly:96,  at:[54,104], text:'Microvilli', sub:'the brush border' },
        { side:'left',  ly:210, at:[44,214], text:'Epithelium', sub:'one cell thick' },
        { side:'left',  ly:330, at:[92,330], text:'Villus' },
        { side:'right', ly:96,  at:[166,93], text:'Capillaries', sub:'glucose + amino acids' },
        { side:'right', ly:216, at:[150,215], text:'Lacteal', sub:'fatty acids + glycerol' },
        { side:'right', ly:360, at:[214,364], text:'Blood vessel', sub:'on to the hepatic portal vein' }
      ],
      note:[164, 428, 'Large surface area · short diffusion distance · steep concentration gradient', 'middle']
    });
    return {
      svg: base.replace('</svg>', '<text class="fs" x="-150" y="6">lumen of the small intestine</text>' + flow + '</svg>'),
      cap:'<b>The villus.</b> Four adaptations, each with a reason: villi and microvilli give a <b>large surface area</b>; the wall is <b>one cell thick</b> so the diffusion distance is short; a <b>dense capillary network</b> carries nutrients away and keeps the concentration gradient steep; a <b>lacteal</b> takes the fatty acids and glycerol.'
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
    /* Two panels. The gut follows the orientation of the body plate beside it —
       descending colon down the viewer's RIGHT, sigmoid bending left, rectum and
       anus at the bottom — because drawing it the other way round teaches a
       second, contradictory picture of the same organ.

       The cell is a cell: membrane, cytoplasm, nucleus with a nucleolus,
       mitochondria with cristae, rough ER studded with ribosomes, a Golgi
       stack, free ribosomes. The point of the panel is that excretion removes
       what these organelles made, so they have to be visible. */
    var LX = 12, LW = 268, RX = 302, RW = 306, PT = 28, PH = 268;

    /* --- the last of the gut, oriented like the plate --- */
    var gutPath = 'M232,96 L232,150 Q232,178 206,190 L176,196 Q152,202 152,224';
    var gut =
      '<path d="' + gutPath + '" fill="none" stroke="#B07E4A" stroke-width="30" stroke-linecap="round"/>' +
      '<path d="' + gutPath + '" fill="none" stroke="#EFDFCB" stroke-width="23" stroke-linecap="round"/>' +
      [[232,112],[232,146],[210,186],[176,196]].map(function (p) {
        return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="7.5" ry="5.6" fill="#A9713C" opacity=".85"/>';
      }).join('') +
      '<ellipse cx="152" cy="230" rx="13" ry="5.5" fill="#C08B57" stroke="#8A5A2B" stroke-width="2"/>' +
      '<ellipse cx="152" cy="230" rx="5" ry="2.2" fill="#6E4423"/>' +
      '<path class="ld" d="M138,230 L118,230"/>' +
      '<text class="fs" x="114" y="233" text-anchor="end">anus</text>' +
      '<path class="ld" d="M216,124 L206,124"/>' +
      '<text class="fs" x="202" y="127" text-anchor="end">colon</text>' +
      '<path class="ld" d="M196,208 L212,214"/>' +
      '<text class="fs" x="216" y="217">rectum</text>';

    /* --- a body cell --- */
    var CX = 414, CY = 158;
    function mito(x, y, rot) {
      return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')">' +
        '<rect x="-17" y="-8" width="34" height="16" rx="8" fill="#F2C9A6" stroke="#B5713A" stroke-width="1.6"/>' +
        '<path d="M-11,-6 q5,6 0,12 M-3,-6 q5,6 0,12 M5,-6 q5,6 0,12" fill="none" stroke="#B5713A" stroke-width="1.3"/>' +
        '</g>';
    }
    var cell =
      /* cytoplasm and membrane */
      '<path d="M414,92 C462,90 486,120 484,158 C482,196 456,224 414,224 ' +
      'C372,224 344,198 344,158 C344,120 368,94 414,92 Z" ' +
      'fill="#E4F1F7" stroke="#0F6E8C" stroke-width="3"/>' +
      '<path d="M414,98 C458,96 479,124 477,158 C475,192 452,218 414,218 ' +
      'C376,218 351,194 351,158 C351,124 372,100 414,98 Z" ' +
      'fill="none" stroke="#8FBDD4" stroke-width="1.4"/>' +
      /* nucleus */
      '<ellipse cx="404" cy="146" rx="30" ry="25" fill="#BBD9E8" stroke="#0F6E8C" stroke-width="2"/>' +
      '<ellipse cx="404" cy="146" rx="25" ry="20" fill="none" stroke="#7FB2CE" stroke-width="1.2"/>' +
      '<ellipse cx="410" cy="144" rx="9" ry="7.5" fill="#5B8FB5"/>' +
      /* rough ER, studded with ribosomes */
      '<path d="M368,178 q18,-9 36,-2 M366,188 q20,-9 40,-2" fill="none" stroke="#0F6E8C" stroke-width="1.6"/>' +
      [[371,176],[381,173],[391,173],[401,176],[369,186],[380,183],[391,183],[402,186]].map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.7" fill="#0B5670"/>';
      }).join('') +
      /* Golgi stack with a vesicle */
      '<g transform="translate(452,182)">' +
      '<path d="M-16,-6 q16,-6 30,-1 M-16,0 q16,-6 30,-1 M-16,6 q16,-6 30,-1" fill="none" stroke="#7A4FA0" stroke-width="1.9" stroke-linecap="round"/>' +
      '<circle cx="18" cy="8" r="3.2" fill="#7A4FA0"/></g>' +
      /* mitochondria */
      mito(372, 128, -24) + mito(452, 132, 16) +
      /* free ribosomes */
      [[430,196],[420,204],[440,168],[386,204],[398,196]].map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.9" fill="#0B5670"/>';
      }).join('');

    var cellLabels =
      '<path class="ld" d="M498,130 L430,140"/><text class="fs" x="502" y="133">nucleus</text>' +
      '<path class="ld" d="M498,156 L466,136"/><text class="fs" x="502" y="159">mitochondrion</text>' +
      '<path class="ld" d="M498,182 L470,182"/><text class="fs" x="502" y="185">Golgi apparatus</text>' +
      '<path class="ld" d="M498,208 L404,190"/><text class="fs" x="502" y="211">ribosomes</text>' +
      '<path class="ld" d="M498,232 L474,204"/><text class="fs" x="502" y="235">cell membrane</text>';

    return {
      svg: svg('0 0 620 348',
        '<rect x="' + LX + '" y="' + PT + '" width="' + LW + '" height="' + PH + '" rx="14" fill="#FCF4E7" stroke="#B07E4A" stroke-width="2.4"/>' +
        '<rect x="' + RX + '" y="' + PT + '" width="' + RW + '" height="' + PH + '" rx="14" fill="#E8F3F8" stroke="#0F6E8C" stroke-width="2.4"/>' +
        '<text class="fb" x="146" y="56" text-anchor="middle" style="fill:#8A5A2B">EGESTION</text>' +
        '<text class="fs" x="146" y="74" text-anchor="middle">never entered a cell</text>' +
        '<text class="fb" x="455" y="56" text-anchor="middle" style="fill:#0F6E8C">EXCRETION</text>' +
        '<text class="fs" x="455" y="74" text-anchor="middle">made inside cells</text>' +
        gut + cell + cellLabels +
        '<text class="fb" x="30" y="112" style="fill:#8A5A2B">Fibre / roughage</text>' +
        '<text class="fb" x="30" y="140" style="fill:#8A5A2B">Undigested food</text>' +
        '<text class="fb" x="30" y="168" style="fill:#8A5A2B">Dead gut cells</text>' +
        '<text class="fs" x="146" y="274" text-anchor="middle">passed out as faeces</text>' +
        '<text class="fs" x="455" y="256" text-anchor="middle">Urea from the liver leaves in urine.</text>' +
        '<text class="fs" x="455" y="272" text-anchor="middle">Carbon dioxide from respiration leaves in the breath.</text>' +
        '<text class="fl" x="310" y="320" text-anchor="middle">Food in the gut is still ' +
        '<tspan style="fill:#14572B" font-weight="700">outside</tspan> your cells, so getting rid of it is egestion.</text>' +
        '<text class="fl" x="310" y="338" text-anchor="middle">Excretion removes what the cells themselves made.</text>'),
      cap:'The alimentary canal is a tube running <i>through</i> the body, and what is in the tube has never been inside a cell. <b>Egestion</b> passes that out. <b>Excretion</b> removes waste the cells made &#8212; urea from the liver, carbon dioxide from respiration in the mitochondria. Different processes, and 0610 asks you to tell them apart.'
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
          { side:'right', ly:344, at:[201,296], text:'Cement',      sub:'anchors the root' },
          { side:'right', ly:432, at:[308,435], text:'Jaw bone' },
          { side:'right', ly:508, at:[288,556], text:'Blood vessel' },
          { side:'right', ly:562, at:[288,580], text:'Nerve' }
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
