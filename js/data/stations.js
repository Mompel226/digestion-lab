/* Auto-assembled station content — IGCSE 0610 Topic 7.
   Source: Dr Mompel's 7.1–7.5 lesson decks, Topic 7 notes, and 0610 mark schemes.
   Edit this file to change any question or wording. */
window.STATIONS = [
 {
  "id": "overview",
  "name": "The Alimentary Canal",
  "subtitle": "One continuous tube, five processes, mouth to anus",
  "processes": [
   "ingestion",
   "digestion",
   "absorption",
   "assimilation",
   "egestion"
  ],
  "learn": {
   "exam": [
    "The alimentary canal is one long continuous tube running from the mouth to the anus, and food travels through it in this order: mouth, oesophagus, stomach, small intestine, large intestine, rectum, anus.",
    "The salivary glands, pancreas, liver and gall bladder are associated (accessory) organs: food never passes through them, but they secrete substances into the canal.",
    "The five processes of human nutrition, in order, are ingestion, digestion, absorption, assimilation and egestion.",
    "Digestion is the breakdown of large, insoluble food molecules into small, soluble molecules of nutrients.",
    "Digestion is necessary because large molecules cannot pass through the wall of the alimentary canal into the blood; only small soluble molecules can.",
    "Physical digestion breaks food from larger into smaller pieces without any chemical change to the molecules, which increases the surface area for enzymes; chemical digestion uses enzymes to break the molecules themselves apart."
   ],
   "real": [
    "An adult alimentary canal is roughly 9 m long, and the small intestine alone accounts for 6 to 7 m of it.",
    "The space inside the canal (the lumen) is continuous with the outside world, so strictly speaking food is not inside the body until it has been absorbed through the gut wall.",
    "Faeces are not purely undigested food: they also contain dead gut lining cells, huge numbers of bacteria and bile pigments from broken-down red blood cells, and those pigments genuinely are excreted."
   ],
   "golden": "Egestion is not excretion: egestion removes food that was never digested or absorbed, so it never entered your cells, while excretion removes the waste products of reactions inside cells, such as urea in urine and carbon dioxide from the lungs."
  },
  "keywords": [
   {
    "term": "alimentary canal",
    "def": "The continuous tube running from the mouth to the anus, through which food passes."
   },
   {
    "term": "ingestion",
    "def": "The taking of food or drink substances into the body through the mouth."
   },
   {
    "term": "digestion",
    "def": "The breakdown of large, insoluble food molecules into small, soluble molecules that can be absorbed."
   },
   {
    "term": "absorption",
    "def": "The movement of small food molecules through the wall of the intestine into the blood."
   },
   {
    "term": "assimilation",
    "def": "The movement of digested food molecules into the cells of the body, where they are used and become part of the cells."
   },
   {
    "term": "egestion",
    "def": "The passing out of food that has not been digested, as faeces, through the anus."
   },
   {
    "term": "excretion",
    "def": "The removal of the waste products of reactions inside cells, for example urea in urine and carbon dioxide from the lungs."
   },
   {
    "term": "physical digestion",
    "def": "The breakdown of food from larger into smaller pieces without chemical change to the food molecules."
   },
   {
    "term": "chemical digestion",
    "def": "The breakdown of large insoluble molecules into small soluble molecules using enzymes."
   },
   {
    "term": "associated organ",
    "def": "An organ such as the liver, pancreas, gall bladder or salivary glands that secretes into the alimentary canal but that food never passes through."
   },
   {
    "term": "peristalsis",
    "def": "The wave-like squeezing action of muscles, contracting behind the food and relaxing in front of it, that moves food along the oesophagus and intestines."
   }
  ],
  "photoHint": "A photograph of a dissected human torso or a detailed anatomical model showing the whole gut in place, with the stomach, the coiled small intestine and the large intestine framing it.",
  "activities": [
   {
    "type": "order",
    "prompt": "Put the organs of the alimentary canal into the order that food passes through them.",
    "items": [
     "Mouth",
     "Oesophagus",
     "Stomach",
     "Small intestine",
     "Large intestine",
     "Rectum",
     "Anus"
    ]
   },
   {
    "type": "order",
    "prompt": "Put the five processes of human nutrition into the correct order.",
    "items": [
     "Ingestion",
     "Digestion",
     "Absorption",
     "Assimilation",
     "Egestion"
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each process onto its definition.",
    "tokens": [
     "Ingestion",
     "Digestion",
     "Absorption",
     "Assimilation",
     "Egestion"
    ],
    "slots": [
     {
      "label": "Taking food or drink into the body through the mouth",
      "accept": "Ingestion"
     },
     {
      "label": "Breaking large insoluble molecules into small soluble ones",
      "accept": "Digestion"
     },
     {
      "label": "Small food molecules pass through the intestine wall into the blood",
      "accept": "Absorption"
     },
     {
      "label": "Digested molecules enter the cells of the body and are used there",
      "accept": "Assimilation"
     },
     {
      "label": "Undigested food leaves the body as faeces through the anus",
      "accept": "Egestion"
     }
    ],
    "distractors": [
     "Excretion",
     "Peristalsis"
    ]
   },
   {
    "type": "blank",
    "prompt": "Complete the definition of digestion and the reason it is necessary.",
    "text": "Digestion breaks large {1} food molecules into small {2} ones. This is necessary because large molecules cannot pass through the {3} of the alimentary canal into the {4}.",
    "answers": {
     "1": {
      "accept": [
       "insoluble",
       "in-soluble",
       "non-soluble",
       "non soluble",
       "not soluble",
       "not-soluble",
       "insoluble molecules"
      ],
      "hint": "they will not dissolve"
     },
     "2": {
      "accept": [
       "soluble",
       "dissolvable",
       "small soluble",
       "water soluble",
       "water-soluble",
       "soluble ones"
      ],
      "hint": "they dissolve, so they can be carried in the plasma"
     },
     "3": {
      "accept": [
       "wall",
       "walls",
       "the wall",
       "the walls",
       "gut wall",
       "the gut wall",
       "wall of the gut",
       "intestine wall",
       "intestinal wall",
       "wall of the intestine",
       "wall of the alimentary canal",
       "canal wall",
       "lining",
       "the lining",
       "gut lining"
      ],
      "hint": "the lining you must cross to leave the tube"
     },
     "4": {
      "accept": [
       "blood",
       "the blood",
       "bloodstream",
       "blood stream",
       "the bloodstream",
       "the blood stream",
       "blood plasma",
       "plasma",
       "the plasma",
       "capillaries",
       "the capillaries",
       "blood capillaries",
       "blood vessels"
      ],
      "hint": "the transport fluid on the other side of that wall"
     }
    }
   },
   {
    "type": "sort",
    "prompt": "Sort each event into physical digestion or chemical digestion.",
    "bins": [
     "Physical digestion",
     "Chemical digestion"
    ],
    "items": [
     {
      "text": "Teeth cutting and grinding food into smaller pieces",
      "bin": 0
     },
     {
      "text": "The stomach muscles churning food to mix it with gastric juice",
      "bin": 0
     },
     {
      "text": "Bile emulsifying fat into many small droplets",
      "bin": 0
     },
     {
      "text": "Amylase breaking starch down into maltose",
      "bin": 1
     },
     {
      "text": "Pepsin breaking protein down into polypeptides",
      "bin": 1
     },
     {
      "text": "Lipase breaking fats down into fatty acids and glycerol",
      "bin": 1
     }
    ]
   },
   {
    "type": "sort",
    "prompt": "Sort each example into egestion or excretion.",
    "bins": [
     "Egestion",
     "Excretion"
    ],
    "items": [
     {
      "text": "Faeces passing out of the body through the anus",
      "bin": 0
     },
     {
      "text": "Fibre that was never digested leaving the body",
      "bin": 0
     },
     {
      "text": "Undigested food that never entered a body cell",
      "bin": 0
     },
     {
      "text": "Carbon dioxide breathed out at the lungs",
      "bin": 1
     },
     {
      "text": "Urea removed from the blood and lost in urine",
      "bin": 1
     }
    ]
   },
   {
    "type": "mcq",
    "prompt": "Why must large food molecules be digested before the body can use them? Choose two.",
    "options": [
     "Large molecules cannot pass through the wall of the alimentary canal into the blood",
     "Large molecules are insoluble, so they cannot dissolve and be transported in the blood plasma",
     "Large molecules would be destroyed by the hydrochloric acid in the stomach",
     "Large molecules contain no energy until they are broken into smaller pieces"
    ],
    "correct": [
     0,
     1
    ],
    "why": {
     "0": "Correct. This is the mark-scheme reason: only small molecules can cross the gut wall, so absorption is impossible until digestion has happened.",
     "1": "Correct. Digestion turns large insoluble molecules into small soluble ones, and being soluble is what allows them to be carried dissolved in the plasma.",
     "2": "Wrong. Hydrochloric acid helps digestion, by giving pepsin its optimum pH and killing bacteria in food. Molecules do not need to be digested to escape the acid.",
     "3": "Wrong. A starch molecule already holds the chemical energy; digestion does not create energy, it makes the molecules small enough to be absorbed and then respired."
    }
   }
  ]
 },
 {
  "id": "mouth",
  "name": "Mouth and teeth",
  "subtitle": "Teeth, mastication and the start of digestion",
  "processes": [
   "ingestion",
   "digestion"
  ],
  "learn": {
   "exam": [
    "Ingestion is the taking of food or drink into the body through the mouth.",
    "Physical digestion is the breakdown of food from larger into smaller pieces without chemical change to the food molecules.",
    "Mastication, the cutting and mixing of food with saliva by the teeth and tongue, forms a ball of food called a bolus and increases the surface area of the food for enzymes to act on.",
    "Incisors cut and bite off pieces of food, canines hold and tear at food, premolars crush and grind soft food, and molars chew and grind hard food.",
    "A tooth has enamel on the outside (the hardest substance in the body, made of calcium salts), dentine beneath it, a pulp cavity holding blood vessels and nerves, and cement and periodontal fibres holding the root in the jawbone.",
    "In tooth decay, bacteria in plaque respire sugar and release acid that dissolves the enamel, then the dentine, and finally reaches the pulp cavity; using fluoride toothpaste and eating less sugar slows this, and vitamin C keeps the gums healthy."
   ],
   "real": [
    "Enamel contains no living cells, so unlike bone it cannot grow back once acid has dissolved it; a filling replaces it, it does not repair it.",
    "Fluoride converts the hydroxyapatite in enamel into fluorapatite, which is less soluble in acid even under acidic conditions.",
    "Dentine carries living cytoplasm inside microscopic tubules running out from the pulp, which is why a tooth with worn enamel senses cold and pain so sharply."
   ],
   "golden": "Physical digestion never changes the food molecules, so the teeth only make the pieces smaller and increase the surface area for enzymes; an answer saying the teeth break down starch scores nothing."
  },
  "keywords": [
   {
    "term": "ingestion",
    "def": "The taking of food or drink into the body through the mouth."
   },
   {
    "term": "physical digestion",
    "def": "The breakdown of food from larger into smaller pieces without chemical change to the food molecules."
   },
   {
    "term": "mastication",
    "def": "The cutting and mixing of food with saliva by the teeth and tongue."
   },
   {
    "term": "bolus",
    "def": "The ball of food produced by mastication, ready to be swallowed."
   },
   {
    "term": "incisor",
    "def": "A chisel-shaped tooth at the front of the mouth, used for cutting and biting off pieces of food."
   },
   {
    "term": "canine",
    "def": "A long, sharp, pointed tooth used to hold and tear at food."
   },
   {
    "term": "premolar",
    "def": "A tooth with a ridged surface used to crush and grind soft food."
   },
   {
    "term": "molar",
    "def": "A large, broad tooth at the back of the mouth used for chewing and grinding hard food."
   },
   {
    "term": "enamel",
    "def": "The hard outer layer of a tooth, made of calcium salts; it is the hardest substance in the body and protects the tooth from wear and acid."
   },
   {
    "term": "dentine",
    "def": "The layer beneath the enamel; it is softer than enamel, contains living cytoplasm and can sense pain and temperature."
   },
   {
    "term": "pulp cavity",
    "def": "The space in the centre of a tooth containing blood vessels, which supply nutrients, and nerves, which detect pain, heat and cold."
   },
   {
    "term": "root canal",
    "def": "The channel running down the root of a tooth along which the blood vessels and nerves reach the pulp cavity."
   },
   {
    "term": "cement",
    "def": "The thin, bone-like layer covering the root of a tooth that helps anchor it to the jawbone."
   },
   {
    "term": "periodontal fibres",
    "def": "Tough fibres between the cement and the jawbone that hold the tooth firmly in its socket and act as shock absorbers."
   },
   {
    "term": "gum",
    "def": "The soft tissue that covers the jawbone and seals around the neck of each tooth; it needs vitamin C to stay healthy."
   },
   {
    "term": "jawbone",
    "def": "The bone in which the roots of the teeth are set, holding each tooth in its socket."
   },
   {
    "term": "plaque",
    "def": "The sticky layer of bacteria and food that builds up on teeth; the bacteria respire sugar and release acid that causes decay."
   }
  ],
  "photoHint": "A real molar cut in half lengthways and photographed close up, so that the white enamel cap, the paler yellow dentine beneath it and the dark pulp cavity running down into the root are all clearly visible.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the account of what happens in the mouth.",
    "text": "Ingestion is the taking of food or drink into the body through the {1}. The {2} carry out physical digestion, breaking the food into smaller pieces. The food is mixed with {3} by the tongue until it forms a ball of food called a {4}.",
    "answers": {
     "1": {
      "accept": [
       "mouth",
       "the mouth",
       "mouth cavity",
       "the mouth cavity",
       "buccal cavity",
       "the buccal cavity",
       "oral cavity"
      ],
      "hint": "where food enters the alimentary canal"
     },
     "2": {
      "accept": [
       "teeth",
       "the teeth",
       "tooth",
       "teeth and tongue",
       "the teeth and tongue"
      ],
      "hint": "a full adult set has 32 of them"
     },
     "3": {
      "accept": [
       "saliva",
       "the saliva"
      ],
      "hint": "made by the salivary glands"
     },
     "4": {
      "accept": [
       "bolus",
       "a bolus",
       "the bolus",
       "food bolus",
       "a food bolus",
       "ball of food",
       "a ball of food"
      ],
      "hint": "the product of mastication"
     }
    }
   },
   {
    "type": "match",
    "prompt": "Match each type of tooth to its function.",
    "left": [
     "Incisors",
     "Canines",
     "Premolars",
     "Molars"
    ],
    "right": [
     "Cutting and biting off pieces of food",
     "Holding and tearing at food",
     "Crushing and grinding soft food",
     "Chewing and grinding hard food"
    ],
    "pairs": [
     [
      0,
      0
     ],
     [
      1,
      1
     ],
     [
      2,
      2
     ],
     [
      3,
      3
     ]
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each label onto the job it does in and around a tooth. One token is a sticky build-up on the teeth, not a part of the tooth or its socket, so it is not used.",
    "tokens": [
     "enamel",
     "dentine",
     "pulp cavity",
     "root canal",
     "cement",
     "periodontal fibres",
     "gum"
    ],
    "slots": [
     {
      "label": "Hard outer layer of calcium salts that protects the tooth from wear and acid",
      "accept": "enamel"
     },
     {
      "label": "Layer under the enamel that contains living cytoplasm and senses pain and cold",
      "accept": "dentine"
     },
     {
      "label": "Central space holding the blood vessels and nerves",
      "accept": "pulp cavity"
     },
     {
      "label": "Channel down the root that the blood vessels and nerves pass along",
      "accept": "root canal"
     },
     {
      "label": "Thin, bone-like layer covering the root that anchors the tooth to the jawbone",
      "accept": "cement"
     },
     {
      "label": "Tough fibres between the cement and the jawbone that act as shock absorbers",
      "accept": "periodontal fibres"
     },
     {
      "label": "Soft tissue that covers the jawbone and seals around the neck of the tooth",
      "accept": "gum"
     }
    ],
    "distractors": [
     "plaque"
    ]
   },
   {
    "type": "sort",
    "prompt": "Sort each event into physical digestion or chemical digestion.",
    "bins": [
     "Physical digestion",
     "Chemical digestion"
    ],
    "items": [
     {
      "text": "Incisors biting off a piece of apple",
      "bin": 0
     },
     {
      "text": "The tongue rolling chewed food into a bolus",
      "bin": 0
     },
     {
      "text": "Molars grinding a nut into small pieces",
      "bin": 0
     },
     {
      "text": "Salivary amylase breaking starch into maltose",
      "bin": 1
     },
     {
      "text": "Pepsin breaking protein into shorter polypeptides",
      "bin": 1
     },
     {
      "text": "Bile emulsifying fat into many small droplets",
      "bin": 0
     }
    ]
   },
   {
    "type": "order",
    "prompt": "Put the stages of tooth decay into the correct order.",
    "items": [
     "Sugar is left on the teeth and bacteria build up in a layer of plaque",
     "The bacteria respire the sugar and release acid",
     "The acid dissolves the enamel",
     "The decay reaches the dentine, so the tooth becomes sensitive to cold",
     "The decay reaches the pulp cavity and the nerves, causing toothache"
    ]
   },
   {
    "type": "mcq",
    "prompt": "Choose two. Which two statements correctly describe how tooth decay is reduced?",
    "options": [
     "Fluoride toothpaste makes the enamel less soluble, so acid dissolves it more slowly.",
     "Eating less sugar gives the bacteria in plaque less to respire, so less acid is made.",
     "Vitamin C hardens the enamel so that acid cannot dissolve it.",
     "Amylase in saliva digests the bacteria in plaque."
    ],
    "correct": [
     0,
     1
    ],
    "why": {
     "0": "Correct. Fluoride is taken into the enamel and makes it harder for acid to dissolve, which is why fluoride toothpaste is recommended.",
     "1": "Correct. The bacteria in plaque respire sugar and release acid, so less sugar means less acid attacking the enamel.",
     "2": "Vitamin C is needed for healthy gums, and too little causes scurvy in which the gums weaken and bleed, but it has no effect on the hardness of enamel.",
     "3": "Amylase digests starch into maltose. Enzymes are specific, so amylase has no effect on bacteria."
    }
   },
   {
    "type": "blank",
    "prompt": "Build the exam answer to: 'Explain how the action of the teeth helps the chemical digestion of food.' (3 marks) The last gap names the type of digestion and is a check, not one of the three marks.",
    "text": "The teeth break the food from larger pieces into {1} pieces. This increases the {2} of the food. Enzymes can then act on more of the food at once, so the {3} of chemical digestion increases. The food molecules themselves are not changed, so this is {4} digestion.",
    "answers": {
     "1": {
      "accept": [
       "smaller",
       "small",
       "finer",
       "much smaller",
       "smaller and smaller"
      ],
      "hint": "the opposite of larger"
     },
     "2": {
      "accept": [
       "surface area",
       "the surface area",
       "surface-area",
       "surface area of the food",
       "the surface area of the food",
       "total surface area",
       "the total surface area"
      ],
      "hint": "two words: how much of the food is exposed to enzymes"
     },
     "3": {
      "accept": [
       "rate",
       "speed",
       "rate of reaction",
       "the rate of reaction",
       "speed of reaction",
       "rate of digestion",
       "speed of digestion"
      ],
      "hint": "how fast the reaction goes"
     },
     "4": {
      "accept": [
       "physical",
       "physical digestion"
      ],
      "hint": "the syllabus word for this kind of digestion, not 'mechanical'"
     }
    }
   }
  ]
 },
 {
  "id": "salivary-glands",
  "name": "Salivary glands",
  "subtitle": "Saliva, amylase and the first enzyme of digestion",
  "processes": [
   "digestion"
  ],
  "learn": {
   "exam": [
    "The salivary glands secrete saliva into the mouth; they are associated organs, so they are not part of the alimentary canal itself.",
    "Saliva contains the enzyme salivary amylase, which begins the chemical digestion of starch.",
    "Amylase breaks starch down into maltose, a simple reducing sugar.",
    "Salivary amylase works best at about pH 6.8, which is close to neutral and is the pH of saliva.",
    "Saliva also lubricates the food, so the bolus is slippery and can be swallowed easily.",
    "Maltose is not absorbed in the mouth; it is broken down to glucose later by maltase on the epithelium of the small intestine."
   ],
   "real": [
    "Saliva is over 99% water; the rest is mucus, mineral ions, amylase and lysozyme, an enzyme that damages bacterial cell walls.",
    "Food is in the mouth for well under a minute, so most salivary amylase actually works inside the bolus after swallowing, until stomach acid penetrates the bolus and denatures it.",
    "Saliva contains hydrogencarbonate ions that buffer the acid made by plaque bacteria, which is part of the reason a dry mouth leads to more tooth decay."
   ],
   "golden": "Salivary amylase produces maltose, not glucose; glucose only appears when maltase acts on maltose at the epithelium of the small intestine."
  },
  "keywords": [
   {
    "term": "salivary glands",
    "def": "The glands that secrete saliva into the mouth; they are associated organs, not part of the alimentary canal."
   },
   {
    "term": "saliva",
    "def": "The watery fluid secreted into the mouth; it contains amylase and lubricates food so that it can be swallowed."
   },
   {
    "term": "salivary amylase",
    "def": "The carbohydrase enzyme in saliva that breaks starch down into maltose."
   },
   {
    "term": "carbohydrase",
    "def": "The general name for enzymes that break carbohydrates down into simple sugars."
   },
   {
    "term": "chemical digestion",
    "def": "The use of enzymes to break large insoluble molecules into small soluble ones that can be absorbed."
   },
   {
    "term": "starch",
    "def": "A large, insoluble carbohydrate made of many glucose molecules joined into a chain."
   },
   {
    "term": "maltose",
    "def": "A simple reducing sugar made of two glucose molecules; it is the product of amylase acting on starch."
   },
   {
    "term": "maltase",
    "def": "The enzyme on the membranes of the epithelium of the small intestine that breaks maltose down into glucose."
   },
   {
    "term": "optimum pH",
    "def": "The pH at which an enzyme works fastest; for salivary amylase this is about 6.8."
   },
   {
    "term": "associated organ",
    "def": "An organ that makes a digestive juice but is not part of the tube the food passes through: the salivary glands, pancreas, liver and gall bladder."
   }
  ],
  "photoHint": "A photograph of two test tubes after an iodine test, one blue-black where starch remains and one still orange-brown where saliva was added and left for a few minutes.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the account of chemical digestion in the mouth.",
    "text": "The {1} glands secrete {2} into the mouth. It contains the enzyme salivary {3}, which begins the chemical digestion of {4} and breaks it down into {5}.",
    "answers": {
     "1": {
      "accept": [
       "salivary",
       "the salivary"
      ],
      "hint": "named after the fluid they make"
     },
     "2": {
      "accept": [
       "saliva",
       "the saliva"
      ],
      "hint": "over 99% water"
     },
     "3": {
      "accept": [
       "amylase",
       "salivary amylase",
       "the amylase",
       "carbohydrase"
      ],
      "hint": "a carbohydrase"
     },
     "4": {
      "accept": [
       "starch",
       "the starch",
       "starches"
      ],
      "hint": "the complex carbohydrate in bread, pasta and potatoes"
     },
     "5": {
      "accept": [
       "maltose",
       "the maltose",
       "maltose sugar",
       "a reducing sugar",
       "reducing sugar",
       "simple reducing sugar",
       "a simple reducing sugar",
       "simple reducing sugars"
      ],
      "hint": "a simple reducing sugar made of two glucose molecules"
     }
    }
   },
   {
    "type": "match",
    "prompt": "Match each substance to what happens to it.",
    "left": [
     "Starch",
     "Maltose",
     "Protein",
     "Saliva"
    ],
    "right": [
     "Broken down to maltose by amylase",
     "Broken down to glucose by maltase",
     "Broken down to polypeptides by pepsin",
     "Lubricates the bolus so it can be swallowed"
    ],
    "pairs": [
     [
      0,
      0
     ],
     [
      1,
      1
     ],
     [
      2,
      2
     ],
     [
      3,
      3
     ]
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each enzyme to the organ that secretes it.",
    "tokens": [
     "salivary amylase",
     "pepsin",
     "pancreatic lipase"
    ],
    "slots": [
     {
      "label": "Salivary glands",
      "accept": "salivary amylase"
     },
     {
      "label": "Stomach, in gastric juice",
      "accept": "pepsin"
     },
     {
      "label": "Pancreas",
      "accept": "pancreatic lipase"
     }
    ],
    "distractors": [
     "maltase"
    ]
   },
   {
    "type": "ph",
    "prompt": "Set the pH to the optimum for salivary amylase.",
    "enzyme": "Salivary amylase",
    "optimum": 6.8,
    "tolerance": 0.6,
    "explain": "Saliva is about pH 6.8, close to neutral, and salivary amylase works fastest there. When the bolus reaches the stomach the pH falls to about 2, the amylase denatures and starch digestion stops until the pancreas releases more amylase into the duodenum."
   },
   {
    "type": "mcq",
    "prompt": "A student eats a piece of bread. Why does the digestion of starch by salivary amylase stop soon after the bolus reaches the stomach?",
    "options": [
     "There is no starch left, because the mouth digests all of it.",
     "Hydrochloric acid lowers the pH to about 2, which denatures the salivary amylase.",
     "The amylase is absorbed into the blood through the stomach wall.",
     "Pepsin digests the starch instead, so amylase is no longer needed."
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "Food is in the mouth for well under a minute, so only a small part of the starch is digested there; most starch digestion happens later, in the duodenum.",
     "1": "Correct. Salivary amylase has an optimum pH of about 6.8, so the acid in the stomach changes the shape of its active site and it stops working.",
     "2": "Enzymes are not absorbed; absorption of small soluble food molecules happens in the small intestine, and the stomach absorbs almost nothing.",
     "3": "Enzymes are specific. Pepsin is a protease and acts only on protein, so it cannot digest starch."
    }
   },
   {
    "type": "order",
    "prompt": "Put the digestion of starch into the correct order, from ingestion to absorption.",
    "items": [
     "Starch is ingested and chewed by the teeth, which increases the surface area of the food",
     "Salivary amylase in saliva breaks starch down into maltose",
     "The bolus is swallowed and moved down the oesophagus by peristalsis",
     "Pancreatic amylase in the duodenum breaks the remaining starch down into maltose",
     "Maltase on the epithelium of the small intestine breaks maltose down into glucose",
     "Glucose is absorbed into the capillaries of the villi and carried to the liver"
    ]
   }
  ]
 },
 {
  "id": "epiglottis",
  "name": "Epiglottis",
  "subtitle": "The flap that keeps food out of the trachea",
  "beyond": true,
  "processes": [
   "ingestion"
  ],
  "learn": {
   "exam": [
    "Swallowing moves the bolus from the mouth into the oesophagus.",
    "The pharynx is the space at the back of the mouth where the path of food and the path of air cross.",
    "The epiglottis is a flap of cartilage that folds down over the opening of the trachea as you swallow, so that the bolus enters the oesophagus and not the airway.",
    "The oesophagus carries food to the stomach; the trachea carries air to the lungs and is not part of the alimentary canal.",
    "Once in the oesophagus, the bolus is moved down to the stomach by peristalsis, the squeezing action of muscles in the wall of the tube."
   ],
   "real": [
    "The epiglottis is not named in the 0610 syllabus; it is here so that swallowing makes sense, but the examinable words are bolus, oesophagus and peristalsis.",
    "Swallowing is a reflex: once the bolus touches the back of the pharynx you cannot stop it, the larynx is pulled up under the epiglottis and breathing pauses for about a second.",
    "If food does enter the trachea the cough reflex usually clears it, and when it does not the food can cause a chest infection called aspiration pneumonia."
   ],
   "golden": "Food never travels down the trachea, so an answer that sends food towards the lungs is describing choking, not swallowing."
  },
  "keywords": [
   {
    "term": "epiglottis",
    "def": "A flap of cartilage that folds down over the opening of the trachea during swallowing so that food enters the oesophagus."
   },
   {
    "term": "swallowing",
    "def": "The reflex that pushes the bolus from the mouth, through the pharynx, into the oesophagus."
   },
   {
    "term": "pharynx",
    "def": "The space at the back of the mouth and nose where the path of food and the path of air cross."
   },
   {
    "term": "trachea",
    "def": "The tube that carries air from the pharynx to the lungs; it is held open by rings of cartilage."
   },
   {
    "term": "oesophagus",
    "def": "The muscular tube that carries the bolus from the mouth to the stomach."
   },
   {
    "term": "bolus",
    "def": "The ball of food produced by mastication, ready to be swallowed."
   },
   {
    "term": "peristalsis",
    "def": "The squeezing action of muscles that moves food along the oesophagus and intestines."
   }
  ],
  "photoHint": "An endoscope photograph looking down into the back of the throat, showing the pale, leaf-shaped epiglottis standing above the vocal cords with the entrance to the oesophagus behind it.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the account of swallowing.",
    "text": "When you swallow, the {1} of food is pushed to the back of the mouth by the tongue. A flap called the {2} folds down over the opening of the {3}, so the food passes into the {4} instead.",
    "answers": {
     "1": {
      "accept": [
       "bolus",
       "a bolus",
       "the bolus",
       "food bolus",
       "a food bolus",
       "ball of food",
       "a ball of food"
      ],
      "hint": "the ball of food made by mastication"
     },
     "2": {
      "accept": [
       "epiglottis",
       "the epiglottis"
      ],
      "hint": "made of cartilage; not on the syllabus, but useful"
     },
     "3": {
      "accept": [
       "trachea",
       "the trachea",
       "windpipe",
       "the windpipe",
       "wind pipe",
       "the wind pipe",
       "airway",
       "the airway"
      ],
      "hint": "the tube that carries air to the lungs"
     },
     "4": {
      "accept": [
       "oesophagus",
       "the oesophagus",
       "esophagus",
       "the esophagus",
       "gullet",
       "the gullet",
       "food pipe",
       "the food pipe",
       "oesophagus (gullet)"
      ],
      "hint": "the tube that carries food to the stomach"
     }
    }
   },
   {
    "type": "drag",
    "prompt": "Drag each structure onto its place in the path of food or the path of air. One token is a flap, not a tube, so it is not used.",
    "tokens": [
     "oesophagus",
     "stomach",
     "trachea",
     "lungs"
    ],
    "slots": [
     {
      "label": "Food: the bolus leaves the pharynx and enters here",
      "accept": "oesophagus"
     },
     {
      "label": "Food: the bolus arrives here",
      "accept": "stomach"
     },
     {
      "label": "Air: air leaves the pharynx and enters here",
      "accept": "trachea"
     },
     {
      "label": "Air: the air arrives here",
      "accept": "lungs"
     }
    ],
    "distractors": [
     "epiglottis"
    ]
   },
   {
    "type": "order",
    "prompt": "Put the stages of swallowing into the correct order.",
    "items": [
     "The teeth and tongue break up the food and form it into a bolus",
     "The tongue pushes the bolus to the back of the mouth, into the pharynx",
     "The epiglottis folds down and covers the opening of the trachea",
     "The bolus passes into the oesophagus",
     "Peristalsis squeezes the bolus down the oesophagus towards the stomach"
    ]
   },
   {
    "type": "sort",
    "prompt": "Sort each statement into the tube it describes.",
    "bins": [
     "Oesophagus",
     "Trachea"
    ],
    "items": [
     {
      "text": "Carries the bolus to the stomach",
      "bin": 0
     },
     {
      "text": "Carries air towards the lungs",
      "bin": 1
     },
     {
      "text": "Moves its contents along by peristalsis",
      "bin": 0
     },
     {
      "text": "Held open by rings of cartilage",
      "bin": 1
     },
     {
      "text": "Is covered by the epiglottis during swallowing",
      "bin": 1
     },
     {
      "text": "Is part of the alimentary canal",
      "bin": 0
     }
    ]
   },
   {
    "type": "mcq",
    "prompt": "Why does food not normally enter the trachea when you swallow?",
    "options": [
     "The trachea is too narrow for the bolus to fit into.",
     "The epiglottis folds down and covers the opening of the trachea.",
     "Peristalsis in the trachea pushes any food back up into the mouth.",
     "Saliva makes the bolus too heavy to enter the trachea."
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "The trachea is actually held permanently open by rings of cartilage, while the oesophagus is normally squashed flat, so size is not what keeps food out.",
     "1": "Correct. The epiglottis is a flap of cartilage that folds down over the opening of the trachea as the bolus passes, so the food is directed into the oesophagus.",
     "2": "Peristalsis is the squeezing of muscles in the wall of the alimentary canal; the trachea is not part of the alimentary canal and does not carry out peristalsis.",
     "3": "Saliva lubricates the bolus so it slides easily; weight has nothing to do with which tube the food enters."
    }
   },
   {
    "type": "mcq",
    "prompt": "A person talks while eating and a piece of food enters the trachea. Which statement best describes what has happened?",
    "options": [
     "The bolus has entered the alimentary canal by the normal route.",
     "The epiglottis did not close over the trachea in time, so food entered the airway and the cough reflex is triggered.",
     "Peristalsis has reversed and pushed the food towards the lungs.",
     "The food will be absorbed into the blood through the wall of the trachea."
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "The alimentary canal runs mouth, oesophagus, stomach, small intestine, large intestine, anus; the trachea is part of the gas exchange system, so this is not the normal route.",
     "1": "Correct. Swallowing and speaking use the same opening, so if the epiglottis is not covering the trachea when the bolus passes, food enters the airway and coughing clears it.",
     "2": "Peristalsis happens in the muscular wall of the alimentary canal, not in the trachea, so it cannot move food into the airway.",
     "3": "Nothing from food is absorbed through the trachea; small soluble food molecules are absorbed through the villi of the small intestine."
    }
   }
  ]
 },
 {
  "id": "oesophagus",
  "name": "Oesophagus",
  "subtitle": "The muscular tube that pushes the bolus to the stomach",
  "processes": [
   "ingestion"
  ],
  "learn": {
   "exam": [
    "The oesophagus is the muscular tube that carries the bolus from the mouth to the stomach.",
    "Peristalsis is the wave of muscle contraction (the squeezing action of the muscles in the wall) that moves food along the alimentary canal.",
    "The wall contains circular muscle and longitudinal muscle: circular muscle contracts behind the bolus to narrow the tube and push it forwards, and relaxes in front of it so the bolus can move on.",
    "Peristalsis happens along the whole alimentary canal, not just the oesophagus.",
    "Fibre (roughage) is not digested; it adds bulk so the gut muscles have something to grip, and too little fibre causes constipation.",
    "No digestive enzymes are secreted and no food is absorbed in the oesophagus — it only transports food. Mucus is secreted, but only to lubricate the bolus, not to digest it."
   ],
   "real": [
    "Ahead of the bolus the longitudinal muscle contracts, shortening and widening that stretch of tube so the bolus slides into it easily.",
    "Peristalsis is controlled by a network of nerves in the wall of the gut itself, so the gut keeps moving food along even with no signals from the brain.",
    "A ring of muscle at the lower end of the oesophagus keeps stomach contents out; when it leaks, acid on the unprotected lining is what people feel as heartburn."
   ],
   "golden": "The bolus does not fall down the oesophagus under gravity — muscle pushes it, which is why you could still swallow a drink standing on your head."
  },
  "keywords": [
   {
    "term": "bolus",
    "def": "A ball of chewed food, mixed with saliva, that is swallowed."
   },
   {
    "term": "peristalsis",
    "def": "The wave of muscle contraction (squeezing action) that moves food along the oesophagus and the rest of the alimentary canal."
   },
   {
    "term": "circular muscle",
    "def": "A ring of muscle in the wall of the alimentary canal; when it contracts the tube becomes narrower."
   },
   {
    "term": "longitudinal muscle",
    "def": "Muscle running along the length of the wall of the alimentary canal; when it contracts the tube becomes shorter and wider."
   },
   {
    "term": "fibre (roughage)",
    "def": "The part of food that is not digested; it adds bulk so that peristalsis can move the food along."
   },
   {
    "term": "alimentary canal",
    "def": "The single long tube from the mouth to the anus that food passes through. The liver, pancreas, gall bladder and salivary glands are digestive organs but are NOT part of the alimentary canal."
   }
  ],
  "photoHint": "A stained transverse section of the oesophagus wall under the light microscope, with the folded inner lining and the two muscle layers — circular and longitudinal — clearly distinguishable.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the description of swallowing.",
    "text": "Food is chewed and mixed with saliva to make a ball called a {1}. It is swallowed into the {2}, a muscular tube, and pushed towards the stomach by {3}.",
    "answers": {
     "1": {
      "accept": [
       "bolus",
       "a bolus",
       "the bolus",
       "food bolus",
       "bolus of food",
       "ball of food",
       "a ball of food"
      ],
      "hint": "The ball of food produced by chewing"
     },
     "2": {
      "accept": [
       "oesophagus",
       "the oesophagus",
       "esophagus",
       "the esophagus",
       "gullet",
       "the gullet",
       "oesophagus (gullet)"
      ],
      "hint": "The tube between the mouth and the stomach"
     },
     "3": {
      "accept": [
       "peristalsis",
       "the peristalsis",
       "peristalsis (muscle contraction)",
       "peristaltic waves",
       "peristaltic wave",
       "a peristaltic wave",
       "waves of peristalsis",
       "peristaltic action",
       "peristaltic movement"
      ],
      "hint": "The squeezing action of the muscles in the wall"
     }
    }
   },
   {
    "type": "mcq",
    "prompt": "What is the main function of peristalsis?",
    "options": [
     "Absorbing nutrients into the blood",
     "Producing digestive enzymes",
     "Moving food along the alimentary canal",
     "Storing faeces before egestion"
    ],
    "correct": [
     2
    ],
    "why": {
     "0": "Absorption of digested food happens in the small intestine, through the villi (the colon absorbs some water). Peristalsis only moves food; it takes nothing into the blood.",
     "1": "Enzymes are secreted by glands such as the salivary glands and the pancreas — digestive organs that are not part of the alimentary canal itself. A muscle contraction makes no enzymes.",
     "2": "Correct. Circular muscle contracts behind the food and squeezes it forwards, all the way from the oesophagus to the rectum.",
     "3": "Faeces are stored in the rectum. Peristalsis is what moved the material there in the first place."
    }
   },
   {
    "type": "sort",
    "prompt": "Sort each statement by whether it happens in the oesophagus.",
    "bins": [
     "Happens in the oesophagus",
     "Does not happen in the oesophagus"
    ],
    "items": [
     {
      "text": "A wave of muscle contraction pushes the bolus along",
      "bin": 0
     },
     {
      "text": "Mucus makes the bolus slippery so it slides easily",
      "bin": 0
     },
     {
      "text": "Enzymes are secreted onto the food",
      "bin": 1
     },
     {
      "text": "Small soluble molecules are absorbed into the blood",
      "bin": 1
     },
     {
      "text": "Hydrochloric acid is added to the food",
      "bin": 1
     },
     {
      "text": "The food is churned into chyme",
      "bin": 1
     }
    ]
   },
   {
    "type": "drag",
    "prompt": "A bolus is halfway down the oesophagus. Drag each muscle action to its place in the peristaltic wave.",
    "tokens": [
     "circular muscle contracts",
     "circular muscle relaxes",
     "longitudinal muscle contracts"
    ],
    "slots": [
     {
      "label": "In the wall just behind the bolus — the tube narrows and squeezes it forwards",
      "accept": "circular muscle contracts"
     },
     {
      "label": "In the wall just in front of the bolus — the tube stays open so the bolus can move on",
      "accept": "circular muscle relaxes"
     },
     {
      "label": "Ahead of the bolus — the tube is pulled shorter and wider",
      "accept": "longitudinal muscle contracts"
     }
    ],
    "distractors": [
     "cilia beat",
     "the bolus falls under gravity"
    ]
   },
   {
    "type": "order",
    "prompt": "Put the journey of a mouthful of bread in order, from the first bite to the stomach.",
    "items": [
     "The teeth cut and grind the bread, increasing its surface area",
     "Saliva moistens the food and the tongue rolls it into a bolus",
     "The bolus is swallowed and enters the oesophagus",
     "Circular muscle contracts behind the bolus and squeezes it forwards",
     "The wave of contraction travels down the oesophagus, carrying the bolus with it",
     "The bolus passes into the stomach"
    ]
   },
   {
    "type": "blank",
    "prompt": "Complete the link between fibre and peristalsis.",
    "text": "Fibre, also called roughage, is not {1} by the body, so it provides no energy. It adds {2} to the food, so the gut muscles have something to grip during {3}. A diet with too little fibre can cause {4}.",
    "answers": {
     "1": {
      "accept": [
       "digested",
       "digested (broken down)",
       "broken down",
       "broken down by enzymes",
       "digested by enzymes",
       "chemically digested",
       "absorbed",
       "digested or absorbed"
      ],
      "hint": "Enzymes cannot break it down"
     },
     "2": {
      "accept": [
       "bulk",
       "extra bulk",
       "bulk (roughage)",
       "roughage bulk",
       "volume",
       "extra volume",
       "bulk to it"
      ],
      "hint": "Starts with b — it gives the food something to push against"
     },
     "3": {
      "accept": [
       "peristalsis",
       "the peristalsis",
       "peristalsis (muscle contraction)",
       "peristaltic waves",
       "peristaltic wave",
       "a peristaltic wave",
       "waves of peristalsis",
       "peristaltic action",
       "peristaltic movement"
      ],
      "hint": "The wave of muscle contraction along the canal"
     },
     "4": {
      "accept": [
       "constipation",
       "constipated",
       "constipation (hard faeces)",
       "constipation (hard feces)"
      ],
      "hint": "Faeces move too slowly and become hard"
     }
    }
   },
   {
    "type": "mcq",
    "prompt": "An astronaut in orbit, where objects float, swallows a mouthful of food. It still reaches her stomach. Which statement explains why?",
    "options": [
     "Gravity pulls the bolus down the oesophagus",
     "Circular muscle contracts behind the bolus and squeezes it along",
     "The stomach sucks the bolus down by lowering its pressure",
     "Cilia lining the oesophagus sweep the bolus downwards"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "Gravity plays almost no part, which is why you can swallow lying down, upside down, or in orbit.",
     "1": "Correct. Peristalsis is muscle, not gravity, so it works in any position.",
     "2": "The stomach does not suck. The bolus is pushed into it by the peristaltic wave in the oesophagus.",
     "3": "Cilia sweep mucus along the airways. The lining of the oesophagus does not move food with cilia."
    }
   }
  ]
 },
 {
  "id": "stomach",
  "name": "Stomach",
  "subtitle": "Churning, acid and pepsin: protein digestion begins here",
  "processes": [
   "digestion"
  ],
  "learn": {
   "exam": [
    "The muscular wall of the stomach churns the food and mixes it with gastric juice; this churning is physical digestion.",
    "The stomach produces gastric juice, which contains hydrochloric acid and the enzyme pepsin (a protease).",
    "The hydrochloric acid has three jobs: it gives the optimum acidic pH of about 2 for pepsin, it kills microorganisms in the food, and it denatures proteins so the chains unfold and the enzyme can reach them.",
    "Pepsin begins the chemical digestion of protein, breaking it down into short polypeptides; proteases in the small intestine finish the job, producing amino acids. (A mark scheme will also allow 'protein → amino acids' for pepsin, but polypeptides is the better answer.)",
    "The mixture of partly digested food and gastric juice that leaves the stomach is called chyme.",
    "A layer of mucus protects the stomach lining from the acid and from pepsin, and no food molecules are absorbed in the stomach."
   ],
   "real": [
    "Denaturing the protein in food helps digestion, because the unfolded chain gives pepsin more places to cut, while denaturing an enzyme stops digestion, because the active site is wrecked — same word, opposite consequence.",
    "The stomach releases pepsin in an inactive form called pepsinogen, and the hydrochloric acid switches it on, so the cells that make it are not digested by it.",
    "Alcohol and some drugs such as aspirin are absorbed straight through the stomach wall, but food molecules are not."
   ],
   "golden": "Hydrochloric acid is not an enzyme and does not digest the food — it creates the conditions (pH 2) in which pepsin can, so never write that the acid breaks down protein."
  },
  "keywords": [
   {
    "term": "gastric juice",
    "def": "The fluid produced by the stomach; it contains hydrochloric acid and the enzyme pepsin."
   },
   {
    "term": "hydrochloric acid",
    "def": "The acid in gastric juice; it gives a pH of about 2, kills microorganisms in food and denatures proteins. It is not an enzyme, so it does not digest the food itself."
   },
   {
    "term": "pepsin",
    "def": "A protease in gastric juice that breaks protein down into short polypeptides."
   },
   {
    "term": "protease",
    "def": "An enzyme that breaks down protein."
   },
   {
    "term": "chyme",
    "def": "The soupy mixture of partly digested food and gastric juice that leaves the stomach."
   },
   {
    "term": "denatured",
    "def": "An enzyme is denatured when its shape changes so that the substrate no longer fits the active site and it stops working; denaturing by heat is permanent, so cooling the enzyme does not bring it back. Protein in food can also be denatured — there the unfolding is helpful, because it lets pepsin reach more of the chain."
   },
   {
    "term": "mucus",
    "def": "A slimy layer secreted onto the stomach lining that stops the acid and pepsin digesting the stomach wall."
   }
  ],
  "photoHint": "An endoscope photograph taken inside a living stomach, showing the thick folds of the glistening, mucus-covered lining.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the account of what the stomach does.",
    "text": "The stomach produces {1} juice, which contains hydrochloric acid and the enzyme {2}. The muscular wall {3} the food and mixes it with the juice. The soupy mixture that leaves the stomach is called {4}.",
    "answers": {
     "1": {
      "accept": [
       "gastric",
       "gastric juice",
       "the gastric",
       "gastric (juice)"
      ],
      "hint": "From the Greek word for stomach"
     },
     "2": {
      "accept": [
       "pepsin",
       "pepsin (a protease)",
       "pepsin (protease)",
       "protease",
       "a protease",
       "the protease"
      ],
      "hint": "The protease of the stomach"
     },
     "3": {
      "accept": [
       "churns",
       "churn",
       "churns up",
       "churns and mixes",
       "churns (mixes)",
       "squeezes",
       "squeezes and churns",
       "mixes",
       "mixes up",
       "mixes and churns"
      ],
      "hint": "The word for the mixing action of the stomach muscles"
     },
     "4": {
      "accept": [
       "chyme",
       "the chyme",
       "acid chyme",
       "acidic chyme"
      ],
      "hint": "Rhymes with 'time'"
     }
    }
   },
   {
    "type": "mcq",
    "prompt": "The function of hydrochloric acid in the stomach is to:",
    "options": [
     "emulsify fats",
     "neutralise alkaline food",
     "kill bacteria and provide a suitable pH for enzymes",
     "digest starch"
    ],
    "correct": [
     2
    ],
    "why": {
     "0": "Bile emulsifies fats, and that happens in the small intestine, not the stomach. Bile is not an enzyme — it breaks fat droplets up physically — and it is made by the liver, which is not part of the alimentary canal.",
     "1": "The acid does the opposite: it makes the stomach contents strongly acidic. It is bile that neutralises them later, in the duodenum.",
     "2": "Correct. The acid kills microorganisms in the food and gives the pH of about 2 that pepsin needs. Mark schemes say 'microorganisms' as well as 'bacteria'.",
     "3": "Starch is digested by amylase, which works at about pH 7. Stomach acid actually stops swallowed salivary amylase working."
    }
   },
   {
    "type": "sort",
    "prompt": "Sort what happens in the stomach.",
    "bins": [
     "Physical digestion",
     "Chemical digestion",
     "Not digestion — it prepares the food or protects the stomach"
    ],
    "items": [
     {
      "text": "The muscular wall churns the food",
      "bin": 0
     },
     {
      "text": "The moving stomach wall mixes food with gastric juice",
      "bin": 0
     },
     {
      "text": "Pepsin breaks protein down into short polypeptides",
      "bin": 1
     },
     {
      "text": "An enzyme breaks the bonds in a protein chain",
      "bin": 1
     },
     {
      "text": "Hydrochloric acid kills microorganisms in the food",
      "bin": 2
     },
     {
      "text": "Hydrochloric acid unfolds protein molecules so pepsin can reach them",
      "bin": 2
     },
     {
      "text": "Mucus coats the stomach lining",
      "bin": 2
     }
    ]
   },
   {
    "type": "ph",
    "prompt": "Set the pH to the optimum for pepsin.",
    "enzyme": "Pepsin",
    "optimum": 2,
    "tolerance": 0.6,
    "explain": "Gastric juice contains hydrochloric acid, which keeps the stomach at about pH 2 — the optimum for pepsin. Move the pH away from 2 and pepsin works more and more slowly, and at neutral or alkaline pH it is denatured: its active site changes shape, protein no longer fits, and protein digestion in the stomach stops. This is why pepsin cannot work in the alkaline small intestine — trypsin, a protease from the pancreas, takes over there."
   },
   {
    "type": "match",
    "prompt": "Hydrochloric acid has three jobs in the stomach. Match each job to what it achieves.",
    "left": [
     "Gives a pH of about 2",
     "Kills microorganisms in the food",
     "Denatures the proteins in the food"
    ],
    "right": [
     "Pepsin is at its optimum pH, so protein is digested quickly",
     "Fewer pathogens survive to reach the intestines",
     "The protein chains unfold, so pepsin can reach more of the chain"
    ],
    "pairs": [
     [
      0,
      0
     ],
     [
      1,
      1
     ],
     [
      2,
      2
     ]
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each molecule to the right stage of protein digestion.",
    "tokens": [
     "protein",
     "short polypeptides",
     "amino acids"
    ],
    "slots": [
     {
      "label": "Swallowed into the stomach",
      "accept": "protein"
     },
     {
      "label": "Produced by pepsin in the stomach",
      "accept": "short polypeptides"
     },
     {
      "label": "Produced by proteases in the small intestine, ready to be absorbed",
      "accept": "amino acids"
     }
    ],
    "distractors": [
     "glucose",
     "fatty acids and glycerol"
    ]
   },
   {
    "type": "mcq",
    "prompt": "A student boils a solution of pepsin, cools it back to 37 °C, then adds it to protein at pH 2. No protein is digested. Why not?",
    "options": [
     "The enzyme was used up during boiling, because enzymes are used up in the reactions they catalyse",
     "Boiling denatured the pepsin: its active site changed shape permanently, so the protein no longer fits",
     "Pepsin only works at 100 °C, so cooling it stopped the reaction",
     "pH 2 is too acidic for pepsin, so it cannot work"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "Enzymes are catalysts. They are not used up in the reaction and can be used again, so 'used up' is never the reason.",
     "1": "Correct. High temperature changes the shape of the active site, and denaturing by heat is permanent — cooling the enzyme down does not bring it back.",
     "2": "No human enzyme works at 100 °C. Enzymes in the body have an optimum near 37 °C and are denatured well below boiling.",
     "3": "pH 2 is pepsin's optimum. That is exactly the pH the hydrochloric acid provides in the stomach."
    }
   }
  ]
 },
 {
  "id": "liver",
  "name": "Liver",
  "subtitle": "Makes bile and stores glucose as glycogen",
  "processes": [
   "digestion",
   "assimilation"
  ],
  "learn": {
   "exam": [
    "The liver is an associated (accessory) organ: it is not part of the alimentary canal, so food never passes through it.",
    "The liver produces bile, which then passes to the gall bladder to be stored.",
    "Blood carrying the glucose and amino acids absorbed by the small intestine travels to the liver in the hepatic portal vein.",
    "Assimilation is the movement of digested food molecules into the cells of the body, where they are used and become part of the cells.",
    "Glucose that is not needed straight away for respiration is converted to glycogen and stored in the liver and in the muscles.",
    "Amino acids pass through the liver to the body's cells, where they are built into new proteins."
   ],
   "real": [
    "Excess amino acids cannot be stored, so the liver removes their amino group (deamination) and converts it to urea, which the kidneys remove in urine.",
    "Bile is coloured by pigments the liver makes when it breaks down worn-out red blood cells, and those pigments are what make faeces brown.",
    "The liver converts glucose to glycogen in response to insulin from the pancreas, which is how a high blood glucose concentration is brought back down."
   ],
   "golden": "The liver makes bile and the gall bladder stores it, so never write that bile is made in the gall bladder or that bile is an enzyme."
  },
  "keywords": [
   {
    "term": "bile",
    "def": "An alkaline greenish fluid made by the liver that emulsifies fats and neutralises stomach acid; it contains no enzymes."
   },
   {
    "term": "hepatic portal vein",
    "def": "The blood vessel that carries absorbed nutrients from the small intestine to the liver."
   },
   {
    "term": "glycogen",
    "def": "The storage carbohydrate made from excess glucose and stored in the liver and muscles."
   },
   {
    "term": "assimilation",
    "def": "The movement of digested food molecules into the cells of the body, where they are used and become part of the cells."
   },
   {
    "term": "associated organ",
    "def": "A digestive organ that food never passes through; it adds its secretions to the alimentary canal through a duct."
   }
  ],
  "photoHint": "A real human liver seen from the front, dark red-brown and wedge-shaped, with the small green gall bladder tucked under its right lobe.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the sentences about the liver.",
    "text": "The liver produces {1}, which is stored in the {2}. Blood carrying absorbed nutrients travels from the small intestine to the liver in the {3} vein.",
    "answers": {
     "1": {
      "accept": [
       "bile",
       "the bile",
       "bile juice"
      ],
      "hint": "An alkaline fluid, not an enzyme"
     },
     "2": {
      "accept": [
       "gall bladder",
       "gallbladder",
       "gall-bladder",
       "the gall bladder",
       "the gallbladder"
      ],
      "hint": "A small sac tucked under the liver"
     },
     "3": {
      "accept": [
       "hepatic portal",
       "hepatic portal vein",
       "the hepatic portal",
       "the hepatic portal vein",
       "hepatic-portal",
       "hepatic-portal vein",
       "hepatic portal (vein)"
      ],
      "hint": "Hepatic means to do with the liver"
     }
    }
   },
   {
    "type": "mcq",
    "prompt": "Which one of these organs is part of the alimentary canal?",
    "options": [
     "Liver",
     "Gall bladder",
     "Oesophagus",
     "Pancreas"
    ],
    "correct": [
     2
    ],
    "why": {
     "0": "The liver is an associated (accessory) organ. It makes bile and delivers it through a duct, but food never passes through the liver.",
     "1": "The gall bladder is an associated (accessory) organ. It stores bile and empties it into the duodenum through the bile duct.",
     "2": "Correct. The alimentary canal is the tube from mouth to anus: mouth, oesophagus, stomach, small intestine, large intestine (colon and rectum), anus. Food passes through the oesophagus.",
     "3": "The pancreas is an associated (accessory) organ. It secretes pancreatic juice into the duodenum through a duct; food never enters it."
    }
   },
   {
    "type": "sort",
    "prompt": "Sort each organ into the alimentary canal or the associated (accessory) organs.",
    "bins": [
     "Part of the alimentary canal",
     "Associated (accessory) organ"
    ],
    "items": [
     {
      "text": "Oesophagus",
      "bin": 0
     },
     {
      "text": "Stomach",
      "bin": 0
     },
     {
      "text": "Duodenum",
      "bin": 0
     },
     {
      "text": "Colon",
      "bin": 0
     },
     {
      "text": "Rectum",
      "bin": 0
     },
     {
      "text": "Liver",
      "bin": 1
     },
     {
      "text": "Gall bladder",
      "bin": 1
     },
     {
      "text": "Pancreas",
      "bin": 1
     },
     {
      "text": "Salivary glands",
      "bin": 1
     }
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each word into the correct place in the story of glucose in the liver.",
    "tokens": [
     "hepatic portal vein",
     "glycogen",
     "respiration"
    ],
    "slots": [
     {
      "label": "Glucose reaches the liver in the...",
      "accept": "hepatic portal vein"
     },
     {
      "label": "Excess glucose is stored in the liver and muscles as...",
      "accept": "glycogen"
     },
     {
      "label": "Glucose is used by body cells to release energy in...",
      "accept": "respiration"
     }
    ],
    "distractors": [
     "starch",
     "lacteal"
    ]
   },
   {
    "type": "order",
    "prompt": "Put the journey of a glucose molecule in order, from a slice of bread to storage in the liver.",
    "items": [
     "Amylase breaks starch down into maltose",
     "Maltase on the epithelium of the small intestine breaks maltose down into glucose",
     "Glucose is absorbed through a villus into a capillary",
     "The hepatic portal vein carries the glucose to the liver",
     "Excess glucose is converted to glycogen",
     "Glycogen is stored in the liver and in the muscles"
    ]
   },
   {
    "type": "mcq",
    "prompt": "A student writes: 'Glucose moves into the blood at the small intestine, so that is assimilation.' Which statement corrects them?",
    "options": [
     "They are right, because absorption and assimilation mean the same thing.",
     "Moving into the blood is absorption; assimilation is when cells take the glucose in and use it.",
     "It is egestion, because the glucose is leaving the gut.",
     "It is digestion, because the glucose was made from starch."
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "They are different stages. Absorption is movement into the blood or lymph; assimilation happens later, inside the cells.",
     "1": "Correct. Absorption is the movement of small food molecules through the wall of the intestine into the blood. Assimilation is the movement of those molecules into the cells, where they are used and become part of the cell.",
     "2": "Egestion is the passing out of undigested food as faeces through the anus. Glucose is absorbed, not egested.",
     "3": "Digestion is the breakdown of large insoluble molecules into small soluble ones. That already happened before the glucose reached the blood."
    }
   }
  ]
 },
 {
  "id": "gall-bladder",
  "name": "Gall bladder",
  "subtitle": "Stores bile and releases it into the duodenum",
  "processes": [
   "digestion"
  ],
  "learn": {
   "exam": [
    "The gall bladder is an associated (accessory) organ that stores the bile made by the liver.",
    "Bile leaves the gall bladder through the bile duct and enters the duodenum, the first part of the small intestine.",
    "Bile is not an enzyme, but it has two roles in digestion.",
    "Bile emulsifies fats: it breaks large fat droplets (globules) into many smaller droplets, which increases the surface area for lipase to work on.",
    "Bile is alkaline, so it neutralises the acidic chyme from the stomach and gives the optimum pH for the pancreatic enzymes.",
    "This is why trypsin, with an optimum pH of about 8, is not denatured by the acid arriving from the stomach."
   ],
   "real": [
    "The gall bladder concentrates bile by removing water from it, so one squeeze delivers a lot of bile when a fatty meal arrives.",
    "Bile salts do the emulsifying and hydrogencarbonate ions do the neutralising; neither is an enzyme.",
    "A person whose gall bladder has been removed can still digest fat, because bile drips continuously from the liver down the bile duct instead of arriving in one burst."
   ],
   "golden": "Bile is not an enzyme: it breaks fat droplets into smaller droplets, not fat molecules into smaller molecules."
  },
  "keywords": [
   {
    "term": "bile duct",
    "def": "The tube that carries bile from the gall bladder to the duodenum."
   },
   {
    "term": "emulsification",
    "def": "The breaking of large fat droplets (globules) into many smaller droplets, which increases the surface area for lipase."
   },
   {
    "term": "chyme",
    "def": "The acidic, part-digested liquid food that leaves the stomach and enters the duodenum."
   },
   {
    "term": "neutralise",
    "def": "To cancel out an acid using an alkali, raising the pH towards neutral or slightly alkaline."
   },
   {
    "term": "duodenum",
    "def": "The first part of the small intestine, where bile and pancreatic juice are added to the food."
   }
  ],
  "photoHint": "A close photograph of a fresh gall bladder, green and pear-shaped, attached to the underside of a liver, with the bile duct running away from it.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the sentences about bile.",
    "text": "Bile is made in the {1} and stored in the gall bladder. It is released through the {2} duct into the {3}, the first part of the small intestine.",
    "answers": {
     "1": {
      "accept": [
       "liver",
       "the liver"
      ],
      "hint": "The largest organ in the abdomen"
     },
     "2": {
      "accept": [
       "bile",
       "the bile",
       "common bile",
       "gall"
      ],
      "hint": "The duct is named after the fluid it carries"
     },
     "3": {
      "accept": [
       "duodenum",
       "the duodenum",
       "duodenum (small intestine)"
      ],
      "hint": "Chyme from the stomach arrives here"
     }
    }
   },
   {
    "type": "mcq",
    "prompt": "What is the role of bile?",
    "options": [
     "An acidic fluid that activates pepsin",
     "An alkaline fluid that neutralises stomach acid and emulsifies fats",
     "An enzyme that digests lipids",
     "A hormone that stimulates peristalsis"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "Bile is alkaline, not acidic. It is the hydrochloric acid in gastric juice that gives pepsin its acidic optimum pH of about 2.",
     "1": "Correct. Those are bile's two roles: it neutralises the acidic chyme so the pancreatic enzymes have their optimum pH, and it emulsifies fats to increase the surface area for lipase.",
     "2": "Bile contains no enzymes at all. Lipase, from the pancreas, is the enzyme that digests lipids; bile only prepares the fat for it.",
     "3": "Bile is a digestive fluid, not a hormone. Peristalsis is the squeezing action of muscles that moves food along the canal."
    }
   },
   {
    "type": "sort",
    "prompt": "Bile does two jobs. Sort each statement into the job it describes.",
    "bins": [
     "Emulsification",
     "Neutralisation"
    ],
    "items": [
     {
      "text": "Breaks large fat droplets into many smaller droplets",
      "bin": 0
     },
     {
      "text": "Increases the surface area of the fat for lipase",
      "bin": 0
     },
     {
      "text": "A physical change: the fat molecules themselves are unchanged",
      "bin": 0
     },
     {
      "text": "Raises the pH of the acidic chyme from the stomach",
      "bin": 1
     },
     {
      "text": "Gives the pancreatic enzymes their optimum pH",
      "bin": 1
     },
     {
      "text": "Stops stomach acid damaging the lining of the small intestine",
      "bin": 1
     }
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each word to its description in the digestion of a fatty meal.",
    "tokens": [
     "bile",
     "surface area",
     "lipase",
     "fatty acids and glycerol"
    ],
    "slots": [
     {
      "label": "The fluid that emulsifies the fat",
      "accept": "bile"
     },
     {
      "label": "What emulsification increases",
      "accept": "surface area"
     },
     {
      "label": "The enzyme that then digests the fat droplets",
      "accept": "lipase"
     },
     {
      "label": "The products of fat digestion",
      "accept": "fatty acids and glycerol"
     }
    ],
    "distractors": [
     "amylase",
     "maltose"
    ]
   },
   {
    "type": "ph",
    "prompt": "Chyme has just arrived in the duodenum straight from the stomach. Set the pH to the optimum for pepsin, the enzyme that was working on it there.",
    "enzyme": "Pepsin",
    "optimum": 2,
    "tolerance": 1.0,
    "explain": "Hydrochloric acid keeps the stomach at about pH 1-2, the optimum for pepsin, so chyme enters the duodenum acidic. Alkaline bile and alkaline pancreatic juice neutralise it, raising the pH to about 8. Without that, trypsin and pancreatic lipase would be denatured."
   },
   {
    "type": "order",
    "prompt": "Put the journey of bile in the correct order.",
    "items": [
     "Bile is made in the liver",
     "Bile is stored in the gall bladder",
     "A fatty meal leaves the stomach and enters the duodenum",
     "The gall bladder contracts and bile passes down the bile duct",
     "Bile neutralises the acid and emulsifies the fat into small droplets",
     "Lipase breaks the fat down into fatty acids and glycerol"
    ]
   },
   {
    "type": "mcq",
    "prompt": "A gallstone blocks a patient's bile duct. Which effect is most likely?",
    "options": [
     "Starch is no longer digested",
     "Fat is digested more slowly because it is not emulsified",
     "Protein is no longer digested in the stomach",
     "Food can no longer be swallowed"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "Starch is digested by amylase from the salivary glands and the pancreas. Bile has no role in starch digestion.",
     "1": "Correct. With no bile reaching the duodenum, the fat stays in large globules, so the surface area for lipase is small and fat digestion is slower and less complete; more fat is lost in the faeces.",
     "2": "Protein digestion in the stomach uses pepsin and hydrochloric acid in gastric juice. Bile never enters the stomach, so this is unaffected.",
     "3": "Swallowing uses the tongue and peristalsis in the oesophagus, both far upstream of the bile duct."
    }
   }
  ]
 },
 {
  "id": "pancreas",
  "name": "Pancreas",
  "subtitle": "Sends alkaline pancreatic juice and three enzymes to the duodenum",
  "processes": [
   "digestion"
  ],
  "learn": {
   "exam": [
    "The pancreas is an associated (accessory) organ: it is not part of the alimentary canal and food never passes through it.",
    "The pancreas secretes pancreatic juice into the duodenum through a duct.",
    "Pancreatic juice contains amylase, a protease (trypsin) and lipase.",
    "Amylase breaks down starch to maltose, trypsin breaks down protein and polypeptides to amino acids, and lipase breaks down fats and oils to fatty acids and glycerol.",
    "Pancreatic juice is alkaline, so together with bile it neutralises the acidic chyme and gives these enzymes the neutral to slightly alkaline pH they need (about pH 7-8; trypsin's optimum is about 8).",
    "The pancreas does not make pepsin; pepsin is made in the stomach and only works there."
   ],
   "real": [
    "The pancreas also makes the hormones insulin and glucagon, but these go straight into the blood, not into the gut.",
    "Trypsin is secreted in an inactive form and is only switched on once it is inside the duodenum, which stops it digesting the pancreas itself.",
    "The alkalinity of pancreatic juice comes from hydrogencarbonate ions secreted by the cells lining its ducts."
   ],
   "golden": "The pancreas makes trypsin, not pepsin, and pepsin only ever works in the stomach."
  },
  "keywords": [
   {
    "term": "pancreatic juice",
    "def": "The alkaline fluid the pancreas secretes into the duodenum, containing amylase, protease (trypsin) and lipase."
   },
   {
    "term": "trypsin",
    "def": "A protease from the pancreas that breaks protein and polypeptides down to amino acids in the small intestine; optimum pH about 8."
   },
   {
    "term": "lipase",
    "def": "An enzyme that breaks fats and oils down into fatty acids and glycerol."
   },
   {
    "term": "amylase",
    "def": "An enzyme that breaks starch down into maltose."
   },
   {
    "term": "optimum pH",
    "def": "The pH at which an enzyme works fastest; away from it the rate falls, and at an extreme pH the enzyme is denatured and stops working."
   }
  ],
  "photoHint": "An anatomical photograph of the pale, elongated pancreas lying behind the stomach, with its duct running towards the duodenum where it meets the bile duct.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the sentences about the pancreas.",
    "text": "The pancreas makes {1} juice and secretes it into the {2}. The juice is {3}, and it contains the enzymes amylase, {4} and lipase.",
    "answers": {
     "1": {
      "accept": [
       "pancreatic",
       "the pancreatic"
      ],
      "hint": "Named after the organ that makes it"
     },
     "2": {
      "accept": [
       "duodenum",
       "the duodenum",
       "small intestine",
       "the small intestine",
       "duodenum (small intestine)"
      ],
      "hint": "The first part of the small intestine"
     },
     "3": {
      "accept": [
       "alkaline",
       "slightly alkaline",
       "alkali",
       "an alkali",
       "basic",
       "slightly basic"
      ],
      "hint": "The opposite of acidic; it helps neutralise the chyme"
     },
     "4": {
      "accept": [
       "trypsin",
       "protease",
       "proteases",
       "a protease",
       "the protease",
       "trypsin (a protease)",
       "protease (trypsin)"
      ],
      "hint": "The protease that works in alkaline conditions"
     }
    }
   },
   {
    "type": "match",
    "prompt": "Match each pancreatic enzyme to the reaction it catalyses.",
    "left": [
     "Amylase",
     "Trypsin",
     "Lipase"
    ],
    "right": [
     "Fats and oils to fatty acids and glycerol",
     "Starch to maltose",
     "Protein and polypeptides to amino acids"
    ],
    "pairs": [
     [
      0,
      1
     ],
     [
      1,
      2
     ],
     [
      2,
      0
     ]
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each organ to the enzyme it secretes.",
    "tokens": [
     "salivary glands",
     "stomach",
     "pancreas"
    ],
    "slots": [
     {
      "label": "Salivary amylase",
      "accept": "salivary glands"
     },
     {
      "label": "Pepsin",
      "accept": "stomach"
     },
     {
      "label": "Trypsin",
      "accept": "pancreas"
     }
    ],
    "distractors": [
     "liver",
     "gall bladder"
    ]
   },
   {
    "type": "mcq",
    "prompt": "The alimentary canal is the tube running from the mouth to the anus. Which two of these are associated (accessory) organs and NOT part of that tube? Choose two.",
    "options": [
     "Pancreas",
     "Stomach",
     "Colon",
     "Salivary glands"
    ],
    "correct": [
     0,
     3
    ],
    "why": {
     "0": "Correct. The pancreas sits outside the canal and pours pancreatic juice into the duodenum through a duct; food never passes through it.",
     "1": "The stomach is part of the alimentary canal. Food enters it, is churned, and is mixed with gastric juice.",
     "2": "The colon is part of the alimentary canal. It is the main part of the large intestine and it absorbs water from the undigested material.",
     "3": "Correct. The salivary glands make saliva and pour it into the mouth through ducts, but food never travels through the glands themselves."
    }
   },
   {
    "type": "ph",
    "prompt": "Set the pH to the optimum for trypsin.",
    "enzyme": "Trypsin",
    "optimum": 8,
    "tolerance": 1.0,
    "explain": "Trypsin is the protease in pancreatic juice and works best at about pH 8. The chyme arriving from the stomach is at about pH 2, so alkaline bile and alkaline pancreatic juice neutralise it first; at stomach pH trypsin would be denatured."
   },
   {
    "type": "order",
    "prompt": "Put these events in order for a protein-rich meal, from the mouth to the blood.",
    "items": [
     "Teeth cut and grind the meat, increasing its surface area",
     "Pepsin in the stomach breaks the protein down into polypeptides",
     "The acidic chyme passes into the duodenum",
     "Alkaline bile and pancreatic juice neutralise the acid",
     "Trypsin breaks the polypeptides down into amino acids",
     "The amino acids are absorbed into the capillaries of the villi"
    ]
   },
   {
    "type": "mcq",
    "prompt": "Explain why trypsin can work in the small intestine even though the food arriving there has come from an acidic stomach.",
    "options": [
     "Trypsin has a very low optimum pH, like pepsin",
     "Alkaline bile and alkaline pancreatic juice neutralise the acid, giving trypsin its optimum pH of about 8",
     "Bile is an enzyme that protects trypsin from the acid",
     "The stomach acid is absorbed into the blood before the food leaves the stomach"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "This is the wrong way round. Pepsin has the low optimum, about pH 2; trypsin's optimum is about pH 8.",
     "1": "Correct. Bile from the gall bladder and pancreatic juice from the pancreas are both alkaline, so they raise the pH of the chyme to about 8, the optimum for trypsin and pancreatic lipase.",
     "2": "Bile contains no enzymes. It works by emulsifying fat and by neutralising acid, and the neutralising is what protects trypsin here.",
     "3": "Hydrochloric acid is not absorbed in the stomach. The chyme leaves the stomach still acidic at about pH 2 and is neutralised in the duodenum."
    }
   }
  ]
 },
 {
  "id": "duodenum",
  "name": "Duodenum",
  "subtitle": "Where bile and pancreatic juice meet the acidic chyme",
  "processes": [
   "digestion"
  ],
  "learn": {
   "exam": [
    "The duodenum is the first part of the small intestine; acidic chyme from the stomach enters its lumen, the space inside the tube.",
    "Bile is made in the liver, stored in the gall bladder and released into the duodenum.",
    "The pancreas, liver and gall bladder are associated (accessory) organs: they make secretions and add them to the duodenum, but they are not part of the alimentary canal itself.",
    "Bile emulsifies fats: it breaks large fat droplets into many small ones, which increases the surface area for lipase to work on.",
    "Bile is alkaline, so it neutralises the acid from the stomach and gives the optimum pH for the pancreatic enzymes.",
    "Pancreatic juice contains amylase (starch to maltose), trypsin (protein to amino acids) and lipase (fats to fatty acids and glycerol); maltase, on the membranes of the epithelium, then breaks maltose down to glucose.",
    "By the time chyme leaves the duodenum, the chemical digestion of carbohydrates, proteins and fats is complete, ready for absorption in the jejunum and ileum."
   ],
   "real": [
    "Pancreatic juice also contains hydrogencarbonate ions, and these do most of the actual neutralising; bile helps, but it is not working alone.",
    "Trypsin is secreted from the pancreas in an inactive form and is only switched on once it reaches the duodenum, so the pancreas does not digest itself.",
    "A little absorption does begin in the duodenum, mainly of iron and calcium, but most nutrients are absorbed further along in the jejunum and ileum.",
    "Strictly, trypsin cuts proteins into shorter polypeptides and peptidases on the epithelium finish the job into amino acids; at IGCSE 'protein to amino acids' is the accepted answer."
   ],
   "golden": "Bile is not an enzyme: bile changes fat physically by emulsifying it, and only lipase changes fat chemically into fatty acids and glycerol."
  },
  "keywords": [
   {
    "term": "lumen",
    "def": "The lumen is the space inside a tube such as the small intestine, where the food and the digestive juices mix."
   },
   {
    "term": "duodenum",
    "def": "The duodenum is the first part of the small intestine, where bile and pancreatic juice are added to the chyme."
   },
   {
    "term": "chyme",
    "def": "Chyme is the acidic, partly digested, soupy mixture of food that leaves the stomach."
   },
   {
    "term": "bile",
    "def": "Bile is an alkaline liquid made in the liver and stored in the gall bladder; it emulsifies fats and neutralises stomach acid."
   },
   {
    "term": "emulsification",
    "def": "Emulsification is the breaking of large fat droplets into many small droplets, which increases the surface area for lipase."
   },
   {
    "term": "neutralisation",
    "def": "Neutralisation is the raising of the pH of the acidic chyme by alkaline bile and pancreatic juice, so the pancreatic enzymes are not denatured."
   },
   {
    "term": "pancreatic juice",
    "def": "Pancreatic juice is the fluid the pancreas secretes into the duodenum; it contains amylase, protease (trypsin) and lipase."
   },
   {
    "term": "trypsin",
    "def": "Trypsin is a protease made in the pancreas that breaks proteins down into amino acids in the alkaline conditions of the small intestine."
   },
   {
    "term": "maltase",
    "def": "Maltase is an enzyme on the membranes of the epithelium of the small intestine that breaks maltose down into glucose."
   }
  ],
  "photoHint": "An endoscopic or dissection photograph looking along the lumen of the duodenum, with the opening of the bile and pancreatic ducts visible in the wall.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the account of what happens when food arrives in the small intestine.",
    "text": "Chyme from the stomach enters the {1}, the first part of the small intestine. Digestive juices containing amylase, protease and lipase are added from the {2}, and bile arrives from the {3}. Bile {4} lipids and {5} the stomach acid.",
    "answers": {
     "1": {
      "accept": [
       "duodenum",
       "the duodenum"
      ],
      "hint": "first part of the small intestine"
     },
     "2": {
      "accept": [
       "pancreas",
       "the pancreas",
       "pancreas gland",
       "the pancreas gland"
      ],
      "hint": "an associated organ that makes three enzymes at once"
     },
     "3": {
      "accept": [
       "gall bladder",
       "gallbladder",
       "gall-bladder",
       "the gall bladder",
       "the gallbladder",
       "the gall-bladder",
       "gall bladder (via the bile duct)",
       "bile duct",
       "the bile duct"
      ],
      "hint": "bile is made in the liver but stored here"
     },
     "4": {
      "accept": [
       "emulsifies",
       "emulsify",
       "emulsifies them",
       "emulsifies the",
       "emulsifies the lipids",
       "emulsifies the fats",
       "physically breaks up",
       "breaks up",
       "breaks up the"
      ],
      "hint": "breaks large fat droplets into many small ones - a physical change, not a chemical one"
     },
     "5": {
      "accept": [
       "neutralises",
       "neutralise",
       "neutralizes",
       "neutralize",
       "neutralises it",
       "neutralises the",
       "neutralises the stomach acid",
       "neutralising",
       "neutralizing"
      ],
      "hint": "raises the pH back to about 7"
     }
    }
   },
   {
    "type": "mcq",
    "prompt": "What is meant by the lumen of the small intestine?",
    "options": [
     "The muscular wall that squeezes food along by peristalsis",
     "The space inside the tube, where food and digestive juices mix",
     "The single layer of cells lining the wall, through which nutrients are absorbed",
     "The blood vessel that carries absorbed nutrients to the liver"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "That is the muscle layer of the gut wall. It surrounds the lumen but is not the lumen itself.",
     "1": "Correct. Lumen simply means the space inside a tube. Digestion happens in the lumen; absorption happens through the wall around it.",
     "2": "That is the epithelium. It lines the lumen, but the lumen is the space, not the lining.",
     "3": "That is the hepatic portal vein. It is outside the gut wall altogether."
    }
   },
   {
    "type": "drag",
    "prompt": "Drag each substance to the place where it is made.",
    "tokens": [
     "bile",
     "trypsin",
     "hydrochloric acid",
     "maltase"
    ],
    "slots": [
     {
      "label": "Liver",
      "accept": "bile"
     },
     {
      "label": "Pancreas",
      "accept": "trypsin"
     },
     {
      "label": "Stomach",
      "accept": "hydrochloric acid"
     },
     {
      "label": "Membranes of the epithelium of the small intestine",
      "accept": "maltase"
     }
    ],
    "distractors": [
     "salivary amylase"
    ]
   },
   {
    "type": "sort",
    "prompt": "Fat in the duodenum is changed in two different ways. Sort each statement into the correct column.",
    "bins": [
     "Bile: a physical change",
     "Lipase: a chemical change"
    ],
    "items": [
     {
      "text": "Large fat droplets are broken into many small droplets",
      "bin": 0
     },
     {
      "text": "The surface area of the fat is increased",
      "bin": 0
     },
     {
      "text": "The fat molecules themselves are not changed",
      "bin": 0
     },
     {
      "text": "Fat is broken down into fatty acids and glycerol",
      "bin": 1
     },
     {
      "text": "Bonds inside the fat molecule are broken",
      "bin": 1
     },
     {
      "text": "An enzyme catalyses the reaction",
      "bin": 1
     }
    ]
   },
   {
    "type": "order",
    "prompt": "Put these events in the order they happen to a fatty meal arriving in the duodenum.",
    "items": [
     "Acidic chyme leaves the stomach and enters the lumen of the duodenum",
     "Alkaline bile and pancreatic juice are released into the duodenum",
     "The stomach acid is neutralised, giving the optimum pH for the pancreatic enzymes",
     "Bile emulsifies the fat into many small droplets, increasing the surface area",
     "Lipase breaks the fat down into fatty acids and glycerol",
     "The fatty acids and glycerol are absorbed into a lacteal further along the small intestine"
    ]
   },
   {
    "type": "ph",
    "prompt": "Set the pH to the optimum for trypsin, the protease in pancreatic juice.",
    "enzyme": "Trypsin",
    "optimum": 8,
    "tolerance": 1.0,
    "explain": "Trypsin works in the small intestine, where alkaline bile and pancreatic juice have neutralised the stomach acid, so the contents are around neutral to slightly alkaline and trypsin's optimum pH is about 8. At the stomach pH of 2 trypsin would be denatured, which is exactly why the acid must be neutralised before trypsin can do its job."
   },
   {
    "type": "mcq",
    "prompt": "A person's bile duct is blocked by a gallstone, so no bile reaches the duodenum. What effect would you expect on the digestion of a fatty meal?",
    "options": [
     "No fat is digested at all, because bile is the enzyme that breaks fat down",
     "Fat is digested more slowly, because it is not emulsified so lipase has a smaller surface area to work on",
     "Fat is digested faster, because lipase can reach the large droplets more easily",
     "Fat digestion is unaffected, because lipase works just as fast on large droplets as on small ones"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "Bile is not an enzyme, so it cannot digest anything. Lipase is still secreted by the pancreas, so some fat is still digested, just far more slowly.",
     "1": "Correct. Without emulsification the fat stays as a few large droplets, so there is much less surface area for lipase to act on and the rate of digestion falls.",
     "2": "Large droplets have a smaller total surface area than the same volume of fat split into many small droplets, so lipase can reach less of it, not more.",
     "3": "Enzymes can only act on the surface of a droplet. Smaller droplets give a larger total surface area, so emulsified fat is digested much faster."
    }
   }
  ]
 },
 {
  "id": "ileum-villi",
  "name": "Small intestine",
  "subtitle": "Villi and microvilli absorb small food molecules into the blood",
  "processes": [
   "digestion",
   "absorption"
  ],
  "learn": {
   "exam": [
    "Absorption is the movement of small food molecules through the wall of the intestine into the blood.",
    "Most nutrients, and most of the water, are absorbed in the small intestine, mainly in the jejunum and ileum.",
    "Circular folds, villi and microvilli increase the surface area by up to 600 times compared with a flat surface, giving far more sites for absorption.",
    "The wall of a villus is one cell thick, so the diffusion distance is short, and the dense network of capillaries carries absorbed molecules away, keeping the concentration gradient steep.",
    "Glucose and amino acids are absorbed into the capillaries and carried in the hepatic portal vein to the liver; fatty acids and glycerol are absorbed into the lacteal and travel in the lymph before joining the blood.",
    "Molecules are absorbed by diffusion when the concentration gradient allows it, and by active transport when they must move against the gradient; active transport needs energy from respiration, so the epithelial cells contain many mitochondria."
   ],
   "real": [
    "Textbooks quote an absorbing surface of roughly 250 square metres, about the area of a tennis court; careful modern measurements put it nearer 30 square metres. Either way it is vastly more than a smooth tube of the same length would give.",
    "Inside the epithelial cells the fatty acids and glycerol are rebuilt into fats and packaged into droplets called chylomicrons, which are too large to squeeze into a capillary, which is why they enter the lacteal instead.",
    "The jejunum absorbs most of the nutrients; the ileum is where vitamin B12 and bile salts are absorbed, and the bile salts are recycled back to the liver."
   ],
   "golden": "Most water is absorbed in the small intestine, not the large intestine; the colon only takes back the water that is left."
  },
  "keywords": [
   {
    "term": "absorption",
    "def": "Absorption is the movement of small food molecules through the wall of the intestine into the blood."
   },
   {
    "term": "villus",
    "def": "A villus is a finger-like projection of the lining of the small intestine that increases the surface area for absorption (plural: villi)."
   },
   {
    "term": "microvilli",
    "def": "Microvilli are tiny folds of the cell membrane on each epithelial cell, which increase the surface area still further."
   },
   {
    "term": "circular folds",
    "def": "Circular folds are ridges running round the inside of the small intestine that roughly triple the surface area compared with a flat tube."
   },
   {
    "term": "epithelium",
    "def": "The epithelium is the single layer of cells lining the small intestine, through which food molecules are absorbed."
   },
   {
    "term": "lacteal",
    "def": "A lacteal is the lymph vessel in the centre of a villus that absorbs fatty acids and glycerol."
   },
   {
    "term": "capillary",
    "def": "A capillary is the smallest type of blood vessel; the network in each villus absorbs glucose and amino acids and carries them away."
   },
   {
    "term": "hepatic portal vein",
    "def": "The hepatic portal vein carries absorbed nutrients from the small intestine to the liver."
   },
   {
    "term": "active transport",
    "def": "Active transport is the movement of molecules across a membrane against the concentration gradient, using energy from respiration."
   },
   {
    "term": "ileum",
    "def": "The ileum is the last part of the small intestine, where the absorption of the remaining nutrients is completed."
   }
  ],
  "photoHint": "A light-microscope section through the small intestine showing finger-like villi, with the single-cell-thick epithelium, the central lacteal and the capillary network visible inside one villus.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the definition and the two adaptations that come with it.",
    "text": "Absorption is the movement of small food molecules through the {1} of the intestine into the {2}. The lining is covered with finger-like projections called {3}, and each epithelial cell has tiny folds called {4}, which increase the surface area even more.",
    "answers": {
     "1": {
      "accept": [
       "wall",
       "the wall",
       "walls",
       "the walls",
       "intestine wall",
       "intestinal wall",
       "gut wall",
       "wall of the intestine",
       "lining",
       "the lining",
       "epithelium",
       "the epithelium"
      ],
      "hint": "the layer the molecules pass through"
     },
     "2": {
      "accept": [
       "blood",
       "the blood",
       "bloodstream",
       "blood stream",
       "the bloodstream",
       "the blood stream",
       "blood and lymph",
       "blood or lymph",
       "blood (or lymph)",
       "capillaries",
       "the capillaries"
      ],
      "hint": "the liquid the molecules end up in - the mark scheme wants this, not 'the body'"
     },
     "3": {
      "accept": [
       "villi",
       "the villi",
       "villus",
       "villi (singular villus)"
      ],
      "hint": "the singular is villus"
     },
     "4": {
      "accept": [
       "microvilli",
       "the microvilli",
       "micro-villi",
       "micro villi",
       "microvillus"
      ],
      "hint": "micro- means very small"
     }
    }
   },
   {
    "type": "mcq",
    "prompt": "Where is most of the water in food and drink absorbed?",
    "options": [
     "Stomach",
     "Small intestine",
     "Colon",
     "Rectum"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "The stomach churns food and mixes it with gastric juice. It absorbs almost nothing.",
     "1": "Correct. Most water is absorbed in the small intestine, alongside the nutrients. This is the classic exam trap on this topic.",
     "2": "The colon does absorb water, but only the water that is left over after the small intestine has finished. That is what makes the waste more solid.",
     "3": "The rectum stores faeces until egestion. It is not an absorbing region."
    }
   },
   {
    "type": "match",
    "prompt": "Match each enzyme to the reaction it catalyses.",
    "left": [
     "Amylase",
     "Maltase",
     "Trypsin",
     "Lipase",
     "Pepsin"
    ],
    "right": [
     "Starch to maltose",
     "Maltose to glucose",
     "Protein to amino acids, in alkaline conditions",
     "Fats to fatty acids and glycerol",
     "Protein to short polypeptides, in acidic conditions"
    ],
    "pairs": [
     [
      0,
      0
     ],
     [
      1,
      1
     ],
     [
      2,
      2
     ],
     [
      3,
      3
     ],
     [
      4,
      4
     ]
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each adaptation of the villus to the reason it makes absorption faster.",
    "tokens": [
     "villi and microvilli",
     "wall only one cell thick",
     "dense network of capillaries",
     "lacteal in the centre"
    ],
    "slots": [
     {
      "label": "Gives a large surface area for absorption",
      "accept": "villi and microvilli"
     },
     {
      "label": "Gives a short diffusion distance",
      "accept": "wall only one cell thick"
     },
     {
      "label": "Carries molecules away, keeping the concentration gradient steep",
      "accept": "dense network of capillaries"
     },
     {
      "label": "Takes away the fatty acids and glycerol",
      "accept": "lacteal in the centre"
     }
    ],
    "distractors": [
     "thick muscular wall"
    ]
   },
   {
    "type": "sort",
    "prompt": "Sort each absorbed substance into the vessel it enters inside the villus.",
    "bins": [
     "Capillary (blood)",
     "Lacteal (lymph)"
    ],
    "items": [
     {
      "text": "Glucose",
      "bin": 0
     },
     {
      "text": "Amino acids",
      "bin": 0
     },
     {
      "text": "Iron and other mineral ions",
      "bin": 0
     },
     {
      "text": "Vitamin C",
      "bin": 0
     },
     {
      "text": "Fatty acids",
      "bin": 1
     },
     {
      "text": "Glycerol",
      "bin": 1
     }
    ]
   },
   {
    "type": "order",
    "prompt": "Put the journey of a glucose molecule in order, from the starch in a slice of bread to a liver cell.",
    "items": [
     "Amylase in saliva and in pancreatic juice breaks the starch down into maltose",
     "Maltase on the membranes of the epithelium breaks the maltose down into glucose",
     "The glucose is absorbed through the epithelium of a villus by diffusion and by active transport",
     "The glucose enters one of the capillaries inside the villus",
     "The blood carries the glucose along the hepatic portal vein",
     "The glucose reaches the liver, where it is used in respiration or stored as glycogen"
    ]
   },
   {
    "type": "blank",
    "prompt": "Coeliac disease is an immune reaction to gluten that damages and flattens the villi of the small intestine. Complete the exam answer.",
    "text": "Flattened villi give a much smaller {1} area, so fewer food molecules can be absorbed. The diffusion distance is also longer where the lining is damaged. Less {2} reaches the blood, so less energy is released in respiration and the person feels tired and loses {3}. Water and undigested food stay in the lumen, which causes {4}.",
    "answers": {
     "1": {
      "accept": [
       "surface",
       "surface area",
       "the surface",
       "absorbing surface",
       "absorbing"
      ],
      "hint": "the villi exist to increase this"
     },
     "2": {
      "accept": [
       "glucose",
       "sugar",
       "sugars",
       "the glucose",
       "glucose and amino acids",
       "glucose and other nutrients",
       "food",
       "nutrients"
      ],
      "hint": "the sugar used in respiration"
     },
     "3": {
      "accept": [
       "weight",
       "mass",
       "body mass",
       "body weight",
       "their weight",
       "weight/mass"
      ],
      "hint": "what falls when you absorb less energy than you use"
     },
     "4": {
      "accept": [
       "diarrhoea",
       "diarrhea",
       "loose faeces",
       "watery faeces",
       "loose stools",
       "watery stools",
       "loose, watery faeces",
       "diarrhoea (loose faeces)"
      ],
      "hint": "loose, watery faeces; British spelling has two vowels after the r"
     }
    }
   }
  ]
 },
 {
  "id": "colon",
  "name": "Large intestine",
  "subtitle": "Reabsorbs water and mineral salts, making the waste solid",
  "processes": [
   "absorption"
  ],
  "learn": {
   "exam": [
    "The colon is the main part of the large intestine, and the undigested material that reaches it has already had its nutrients absorbed in the small intestine.",
    "The colon reabsorbs water and mineral salts from this undigested material into the blood.",
    "Removing the water makes the remaining material more solid, and this solid waste is faeces.",
    "Most water is absorbed in the small intestine; the colon only absorbs the water that is left.",
    "No human digestive enzymes are secreted into the colon, so no chemical digestion of food by your own enzymes happens here.",
    "Fibre (roughage) is not digested and adds bulk that the gut muscles can grip, so peristalsis keeps the material moving and constipation is prevented."
   ],
   "real": [
    "Beyond the syllabus: billions of bacteria live in the colon, and they ferment some of the fibre that human enzymes cannot touch, releasing gases and making small amounts of vitamin K and some B vitamins.",
    "Humans have no cellulase, the enzyme that breaks down cellulose, which is why plant cell walls pass straight through us; herbivores such as cows rely on microorganisms in their gut to do that job for them.",
    "The large intestine is not only the colon: it begins at the caecum and appendix and ends at the rectum, so 'colon' names the long middle section."
   ],
   "golden": "The colon absorbs water and mineral salts, never nutrients: digestion and nutrient absorption were already finished in the small intestine, and most of the water was absorbed there too."
  },
  "keywords": [
   {
    "term": "colon",
    "def": "The main part of the large intestine, which reabsorbs water and mineral salts from undigested material."
   },
   {
    "term": "faeces",
    "def": "The solid waste made mainly of undigested food and water, formed in the colon and stored in the rectum."
   },
   {
    "term": "fibre (roughage)",
    "def": "Indigestible plant material that adds bulk to food in the gut, helping peristalsis move it along."
   },
   {
    "term": "cellulose",
    "def": "The carbohydrate that makes up plant cell walls, which humans cannot digest because they have no enzyme for it."
   },
   {
    "term": "reabsorption",
    "def": "Taking a substance such as water back into the blood through the wall of the alimentary canal."
   },
   {
    "term": "constipation",
    "def": "Hard, difficult-to-pass faeces, caused when material moves slowly through the colon and too much water is reabsorbed."
   }
  ],
  "photoHint": "A colonoscopy photograph of a healthy transverse colon showing the triangular haustral folds and the moist, pink mucosa lining the tube.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the sentences about the last stage of the alimentary canal.",
    "text": "In the large intestine ({1}), {2} is reabsorbed, leaving undigested material. This forms solid waste called {3}, which is stored in the {4}.",
    "answers": {
     "1": {
      "accept": [
       "colon",
       "the colon"
      ],
      "hint": "the long middle section of the large intestine"
     },
     "2": {
      "accept": [
       "water",
       "the water",
       "water and mineral salts",
       "water and mineral ions",
       "water and minerals",
       "water and salts"
      ],
      "hint": "mineral salts are taken back too, but this is the main substance removed"
     },
     "3": {
      "accept": [
       "faeces",
       "faecal matter",
       "faecal material",
       "faeces (stool)",
       "feces",
       "fecal matter",
       "fecal material",
       "stool",
       "stools"
      ],
      "hint": "British spelling, starts with 'f'"
     },
     "4": {
      "accept": [
       "rectum",
       "the rectum"
      ],
      "hint": "the storage section just before the anus"
     }
    }
   },
   {
    "type": "mcq",
    "prompt": "Where is most of the water absorbed in a human?",
    "options": [
     "Stomach",
     "Small intestine",
     "Colon",
     "Rectum"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "The stomach churns food and mixes it with gastric juice, but it is not an absorbing organ for water.",
     "1": "Correct. Most water is absorbed in the small intestine; the colon only reabsorbs the water that is left in the undigested material.",
     "2": "A very common wrong answer. The colon does reabsorb water, but only the water that is left, because the small intestine has already absorbed most of it.",
     "3": "The rectum stores faeces. It is not the main site of water absorption."
    }
   },
   {
    "type": "drag",
    "prompt": "Drag each job onto the correct part of the large intestine.",
    "tokens": [
     "reabsorbs water and mineral salts",
     "stores faeces",
     "opening where faeces leave the body"
    ],
    "slots": [
     {
      "label": "Colon",
      "accept": "reabsorbs water and mineral salts"
     },
     {
      "label": "Rectum",
      "accept": "stores faeces"
     },
     {
      "label": "Anus",
      "accept": "opening where faeces leave the body"
     }
    ],
    "distractors": [
     "produces bile",
     "secretes pepsin into the food",
     "absorbs glucose into the blood"
    ]
   },
   {
    "type": "blank",
    "prompt": "Complete the sentences about fibre.",
    "text": "Fibre is also called {1}. Humans cannot digest it because we have no enzyme that breaks down {2}, the carbohydrate in plant cell walls. Fibre adds {3} to the material in the gut, so {4} can move it along, and this helps prevent constipation.",
    "answers": {
     "1": {
      "accept": [
       "roughage"
      ],
      "hint": "the older name for fibre used in the lesson slides, starts with 'r'"
     },
     "2": {
      "accept": [
       "cellulose"
      ],
      "hint": "the tough carbohydrate that makes plant cell walls"
     },
     "3": {
      "accept": [
       "bulk",
       "volume",
       "bulk and volume",
       "extra bulk"
      ],
      "hint": "it gives the gut muscles something to grip"
     },
     "4": {
      "accept": [
       "peristalsis",
       "peristaltic waves",
       "peristalsis waves",
       "waves of peristalsis",
       "muscles",
       "the muscles",
       "gut muscles",
       "the gut muscles",
       "muscle contractions"
      ],
      "hint": "the squeezing action of muscles that moves food along"
     }
    }
   },
   {
    "type": "order",
    "prompt": "Put the journey of a piece of indigestible fibre in the correct order, starting as it leaves the small intestine.",
    "items": [
     "Undigested material leaves the ileum and passes into the colon",
     "Water and mineral salts are reabsorbed through the colon wall into the blood",
     "The remaining material becomes more solid and forms faeces",
     "Faeces are stored in the rectum",
     "Faeces are egested through the anus"
    ]
   },
   {
    "type": "sort",
    "prompt": "Sort each statement: is it true of the small intestine or of the colon?",
    "bins": [
     "Small intestine",
     "Colon"
    ],
    "items": [
     {
      "text": "Most of the water is absorbed here",
      "bin": 0
     },
     {
      "text": "Villi and microvilli absorb glucose and amino acids into the blood",
      "bin": 0
     },
     {
      "text": "Bile and pancreatic juice are added to the food here",
      "bin": 0
     },
     {
      "text": "Chemical digestion is completed here",
      "bin": 0
     },
     {
      "text": "The water that is left is reabsorbed here, along with mineral salts",
      "bin": 1
     },
     {
      "text": "No human enzymes act on the food here",
      "bin": 1
     },
     {
      "text": "Faeces are formed here",
      "bin": 1
     }
    ]
   },
   {
    "type": "mcq",
    "prompt": "A person has an infection and material passes through their colon much faster than normal. Their faeces are watery. Which statement explains this?",
    "options": [
     "The colon has secreted extra digestive enzymes, which have turned the faeces into liquid.",
     "There is less time for water to be reabsorbed through the colon wall into the blood.",
     "The small intestine has stopped absorbing water, so all of it reaches the colon.",
     "Fibre has been digested into soluble sugars, which draw water into the gut."
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "No human digestive enzymes are secreted into the colon, so this cannot be the reason.",
     "1": "Correct. The colon makes waste solid by reabsorbing water, and that takes time. Move the material through quickly and less water is reabsorbed, so the faeces stay watery.",
     "2": "The small intestine is still absorbing most of the water. The change here is the speed through the colon, not a failure in the small intestine.",
     "3": "Humans have no enzyme for cellulose, so fibre is never digested into sugars. That is exactly why it stays in the gut and adds bulk."
    }
   }
  ]
 },
 {
  "id": "rectum-anus",
  "name": "Rectum and anus",
  "subtitle": "Faeces stored, then egested, which is not excretion",
  "processes": [
   "egestion"
  ],
  "learn": {
   "exam": [
    "The rectum is the last part of the large intestine and it stores faeces until they are passed out of the body.",
    "The anus is the opening at the end of the alimentary canal, and egestion happens here.",
    "Egestion is the passing out of food that has not been digested, as faeces, through the anus.",
    "Egestion is not excretion: the material in faeces was never absorbed through the gut wall, so it never entered the body's cells and was never truly inside the body.",
    "Excretion is the removal of the waste products of chemical reactions inside cells, such as urea in urine from the kidneys and carbon dioxide from the lungs."
   ],
   "real": [
    "Beyond the syllabus: the act of egesting faeces is called defecation, and the release of urine is called urination, which is a form of excretion.",
    "Faeces are not only undigested food: they also contain water, bacteria from the colon and dead cells rubbed off the lining of the gut.",
    "One genuinely excretory substance does leave in the faeces, the brown bile pigments the liver makes when it breaks down old haemoglobin, so the neat split is a simplification, but 0610 still counts egestion and excretion as two separate processes."
   ],
   "golden": "Egestion removes material that never entered your cells, so it was never really in your body, while excretion removes waste made by chemical reactions inside your cells: faeces are egested, urea and carbon dioxide are excreted."
  },
  "keywords": [
   {
    "term": "egestion",
    "def": "The passing out of food that has not been digested, as faeces, through the anus."
   },
   {
    "term": "excretion",
    "def": "The removal of the waste products of chemical reactions inside cells, and of substances in excess of requirements, such as urea and carbon dioxide."
   },
   {
    "term": "rectum",
    "def": "The last part of the large intestine, where faeces are stored before they are egested."
   },
   {
    "term": "anus",
    "def": "The opening at the end of the alimentary canal through which faeces are egested."
   },
   {
    "term": "faeces",
    "def": "The solid waste, made mainly of undigested food and water, that is stored in the rectum and egested through the anus."
   },
   {
    "term": "urea",
    "def": "The waste product made in the liver from excess amino acids, removed from the blood by the kidneys and excreted in urine."
   },
   {
    "term": "defecation",
    "def": "The act of pushing faeces out through the anus; it is the word for egesting, and is not required by 0610."
   },
   {
    "term": "urination",
    "def": "The release of urine from the body, which is a form of excretion; not required by 0610."
   }
  ],
  "photoHint": "A labelled anatomical model or MRI section of the pelvis showing the sigmoid colon narrowing into the rectum and the ring of muscle around the anal canal.",
  "activities": [
   {
    "type": "blank",
    "prompt": "Complete the definition of the fifth digestive process.",
    "text": "{1} is the passing out of food that has not been {2}, as {3}, through the {4}.",
    "answers": {
     "1": {
      "accept": [
       "egestion"
      ],
      "hint": "the fifth of the five processes, after assimilation"
     },
     "2": {
      "accept": [
       "digested",
       "broken down",
       "digested or absorbed",
       "digested and absorbed"
      ],
      "hint": "broken down into small soluble molecules"
     },
     "3": {
      "accept": [
       "faeces",
       "faecal matter",
       "faecal material",
       "faeces (stool)",
       "feces",
       "fecal matter",
       "fecal material",
       "stool",
       "stools"
      ],
      "hint": "British spelling, starts with 'f'"
     },
     "4": {
      "accept": [
       "anus",
       "the anus"
      ],
      "hint": "the opening at the very end of the alimentary canal"
     }
    }
   },
   {
    "type": "mcq",
    "prompt": "Which part of the alimentary canal stores faeces?",
    "options": [
     "Colon",
     "Rectum",
     "Anus",
     "Ileum"
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "The colon reabsorbs water and mineral salts and forms the faeces, but it does not store them.",
     "1": "Correct. The rectum stores faeces until they pass out of the body.",
     "2": "The anus is the opening where egestion happens, not a store.",
     "3": "The ileum is part of the small intestine, where nutrients are absorbed by the villi."
    }
   },
   {
    "type": "match",
    "prompt": "Match each organ to its job.",
    "left": [
     "Colon",
     "Rectum",
     "Anus",
     "Kidney"
    ],
    "right": [
     "Reabsorbs water and mineral salts from undigested material",
     "Stores faeces until they are egested",
     "The opening through which faeces are egested",
     "Removes urea from the blood to make urine"
    ],
    "pairs": [
     [
      0,
      0
     ],
     [
      1,
      1
     ],
     [
      2,
      2
     ],
     [
      3,
      3
     ]
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each substance onto the route by which the body gets rid of it.",
    "tokens": [
     "urea",
     "carbon dioxide",
     "undigested fibre"
    ],
    "slots": [
     {
      "label": "Removed by the kidneys, leaves in urine",
      "accept": "urea"
     },
     {
      "label": "Removed by the lungs, breathed out",
      "accept": "carbon dioxide"
     },
     {
      "label": "Never absorbed at all, leaves through the anus in faeces",
      "accept": "undigested fibre"
     }
    ],
    "distractors": [
     "glucose",
     "amino acids"
    ]
   },
   {
    "type": "blank",
    "prompt": "Complete the comparison Daniel makes on the egestion slide of 7.2.",
    "text": "Egestion removes material that was never {1} into the blood, so it never entered the body's cells. Excretion removes the waste products of chemical reactions inside {2}, for example {3} in urine and {4} breathed out by the lungs.",
    "answers": {
     "1": {
      "accept": [
       "absorbed",
       "taken in",
       "taken",
       "taken up",
       "absorbed through the gut wall",
       "absorbed through the wall of the gut"
      ],
      "hint": "the third of the five digestive processes"
     },
     "2": {
      "accept": [
       "cells",
       "the cells",
       "body cells",
       "your cells",
       "the body's cells",
       "cells of the body"
      ],
      "hint": "the smallest units of the body, where metabolism happens"
     },
     "3": {
      "accept": [
       "urea"
      ],
      "hint": "made in the liver from excess amino acids"
     },
     "4": {
      "accept": [
       "carbon dioxide",
       "carbon-dioxide",
       "carbon dioxide gas",
       "co2",
       "co 2",
       "co₂"
      ],
      "hint": "the waste gas from respiration"
     }
    }
   },
   {
    "type": "sort",
    "prompt": "Sort each one: is the body egesting it or excreting it?",
    "bins": [
     "Egestion",
     "Excretion"
    ],
    "items": [
     {
      "text": "Faeces passing out through the anus",
      "bin": 0
     },
     {
      "text": "Urea, made in the liver and removed by the kidneys in urine",
      "bin": 1
     },
     {
      "text": "Carbon dioxide from respiration, breathed out by the lungs",
      "bin": 1
     },
     {
      "text": "Cellulose (fibre) that no human enzyme can digest",
      "bin": 0
     },
     {
      "text": "Excess water leaving the body in urine",
      "bin": 1
     },
     {
      "text": "Food that passed all the way through the gut without being absorbed",
      "bin": 0
     },
     {
      "text": "The tough skins of sweetcorn, which appear unchanged in faeces",
      "bin": 0
     }
    ]
   },
   {
    "type": "mcq",
    "prompt": "A student writes: 'Egestion is a type of excretion, because both remove waste from the body.' Which statement best explains why the student is wrong?",
    "options": [
     "Faeces are mostly water, and water is never a waste product.",
     "The material in faeces was never absorbed into the body's cells, so it is not the waste product of any reaction in the body.",
     "Excretion only happens in the kidneys, and faeces do not come from the kidneys.",
     "Egestion happens about once a day, while excretion happens all the time."
    ],
    "correct": [
     1
    ],
    "why": {
     "0": "Faeces do contain a lot of water, but that is not the point, and the body does excrete excess water in urine. The test is where the material came from, not what it is made of.",
     "1": "Correct. Egestion removes material that passed through the gut without ever crossing the gut wall, so it was never really in the body. Excretion removes waste made by chemical reactions inside cells.",
     "2": "Excretion is not only the kidneys: the lungs excrete carbon dioxide. The reason egestion is different is the origin of the material, not which organ removes it.",
     "3": "How often something happens does not decide which process it is. Urine and faeces are both released at intervals."
    }
   }
  ]
 },
 {
  "id": "molecules-lab",
  "name": "Molecules Lab",
  "subtitle": "The molecules, food tests and enzymes behind digestion",
  "processes": [
   "digestion",
   "absorption"
  ],
  "learn": {
   "exam": [
    "Starch, glycogen and cellulose are all polymers built from glucose; protein is a polymer built from amino acids, of which there are 20 different types; a lipid (triglyceride) is one molecule of glycerol joined to three fatty acids.",
    "Food tests: iodine solution turns blue-black with starch; Benedict's solution heated with a reducing sugar turns from blue through green, yellow and orange to brick red, the more sugar the further the colour goes; Biuret solution turns purple with protein; the ethanol emulsion test gives a cloudy white emulsion with fats and oils.",
    "Enzymes are biological catalysts made of protein: they speed up reactions and are not used up in the reaction.",
    "An enzyme is specific because the shape of its active site is complementary to the shape of only one substrate, so no other molecule fits.",
    "Raising the temperature increases the rate up to the optimum; above the optimum, or at a pH far from the optimum, the enzyme is denatured, meaning the active site changes shape permanently so the substrate no longer fits and the reaction stops.",
    "Small nutrient molecules cross the villus epithelium by diffusion and by active transport, while water is absorbed by osmosis; active transport uses energy from respiration and can move a nutrient against its concentration gradient."
   ],
   "real": [
    "Lock and key is a simplification: in the induced fit model the active site moulds slightly around the substrate as it binds, rather than being a rigid pre-cut shape.",
    "Denaturation breaks the weak bonds that hold the protein's folded shape, so the sequence of amino acids is unchanged; it is the three-dimensional shape that is lost, not the molecule itself.",
    "In the villus, glucose and amino acids are taken into the epithelial cells by active transport and then diffuse on into the capillary, while fatty acids and glycerol diffuse in and are rebuilt into fats and packaged before entering the lacteal."
   ],
   "golden": "An enzyme is not alive, so it can never be killed: heat and extreme pH denature it, which means the active site has permanently changed shape and the substrate no longer fits."
  },
  "keywords": [
   {
    "term": "polymer",
    "def": "A large molecule made of many small sub-units joined together in a chain."
   },
   {
    "term": "monomer",
    "def": "A small molecule that joins with others to build a polymer, for example glucose or an amino acid."
   },
   {
    "term": "triglyceride",
    "def": "A lipid made of one molecule of glycerol joined to three fatty acids."
   },
   {
    "term": "reducing sugar",
    "def": "A sugar such as glucose or maltose that gives a brick red colour when heated with Benedict's solution."
   },
   {
    "term": "catalyst",
    "def": "A substance that speeds up a chemical reaction without being changed or used up itself."
   },
   {
    "term": "substrate",
    "def": "The molecule that an enzyme acts on."
   },
   {
    "term": "active site",
    "def": "The part of an enzyme that the substrate fits into; its shape is complementary to only one substrate."
   },
   {
    "term": "denatured",
    "def": "Describes an enzyme whose active site has permanently changed shape, so the substrate no longer fits and the enzyme stops working."
   },
   {
    "term": "optimum pH",
    "def": "The pH at which an enzyme works at its fastest rate."
   },
   {
    "term": "diffusion",
    "def": "The net movement of particles from a region of higher concentration to a region of lower concentration, down a concentration gradient, as a result of random movement."
   },
   {
    "term": "osmosis",
    "def": "The net movement of water molecules from a dilute solution (higher water potential) to a concentrated solution (lower water potential), through a partially permeable membrane."
   },
   {
    "term": "active transport",
    "def": "The movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration, using energy released by respiration."
   }
  ],
  "photoHint": "Four test tubes photographed side by side against a white background showing the finished food-test colours: blue-black iodine, brick red Benedict's, purple Biuret and a cloudy white ethanol emulsion.",
  "activities": [
   {
    "type": "match",
    "prompt": "Match each food test to its positive result.",
    "left": [
     "Benedict's solution, heated",
     "Iodine solution",
     "Ethanol emulsion test",
     "Biuret solution"
    ],
    "right": [
     "Blue-black colour",
     "Brick red colour",
     "Purple colour",
     "Cloudy white emulsion"
    ],
    "pairs": [
     [
      0,
      1
     ],
     [
      1,
      0
     ],
     [
      2,
      3
     ],
     [
      3,
      2
     ]
    ]
   },
   {
    "type": "drag",
    "prompt": "Drag each molecule onto the description that fits it.",
    "tokens": [
     "Glucose",
     "Amino acids",
     "Glycerol and three fatty acids",
     "Maltose"
    ],
    "slots": [
     {
      "label": "The sub-unit that starch, glycogen and cellulose are all built from",
      "accept": "Glucose"
     },
     {
      "label": "The sub-units of a protein; there are 20 different types",
      "accept": "Amino acids"
     },
     {
      "label": "What one triglyceride is made of",
      "accept": "Glycerol and three fatty acids"
     },
     {
      "label": "The disaccharide that amylase makes from starch",
      "accept": "Maltose"
     }
    ],
    "distractors": [
     "Glycerol only",
     "Fatty acids only",
     "Cellulose"
    ]
   },
   {
    "type": "blank",
    "prompt": "Complete the account of how an enzyme works.",
    "text": "An enzyme is a {1} catalyst made of {2}. The substrate fits into the {3} site, which is {4} in shape to that substrate and to no other. Heating the enzyme far above its optimum temperature {5} it, so the substrate no longer fits.",
    "answers": {
     "1": {
      "accept": [
       "biological",
       "biologic",
       "biological (protein)"
      ],
      "hint": "made by living cells"
     },
     "2": {
      "accept": [
       "protein",
       "proteins",
       "a protein",
       "protein molecules",
       "amino acids",
       "amino acid chains"
      ],
      "hint": "which is exactly why heat and pH damage them"
     },
     "3": {
      "accept": [
       "active",
       "the active",
       "an active"
      ],
      "hint": "the pocket the substrate binds into"
     },
     "4": {
      "accept": [
       "complementary",
       "complementary in shape",
       "complementary shape",
       "the complementary",
       "exactly complementary",
       "complimentary"
      ],
      "hint": "starts with c: the two shapes fit each other exactly, like a key in a lock"
     },
     "5": {
      "accept": [
       "denatures",
       "denature",
       "denatured",
       "denatures it",
       "will denature",
       "has denatured",
       "denaturates",
       "de-natures"
      ],
      "hint": "the active site changes shape permanently"
     }
    }
   },
   {
    "type": "ph",
    "prompt": "Set the pH to the optimum for amylase.",
    "enzyme": "Amylase",
    "optimum": 7,
    "tolerance": 0.6,
    "explain": "Amylase acts in the mouth and in the duodenum, and both are close to neutral: salivary amylase is fastest near pH 6.8 and pancreatic amylase near pH 7.0, so pH 7 is the answer to give. In the stomach at pH 2 the salivary amylase is denatured, which is why starch digestion pauses there and only restarts in the duodenum."
   },
   {
    "type": "ph",
    "prompt": "Set the pH to the optimum for trypsin.",
    "enzyme": "Trypsin",
    "optimum": 8,
    "tolerance": 0.6,
    "explain": "Trypsin is a protease made by the pancreas and acting in the small intestine, where its optimum is about pH 8, slightly alkaline. Bile and pancreatic juice are both alkaline and together they neutralise the acidic chyme arriving from the stomach; without that neutralisation the pH would stay near 2 and trypsin would be denatured."
   },
   {
    "type": "sort",
    "prompt": "Sort each example by the transport process that moves the substance.",
    "bins": [
     "Diffusion",
     "Osmosis",
     "Active transport"
    ],
    "items": [
     {
      "text": "Fatty acids and glycerol entering an epithelial cell of the villus down their concentration gradient",
      "bin": 0
     },
     {
      "text": "Oxygen moving from a capillary into a villus cell that is respiring",
      "bin": 0
     },
     {
      "text": "Water moving from the gut contents into the blood through a partially permeable membrane",
      "bin": 1
     },
     {
      "text": "The last of the water leaving the contents of the colon and entering the blood",
      "bin": 1
     },
     {
      "text": "Glucose taken into an epithelial cell when the gut contains less glucose than the cell already holds",
      "bin": 2
     },
     {
      "text": "Amino acids absorbed using energy released by respiration",
      "bin": 2
     }
    ]
   },
   {
    "type": "mcq",
    "prompt": "A student mixes starch solution with saliva and keeps it at 37 °C and pH 2. After 30 minutes she adds iodine solution. Which result and explanation are both correct?",
    "options": [
     "Blue-black, because starch is still present: at pH 2 the amylase is denatured, so its active site no longer fits starch",
     "Blue-black, because iodine solution turns blue-black with maltose as well as with starch",
     "Orange-brown with no change, because the acid has broken the starch down instead of the enzyme",
     "Orange-brown with no change, because amylase works faster in acid, as it does in the stomach"
    ],
    "correct": [
     0
    ],
    "why": {
     "0": "Correct. Amylase has an optimum near pH 7; at pH 2 it is denatured, the active site has permanently changed shape, no maltose is made and the starch is still there to give the blue-black colour.",
     "1": "Wrong result for the wrong reason. Iodine solution is a test for starch only. Maltose is a reducing sugar, so you would detect it with Benedict's solution and heat, not with iodine.",
     "2": "Wrong. Dilute acid at 37 °C does not break starch down in half an hour, and if the starch had gone the reason would still not be the acid: only the enzyme is doing the digesting here.",
     "3": "Wrong. Amylase does not work in acid; it is the protease pepsin that has an acidic optimum of about pH 2. Salivary amylase is denatured once the bolus reaches the stomach."
    }
   }
  ]
 }
];
