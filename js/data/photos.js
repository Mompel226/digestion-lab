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
      "t": "pair",
      "kind": "Diagram",
      "after": 4,
      "cap": "The tooth, drawn: <b>enamel</b> is the hardest substance in the body and protects the tooth; <b>dentine</b> lies beneath it and senses pain; the <b>pulp cavity</b> holds the blood vessels and nerves — which is why a deep cavity hurts; <b>cement</b> and the periodontal fibres anchor the root in the jaw bone. The real molar, cut in half, is on the body plate.",
      "of": [
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
    }
  ],
  "salivary-glands": [],
  "oesophagus": [],
  "stomach": [],
  "liver": [
    {
      "t": "photo",
      "src": "pancreas-dissection.jpg",
      "kind": "Photograph",
      "cap": "<b>A real liver</b>, seen in a dissection with the pancreas below it and the <b>hepatic portal vein</b> bringing blood up from the gut — the vessel named in the sentence above.",
      "after": 2,
      "maxw": 300
    }
  ],
  "gall-bladder": [],
  "pancreas": [
    {
      "t": "photo",
      "src": "pancreas-duct.jpg",
      "kind": "Illustration",
      "cap": "The pancreas and its duct, delivering pancreatic juice into the duodenum.",
      "after": 1,
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
      "t": "photo",
      "src": "intestine-dissection.jpg",
      "kind": "Photograph",
      "cap": "This is the organ itself. Loops of jejunum opened at surgery, with the fan-shaped mesentery carrying the blood vessels that take absorbed nutrients away — six to seven metres of tube in an adult, and everything below happens on its inside surface.",
      "maxw": 800,
      "after": 0
    },
    {
      "t": "photo",
      "src": "folds-real-photo.jpg",
      "kind": "Photograph",
      "cap": "Level one, in a real intestine: the circular folds are the ridges running round the inside of the tube. Nothing in here is smooth, and that is the whole point.",
      "after": 1,
      "maxw": 800
    },
    {
      "t": "photo",
      "src": "villi-carpet.jpg",
      "kind": "Photograph",
      "cap": "Level two: zoom in on one fold and its entire surface is a carpet of villi, packed side by side. Each one is a projection built from many cells — not a single cell.",
      "maxw": 240,
      "after": 2
    },
    {
      "t": "photo",
      "src": "villi-and-microvilli-em.jpg",
      "kind": "Micrographs",
      "cap": "Level three, and the only level you need an electron microscope to see. Left: villi at ×70 under a light microscope. Right: the surface of one epithelial cell at ×18,000 — that fuzzy border is its microvilli.",
      "after": 3,
      "maxw": 800
    },
    {
      "t": "photo",
      "src": "surface-area-levels.jpg",
      "kind": "Illustration",
      "cap": "All three levels at once, and what they come to: <b>circular folds</b>, then <b>villi</b> on the folds, then <b>microvilli</b> on each cell. Together they multiply the area by up to 600 times compared with a flat tube.",
      "maxw": 800,
      "more": true
    },
    {
      "t": "video",
      "src": "villus-absorption",
      "kind": "Animation",
      "cap": "Now watch it happen. The molecules cross a wall one cell thick and vanish into the vessels running through the middle of the villus.",
      "after": 6
    },
    {
      "t": "photo",
      "src": "villi-micrograph-set.jpg",
      "kind": "Micrographs",
      "cap": "Could you tell them apart in an exam? (b) circular folds, (c) villi and (d) microvilli, at increasing magnification — the same three levels, this time as real micrographs.",
      "maxw": 539,
      "more": true
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
