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
     the card background; the weakest is 4.64:1.

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
    molecule:     { n:'',  label:'Food molecules and nutrients', chip:false },
    /* A disease is not a stage and not a nutrient — it is what happens when one
       is missing. It gets a neutral ink rather than an eighth hue, which says
       "different kind of word" without adding to the colour load. */
    condition:    { n:'',  label:'Conditions and diseases', chip:false }
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
               'hydrochloric acid','gastric juice','pancreatic juice','saliva','bile','mucus','denature','denatures',
               'denatured','denaturation','optimum ph','alkaline','acidic','neutralises','neutralise',
               'hydrolysis','hydrolyses','hydrolysed','hydrolase','hydrolases','catabolic',
               'neutralisation','catalyst','catalysts','active site','substrate','chemically'],

    absorption:['villus','villi','microvilli','microvillus','circular folds','lacteal','lacteals',
                'capillary','capillaries','epithelium','diffusion','diffuse','diffuses','diffused',
                'active transport','osmosis','absorbed','absorb','absorbs','lumen',
                'concentration gradient','goblet cell','goblet cells',
                'blood','bloodstream','plasma','lymph node','lymph nodes','lymph vessel','lymph vessels','lymphatic system','lymph',
                'enterocyte','enterocytes','mesentery'],

    assimilation:['assimilated','glycogen','respiration','hepatic portal vein','protein synthesis',
                  'condensation','synthetase','synthetases','ligase','ligases','anabolic'],

    /* 'excretion' is deliberately NOT here. Egestion is not excretion, and
       giving them the same colour would teach exactly the wrong thing —
       leaving excretion in plain black makes the contrast visible. */
    egestion:  ['egested','faeces','stool','defecation','undigested'],

    molecule:  ['starch','maltose','glucose','galactose','fructose','sucrose','lactose','cellulose',
                'protein','proteins','polypeptide','polypeptides','amino acid','amino acids','lipid','lipids',
                'fat','fats','oils','fatty acid','fatty acids','glycerol','triglyceride','triglycerides',
                'monosaccharide','monosaccharides','disaccharide','disaccharides','polysaccharide',
                'reducing sugar','reducing sugars','simple sugars','monomer','monomers','polymer','polymers',
                'insoluble','soluble','nutrient','nutrients',
                /* the dietary components — same family, because they are what food is made of */
                'carbohydrate','carbohydrates','vitamin','vitamins','vitamin c','vitamin d',
                'mineral ion','mineral ions','calcium','iron','water','balanced diet',
                'fibre','roughage',
                /* whole phrases, so they are marked once rather than word by word */
                'fats and oils','fibre (roughage)',
                /* the food tests — each opens its before-and-after tubes */
                'iodine solution','benedict’s solution','benedict\'s solution','biuret solution','ethanol emulsion test'],

    condition: ['scurvy','rickets','anaemia','kwashiorkor','deficiency disease',
                'deficiency diseases','malnutrition','constipation','obesity','starvation']
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
  /* What a peek is for: an image earns its place only if it shows something
     the sentence cannot. For the macronutrients that means showing the range
     a word covers — protein from an animal and protein from a plant, fat that
     is solid beside oil that is liquid — not just one example of it. For the
     micronutrients it means the deficiency, because no student can picture
     scurvy. Those four are Dr Mompel's own lesson photographs, deliberately:
     a drawn diagram of a bowed shin does not look like a leg, and the class
     has already met these exact pictures. They are small — 230px for the
     rickets plate — so they are shown at their true size and open full size
     on click, rather than being stretched.

     Third element = the credit line, shown under the note. Every borrowed
     image has one; SOURCES.md carries the full record. */
  var PEEK = {
    /* Two questions students ask that a sentence cannot answer, so each opens a drawing:
       why one sugar answers Benedict's when another does not, and what "a large molecule"
       actually looks like when it is made of the sugar it will be digested back into. */
    'reducing sugar':  ['fig:reducingSugar', 'What makes a sugar <b>reducing</b> — and why sucrose never answers Benedict\u2019s.'],
    'reducing sugars': ['fig:reducingSugar', 'What makes a sugar <b>reducing</b> — and why sucrose never answers Benedict\u2019s.'],
    'starch':          ['fig:starchStructure', 'Starch, drawn as what it is made of: amylose and amylopectin, both built from glucose.'],

    /* the food tests — his own photographs from the Topic 4 lesson, before and after */
    'iodine solution':       ['tests/iodine.jpg', '<b>Iodine solution test — for starch.</b> Left, the control: no starch, so the iodine solution keeps its own <b>orange-yellow</b> colour. Right: starch present — <b>blue-black</b>. Say “iodine solution”, never just “iodine”.', 'From the Topic 4 Food Tests lesson'],
    'benedict’s solution':   ['tests/benedict.jpg', '<b>Benedict’s solution test — for reducing sugars</b> (glucose, maltose), heated in a water bath. Four tubes, left to right: <b>blue</b> — no reducing sugar; <b>green/yellow</b> precipitate — traces; <b>orange-red</b> — a moderate amount; <b>brick-red</b> precipitate — a large amount. The colour goes further the more sugar there is. Write the colour you see, never “positive”.', 'From the Topic 4 Food Tests lesson'],
    'benedict\'s solution': ['tests/benedict.jpg', '<b>Benedict’s solution test — for reducing sugars</b> (glucose, maltose), heated in a water bath. Four tubes, left to right: <b>blue</b> — no reducing sugar; <b>green/yellow</b> precipitate — traces; <b>orange-red</b> — a moderate amount; <b>brick-red</b> precipitate — a large amount. The colour goes further the more sugar there is. Write the colour you see, never “positive”.', 'From the Topic 4 Food Tests lesson'],
    'biuret solution':       ['tests/biuret.jpg', '<b>Biuret solution test — for protein.</b> Left: negative — the pale <b>blue</b> of the reagent itself, no protein. Right: positive — <b>purple</b> (lilac), protein present. (Biuret solution is sodium hydroxide solution with a little copper sulfate solution.)', 'From the Topic 4 Food Tests lesson'],
    'ethanol emulsion test': ['tests/emulsion.jpg', '<b>Ethanol emulsion test — for fats and oils.</b> Shake the food with ethanol, then pour the ethanol into water. A positive result: the <b>cloudy white emulsion</b> in this tube, sitting where the ethanol met the water — the fat has come out of the ethanol as countless tiny droplets. With no fat or oil the water stays clear.', 'From the Topic 4 Food Tests lesson'],
    'carbohydrates': ['food-carbohydrate.jpg', 'Bread, rice, pasta, potatoes and cereals — the body’s main energy source, and the one it reaches for first.', 'Scott Bauer, USDA ARS, public domain'],
    'carbohydrate':  ['food-carbohydrate.jpg', 'Bread, rice, pasta, potatoes and cereals — the body’s main energy source, and the one it reaches for first.', 'Scott Bauer, USDA ARS, public domain'],
    'protein':       ['food-protein.jpg', 'From animals (meat, fish, eggs) and from plants (beans, lentils, nuts, tofu) alike — for growth and for repairing tissues.', 'Salmon: DanaTentis, CC0. Beans: Bean appreciator, CC0'],
    'proteins':      ['food-protein.jpg', 'From animals (meat, fish, eggs) and from plants (beans, lentils, nuts, tofu) alike — for growth and for repairing tissues.', 'Salmon: DanaTentis, CC0. Beans: Bean appreciator, CC0'],
    'fats and oils': ['food-fats.jpg', 'The difference is the state they are in at room temperature. <b>Fats</b> are solid — butter, lard, the fat on meat. <b>Oils</b> are liquid — olive, sunflower, rapeseed. Both store energy, insulate and protect.', 'Butter: markusspiske, CC0. Oil: ajay_suresh, CC BY 2.0'],
    'fibre (roughage)': ['food-fibre.jpg', 'Wholemeal bread, oats, lentils, beans, nuts and seeds — and the skins of fruit and vegetables. It is mostly <b>cellulose</b> from plant cell walls, and humans make no enzyme that can break cellulose down, so none of it is digested and it gives you no energy at all. That is exactly the point: it stays as bulk that the circular muscles of the gut wall can grip, so <b>peristalsis</b> keeps the contents moving and constipation is prevented.', 'formulatehealth, CC BY 2.0'],
    'fibre':         ['food-fibre.jpg', 'Wholemeal bread, oats, lentils, beans, nuts and seeds — and the skins of fruit and vegetables. It is mostly <b>cellulose</b> from plant cell walls, and humans make no enzyme that can break cellulose down, so none of it is digested and it gives you no energy at all. That is exactly the point: it stays as bulk that the circular muscles of the gut wall can grip, so <b>peristalsis</b> keeps the contents moving and constipation is prevented.', 'formulatehealth, CC BY 2.0'],

    /* the micronutrients: what happens when you go without */
    'vitamin c':     ['scurvy-gums.jpg', 'From citrus fruit, peppers and green vegetables. Without it you cannot make collagen, so gums swell and bleed and wounds stop healing — scurvy.', 'From the 7.1 lesson'],
    'scurvy':        ['scurvy-gums.jpg', 'Swollen, bleeding gums and wounds that will not heal. Caused by a lack of vitamin C.', 'From the 7.1 lesson'],
    'vitamin d':     ['rickets.jpg', 'From oily fish, eggs and dairy — and made in your skin in sunlight. Its job is to let the gut absorb <b>calcium</b>. Without it the growing ends of the shin bones stay soft and bend — that is <b>rickets</b>, and vitamin D is the deficiency to name. The X-ray and MRI at the top show the bone itself; the photographs below show what it looks like from outside.', 'From the 7.1 lesson'],
    'rickets':       ['rickets.jpg', 'Soft bone that bows under a child’s own weight. The X-ray and MRI at the top show the shin and knee; the two photographs below show the bowed legs that result. Caused by a lack of <b>vitamin D</b>. Without the vitamin, calcium cannot be absorbed from food, so the growing bone never hardens — but the cause you write down is the vitamin, not the mineral.', 'From the 7.1 lesson'],
    'calcium':       ['osteoporosis.jpg', 'From milk, cheese and green vegetables. Calcium is what makes <b>bones and teeth hard</b> — that is the use to give in an answer, and blood clotting is the second, smaller one. Too little for years and the skeleton is drawn on until it is weak and brittle: the vertebrae collapse forward, giving the curved spine and lost height on the right. That is not rickets — rickets is a lack of vitamin D.', 'From the 7.1 lesson'],
    'iron':          ['haemoglobin-iron.jpg', 'From red meat, liver and dark green vegetables. Haemoglobin is four folded protein chains, and buried in each one is a flat <b>haem</b> group with a single <b>iron</b> atom at its centre — four irons per molecule, and each one grips one oxygen molecule. No iron means no haem, so no working haemoglobin: the blood carries less oxygen, and that is <b>anaemia</b>. (The diagram uses the American spellings <i>hemoglobin</i> and <i>heme</i>.)', 'XBio / explorebiology, Wikimedia Commons, CC BY 4.0'],
    'anaemia':       ['anaemia-pallor.jpg', 'Too little iron means too little haemoglobin, so less oxygen reaches the tissues. Pale skin and tiredness follow — compare the two hands.', 'From the 7.1 lesson'],
    'kwashiorkor':   ['kwashiorkor.jpg', 'Severe protein deficiency. Two signs sit together here: the wasted arm and visible ribs, and the swollen abdomen — which is fluid, not fat.', 'Dr. Lyle Conrad, CDC, public domain']
  };

  /* term -> the station that explains it */
  var JUMP = {
    'peristalsis':'oesophagus', 'peristaltic':'oesophagus', 'bolus':'oesophagus',
    'bile':'liver', 'emulsification':'liver', 'emulsifies':'liver',
    'emulsify':'liver', 'emulsifying':'liver',
    'villus':'ileum-villi', 'villi':'ileum-villi', 'microvilli':'ileum-villi',
    'lacteal':'ileum-villi', 'lacteals':'ileum-villi', 'circular folds':'ileum-villi',
    'pepsin':'stomach', 'gastric juice':'stomach', 'hydrochloric acid':'stomach', 'chyme':'stomach',
    'churning':'stomach', 'churns':'stomach',
    'amylase':'salivary-glands', 'salivary amylase':'salivary-glands', 'saliva':'salivary-glands',
    'maltase':'ileum-villi', 'trypsin':'pancreas', 'pancreatic juice':'pancreas', 'lipase':'pancreas',
    'mastication':'mouth', 'incisor':'mouth', 'incisors':'mouth', 'canine':'mouth', 'canines':'mouth',
    'premolar':'mouth', 'premolars':'mouth', 'molar':'mouth', 'molars':'mouth',
    'enamel':'mouth', 'dentine':'mouth', 'pulp':'mouth', 'cement':'mouth',
    'faeces':'rectum-anus', 'egested':'rectum-anus',
    'glycogen':'liver', 'hepatic portal vein':'liver',
    'denatured':'molecules-lab', 'denature':'molecules-lab', 'denatures':'molecules-lab',
    'active site':'molecules-lab', 'substrate':'molecules-lab', 'catalyst':'molecules-lab',
    'diffusion':'molecules-lab', 'osmosis':'molecules-lab', 'active transport':'molecules-lab',
    'starch':'molecules-lab', 'maltose':'molecules-lab', 'glucose':'molecules-lab',
    'amino acids':'molecules-lab', 'fatty acids':'molecules-lab', 'glycerol':'molecules-lab',
    'enzyme':'molecules-lab', 'enzymes':'molecules-lab', 'catalysts':'molecules-lab', 'optimum ph':'molecules-lab',
    'concentration gradient':'molecules-lab', 'soluble':'overview', 'insoluble':'overview',
    'epithelium':'ileum-villi', 'goblet cell':'ileum-villi', 'goblet cells':'ileum-villi', 'lumen':'ileum-villi',
    'capillary':'ileum-villi', 'capillaries':'ileum-villi', 'enterocyte':'ileum-villi', 'enterocytes':'ileum-villi',
    'lymph':'ileum-villi', 'lymph node':'ileum-villi', 'lymph nodes':'ileum-villi', 'lymph vessel':'ileum-villi',
    'lymph vessels':'ileum-villi', 'lymphatic system':'ileum-villi', 'mesentery':'ileum-villi',
    'mucus':'stomach', 'protease':'pancreas', 'proteases':'pancreas', 'pancreatic amylase':'pancreas',
    'carbohydrase':'salivary-glands', 'carbohydrases':'salivary-glands',
    'assimilated':'liver', 'protein synthesis':'liver',
    'cellulose':'colon', 'undigested':'rectum-anus', 'nutrient':'diet', 'nutrients':'diet'
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

  /* which words the shared glossary defines, so a plain term can offer its definition */
  var DEFINED = {};
  (function () {
    var g = (typeof window !== 'undefined' && window.GLOSSARY) || [];
    g.forEach(function (e) { DEFINED[e.term.toLowerCase()] = e.term; });
  })();

  var INFO = {};
  ENTRIES.forEach(function (e) { if (!INFO[e[0].toLowerCase()]) INFO[e[0].toLowerCase()] = e; });

  /* The quote matters: these strings are also written into attributes. */
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                                    .replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* Lookarounds rather than \b, because a term may end in a bracket —
     "fibre (roughage)" must match as one unit, not as two words. */
  var RE = new RegExp('(?<![A-Za-z0-9-])(' +
    ENTRIES.map(function (e) { return escRe(e[0]); }).join('|') + ')(?![A-Za-z0-9-])', 'gi');

  /* Escape first, then mark, so a term can never be injected as markup. */
  var here = null;                       /* the station being read, so we never link to itself */
  /* A marker is an offer to go and look at something. Repeating the offer on
     every later mention of the same word turns it into noise: the reader has
     already been told the picture is there. So each word carries its marker
     on its FIRST appearance on the page and is plain styling after that —
     the same rule an encyclopedia uses for links. `quiet` switches markers
     off entirely, for the Key words list at the foot of the page: by then the
     reader has met every word above, and a column of magnifying glasses is
     just clutter. */
  var seen = null, quiet = false;
  function setStation(id) { here = id; seen = Object.create(null); quiet = false; }
  function setQuiet(v) { quiet = !!v; }

  /* _like this_ underlines a phrase. Some words carry a mark because the syllabus asks a
     candidate to produce them — what each kind of tooth does — but they are not glossary
     terms and bolding them would put four more heavy words in a sentence that already has
     several. An underline says "learn this wording" without shouting. */
  /* _like this_ underlines a phrase: wording the syllabus asks a candidate to produce, marked
     without adding to the weight of the bold terms already in the line.

     The two underscores become sentinels BEFORE the glossary pass and tags after it. Running
     the pattern over finished markup does not work: class names carry underscores of their
     own — `tc__n` on a chip — so it matched inside an attribute and tore the tag in half. A
     term landing inside the phrase is levelled to plain text, since the phrase is one answer
     and should not come out half bold and half not. */
  var U0 = '\u0001', U1 = '\u0002';

  function underlineMarks(escaped) {
    return escaped.replace(/_([^_]{1,90})_/g, U0 + '$1' + U1);
  }
  function underlineTags(html) {
    return html.replace(new RegExp(U0 + '([\\s\\S]*?)' + U1, 'g'), function (m, inner) {
      return '<u class="syl-u">' +
             inner.replace(/<i class="tc__n">[^<]*<\/i>/g, '').replace(/<\/?[bi][^>]*>/g, '') +
             '</u>';
    });
  }

  function mark(text) {
    return underlineTags(underlineMarks(esc(text)).replace(RE, function (m) {
      var low = m.toLowerCase(), e = INFO[low];
      if (!e) return m;
      var cat = e[1], act = '', cls = '';
      var first = !quiet && !(seen && seen[low]);
      if (seen) seen[low] = true;
      if (!first) return m;                     /* plain after the first time on the page */
      if (PEEK[low]) {
        act = ' data-peek="' + PEEK[low][0] + '" data-note="' + esc(PEEK[low][1]) + '"' +
              (PEEK[low][2] ? ' data-credit="' + esc(PEEK[low][2]) + '"' : '') +
              ' tabindex="0" role="button"';
        cls = ' is-peek';
      } else if (JUMP[low] && JUMP[low] !== here) {
        act = ' data-jump="' + JUMP[low] + '" tabindex="0" role="button"';
        cls = ' is-jump';
      } else if (DEFINED[low]) {
        /* A word with nothing to show and nowhere to go still has a definition. It gets the
           quietest mark of the three — a fine dotted rule, no icon — because it is the most
           common case and must not turn the page into a field of markers. */
        act = ' data-gloss="' + esc(DEFINED[low]) + '" tabindex="0" role="button"';
        cls = ' is-gloss';
      }
      if (e[2]) {
        return '<b class="tc tc--' + cat + cls + '"' + act + '><i class="tc__n">' + CATS[cat].n + '</i>' + m + '</b>';
      }
      return '<b class="t t--' + cat + cls + '"' + act + '>' + m + '</b>';
    }));
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
    out += '<span class="legend__i"><b class="t t--condition">Conditions and diseases</b></span>';
    out += '</div>';
    return out;
  }

  global.Terms = { mark:mark, legend:legend, CATS:CATS, setStation:setStation,
                   setQuiet:setQuiet, PEEK:PEEK, JUMP:JUMP };
})(window);
