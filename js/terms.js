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
    molecule:     { n:'',  label:'Food molecules and nutrients', chip:false }
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
                'insoluble','soluble','nutrient','nutrients',
                /* the dietary components — same family, because they are what food is made of */
                'carbohydrate','carbohydrates','vitamin','vitamins','vitamin c','vitamin d',
                'mineral ion','mineral ions','calcium','iron','water','balanced diet',
                'scurvy','rickets','anaemia','kwashiorkor','deficiency disease','malnutrition',
                /* whole phrases, so they are marked once rather than word by word */
                'fats and oils','fibre (roughage)']
  };


  /* --------- what happens when you click a term ---------
     peek : a small picture appears where you clicked — for things you
            need to SEE, like what "fats and oils" actually means
     jump : go to the station where the word is properly explained —
            for things you need to READ about, like peristalsis
     A term does one or the other, never both, so a click is predictable. */
  /* A picture only earns its place if it shows something the words cannot.
     For the macronutrients that means WHICH FOODS contain them — a student
     may not know that tofu is protein. For the vitamins and minerals it
     means the CONSEQUENCE of going without, because that is the thing worth
     remembering and the thing 0610 asks about. "Water" gets nothing: a
     picture of water teaches you nothing you did not already know. */
  var PEEK = {
    'carbohydrates': ['food-carbohydrate.jpg', 'Bread, rice, pasta, potatoes, cereals — the body’s main energy source.'],
    'carbohydrate':  ['food-carbohydrate.jpg', 'Bread, rice, pasta, potatoes, cereals — the body’s main energy source.'],
    'fats and oils': ['food-fats.jpg', 'Butter and cheese are fats — solid at room temperature. Olive and sunflower oil are oils — liquid. Both store energy, insulate and protect.'],

    'protein':       ['food-protein.jpg', 'Meat, fish, eggs, beans, lentils, tofu — for growth and for repairing tissues.'],
    'proteins':      ['food-protein.jpg', 'Meat, fish, eggs, beans, lentils, tofu — for growth and for repairing tissues.'],
    'fibre (roughage)': ['food-fibre.jpg', 'Wholemeal bread, oats, lentils, beans, nuts and seeds — and the skins of fruit and vegetables. You cannot digest any of it, and that is exactly the point: it gives the gut muscles something to grip.', 'Photo: formulatehealth, CC BY 2.0'],
    'fibre':         ['food-fibre.jpg', 'Wholemeal bread, oats, lentils, beans, nuts and seeds — and the skins of fruit and vegetables. You cannot digest any of it, and that is exactly the point: it gives the gut muscles something to grip.', 'Photo: formulatehealth, CC BY 2.0'],

    /* the micronutrients: what happens when you go without */
    'vitamin c':     ['scurvy-gums.jpg', 'From citrus fruit, peppers and green vegetables. Without it you cannot make collagen, so gums bleed and wounds stop healing — scurvy.'],
    'scurvy':        ['scurvy-gums.jpg', 'Bleeding gums and wounds that will not heal. Caused by a lack of vitamin C.'],
    'vitamin d':     ['rickets.jpg', 'From oily fish, eggs and dairy — and made in your skin in sunlight. Without it you cannot absorb calcium, so bones stay soft and bend: rickets.'],
    'rickets':       ['rickets.jpg', 'Soft bones that bow under the child’s own weight. Caused by too little vitamin D or calcium.'],
    'calcium':       ['osteoporosis.jpg', 'From milk, cheese and green vegetables. It makes bone hard. Too little over a lifetime and the skeleton weakens — the spine on the right has lost bone.'],
    'iron':          ['anaemia-pallor.jpg', 'From red meat, liver and dark green vegetables. Iron is part of haemoglobin, so without it less oxygen is carried — the pale hand on the left is anaemic.'],
    'anaemia':       ['anaemia-pallor.jpg', 'Too little iron means too little haemoglobin, so less oxygen reaches the tissues. Pale skin and tiredness follow.'],
    'kwashiorkor':   ['kwashiorkor.jpg', 'Severe protein deficiency. The swollen abdomen is fluid, not fat.']
  };

  /* term -> the station that explains it */
  var JUMP = {
    'peristalsis':'oesophagus', 'peristaltic':'oesophagus', 'bolus':'oesophagus',
    'bile':'gall-bladder', 'emulsification':'gall-bladder', 'emulsifies':'gall-bladder',
    'emulsify':'gall-bladder', 'emulsifying':'gall-bladder',
    'villus':'ileum-villi', 'villi':'ileum-villi', 'microvilli':'ileum-villi',
    'lacteal':'ileum-villi', 'lacteals':'ileum-villi', 'circular folds':'ileum-villi',
    'pepsin':'stomach', 'gastric juice':'stomach', 'hydrochloric acid':'stomach', 'chyme':'stomach',
    'churning':'stomach', 'churns':'stomach',
    'amylase':'salivary-glands', 'salivary amylase':'salivary-glands', 'saliva':'salivary-glands',
    'maltase':'duodenum', 'trypsin':'pancreas', 'pancreatic juice':'pancreas', 'lipase':'pancreas',
    'mastication':'mouth', 'incisor':'mouth', 'incisors':'mouth', 'canine':'mouth', 'canines':'mouth',
    'premolar':'mouth', 'premolars':'mouth', 'molar':'mouth', 'molars':'mouth',
    'enamel':'mouth', 'dentine':'mouth', 'pulp':'mouth', 'cement':'mouth',
    'faeces':'rectum-anus', 'egested':'rectum-anus',
    'glycogen':'liver', 'hepatic portal vein':'liver',
    'denatured':'molecules-lab', 'denature':'molecules-lab', 'denatures':'molecules-lab',
    'active site':'molecules-lab', 'substrate':'molecules-lab', 'catalyst':'molecules-lab',
    'diffusion':'molecules-lab', 'osmosis':'molecules-lab', 'active transport':'molecules-lab',
    'starch':'molecules-lab', 'maltose':'molecules-lab', 'glucose':'molecules-lab',
    'amino acids':'molecules-lab', 'fatty acids':'molecules-lab', 'glycerol':'molecules-lab'
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
  /* Lookarounds rather than \b, because a term may end in a bracket —
     "fibre (roughage)" must match as one unit, not as two words. */
  var RE = new RegExp('(?<![A-Za-z0-9-])(' +
    ENTRIES.map(function (e) { return escRe(e[0]); }).join('|') + ')(?![A-Za-z0-9-])', 'gi');

  /* Escape first, then mark, so a term can never be injected as markup. */
  var here = null;                       /* the station being read, so we never link to itself */
  function setStation(id) { here = id; }

  function mark(text) {
    return esc(text).replace(RE, function (m) {
      var low = m.toLowerCase(), e = INFO[low];
      if (!e) return m;
      var cat = e[1], act = '', cls = '';
      if (PEEK[low]) {
        act = ' data-peek="' + PEEK[low][0] + '" data-note="' + esc(PEEK[low][1]) + '"' +
              (PEEK[low][2] ? ' data-credit="' + esc(PEEK[low][2]) + '"' : '') +
              ' tabindex="0" role="button"';
        cls = ' is-peek';
      } else if (JUMP[low] && JUMP[low] !== here) {
        act = ' data-jump="' + JUMP[low] + '" tabindex="0" role="button"';
        cls = ' is-jump';
      }
      if (e[2]) {
        return '<b class="tc tc--' + cat + cls + '"' + act + '><i class="tc__n">' + CATS[cat].n + '</i>' + m + '</b>';
      }
      return '<b class="t t--' + cat + cls + '"' + act + '>' + m + '</b>';
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
    out += '<span class="legend__i"><b class="t t--molecule">Food molecules and nutrients</b></span>';
    out += '</div>';
    return out;
  }

  global.Terms = { mark:mark, legend:legend, CATS:CATS, setStation:setStation, PEEK:PEEK, JUMP:JUMP };
})(window);
