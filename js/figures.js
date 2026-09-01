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
           '</style>' + inner + '</svg>';
  }
  var A = '<animate attributeName=';

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
        cusps:'2 cusps', nroot:'1 root (sometimes 2)' },
      { x:456, name:'Molar',    job:'Chewing and grinding',
        crown:'M424,118 C424,80 434,62 456,62 C478,62 488,80 488,118 C488,132 478,138 456,138 C434,138 424,132 424,118 Z',
        top:'M428,74 C433,62 439,62 444,74 M448,74 C453,62 459,62 464,74 M468,74 C473,62 479,62 484,74',
        roots:'M436,138 L428,200 M456,138 L456,204 M476,138 L484,200',
        cusps:'4 cusps', nroot:'2–3 roots' }
    ];
    var g = K.map(function (k) {
      return '<g>' +
        (k.roots ? '<path d="' + k.roots + '" stroke="#E6D5B7" stroke-width="10" fill="none" stroke-linecap="round"/>' : '') +
        '<path d="' + k.crown + '" fill="#FCFBF6" stroke="#B9AB92" stroke-width="2.2" stroke-linejoin="round"/>' +
        (k.top ? '<path d="' + k.top + '" fill="none" stroke="#B9AB92" stroke-width="2"/>' : '') +
        '<text class="fb" x="' + k.x + '" y="242" text-anchor="middle">' + k.name + '</text>' +
        '<text class="fs" x="' + k.x + '" y="259" text-anchor="middle">' + k.job + '</text>' +
        '<text class="fl" x="' + k.x + '" y="282" text-anchor="middle" fill="#A16207">' + k.cusps + '</text>' +
        '<text class="fl" x="' + k.x + '" y="299" text-anchor="middle" fill="#0F6E8C">' + k.nroot + '</text>' +
        '</g>';
    }).join('');
    return {
      svg: svg('16 30 524 340',
        '<rect x="26" y="204" width="500" height="11" rx="5.5" fill="#EBD3D3"/>' + g +
        '<rect x="26" y="312" width="500" height="46" rx="10" fill="#FBF3E3" stroke="#A16207" stroke-width="1.6"/>' +
        '<text class="fl" x="276" y="332" text-anchor="middle">Premolar or molar? Count the bumps on the biting surface:</text>' +
        '<text class="fl" x="276" y="350" text-anchor="middle"><tspan fill="#A16207" font-weight="700">2 = premolar</tspan>, ' +
        '<tspan fill="#A16207" font-weight="700">4 = molar</tspan>. Molars are also bigger and further back.</text>'),
      cap:'<b>Incisors</b> cut and bite. <b>Canines</b> hold and tear. <b>Premolars</b> crush and grind. <b>Molars</b> chew and grind. The pair students confuse is premolar and molar — a premolar has <b>two</b> cusps and usually one root; a molar has <b>four</b> cusps and two or three roots. All four are physical digestion: the food molecules are unchanged.'
    };
  }

  /* ---------------- peristalsis (animated) ---------------- */
  function peristalsis() {
    var wave = '';
    for (var i = 0; i < 3; i++) {
      var delay = (i * 1.6) + 's';
      wave +=
        '<g>' +
        '<ellipse cx="40" cy="86" rx="15" ry="30" fill="#C4776A" opacity=".55">' +
        A + '"cx" values="40;400" dur="4.8s" begin="' + delay + '" repeatCount="indefinite"/>' +
        A + '"rx" values="15;9;15" dur="4.8s" begin="' + delay + '" repeatCount="indefinite"/>' +
        '</ellipse></g>';
    }
    return {
      svg: svg('0 0 440 190',
        '<rect x="10" y="40" width="420" height="92" rx="46" fill="#F6E7E2" stroke="#C4776A" stroke-width="2.5"/>' +
        '<text class="fs" x="20" y="30">mouth</text><text class="fs" x="420" y="30" text-anchor="end">stomach</text>' +
        wave +
        /* the bolus, squeezed along */
        '<circle cx="70" cy="86" r="19" fill="#E8A33D" stroke="#A96B18" stroke-width="2">' +
        A + '"cx" values="70;404" dur="4.8s" begin="0.9s" repeatCount="indefinite"/></circle>' +
        '<text class="fl" x="220" y="160" text-anchor="middle">Circular muscle contracts <tspan class="fs">behind</tspan> the bolus and relaxes <tspan class="fs">in front</tspan> of it.</text>' +
        '<text class="fl" x="220" y="180" text-anchor="middle">The wave of contraction is called peristalsis.</text>'),
      cap:'<b>Peristalsis</b> is the wave of muscle contraction that pushes the bolus along the alimentary canal. It happens the whole way from oesophagus to rectum — not just in the oesophagus. Fibre (roughage) gives the muscles bulk to grip.'
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
      svg: svg('-6 0 470 260',
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
        '<text class="fb" x="187" y="92" text-anchor="middle" fill="#4E7D4A">bile</text>' +
        A + '"opacity" values="0;0;1;1;0" keyTimes="0;0.4;0.5;0.92;1" dur="' + CYCLE + '" repeatCount="indefinite"/></g>' +
        '<defs><marker id="arB" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">' +
        '<path d="M0,0 L9,4.5 L0,9 Z" fill="#4E7D4A"/></marker></defs>' +
        /* what a bile salt is */
        '<g transform="translate(24,214)">' +
        '<line x1="0" y1="0" x2="0" y2="11" stroke="#4E7D4A" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="0" cy="0" r="4" fill="#6FA36B" stroke="#3F6B3C" stroke-width="1"/></g>' +
        '<text class="fs" x="38" y="211">a bile salt — the head likes water,</text>' +
        '<text class="fs" x="38" y="224">the tail likes fat, so it sits on the surface</text>' +
        '<text class="fl" x="232" y="243">Same amount of fat. Far more surface for <tspan class="fb" fill="#6B3FA0">lipase</tspan> to work on.</text>' +
        '<text class="fs" x="232" y="256">No bonds are broken here — this is <tspan font-weight="700">physical</tspan>, not chemical.</text>'),
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
        '<text class="fb" x="112" y="44" text-anchor="middle" fill="#A16207">EGESTION</text>' +
        '<text class="fb" x="328" y="44" text-anchor="middle" fill="#0F6E8C">EXCRETION</text>' +
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
      svg: svg('-4 8 470 256',
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
        '<text class="fs" x="150" y="12" text-anchor="middle">from the oesophagus</text>' +
        '<path d="M196,204 C214,214 226,214 240,208" stroke="#E0A87A" stroke-width="14" stroke-linecap="round"/>' +
        '<text class="fs" x="252" y="226">to the duodenum</text>' +
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
        '<text class="fl" x="150" y="242" text-anchor="middle">Watch the rings of muscle travel down and the pieces get smaller.</text>'),
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
        '<text class="fb" x="150" y="98" fill="#A16207">amylase</text>' +
        '<text class="fs" x="150" y="112">mouth and duodenum</text>' +
        '<text class="fb" x="14" y="140">Maltose</text>' +
        chain(14, 164, 2, '#E8C063') + chain(64, 164, 2, '#E8C063') + chain(114, 164, 2, '#E8C063') + chain(164, 164, 2, '#E8C063') +
        '<path d="M226,164 L262,164" stroke="#14572B" stroke-width="2.2" marker-end="url(#ar4)"/>' +
        '<text class="fb" x="244" y="150" text-anchor="middle" fill="#0F6E8C">maltase</text>' +
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
    return {
      svg: svg('0 0 440 220',
        '<text class="fb" x="112" y="26" text-anchor="middle">Breathing in</text>' +
        '<text class="fb" x="328" y="26" text-anchor="middle">Swallowing</text>' +
        /* LEFT: airway open */
        '<path d="M60,44 C60,80 62,110 62,150" stroke="#BFC7CC" stroke-width="20" fill="none" stroke-linecap="round"/>' +
        '<path d="M132,44 C132,80 134,120 134,196" stroke="#C4776A" stroke-width="20" fill="none" stroke-linecap="round"/>' +
        '<path d="M74,54 C92,48 108,54 112,68" stroke="#B03A2E" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<text class="fs" x="52" y="176" text-anchor="middle">trachea</text>' +
        '<text class="fs" x="146" y="212" text-anchor="middle">oesophagus</text>' +
        '<text class="fs" x="112" y="86" text-anchor="middle">epiglottis up</text>' +
        '<text class="fl" x="112" y="112" text-anchor="middle">air passes down</text>' +
        '<text class="fl" x="112" y="130" text-anchor="middle">the trachea</text>' +
        /* RIGHT: airway sealed, bolus going down */
        '<path d="M276,44 C276,80 278,110 278,150" stroke="#BFC7CC" stroke-width="20" fill="none" stroke-linecap="round"/>' +
        '<path d="M348,44 C348,80 350,120 350,196" stroke="#C4776A" stroke-width="20" fill="none" stroke-linecap="round"/>' +
        '<path d="M266,52 C284,64 296,72 300,84" stroke="#B03A2E" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<circle cx="348" cy="60" r="12" fill="#E8A33D" stroke="#A96B18" stroke-width="2">' +
        A + '"cy" values="52;190" dur="2.6s" repeatCount="indefinite"/></circle>' +
        '<text class="fs" x="268" y="176" text-anchor="middle">sealed</text>' +
        '<text class="fs" x="300" y="104" text-anchor="middle">epiglottis down</text>' +
        '<text class="fl" x="330" y="130" text-anchor="middle">the bolus passes down</text>' +
        '<text class="fl" x="330" y="148" text-anchor="middle">the oesophagus</text>'),
      cap:'The <b>epiglottis</b> is a flap that folds over the trachea as you swallow, so the bolus goes into the oesophagus and not the airway. Useful to know — but 0610 does not name it. The examinable words here are <b>bolus</b>, <b>oesophagus</b> and <b>peristalsis</b>.'
    };
  }

  /* ---------------- water reabsorption in the colon ---------------- */
  function waterColon() {
    var drops = '';
    for (var i = 0; i < 7; i++) {
      drops += '<circle cx="' + (76 + i * 42) + '" cy="96" r="5" fill="#0F6E8C" opacity=".85">' +
               A + '"cy" values="96;44" dur="2.4s" begin="' + (i * 0.3) + 's" repeatCount="indefinite"/>' +
               A + '"opacity" values="0;.9;0" dur="2.4s" begin="' + (i * 0.3) + 's" repeatCount="indefinite"/></circle>';
    }
    return {
      svg: svg('-14 0 468 204',
        '<rect x="14" y="14" width="412" height="26" rx="13" fill="#FAE0DC" stroke="#C0392B" stroke-width="1.6"/>' +
        '<text class="fs" x="220" y="32" text-anchor="middle" fill="#8A2A20">blood — water and mineral salts absorbed</text>' +
        '<path d="M40,72 L400,72 M40,126 L400,126" stroke="#C08A72" stroke-width="14" fill="none" stroke-linecap="round"/>' +
        '<rect x="40" y="79" width="360" height="40" fill="#F3E1D3"/>' +
        drops +
        '<ellipse cx="90" cy="100" rx="26" ry="15" fill="#B08968" opacity=".55"/>' +
        '<ellipse cx="200" cy="100" rx="24" ry="14" fill="#A87F5E" opacity=".7"/>' +
        '<ellipse cx="320" cy="100" rx="22" ry="13" fill="#8A6A4A"/>' +
        '<text class="fs" x="90" y="152" text-anchor="middle">watery</text>' +
        '<text class="fs" x="200" y="152" text-anchor="middle">thicker</text>' +
        '<text class="fs" x="320" y="152" text-anchor="middle">solid faeces</text>' +
        '<text class="fl" x="220" y="180" text-anchor="middle">The colon reabsorbs water — but <tspan class="fb">most</tspan> water is absorbed in the small intestine.</text>'),
      cap:'The <b>colon</b> reabsorbs water and mineral salts from the undigested material, so what remains becomes solid faeces. Watch the trap: <b>most</b> of the water is absorbed in the <b>small</b> intestine, not here.'
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

  var FIGS = { chewing:chewing, tooth:tooth, toothTypes:toothTypes, peristalsis:peristalsis,
               emulsify:emulsify, villus:villus, surfaceArea:surfaceArea,
               egestVsExcrete:egestVsExcrete, churn:churn, starchPath:starchPath,
               swallow:swallow, waterColon:waterColon };

  global.Figures = {
    pie:pie, pieKey:pieKey, dietColours:DIET_COL,
    get:function (name) { return FIGS[name] ? FIGS[name]() : null; },
    names:Object.keys(FIGS)
  };
})(window);
