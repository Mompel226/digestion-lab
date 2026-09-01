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
  function chewing() {
    var big = '<rect x="34" y="46" width="72" height="72" rx="9" fill="#E8B98A" stroke="#B07E4A" stroke-width="2"/>';
    var small = '', i, j;
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++)
      small += '<rect x="' + (218 + i * 19) + '" y="' + (46 + j * 19) + '" width="15" height="15" rx="3" ' +
               'fill="#E8B98A" stroke="#B07E4A" stroke-width="1.4"/>';
    return {
      svg: svg('0 0 380 176',
        '<text class="fb" x="70" y="30" text-anchor="middle">One large piece</text>' +
        '<text class="fb" x="256" y="30" text-anchor="middle">Many small pieces</text>' +
        big + small +
        '<path d="M132,82 L190,82" stroke="#14572B" stroke-width="2.5" marker-end="url(#ar)"/>' +
        '<defs><marker id="ar" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">' +
        '<path d="M0,0 L9,4.5 L0,9 Z" fill="#14572B"/></marker></defs>' +
        '<text class="fs" x="161" y="74" text-anchor="middle">teeth</text>' +
        '<text class="fs" x="70" y="140" text-anchor="middle">surface area = 288 units</text>' +
        '<text class="fs" x="256" y="140" text-anchor="middle">surface area = 576 units</text>' +
        '<text class="fl" x="190" y="164" text-anchor="middle">Same amount of food — twice the surface for enzymes to act on.</text>'),
      cap:'<b>Physical digestion increases surface area.</b> The mass of food does not change; the area enzymes can reach does. That is the whole point of chewing.'
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
  function toothTypes() {
    /* Drawn to the two things that actually separate a premolar from a molar:
       the number of cusps on the biting surface, and the number of roots. */
    var K = [
      { x:66,  name:'Incisor',  job:'Cutting and biting',
        crown:'M40,116 C40,72 48,58 66,58 C84,58 92,72 92,116 C92,130 84,136 66,136 C48,136 40,130 40,116 Z',
        top:'M40,66 L92,66', roots:'M54,136 L50,206', cusps:'1 chisel edge', nroot:'1 root' },
      { x:196, name:'Canine',   job:'Holding and tearing',
        crown:'M172,120 C172,68 186,40 196,40 C206,40 220,68 220,120 C220,132 212,138 196,138 C180,138 172,132 172,120 Z',
        top:'', roots:'M188,138 L184,212', cusps:'1 point', nroot:'1 long root' },
      { x:326, name:'Premolar', job:'Crushing and grinding',
        crown:'M300,118 C300,80 308,64 326,64 C344,64 352,80 352,118 C352,132 344,138 326,138 C308,138 300,132 300,118 Z',
        top:'M304,74 C310,62 316,62 322,74 M330,74 C336,62 342,62 348,74', roots:'M316,138 L312,202',
        cusps:'2 cusps', nroot:'usually 1 root' },
      { x:456, name:'Molar',    job:'Chewing and grinding',
        crown:'M424,118 C424,80 434,62 456,62 C478,62 488,80 488,118 C488,132 478,138 456,138 C434,138 424,132 424,118 Z',
        top:'M428,74 C433,62 439,62 444,74 M448,74 C453,62 459,62 464,74 M468,74 C473,62 479,62 484,74',
        roots:'M436,138 L428,200 M456,138 L456,204 M476,138 L484,200',
        cusps:'4 cusps', nroot:'2 roots (3 in the upper jaw)' }
    ];
    var g = K.map(function (k) {
      return '<g>' +
        (k.roots ? '<path d="' + k.roots + '" stroke="#E6D5B7" stroke-width="10" fill="none" stroke-linecap="round"/>' : '') +
        '<path d="' + k.crown + '" fill="#FCFBF6" stroke="#B9AB92" stroke-width="2.2" stroke-linejoin="round"/>' +
        (k.top ? '<path d="' + k.top + '" fill="none" stroke="#B9AB92" stroke-width="2"/>' : '') +
        '<text class="fb" x="' + k.x + '" y="242" text-anchor="middle">' + k.name + '</text>' +
        '<text class="fs" x="' + k.x + '" y="259" text-anchor="middle">' + k.job + '</text>' +
        '<text class="fl" x="' + k.x + '" y="282" text-anchor="middle" style="fill:#A16207">' + k.cusps + '</text>' +
        '<text class="fl" x="' + k.x + '" y="299" text-anchor="middle" style="fill:#0F6E8C">' + k.nroot + '</text>' +
        '</g>';
    }).join('');
    return {
      svg: svg('16 30 524 340',
        '<rect x="26" y="204" width="500" height="11" rx="5.5" fill="#EBD3D3"/>' + g +
        '<rect x="26" y="312" width="500" height="46" rx="10" fill="#FBF3E3" stroke="#A16207" stroke-width="1.6"/>' +
        '<text class="fl" x="276" y="332" text-anchor="middle">Premolar or molar? Count the bumps on the biting surface:</text>' +
        '<text class="fl" x="276" y="350" text-anchor="middle"><tspan fill="#A16207" font-weight="700">2 = premolar</tspan>, ' +
        '<tspan fill="#A16207" font-weight="700">4 = molar</tspan>. Root number depends on the jaw, so it is a poor test.</text>'),
      cap:'<b>Incisors</b> cut and bite. <b>Canines</b> hold and tear. <b>Premolars</b> crush and grind. <b>Molars</b> chew and grind. The pair students confuse is premolar and molar — a premolar has <b>two</b> cusps, a molar has <b>four</b>. Root number is not a reliable test: most premolars have one root, lower molars have two and upper molars three. All four are physical digestion: the food molecules are unchanged.'
    };
  }

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
        '<path d="M160,104 L214,104" stroke="#4E7D4A" stroke-width="3.4" marker-end="url(#arB)"/>' +
        '<text class="fb" x="187" y="92" text-anchor="middle" style="fill:#4E7D4A">bile</text>' +
        A + '"opacity" values="0;0;1;1;0" keyTimes="0;0.4;0.5;0.92;1" dur="' + CYCLE + '" repeatCount="indefinite"/></g>' +
        '<defs><marker id="arB" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">' +
        '<path d="M0,0 L9,4.5 L0,9 Z" fill="#4E7D4A"/></marker></defs>' +
        /* what a bile salt is */
        '<g transform="translate(24,214)">' +
        '<line x1="0" y1="0" x2="0" y2="11" stroke="#4E7D4A" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="0" cy="0" r="4" fill="#6FA36B" stroke="#3F6B3C" stroke-width="1"/></g>' +
        '<text class="fs" x="38" y="211">a bile salt — the head likes water,</text>' +
        '<text class="fs" x="38" y="224">the tail likes fat, so it sits on the surface</text>' +
        '<text class="fl" x="228" y="250" text-anchor="middle">Same amount of fat. Far more surface for <tspan class="fb" style="fill:#6B3FA0">lipase</tspan> to work on.</text>' +
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
      mol(10, 250, 92, 12, '#6B3FA0', '3.6s', '0.6s') +
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
        '<path d="M138,80 L158,80 M283,80 L303,80" stroke="#14572B" stroke-width="2.2" marker-end="url(#ar3)"/>' +
        '<defs><marker id="ar3" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">' +
        '<path d="M0,0 L9,4.5 L0,9 Z" fill="#14572B"/></marker></defs>' +
        '<text class="fl" x="220" y="168" text-anchor="middle">Together they raise the surface area up to <tspan class="fb">600×</tspan> that of a flat tube.</text>' +
        '<text class="fs" x="220" y="188" text-anchor="middle">About 250 m² of absorbing surface — roughly a tennis court.</text>'),
      cap:'Three levels of folding multiply together: <b>circular folds</b> (×3), <b>villi</b> (×10) and <b>microvilli</b> (×20). More surface area means more sites for small soluble molecules to be absorbed.'
    };
  }

  /* ---------------- egestion vs excretion ---------------- */
  function egestVsExcrete() {
    return {
      svg: svg('-28 0 496 236',
        '<rect x="14" y="20" width="196" height="176" rx="12" fill="#FBF3E3" stroke="#A16207" stroke-width="2"/>' +
        '<rect x="230" y="20" width="196" height="176" rx="12" fill="#E5F0F4" stroke="#0F6E8C" stroke-width="2"/>' +
        '<text class="fb" x="112" y="44" text-anchor="middle" style="fill:#A16207">EGESTION</text>' +
        '<text class="fb" x="328" y="44" text-anchor="middle" style="fill:#0F6E8C">EXCRETION</text>' +
        '<text class="fs" x="112" y="62" text-anchor="middle">never entered a cell</text>' +
        '<text class="fs" x="328" y="62" text-anchor="middle">made inside cells</text>' +
        /* left: tube passing through */
        '<path d="M52,84 L52,168" stroke="#C98E76" stroke-width="17" stroke-linecap="round"/>' +
        '<circle cx="52" cy="98" r="6" fill="#8A6A4A"><animate attributeName="cy" values="86;168" dur="3s" repeatCount="indefinite"/></circle>' +
        '<text class="fl" x="76" y="100">Fibre / roughage</text>' +
        '<text class="fl" x="76" y="122">Undigested food</text>' +
        '<text class="fl" x="76" y="144">Dead gut cells</text>' +
        '<text class="fs" x="76" y="166">leaves as faeces, via the anus</text>' +
        /* right: cell producing waste */
        '<circle cx="268" cy="112" r="26" fill="#CDE3EA" stroke="#0F6E8C" stroke-width="2"/>' +
        '<circle cx="268" cy="112" r="8" fill="#0F6E8C" opacity=".5"/>' +
        '<path d="M294,104 L318,96 M294,120 L318,128" stroke="#0F6E8C" stroke-width="1.8" fill="none"/>' +
        '<text class="fl" x="324" y="100">Urea → urine</text>' +
        '<text class="fl" x="324" y="132">CO₂ → lungs</text>' +
        '<text class="fs" x="328" y="166" text-anchor="middle">products of reactions in cells</text>' +
        '<text class="fl" x="220" y="220" text-anchor="middle">Food in the gut is still <tspan class="fb">outside</tspan> your cells — so removing it is egestion, not excretion.</text>'),
      cap:'<b>The distinction 0610 examines.</b> Egestion removes material that was never absorbed into cells. Excretion removes the waste products of chemical reactions <i>inside</i> cells. Faeces are egested; urea and carbon dioxide are excreted.'
    };
  }

  /* ---------------- stomach churning ---------------- */
  function churn() {
    var CYCLE = '6s';
    var WALL = 'M118,44 C158,30 214,44 232,88 C252,136 240,190 196,204 ' +
               'C158,216 122,196 114,160 C106,120 108,66 118,44 Z';
    var INNER = 'M130,58 C162,46 204,58 218,94 C234,134 224,178 190,189 ' +
                'C160,198 134,182 128,152 C122,120 123,76 130,58 Z';

    /* three rings of contraction travelling down the stomach, one after another */
    var waves = '';
    for (var w = 0; w < 3; w++) {
      waves +=
        '<g opacity="0">' +
        '<ellipse cx="173" cy="70" rx="56" ry="13" fill="none" stroke="#B4614A" stroke-width="9" stroke-linecap="round">' +
        A + '"cy" values="70;196" dur="' + CYCLE + '" begin="' + (w * 2) + 's" repeatCount="indefinite"/>' +
        A + '"rx" values="56;44;30;40" dur="' + CYCLE + '" begin="' + (w * 2) + 's" repeatCount="indefinite"/>' +
        '</ellipse>' +
        A + '"opacity" values="0;.75;.75;0" keyTimes="0;0.1;0.8;1" dur="' + CYCLE +
        '" begin="' + (w * 2) + 's" repeatCount="indefinite"/></g>';
    }

    /* food pieces tumbling and breaking up as they are squeezed */
    var bits = '';
    for (var i = 0; i < 11; i++) {
      var ang = (i / 11) * 360;
      var rad = 26 + (i % 3) * 13;
      bits +=
        '<g transform="translate(173,124)">' +
        '<animateTransform attributeName="transform" type="rotate" from="' + ang + ' 0 0" to="' +
        (ang + 360) + ' 0 0" dur="' + (5 + (i % 4)) + 's" repeatCount="indefinite" additive="sum"/>' +
        '<circle cx="' + rad + '" cy="0" r="' + (7 - (i % 3)) + '" fill="#C77B3F" opacity=".9">' +
        A + '"r" values="' + (7 - (i % 3)) + ';' + (3.5 - (i % 3) * 0.6) + '" dur="12s" repeatCount="indefinite"/>' +
        '</circle></g>';
    }

    return {
      svg: svg('-4 0 470 276',
        /* the wall, drawn as the muscle layers that do the work */
        '<path d="' + WALL + '" fill="#E8B48F" stroke="#B4614A" stroke-width="3"/>' +
        '<path d="' + WALL + '" fill="none" stroke="#C97F5E" stroke-width="1.6" opacity=".8" transform="translate(0,0) scale(1)"/>' +
        '<path d="' + INNER + '" fill="#F6E0CC" stroke="#C97F5E" stroke-width="1.6"/>' +
        /* gastric juice filling the stomach, deepening as it mixes */
        '<path d="' + INNER + '" fill="#D9A05B" opacity=".25">' +
        A + '"opacity" values=".18;.5;.18" dur="' + CYCLE + '" repeatCount="indefinite"/></path>' +
        bits + waves +
        /* the oesophagus in, the pylorus out */
        '<path d="M150,44 L150,14" stroke="#DFA096" stroke-width="15" stroke-linecap="round"/>' +
        '<text class="fs" x="150" y="14" text-anchor="middle">from the oesophagus</text>' +
        '<path d="M196,204 C214,214 226,214 240,208" stroke="#E0A87A" stroke-width="14" stroke-linecap="round"/>' +
        '<text class="fs" x="196" y="238">to the duodenum</text>' +
        /* labels, kept clear of the drawing */
        '<g class="fl">' +
        '<path class="ld" d="M300,64 L238,80"/><text x="304" y="68">Muscular wall</text>' +
        '<text class="fs" x="304" y="82">squeezes in waves — this is</text>' +
        '<text class="fs" x="304" y="95">physical digestion</text>' +
        '<path class="ld" d="M300,132 L200,128"/><text x="304" y="136">Gastric juice</text>' +
        '<text class="fs" x="304" y="150">hydrochloric acid + pepsin</text>' +
        '<path class="ld" d="M300,186 L214,170"/><text x="304" y="190">Chyme</text>' +
        '<text class="fs" x="304" y="204">what leaves: a soupy,</text>' +
        '<text class="fs" x="304" y="217">acidic mixture</text>' +
        '</g>' +
        '<text class="fl" x="232" y="266" text-anchor="middle">Watch the rings of muscle travel down, and the pieces get smaller.</text>'),
      cap:'<b>Churning.</b> Rings of muscle contract in waves down the stomach, folding the food over and over and mixing it with gastric juice. That is <b>physical</b> digestion — the pieces get smaller. At the same time <b>pepsin</b> is doing chemical digestion on the protein. What leaves is <b>chyme</b>.'
    };
  }

  /* ---------------- starch pathway ---------------- */
  function starchPath() {
    function chain(x, y, n, fill) {
      var s = '';
      for (var i = 0; i < n; i++) s += '<circle cx="' + (x + i * 15) + '" cy="' + y + '" r="7" fill="' + fill + '" stroke="#7A5B12" stroke-width="1.2"/>';
      return s;
    }
    return {
      svg: svg('0 0 440 200',
        '<text class="fb" x="14" y="34">Starch</text>' + chain(14, 60, 8, '#E8C063') +
        '<path d="M136,84 L136,104" stroke="#14572B" stroke-width="2.2" marker-end="url(#ar4)"/>' +
        '<defs><marker id="ar4" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">' +
        '<path d="M0,0 L9,4.5 L0,9 Z" fill="#14572B"/></marker></defs>' +
        '<text class="fb" x="150" y="98" style="fill:#A16207">amylase</text>' +
        '<text class="fs" x="150" y="112">mouth and duodenum</text>' +
        '<text class="fb" x="14" y="140">Maltose</text>' +
        chain(14, 164, 2, '#E8C063') + chain(64, 164, 2, '#E8C063') + chain(114, 164, 2, '#E8C063') + chain(164, 164, 2, '#E8C063') +
        '<path d="M226,164 L262,164" stroke="#14572B" stroke-width="2.2" marker-end="url(#ar4)"/>' +
        '<text class="fb" x="244" y="150" text-anchor="middle" style="fill:#0F6E8C">maltase</text>' +
        '<text class="fs" x="244" y="186" text-anchor="middle">on the microvilli membrane</text>' +
        '<text class="fb" x="286" y="140">Glucose</text>' +
        '<circle cx="292" cy="164" r="7" fill="#7DBE45" stroke="#4A7A25" stroke-width="1.2"/>' +
        '<circle cx="314" cy="164" r="7" fill="#7DBE45" stroke="#4A7A25" stroke-width="1.2"/>' +
        '<circle cx="336" cy="164" r="7" fill="#7DBE45" stroke="#4A7A25" stroke-width="1.2"/>' +
        '<circle cx="358" cy="164" r="7" fill="#7DBE45" stroke="#4A7A25" stroke-width="1.2"/>' +
        '<circle cx="380" cy="164" r="7" fill="#7DBE45" stroke="#4A7A25" stroke-width="1.2"/>' +
        '<circle cx="402" cy="164" r="7" fill="#7DBE45" stroke="#4A7A25" stroke-width="1.2"/>' +
        '<text class="fs" x="286" y="56">Only glucose is small</text>' +
        '<text class="fs" x="286" y="72">enough — and soluble</text>' +
        '<text class="fs" x="286" y="88">enough — to be absorbed.</text>'),
      cap:'<b>Two enzymes, two steps.</b> Amylase breaks starch into maltose — it does <b>not</b> make glucose. Maltase, sitting on the membranes of the microvilli, then breaks maltose into glucose.'
    };
  }


  /* ---------------- swallowing: the epiglottis ---------------- */
  function swallow() {
    /* A sagittal section, animated through the real sequence:
       the tongue drives the bolus back, the soft palate lifts to shut off
       the nose, the larynx RISES, and it is that rise that tips the
       epiglottis down over the airway. The bolus slides over the closed
       epiglottis into the oesophagus, then everything springs back. */
    var D = '5s', K = '0;0.20;0.30;0.46;0.62;0.74;1';
    var E = '0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1';

    return {
      svg: svg('-6 0 460 316',
        /* --- head in section, static --- */
        '<path d="M40,44 C86,20 168,16 214,40 C246,56 258,86 254,118 C250,152 232,176 214,196 ' +
        'C200,212 190,232 188,256 L96,256 C94,222 84,196 66,176 C46,154 34,120 36,88 C37,68 38,54 40,44 Z" ' +
        'fill="#FBEEE0" stroke="#DCC3A6" stroke-width="2"/>' +
        /* nasal cavity */
        '<path d="M60,64 C96,54 140,54 172,62 C176,74 174,84 166,90 L74,90 C64,84 58,74 60,64 Z" ' +
        'fill="#E7F0F6" stroke="#B9CBD8" stroke-width="1.4"/>' +
        '<text class="fs" x="76" y="76">nasal cavity</text>' +
        /* hard palate */
        '<path d="M62,96 L170,96" stroke="#D8C09A" stroke-width="6" stroke-linecap="round"/>' +
        /* oral cavity */
        '<path d="M60,102 C100,98 152,100 176,108 C180,124 172,140 150,146 L74,146 C62,136 56,118 60,102 Z" ' +
        'fill="#F6E2DC" stroke="#D3B0A6" stroke-width="1.3"/>' +
        /* pharynx + oesophagus, behind */
        '<path d="M186,96 C202,120 206,150 202,180 L202,262" stroke="#DFA096" stroke-width="26" ' +
        'fill="none" stroke-linecap="round"/>' +
        '<text class="fs" x="222" y="250">oesophagus</text>' +

        /* --- larynx and trachea: this whole group RISES during the swallow --- */
        '<g>' +
        '<animateTransform attributeName="transform" type="translate" ' +
        'values="0,0; 0,-14; 0,-16; 0,-16; 0,-8; 0,0; 0,0" keyTimes="' + K + '" ' +
        'dur="' + D + '" repeatCount="indefinite" calcMode="spline" keySplines="' + E + '"/>' +
        '<path d="M158,172 C166,196 168,220 166,248 L166,268" stroke="#C7CFD4" stroke-width="22" ' +
        'fill="none" stroke-linecap="round"/>' +
        '<path d="M150,166 C160,160 174,162 178,172" stroke="#AEB8BE" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<text class="fs" x="120" y="266">trachea</text>' +

        /* the epiglottis, hinged at its base, tipping down over the airway */
        '<g transform="rotate(0 156 164)">' +
        '<animateTransform attributeName="transform" type="rotate" ' +
        'values="0 156 164; 0 156 164; 74 156 164; 78 156 164; 74 156 164; 0 156 164; 0 156 164" ' +
        'keyTimes="' + K + '" dur="' + D + '" repeatCount="indefinite" calcMode="spline" keySplines="' + E + '"/>' +
        '<path d="M156,164 C150,146 152,130 160,122 C168,130 170,146 166,164 Z" ' +
        'fill="#E4A6A6" stroke="#B87878" stroke-width="1.6"/>' +
        '</g></g>' +

        /* --- soft palate lifting to seal off the nose --- */
        '<g transform="rotate(0 172 96)">' +
        '<animateTransform attributeName="transform" type="rotate" ' +
        'values="0 172 96; -34 172 96; -38 172 96; -38 172 96; -30 172 96; 0 172 96; 0 172 96" ' +
        'keyTimes="' + K + '" dur="' + D + '" repeatCount="indefinite" calcMode="spline" keySplines="' + E + '"/>' +
        '<path d="M172,96 C182,104 188,116 186,128 C178,124 172,112 170,100 Z" fill="#E9BFB6" stroke="#C99A90" stroke-width="1.4"/>' +
        '</g>' +

        /* --- the tongue, humping backwards to drive the bolus --- */
        '<path fill="#D98A8A" stroke="#B87070" stroke-width="1.4" ' +
        'd="M72,142 C96,128 132,126 158,136 C168,140 172,146 168,150 L76,150 C70,148 68,145 72,142 Z">' +
        '<animate attributeName="d" keyTimes="' + K + '" dur="' + D + '" repeatCount="indefinite" ' +
        'calcMode="spline" keySplines="' + E + '" values="' +
        'M72,142 C96,128 132,126 158,136 C168,140 172,146 168,150 L76,150 C70,148 68,145 72,142 Z;' +
        'M72,142 C96,118 138,116 162,130 C170,136 172,146 168,150 L76,150 C70,148 68,145 72,142 Z;' +
        'M72,144 C100,116 144,114 166,128 C172,134 172,146 168,150 L76,150 C70,148 68,145 72,144 Z;' +
        'M72,144 C100,118 146,118 168,132 C174,138 172,146 168,150 L76,150 C70,148 68,145 72,144 Z;' +
        'M72,143 C98,124 140,122 162,134 C170,140 172,146 168,150 L76,150 C70,148 68,145 72,143 Z;' +
        'M72,142 C96,128 132,126 158,136 C168,140 172,146 168,150 L76,150 C70,148 68,145 72,142 Z;' +
        'M72,142 C96,128 132,126 158,136 C168,140 172,146 168,150 L76,150 C70,148 68,145 72,142 Z"/></path>' +

        /* --- the bolus: pushed back, over the sealed airway, into the oesophagus --- */
        '<ellipse rx="16" ry="13" fill="#E8A33D" stroke="#A96B18" stroke-width="2">' +
        A + '"cx" values="104;150;176;192;200;202;202" keyTimes="' + K + '" dur="' + D +
        '" repeatCount="indefinite" calcMode="spline" keySplines="' + E + '"/>' +
        A + '"cy" values="126;120;134;168;214;262;262" keyTimes="' + K + '" dur="' + D +
        '" repeatCount="indefinite" calcMode="spline" keySplines="' + E + '"/>' +
        A + '"rx" values="16;16;14;12;12;12;16" keyTimes="' + K + '" dur="' + D + '" repeatCount="indefinite"/>' +
        A + '"ry" values="13;13;14;16;16;16;13" keyTimes="' + K + '" dur="' + D + '" repeatCount="indefinite"/>' +
        A + '"opacity" values="1;1;1;1;1;0;1" keyTimes="' + K + '" dur="' + D + '" repeatCount="indefinite"/>' +
        '</ellipse>' +

        /* --- the caption changes with the stage --- */
        '<g class="fl">' +
        '<text x="300" y="72">1 · The tongue pushes</text><text class="fs" x="300" y="86">the bolus to the back</text>' +
        '<text x="300" y="118">2 · The soft palate lifts</text><text class="fs" x="300" y="132">sealing off the nose</text>' +
        '<text x="300" y="164">3 · The larynx rises</text><text class="fs" x="300" y="178">tipping the epiglottis</text>' +
        '<text class="fs" x="300" y="191">down over the trachea</text>' +
        '<text x="300" y="223">4 · The bolus slides over</text><text class="fs" x="300" y="237">it into the oesophagus</text>' +
        '</g>' +
        '<text class="fs" x="224" y="296" text-anchor="middle">The airway is shut for about one second —</text>' +
        '<text class="fs" x="224" y="309" text-anchor="middle">you cannot breathe and swallow at the same time.</text>'),
      cap:'<b>Swallowing.</b> The <b>epiglottis</b> does not close by itself: the larynx rises and tips it down over the trachea, so the bolus slides over a closed airway into the oesophagus. That is why you stop breathing for about a second every time you swallow, and why talking while eating can send food “down the wrong way”. Useful to know — but 0610 does not name the epiglottis. The examinable words here are <b>bolus</b>, <b>oesophagus</b> and <b>peristalsis</b>.'
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
        '<text class="fl" x="222" y="200" text-anchor="middle">against the wall so the water has time to leave.</text>'),
      cap:'<b>The colon.</b> It does not push with one smooth wave like the oesophagus — neighbouring pouches squeeze in turn, working the contents against the wall so water and mineral salts have time to be absorbed. What arrives watery leaves solid. Watch the trap though: <b>most</b> of the water is absorbed in the <b>small</b> intestine, not here.'
    };
  }


  /* ---------------- pie chart, for the diet questions ---------------- */
  var DIET_COL = { carbohydrate:'#A15C07', fat:'#C9A227', protein:'#9B2C6F',
                   fibre:'#5E7A3A', vitamins:'#0F6480', water:'#1D4E89', other:'#8A8A8A' };
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
       that the seven components stay in the same proportions while the amount
       changes. Three plates, same recipe, different size. */
    var SL = [{label:'Carbohydrate',pct:40,cat:'carbohydrate'},{label:'Protein',pct:20,cat:'protein'},
              {label:'Fats and oils',pct:20,cat:'fat'},{label:'Fibre',pct:10,cat:'fibre'},
              {label:'Vitamins and minerals',pct:10,cat:'vitamins'}];
    var who = [{x:82,  r:34, t:'A 7-year-old',   s:'still growing, but small'},
               {x:228, r:48, t:'An office worker', s:'sitting most of the day'},
               {x:388, r:64, t:'A builder',       s:'heavy work all day'}];
    var g = who.map(function (w) {
      var inner = pie(SL, w.r * 2);
      inner = inner.replace('<svg class="pie" viewBox', '<svg viewBox');
      return '<g transform="translate(' + (w.x - w.r) + ',' + (118 - w.r) + ')">' +
             '<svg width="' + (w.r * 2) + '" height="' + (w.r * 2) + '" ' +
             inner.slice(inner.indexOf('viewBox')) + '</g>' +
             '<text class="fb" x="' + w.x + '" y="200" text-anchor="middle">' + w.t + '</text>' +
             '<text class="fs" x="' + w.x + '" y="215" text-anchor="middle">' + w.s + '</text>';
    }).join('');
    var key = SL.map(function (sl, i) {
      return '<g transform="translate(' + (16 + (i % 3) * 154) + ',' + (238 + Math.floor(i / 3) * 17) + ')">' +
             '<rect width="10" height="10" rx="3" fill="' + DIET_COL[sl.cat] + '"/>' +
             '<text class="fs" x="15" y="9">' + sl.label + '</text></g>';
    }).join('');
    return {
      svg: svg('0 0 470 282',
        '<text class="fl" x="235" y="20" text-anchor="middle">The same seven components, in the same proportions.</text>' +
        '<text class="fl" x="235" y="36" text-anchor="middle">What changes from person to person is <tspan font-weight="700">how much</tspan>.</text>' +
        g + key),
      cap:'A balanced diet is not one fixed menu. The <b>proportions</b> stay the same for everybody; the <b>amount</b> changes with age, activity, and during pregnancy. That is what exam questions test when they hand you four people and four diets.'
    };
  }

  /* ---------------------------------------------------------------
     Two comparisons that a photograph does badly.

     Both of these started as borrowed clinical photographs. Both were
     replaced, for the same reason: a photograph of one patient shows
     one patient, and the student has nothing to hold it against. A
     deficiency is only visible as a difference, so the figure has to
     carry both states at once — the one thing a single photograph
     cannot do. Drawing them also means the provenance is ours.
     --------------------------------------------------------------- */

  /* Smooth a list of numbers so a swept outline has no kinks. */
  function smooth(a) {
    return a.map(function (v, i) {
      var p = a[i - 1] === undefined ? v : a[i - 1],
          n = a[i + 1] === undefined ? v : a[i + 1];
      return (p + v * 2 + n) / 4;
    });
  }

  /* Sweep a width profile down a centreline to get a long-bone outline.
     kt/kw are the profile: wide at the knee, narrow through the shaft,
     wide again at the ankle. bow displaces the shaft sideways, which is
     what soft bone does under a child's own weight. */
  function bonePath(o) {
    var n = 56, i, t, k, f, ws = [], xs = [], ys = [], L = [], R = [];
    for (i = 0; i <= n; i++) {
      t = i / n;
      k = 0; while (k < o.kt.length - 2 && t > o.kt[k + 1]) k++;
      f = (t - o.kt[k]) / (o.kt[k + 1] - o.kt[k]);
      ws.push(o.kw[k] + (o.kw[k + 1] - o.kw[k]) * f);
      ys.push(o.y0 + (o.y1 - o.y0) * t);
      xs.push(o.x0 + (o.x1 - o.x0) * t + (o.bow || 0) * Math.sin(Math.PI * t));
    }
    ws = smooth(smooth(smooth(ws)));
    for (i = 0; i <= n; i++) { L.push([(xs[i] - ws[i]).toFixed(1), ys[i].toFixed(1)]); R.push([(xs[i] + ws[i]).toFixed(1), ys[i].toFixed(1)]); }
    R.reverse();
    return { d: 'M' + L.map(function (p) { return p.join(','); }).join(' L') +
                ' L' + R.map(function (p) { return p.join(','); }).join(' L') + ' Z',
             at: function (u) { var j = Math.round(u * n); return { x: xs[j], y: ys[j], w: ws[j] }; } };
  }

  function boneBend() {
    /* One shin: tibia in front, fibula beside it, growth plates marked. */
    function shin(cx, bow, tone, plate) {
      var tib = bonePath({ x0:cx, x1:cx, y0:46, y1:170, bow:bow,
                           kt:[0,.04,.09,.16,.34,.60,.80,.90,.96,1], kw:[12.5,13,11,6.6,5,4.7,5.6,8,8.4,6.2] }),
          fib = bonePath({ x0:cx+13, x1:cx+9.5, y0:56, y1:170, bow:bow*.9,
                           kt:[0,.08,.5,.9,1], kw:[3.6,2.5,2.2,3.2,4.2] }),
          gp  = [tib.at(.10), tib.at(.90)];
      return '<path d="' + fib.d + '" fill="#F2EDE2" stroke="' + tone + '" stroke-width="1.2"/>' +
             '<path d="' + tib.d + '" fill="#FBF8F1" stroke="' + tone + '" stroke-width="1.6"/>' +
             gp.map(function (p) {
               return '<rect x="' + (p.x - p.w - .5).toFixed(1) + '" y="' + (p.y - 2.4).toFixed(1) +
                      '" width="' + (p.w * 2 + 1).toFixed(1) + '" height="4.8" rx="2.2" fill="' + plate + '"/>';
             }).join('');
    }
    function panel(ox, bow, tone, plate) {
      return '<g>' + shin(ox - 21, -bow, tone, plate) + shin(ox + 21, bow, tone, plate) +
        /* the widest point of the gap, measured — and labelled clear of the art */
        '<line x1="' + (ox - 21 - bow - 4) + '" y1="112" x2="' + (ox + 21 + bow + 4) + '" y2="112" ' +
        'stroke="' + (bow ? '#B3261E' : '#7B8A99') + '" stroke-width="1.3" stroke-dasharray="3.5 3"/>' +
        [-1, 1].map(function (d) {
          return '<line x1="' + (ox + d * (21 + bow + 4)) + '" y1="107" x2="' + (ox + d * (21 + bow + 4)) +
                 '" y2="117" stroke="' + (bow ? '#B3261E' : '#7B8A99') + '" stroke-width="1.3"/>';
        }).join('') + '</g>';
    }
    return {
      svg: svg('0 0 470 288',
        '<text class="fl" x="228" y="17" text-anchor="middle">Vitamin D lets you absorb calcium.</text>' +
        '<text class="fl" x="228" y="36" text-anchor="middle">Calcium is what makes bone hard.</text>' +
        '<text class="fs" x="228" y="54" text-anchor="middle">The shin bones of a child, from the front.</text>' +
        '<g transform="translate(0,24)">' + panel(122, 0, '#4C7FB8', '#9CC3E8') + panel(348, 13, '#B3261E', '#E8A9A2') + '</g>' +
        '<g transform="translate(0,30)">' +
        '<text class="fb" x="122" y="192" text-anchor="middle" style="fill:#2D5F8F">Enough vitamin D</text>' +
        '<text class="fs" x="122" y="210" text-anchor="middle">the bone is hard, so it stays straight</text>' +
        '<text class="fb" x="348" y="192" text-anchor="middle" style="fill:#B3261E">Too little vitamin D</text>' +
        '<text class="fs" x="348" y="210" text-anchor="middle">the bone stays soft and bends under the</text>' +
        '<text class="fs" x="348" y="228" text-anchor="middle">child&#8217;s own weight &#8212; rickets</text>' +
        '<rect x="118" y="238" width="9" height="9" rx="4" fill="#9CC3E8"/>' +
        '<text class="fs" x="132" y="246">growth plate &#8212; where the bone is still growing</text>' +
        '</g>'),
      cap:'<b>Rickets</b> is a child&#8217;s disease because it is the <i>growing</i> ends of the bone, marked above, that stay soft. The same shortage in an adult, whose bones have finished growing, softens them without bending them &#8212; that one is called osteomalacia.'
    };
  }

  function boneDensity() {
    /* A jittered triangular lattice, identical in both panels, with a
       fixed seed. Osteoporosis is then drawn by deleting struts from it
       and thinning what is left — which is what the disease does. Both
       panels really are the same piece of bone, so the comparison is
       honest rather than two unrelated scribbles. */
    function rng(seed) { var s = seed >>> 0; return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
    var W = 130, H = 114, step = 12.5, r = rng(20260901), grid = [], links = [], row, col;
    for (row = 0; row * step * .87 <= H + step; row++) {
      grid[row] = [];
      for (col = 0; col * step <= W + step; col++) {
        grid[row][col] = [col * step + (row % 2 ? step / 2 : 0) + (r() - .5) * 7,
                          row * step * .87 + (r() - .5) * 7];
      }
    }
    for (row = 0; row < grid.length; row++) for (col = 0; col < grid[row].length; col++) {
      var a = grid[row][col], odd = row % 2;
      [[0, 1], [1, 0], [1, odd ? 1 : -1]].forEach(function (d) {
        var b = (grid[row + d[0]] || [])[col + d[1]];
        if (b) links.push([a, b, r()]);
      });
    }
    function panel(ox, keep, sw, shell, tone) {
      /* Offsets are baked into the coordinates. A transform on the clipped
         group would move the clip rectangle with it — the clip is read in
         the element's own transformed space, not the parent's. */
      var dx = ox + 4, dy = 46;
      var out = links.filter(function (l) { return l[2] < keep; }).map(function (l) {
        return '<line x1="' + (l[0][0] + dx).toFixed(1) + '" y1="' + (l[0][1] + dy).toFixed(1) +
               '" x2="' + (l[1][0] + dx).toFixed(1) + '" y2="' + (l[1][1] + dy).toFixed(1) +
               '" stroke="' + tone + '" stroke-width="' + sw + '" stroke-linecap="round"/>';
      }).join('');
      return '<clipPath id="bd' + ox + '"><rect x="' + (ox + 6) + '" y="48" width="128" height="112" rx="6"/></clipPath>' +
             '<rect x="' + ox + '" y="42" width="140" height="124" rx="10" fill="#FBF8F1" stroke="#E2DCCF"/>' +
             '<g clip-path="url(#bd' + ox + ')">' + out + '</g>' +
             '<rect x="' + (ox + 4) + '" y="46" width="132" height="116" rx="7" fill="none" stroke="' + tone +
             '" stroke-width="' + shell + '"/>';
    }
    return {
      svg: svg('0 0 470 280',
        '<text class="fl" x="228" y="17" text-anchor="middle">Inside a bone: the struts that</text>' +
        '<text class="fl" x="228" y="36" text-anchor="middle">carry your weight.</text>' +
        '<text class="fs" x="228" y="54" text-anchor="middle">The same bone, at the same magnification.</text>' +
        '<g transform="translate(0,24)">' + panel(38, 1, 2.2, 5, '#4C7FB8') + panel(292, .42, 1.35, 2.4, '#B3261E') + '</g>' +
        '<g transform="translate(0,32)">' +
        '<text class="fb" x="108" y="186" text-anchor="middle" style="fill:#2D5F8F">Enough calcium</text>' +
        '<text class="fs" x="108" y="204" text-anchor="middle">many thick struts, and a thick outer</text>' +
        '<text class="fs" x="108" y="220" text-anchor="middle">shell &#8212; the load is shared</text>' +
        '<text class="fb" x="362" y="186" text-anchor="middle" style="fill:#B3261E">Too little calcium</text>' +
        '<text class="fs" x="362" y="204" text-anchor="middle">struts lost and the rest thinned, so the</text>' +
        '<text class="fs" x="362" y="220" text-anchor="middle">bone snaps under an ordinary knock</text>' +
        '</g>'),
      cap:'Your skeleton is also your calcium <b>store</b>. When the blood runs short, calcium is taken back out of the bone &#8212; so years of too little calcium quietly empty it. That is <b>osteoporosis</b>, and it is why the calcium you eat as a teenager still matters at seventy.'
    };
  }

  var FIGS = { sameBalance:sameBalance, boneBend:boneBend, boneDensity:boneDensity, chewing:chewing, tooth:tooth, toothTypes:toothTypes, peristalsis:peristalsis,
               emulsify:emulsify, villus:villus, surfaceArea:surfaceArea,
               egestVsExcrete:egestVsExcrete, churn:churn, starchPath:starchPath,
               swallow:swallow, waterColon:waterColon };

  global.Figures = {
    pie:pie, pieKey:pieKey, dietColours:DIET_COL,
    get:function (name) { return FIGS[name] ? FIGS[name]() : null; },
    names:Object.keys(FIGS)
  };
})(window);
