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
   "cap": "Looking along the tooth row — the view exam questions use. The teeth get bigger towards the back. Count the bumps on the biting surface: a premolar has <b>two</b>, a molar has <b>four</b>.",
   "after": 3,
   "annot": [
    {
     "x": 22,
     "y": 13,
     "t": "back of the mouth",
     "to": [
      36,
      26
     ]
    },
    {
     "x": 80,
     "y": 84,
     "t": "towards the front",
     "to": [
      90,
      58
     ]
    },
    {
     "x": 30,
     "y": 64,
     "t": "Molars — bigger, broader tops",
     "to": [
      41,
      40
     ],
     "big": true
    },
    {
     "x": 86,
     "y": 22,
     "t": "Premolars — smaller",
     "to": [
      92,
      44
     ],
     "big": true
    }
   ],
   "maxw": 640
  },
  {
   "t": "photo",
   "src": "jaw-model-xray.jpg",
   "kind": "Model and radiograph",
   "cap": "A jaw model against an X-ray. In the X-ray you can count roots: premolars have one, sometimes two; molars have two or three.",
   "after": 4,
   "maxw": 400
  },
  {
   "t": "photo",
   "src": "tooth-cut-open.jpg",
   "kind": "Photograph",
   "cap": "A real molar cut in half: enamel, dentine, pulp, cementum and the root canal.",
   "after": 4,
   "maxw": 360
  },
  {
   "t": "photo",
   "src": "tooth-decay.jpg",
   "kind": "Photographs",
   "cap": "Tooth decay: healthy enamel, then caries, then a cavity reaching the pulp.",
   "after": 5,
   "maxw": 750
  },
  {
   "t": "photo",
   "src": "incisors-real.jpg",
   "kind": "Photograph",
   "cap": "The incisors — flat and chisel-shaped, with a straight cutting edge.",
   "more": true,
   "maxw": 715
  },
  {
   "t": "photo",
   "src": "canine-real.jpg",
   "kind": "Photograph",
   "cap": "The canine — one pointed cusp, sitting just behind the incisors.",
   "more": true,
   "maxw": 800
  },
  {
   "t": "photo",
   "src": "tooth-xray.jpg",
   "kind": "Radiograph",
   "cap": "An X-ray of the same structures. It also settles a common question: this lower molar has <b>two</b> roots. Upper molars have three, and most premolars have one — so <b>root number depends on the jaw and is a poor way to tell them apart</b>. Count cusps instead.",
   "after": 4,
   "annot": [
    {
     "x": 52,
     "y": 92,
     "t": "Two roots — this is a lower molar",
     "to": [
      34,
      74
     ],
     "big": true
    }
   ],
   "maxw": 378
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
   "t": "photo",
   "src": "stomach-inside.jpg",
   "kind": "Illustration",
   "cap": "Inside the stomach. The folds in the lining are called rugae; they let the stomach stretch as it fills.",
   "after": 0,
   "maxw": 800
  },
  {
   "t": "photo",
   "src": "stomach-churning.jpg",
   "kind": "Illustration",
   "cap": "Churning: the muscular wall squeezes the food and mixes it with gastric juice.",
   "after": 1,
   "maxw": 417
  },
  {
   "t": "photo",
   "src": "stomach-wall.jpg",
   "kind": "Illustration",
   "cap": "The stomach wall — three muscle layers, and the gastric glands that make the juice.",
   "more": true,
   "maxw": 800
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
