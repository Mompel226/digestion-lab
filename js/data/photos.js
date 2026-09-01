/* Photographs, illustrations and animations from Dr Mompel's own Topic 7 slides.
   after : index of the exam bullet this illustrates — rendered inline there
   more  : true = tucked into the collapsed "More from the lesson" group
   maxw  : the widest this image may be drawn, in CSS pixels. It is half the
           file's own width, so on a 2x screen it is never upscaled. A small
           sharp picture beats a large soft one.
   t     : 'photo' -> assets/photos/<src>   ·   'video' -> assets/video/<src>.mp4 + .jpg
   See assets/photos/CREDITS.md for provenance. */
window.PHOTOS = {
 "overview": [],
 "mouth": [
  {
   "t": "photo",
   "src": "premolars-molars-real.jpg",
   "kind": "Photograph",
   "maxw": 640,
   "after": 3,
   "cap": "Looking along the tooth row — the view exam questions use. The bumps arrowed here are the <b>cusps</b>: the raised points on the biting surface that do the crushing. A premolar has <b>two</b>; a molar has <b>four</b>, though from this angle you can only see the two on the cheek side. Counting cusps is the reliable way to tell the two apart — root number is not, because it depends on which jaw the tooth is in.",
   "annot": [
    {
     "x": 25,
     "y": 66,
     "t": "cusps of a molar",
     "big": true,
     "to": [
      [
       54.5,
       27
      ],
      [
       61.5,
       20.5
      ]
     ]
    },
    {
     "x": 72,
     "y": 78,
     "t": "cusps of a premolar",
     "big": true,
     "to": [
      [
       72,
       26
      ],
      [
       78.5,
       30.5
      ]
     ]
    }
   ]
  },
  {
   "t": "pair",
   "kind": "Photograph and diagram",
   "after": 4,
   "cap": "The same tooth twice, so you can read one against the other. <b>Enamel</b> is the hardest substance in the body and protects the tooth; <b>dentine</b> lies beneath it and senses pain; the <b>pulp cavity</b> holds the blood vessels and nerves — which is why a deep cavity hurts; <b>cement</b> and the periodontal fibres anchor the root in the jaw bone.",
   "of": [
    {
     "photo": "tooth-cut-open.jpg",
     "label": "A real molar, cut in half",
     "maxw": 360,
     "w": 30
    },
    {
     "fig": "toothCompact",
     "label": "The same structures, drawn",
     "w": 70
    }
   ]
  },
  {
   "t": "pair",
   "kind": "Radiographs",
   "after": 4,
   "cap": "Roots, on X-ray. On the left, a whole jaw: the premolars towards the front carry <b>one</b> root and the molars at the back carry <b>two or three</b>. On the right, one lower molar close up, with its own labels — note it uses the American spelling <i>dentin</i>. Root number depends on which jaw the tooth is in, so it is a <b>poor way to tell tooth types apart</b>; count cusps instead.",
   "of": [
    {
     "photo": "jaw-model-xray.jpg",
     "label": "A jaw model held against the X-ray behind it",
     "maxw": 400,
     "w": 50
    },
    {
     "photo": "tooth-xray.jpg",
     "label": "One lower molar — two roots",
     "maxw": 378,
     "w": 50
    }
   ]
  },
  {
   "t": "photo",
   "src": "tooth-decay.jpg",
   "kind": "Photographs",
   "maxw": 750,
   "after": 5,
   "cap": "Tooth decay: healthy enamel, then caries, then a cavity reaching the pulp."
  },
  {
   "t": "photo",
   "src": "incisors-real.jpg",
   "kind": "Photograph",
   "maxw": 715,
   "more": true,
   "cap": "The incisors — flat and chisel-shaped, with a straight cutting edge."
  },
  {
   "t": "photo",
   "src": "canine-real.jpg",
   "kind": "Photograph",
   "maxw": 800,
   "more": true,
   "cap": "The canine — one pointed cusp, sitting just behind the incisors."
  }
 ],
 "salivary-glands": [
  {
   "t": "photo",
   "src": "salivary-glands.jpg",
   "kind": "Illustration",
   "cap": "The three pairs of salivary glands and the ducts that carry saliva into the mouth.",
   "after": 0,
   "maxw": 600
  }
 ],
 "oesophagus": [
  {
   "t": "video",
   "src": "peristalsis",
   "kind": "Animation",
   "cap": "And the same thing filmed inside a real body — the bolus is the yellow mass. Watch how the wall closes behind it.",
   "after": 2
  },
  {
   "t": "photo",
   "src": "peristalsis.jpg",
   "kind": "Illustration",
   "cap": "The same thing as an exam diagram: circular muscle contracts behind the bolus, relaxes in front.",
   "after": 1,
   "more": true,
   "maxw": 138
  }
 ],
 "stomach": [
  {
   "t": "pair",
   "kind": "Photographs",
   "after": 1,
   "cap": "The lining of the stomach, twice. On the left, the <b>rugae</b> — the deep folds that let the stomach stretch as it fills. On the right, the wall itself: three layers of muscle running in different directions, which is what lets it churn rather than merely squeeze, and the <b>gastric glands</b> sunk into the lining that secrete the gastric juice.",
   "of": [
    {
     "photo": "stomach-inside.jpg",
     "label": "The rugae — folds in the lining",
     "maxw": 800,
     "w": 50
    },
    {
     "photo": "stomach-wall.jpg",
     "label": "Muscle layers and the gastric glands",
     "maxw": 800,
     "w": 50
    }
   ]
  }
 ],
 "liver": [
  {
   "t": "photo",
   "src": "liver-ducts.jpg",
   "kind": "Illustration",
   "cap": "The liver, gall bladder and the bile ducts that carry bile down to the duodenum.",
   "after": 1,
   "maxw": 250
  }
 ],
 "gall-bladder": [
  {
   "t": "photo",
   "src": "liver-ducts.jpg",
   "kind": "Illustration",
   "cap": "The gall bladder sits under the liver. The bile duct carries bile to the duodenum.",
   "after": 0,
   "maxw": 250
  }
 ],
 "pancreas": [
  {
   "t": "photo",
   "src": "pancreas-duct.jpg",
   "kind": "Illustration",
   "cap": "The pancreas and its duct, delivering pancreatic juice into the duodenum.",
   "after": 0,
   "maxw": 300
  },
  {
   "t": "photo",
   "src": "pancreas-dissection.jpg",
   "kind": "Photograph",
   "cap": "A real dissection: the liver, the pancreas and the portal vein.",
   "more": true,
   "maxw": 300
  }
 ],
 "duodenum": [
  {
   "t": "photo",
   "src": "circular-folds-regions.jpg",
   "kind": "Illustration",
   "cap": "Circular folds along the small intestine: deepest in the jejunum, shallower in the duodenum and ileum.",
   "more": true,
   "maxw": 800
  },
  {
   "t": "photo",
   "src": "small-intestine-parts.jpg",
   "kind": "Illustration",
   "cap": "The three parts of the small intestine: duodenum, jejunum and ileum.",
   "after": 0,
   "maxw": 800
  },
  {
   "t": "photo",
   "src": "canal-regions.jpg",
   "kind": "Illustration",
   "more": true,
   "cap": "Where the duodenum sits: first part of the small intestine, straight after the stomach, with the jejunum and ileum following.",
   "maxw": 800
  }
 ],
 "ileum-villi": [
  {
   "t": "video",
   "src": "villus-absorption",
   "kind": "Animation",
   "cap": "Absorption at the villi. Watch the small soluble molecules cross the wall and disappear into the blood vessels inside.",
   "after": 2
  },
  {
   "t": "photo",
   "src": "villi-and-microvilli-em.jpg",
   "kind": "Micrographs",
   "cap": "Villi at ×70 under a light microscope, and the microvilli of a single cell at ×18,000 under an electron microscope.",
   "after": 1,
   "maxw": 800
  },
  {
   "t": "photo",
   "src": "folds-real-photo.jpg",
   "kind": "Photograph",
   "cap": "Inside a real small intestine: the circular folds of the lining, close up.",
   "after": 1,
   "maxw": 800
  },
  {
   "t": "photo",
   "src": "villi-carpet.jpg",
   "kind": "Photograph",
   "cap": "The lining is a carpet of villi — this is what gives the enormous surface area.",
   "more": true,
   "maxw": 240
  },
  {
   "t": "photo",
   "src": "villi-micrograph-set.jpg",
   "kind": "Micrographs",
   "cap": "(b) circular folds, (c) villi and (d) microvilli, at increasing magnification.",
   "after": 1,
   "maxw": 539
  },
  {
   "t": "photo",
   "src": "surface-area-levels.jpg",
   "kind": "Illustration",
   "cap": "The three levels of folding that make the surface area so large: <b>circular folds</b>, then <b>villi</b> on the folds, then <b>microvilli</b> on each cell. Together they multiply the area by up to 600 times.",
   "after": 1,
   "maxw": 800
  },
  {
   "t": "photo",
   "src": "intestine-dissection.jpg",
   "kind": "Photograph",
   "cap": "A real dissection: loops of jejunum, and the mesentery carrying their blood vessels.",
   "more": true,
   "maxw": 800
  },
  {
   "t": "photo",
   "src": "mesentery-lymph.jpg",
   "kind": "Illustration · going further",
   "cap": "<b>Where the lacteal actually goes.</b> The fan-shaped <b>mesentery</b> holds the small intestine in place and carries its vessels: the artery branches that supply the gut (red), and the lymph vessels studded with <b>lymph nodes</b> (the yellow beads). Fatty acids and glycerol leave a villus in its lacteal, the lacteals drain into these lymph vessels, and the lymph finally joins the blood. The lymphatic system is not on 0610 — but this is the answer to “where does the lacteal go?”",
   "more": true,
   "maxw": 206
  }
 ],
 "colon": [
  {
   "t": "photo",
   "src": "large-intestine-parts.jpg",
   "kind": "Illustration",
   "cap": "The parts of the large intestine: caecum, ascending, transverse, descending, sigmoid, rectum.",
   "after": 0,
   "maxw": 800
  },
  {
   "t": "photo",
   "src": "colon-inside.jpg",
   "kind": "Photograph",
   "cap": "Inside the large intestine, through an endoscope. No villi here — the lining is smooth, because almost nothing is absorbed except water and salts.",
   "after": 1,
   "maxw": 200
  }
 ],
 "molecules-lab": [
  {
   "t": "photo",
   "src": "carbohydrate-chain.jpg",
   "kind": "Illustration",
   "cap": "Carbohydrate digestion: polysaccharide to disaccharide to monosaccharide.",
   "more": true,
   "maxw": 512
  },
  {
   "t": "photo",
   "src": "maltase-membrane.jpg",
   "kind": "Illustration",
   "cap": "Maltase works on the membrane of the epithelial cells, not floating free in the gut.",
   "more": true,
   "maxw": 550
  }
 ],
 "diet": [
  {
   "t": "photo",
   "src": "eatwell-plate.jpg",
   "kind": "Illustration",
   "after": 0,
   "cap": "What \"correct proportions\" actually looks like. The biggest sections are starchy foods and fruit and vegetables — and the smallest is the one most people expect to be biggest.",
   "maxw": 554
  },
  {
   "t": "photo",
   "src": "carbs-complex-simple.jpg",
   "kind": "Illustration",
   "more": true,
   "cap": "Complex versus simple carbohydrates. Both release energy; the complex ones release it more slowly.",
   "maxw": 500
  }
 ]
};
