/* ============================================================
   terms.js — the colour language of the Learn tab.

   Every key term is tagged with the part of the topic it belongs to,
   and highlighted in that colour wherever it appears. Five families,
   using the IGCSE deck palette:

     process     the five stages, dark green — the spine of the topic
     physical    physical digestion, amber
     chemical    chemical digestion and enzymes, red
     transport   absorption and movement, teal
     molecule    the food molecules themselves, purple

   Longest terms are matched first so "physical digestion" wins over
   "digestion", and "small intestine" over "intestine".
   ============================================================ */
(function (global) {
  'use strict';

  var FAMILIES = {
    process: ['ingestion','digestion','absorption','assimilation','egestion','egested','ingested',
              'absorbed','assimilated','digested','excretion','excreted','defecation','urination'],

    physical: ['physical digestion','mastication','chewing','chews','chew','churning','churns','churn',
               'peristalsis','peristaltic','bolus','emulsification','emulsifies','emulsify','emulsifying',
               'emulsified','surface area','incisor','incisors','canine','canines','premolar','premolars',
               'molar','molars','enamel','dentine','pulp','cement','cementum','teeth','tooth',
               'circular muscle','longitudinal muscle','roughage','fibre','swallowing','swallowed','swallow',
               'chyme','churned','periodontal fibres','root canal','plaque','jawbone','gums','gum'],

    chemical: ['chemical digestion','enzyme','enzymes','amylase','salivary amylase','pancreatic amylase',
               'maltase','protease','proteases','pepsin','trypsin','lipase','carbohydrase','carbohydrases',
               'lactase','sucrase','hydrochloric acid','gastric juice','pancreatic juice','bile',
               'denature','denatures','denatured','denaturation','optimum ph','alkaline','acidic','neutralises',
               'neutralise','neutralisation','catalyst','catalysts','active site','substrate','ph',
               'saliva','pancreatic lipase','gastric lipase','bile salts','hydrolysis'],

    transport: ['villus','villi','microvilli','microvillus','circular folds','lacteal','lacteals',
                'capillary','capillaries','epithelium','diffusion','diffuse','diffuses','active transport',
                'osmosis','hepatic portal vein','lymph','blood','bloodstream','lumen',
                'concentration gradient','short diffusion distance','goblet cell','goblet cells'],

    molecule: ['starch','maltose','glucose','galactose','fructose','sucrose','lactose','glycogen','cellulose',
               'protein','proteins','polypeptide','polypeptides','amino acid','amino acids','lipid','lipids',
               'fat','fats','oils','fatty acid','fatty acids','glycerol','triglyceride','triglycerides',
               'monosaccharide','monosaccharides','disaccharide','disaccharides','polysaccharide',
               'reducing sugar','reducing sugars','simple sugars','monomer','monomers','polymer','polymers',
               'insoluble','soluble','nutrient','nutrients']
  };

  var LABEL = {
    process:  'The five processes',
    physical: 'Physical digestion',
    chemical: 'Chemical digestion and enzymes',
    transport:'Absorption and transport',
    molecule: 'Food molecules'
  };

  /* term -> family, longest first */
  var ORDERED = [];
  Object.keys(FAMILIES).forEach(function (fam) {
    FAMILIES[fam].forEach(function (t) { ORDERED.push([t, fam]); });
  });
  ORDERED.sort(function (a, b) { return b[0].length - a[0].length; });

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  var RE = new RegExp('\\b(' + ORDERED.map(function (p) { return escRe(p[0]); }).join('|') + ')\\b', 'gi');
  var FAM_OF = {};
  ORDERED.forEach(function (p) { FAM_OF[p[0].toLowerCase()] = p[1]; });

  /* Escapes first, then highlights, so a term is never injected into markup. */
  function mark(text) {
    return esc(text).replace(RE, function (m) {
      var fam = FAM_OF[m.toLowerCase()];
      return fam ? '<b class="t t--' + fam + '">' + m + '</b>' : m;
    });
  }

  function legend() {
    return '<div class="legend">' + Object.keys(LABEL).map(function (f) {
      return '<span class="legend__i"><i class="t--' + f + '"></i>' + LABEL[f] + '</span>';
    }).join('') + '</div>';
  }

  global.Terms = { mark:mark, legend:legend, families:FAMILIES, label:LABEL };
})(window);
