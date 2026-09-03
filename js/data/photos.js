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
      "cap": "<b>A real liver, in a living animal.</b> This is surgery, not a dissection of a cadaver — and you can tell: the duodenum is pink with fine red vessels because oxygenated blood is still flowing through it, and the liver is a deep, glossy red-brown. Below them runs the purple <b>hepatic portal vein</b>, bringing blood up from the gut to the liver — the vessel named in the sentence above. Compare the grey, bloodless vessels of the cadaver at the small-intestine station.",
      "after": 8,
      "maxw": 300
    }
  ],
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
  "ileum-villi": [
    {
      "t": "pair",
      "kind": "Photograph and 3-D render",
      "after": 4,
      "cap": "<b>The organ itself.</b> Left, a dissection of a cadaver: loops of jejunum lifted to show the fan-shaped <b>mesentery</b> that carries their blood vessels. Look at the colour — the vessels are grey, not pink, because no oxygenated blood flows through them any more (compare the living tissue in the photograph at the liver station). In life, those are the vessels that carry the absorbed nutrients away. Right, the whole mesentery drawn in 3-D: one sheet of membrane fanning out from the back wall of the abdomen to hold the six to seven metres of small intestine.",
      "of": [
        {
          "photo": "intestine-dissection.jpg",
          "label": "Dissection: jejunum and its mesentery",
          "maxw": 800,
          "w": 52
        },
        {
          "photo": "mesentery-render.jpg",
          "label": "The mesentery, whole",
          "maxw": 800,
          "w": 48
        }
      ]
    },
    {
      "t": "video",
      "src": "villus-absorption",
      "kind": "Animation",
      "cap": "Now watch it happen. A protein is broken into <b>amino acids</b> in the lumen; they cross the <b>epithelium</b> — one layer of <b>enterocytes</b>, with the brush border of <b>microvilli</b> on their lumen side — and pass into the blood <b>capillaries</b> (purple, with red blood cells) running through the middle of the villus. The yellow vessel beside them is the <b>lacteal</b>: that is where fatty acids and glycerol would go instead.",
      "after": 12
    },
    {
      "t": "photo",
      "src": "surface-area-levels.jpg",
      "kind": "Illustration",
      "cap": "<b>All three levels in one picture — read it a, b, c.</b> (a) The tube, cut open: the ridges running round the inside are the <b>circular folds</b>. The little box on one fold is zoomed into (b): the fold's whole surface is covered in <b>villi</b>, each one a finger of tissue built from many cells, with blood vessels running up inside. The little box on one villus is zoomed into (c): the wall of the villus is a single layer of cells, and the one cell pulled out at the top right shows the <b>microvilli</b> — the fringe on its top edge, which is just its own membrane folded. Three levels, one inside the next.",
      "after": 9,
      "maxw": 900
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
