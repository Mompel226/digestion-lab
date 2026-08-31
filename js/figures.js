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
    var kinds = [
      { x:56,  name:'Incisor',  fn:'Cutting and biting',  d:'M30,120 C30,74 38,58 56,58 C74,58 82,74 82,120 C82,132 74,138 56,138 C38,138 30,132 30,120 Z', root:'M44,138 L40,196 M68,138 L72,196' },
      { x:166, name:'Canine',   fn:'Holding and tearing', d:'M144,124 C144,72 156,44 166,44 C176,44 188,72 188,124 C188,134 180,140 166,140 C152,140 144,134 144,124 Z', root:'M154,140 L150,200 M178,140 L182,200' },
      { x:276, name:'Premolar', fn:'Crushing and grinding', d:'M250,120 C250,84 258,68 276,68 C294,68 302,84 302,120 C302,134 294,140 276,140 C258,140 250,134 250,120 Z M262,74 L268,84 M284,74 L290,84', root:'M264,140 L260,192 M288,140 L292,192' },
      { x:386, name:'Molar',    fn:'Chewing and grinding hard food', d:'M354,120 C354,86 364,70 386,70 C408,70 418,86 418,120 C418,134 408,140 386,140 C364,140 354,134 354,120 Z M366,76 L372,88 M386,74 L386,88 M406,76 L400,88', root:'M366,140 L358,196 M386,140 L386,196 M406,140 L414,196' }
    ];
    var g = kinds.map(function (k) {
      return '<g><path d="' + k.root + '" stroke="#E4D3B4" stroke-width="9" fill="none" stroke-linecap="round"/>' +
             '<path d="' + k.d + '" fill="#FBFAF4" stroke="#C1B39B" stroke-width="2" stroke-linejoin="round"/>' +
             '<text class="fb" x="' + k.x + '" y="228" text-anchor="middle">' + k.name + '</text>' +
             '<text class="fs" x="' + k.x + '" y="246" text-anchor="middle">' + k.fn.split(' ').slice(0, 3).join(' ') + '</text>' +
             (k.fn.split(' ').length > 3 ? '<text class="fs" x="' + k.x + '" y="260" text-anchor="middle">' + k.fn.split(' ').slice(3).join(' ') + '</text>' : '') +
             '</g>';
    }).join('');
    return {
      svg: svg('0 0 448 276', '<rect x="10" y="196" width="428" height="10" rx="5" fill="#EBD3D3"/>' + g),
      cap:'<b>Incisors</b> cut and bite. <b>Canines</b> hold and tear. <b>Premolars</b> crush and grind soft food. <b>Molars</b> chew and grind hard food. All four are physical digestion — the food molecules are unchanged.'
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
    var drops = '';
    var pos = [[268,58],[300,50],[330,64],[276,92],[308,88],[338,96],[290,116],[322,120],[352,80],[262,74]];
    pos.forEach(function (p, i) {
      drops += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0" fill="#F2C14E" stroke="#B98A16" stroke-width="1.4">' +
               A + '"r" values="0;0;11;11" keyTimes="0;0.42;0.62;1" dur="5s" repeatCount="indefinite"/></circle>';
    });
    return {
      svg: svg('0 0 440 200',
        '<circle cx="96" cy="86" r="46" fill="#F2C14E" stroke="#B98A16" stroke-width="2">' +
        A + '"r" values="46;46;6;6" keyTimes="0;0.42;0.62;1" dur="5s" repeatCount="indefinite"/>' +
        A + '"opacity" values="1;1;0;0" keyTimes="0;0.5;0.62;1" dur="5s" repeatCount="indefinite"/></circle>' +
        drops +
        '<path d="M158,86 L232,86" stroke="#4E7D4A" stroke-width="3" marker-end="url(#ar2)"/>' +
        '<defs><marker id="ar2" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">' +
        '<path d="M0,0 L9,4.5 L0,9 Z" fill="#4E7D4A"/></marker></defs>' +
        '<text class="fb" x="195" y="76" text-anchor="middle">bile</text>' +
        '<text class="fb" x="96" y="26" text-anchor="middle">One large fat droplet</text>' +
        '<text class="fb" x="308" y="26" text-anchor="middle">Many small fat droplets</text>' +
        '<text class="fl" x="220" y="168" text-anchor="middle">Bile is not an enzyme. It changes the fat <tspan class="fb">physically</tspan>, not chemically.</text>' +
        '<text class="fl" x="220" y="188" text-anchor="middle">Lipase then digests the droplets into fatty acids and glycerol.</text>'),
      cap:'<b>Emulsification.</b> Bile breaks large fat droplets into many small ones, increasing the surface area for lipase. Bile is <b>not</b> an enzyme — no chemical bonds are broken here. Bile is also alkaline, so it neutralises the acid arriving from the stomach.'
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
      svg: svg('0 0 440 230',
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
    var bits = '';
    for (var i = 0; i < 9; i++) {
      var ang = (i / 9) * Math.PI * 2, r = 26 + (i % 3) * 9;
      var cx = 150 + Math.cos(ang) * r, cy = 100 + Math.sin(ang) * r * .8;
      bits += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (4 + (i % 3)) + '" fill="#D98C4A" opacity=".85">' +
              '<animateTransform attributeName="transform" type="rotate" from="0 150 100" to="360 150 100" ' +
              'dur="' + (4 + (i % 3) * 1.4) + 's" repeatCount="indefinite"/></circle>';
    }
    return {
      svg: svg('0 0 440 210',
        '<path d="M124,40 C160,30 208,44 218,84 C230,128 218,166 178,174 C144,180 112,164 106,132 C100,98 108,58 124,40 Z" fill="#F4DCC8" stroke="#D98C6A" stroke-width="2.6"/>' +
        bits +
        '<text class="fb" x="272" y="60">Physical</text>' +
        '<text class="fl" x="272" y="80">Muscles churn the food,</text>' +
        '<text class="fl" x="272" y="98">mixing it with gastric juice.</text>' +
        '<text class="fb" x="272" y="130">Chemical</text>' +
        '<text class="fl" x="272" y="150">Pepsin → protein into</text>' +
        '<text class="fl" x="272" y="168">short polypeptides, at pH 2.</text>' +
        '<text class="fs" x="220" y="200" text-anchor="middle">Hydrochloric acid gives pepsin its optimum pH, kills bacteria, and denatures proteins.</text>'),
      cap:'The stomach does <b>both</b> kinds of digestion at once: churning is physical, pepsin is chemical. Note that pepsin makes <b>short polypeptides</b>, not amino acids — trypsin finishes the job in the small intestine.'
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
        '<text class="fs" x="286" y="60">Only glucose is small enough</text>' +
        '<text class="fs" x="286" y="76">and soluble enough to be absorbed.</text>'),
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
      svg: svg('0 0 440 200',
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

  var FIGS = { chewing:chewing, tooth:tooth, toothTypes:toothTypes, peristalsis:peristalsis,
               emulsify:emulsify, villus:villus, surfaceArea:surfaceArea,
               egestVsExcrete:egestVsExcrete, churn:churn, starchPath:starchPath,
               swallow:swallow, waterColon:waterColon };

  global.Figures = {
    get:function (name) { return FIGS[name] ? FIGS[name]() : null; },
    names:Object.keys(FIGS)
  };
})(window);
