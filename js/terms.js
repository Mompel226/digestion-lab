/* ============================================================
   terms.js — the colour language of the Learn tab.

   Design notes, because the first attempt did not work:

   · Green is the app's own colour, so it can no longer mean anything
     in the text. It has been removed from the scheme entirely.

   · The five processes are the spine of the topic, so each gets its
     own colour — not one shared green.

   · Colour is never the only signal. Okabe & Ito's first rule of
     colour-universal design is "do not convey information in colour
     only", so every stage word is also wrapped in a chip carrying its
     number in the sequence. A student who cannot separate the hues
     still reads 1 · 2 · 3 · 4 · 5, and the number teaches the order,
     which is itself examinable.

   · The evidence is that people reason reliably across about six
     colour categories, so there are six, plus one for the food
     molecules — the class students must never confuse with the
     enzymes acting on them.

   · Every ink was checked to WCAG AA (4.5:1) on both the paper and
     the card background; the weakest is 5.68:1.

   Chips mark the stage. Plain bold marks a term belonging to that
   stage, in the same colour, so the chip teaches the colour and the
   colour then works on its own.
   ============================================================ */
(function (global) {
  'use strict';

  /* --------- the categories --------- */
  var CATS = {
    ingestion:    { n:'1', label:'Ingestion',          chip:true },
    digestion:    { n:'2', label:'Digestion',          chip:true },
    physical:     { n:'2', label:'Physical digestion', chip:true },
    chemical:     { n:'2', label:'Chemical digestion', chip:true },
    absorption:   { n:'3', label:'Absorption',         chip:true },
    assimilation: { n:'4', label:'Assimilation',       chip:true },
    egestion:     { n:'5', label:'Egestion',           chip:true },
    molecule:     { n:'',  label:'Food molecules',     chip:false }
  };

  /* Words that NAME a stage get a chip. Everything else is plain bold
     in its stage colour — otherwise the page turns into chip soup. */
  var CHIP_WORDS = {
    ingestion:   ['ingestion'],
    digestion:   ['digestion'],
    physical:    ['physical digestion'],
    chemical:    ['chemical digestion'],
    absorption:  ['absorption'],
    assimilation:['assimilation'],
    egestion:    ['egestion']
  };

  var PLAIN_WORDS = {
    ingestion: ['ingested','ingest','swallowing','swallowed','swallow','taken into the body'],

    physical: ['mastication','chewing','chews','chew','churning','churns','churn','peristalsis',
               'peristaltic','bolus','chyme','emulsification','emulsifies','emulsify','emulsifying',
               'emulsified','surface area','incisor','incisors','canine','canines','premolar','premolars',
               'molar','molars','enamel','dentine','pulp','cement','cementum','teeth','tooth',
               'circular muscle','longitudinal muscle','physically'],

    chemical: ['enzyme','enzymes','amylase','salivary amylase','pancreatic amylase','maltase','lactase',
               'sucrase','protease','proteases','pepsin','trypsin','lipase','carbohydrase','carbohydrases',
               'hydrochloric acid','gastric juice','pancreatic juice','saliva','bile','denature','denatures',
               'denatured','denaturation','optimum ph','alkaline','acidic','neutralises','neutralise',
               'neutralisation','catalyst','catalysts','active site','substrate','chemically'],

    absorption:['villus','villi','microvilli','microvillus','circular folds','lacteal','lacteals',
                'capillary','capillaries','epithelium','diffusion','diffuse','diffuses','diffused',
                'active transport','osmosis','absorbed','absorb','absorbs','lumen',
                'concentration gradient','goblet cell','goblet cells'],

    assimilation:['assimilated','glycogen','respiration','hepatic portal vein','stored','protein synthesis',
                  'blood','bloodstream','plasma','lymph'],

    /* 'excretion' is deliberately NOT here. Egestion is not excretion, and
       giving them the same colour would teach exactly the wrong thing —
       leaving excretion in plain black makes the contrast visible. */
    egestion:  ['egested','faeces','stool','defecation','roughage','fibre','constipation','undigested'],

    molecule:  ['starch','maltose','glucose','galactose','fructose','sucrose','lactose','cellulose',
                'protein','proteins','polypeptide','polypeptides','amino acid','amino acids','lipid','lipids',
                'fat','fats','oils','fatty acid','fatty acids','glycerol','triglyceride','triglycerides',
                'monosaccharide','monosaccharides','disaccharide','disaccharides','polysaccharide',
                'reducing sugar','reducing sugars','simple sugars','monomer','monomers','polymer','polymers',
                'insoluble','soluble','nutrient','nutrients']
  };

  /* --------- build one matcher, longest phrase first --------- */
  var ENTRIES = [];
  Object.keys(CHIP_WORDS).forEach(function (cat) {
    CHIP_WORDS[cat].forEach(function (w) { ENTRIES.push([w, cat, true]); });
  });
  Object.keys(PLAIN_WORDS).forEach(function (cat) {
    PLAIN_WORDS[cat].forEach(function (w) { ENTRIES.push([w, cat, false]); });
  });
  ENTRIES.sort(function (a, b) { return b[0].length - a[0].length; });

  var INFO = {};
  ENTRIES.forEach(function (e) { if (!INFO[e[0].toLowerCase()]) INFO[e[0].toLowerCase()] = e; });

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var RE = new RegExp('\\b(' + ENTRIES.map(function (e) { return escRe(e[0]); }).join('|') + ')\\b', 'gi');

  /* Escape first, then mark, so a term can never be injected as markup. */
  function mark(text) {
    return esc(text).replace(RE, function (m) {
      var e = INFO[m.toLowerCase()];
      if (!e) return m;
      var cat = e[1];
      if (e[2]) {
        return '<b class="tc tc--' + cat + '"><i class="tc__n">' + CATS[cat].n + '</i>' + m + '</b>';
      }
      return '<b class="t t--' + cat + '">' + m + '</b>';
    });
  }

  function legend() {
    var stages = ['ingestion','digestion','physical','chemical','absorption','assimilation','egestion'];
    var out = '<p class="legend__intro">The five processes are numbered in the order they happen. ' +
              'A word in the same colour belongs to that stage.</p><div class="legend">';
    stages.forEach(function (c) {
      out += '<span class="legend__i"><b class="tc tc--' + c + '"><i class="tc__n">' + CATS[c].n + '</i>' +
             CATS[c].label + '</b></span>';
    });
    out += '<span class="legend__i"><b class="t t--molecule">Food molecules</b></span>';
    out += '</div>';
    return out;
  }

  global.Terms = { mark:mark, legend:legend, CATS:CATS };
})(window);
