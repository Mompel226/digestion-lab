/* What the plate shows once the camera has arrived at each station: a
   professional illustration of that organ, drawn ON the plate, registered
   over the organ's own outline.
     img   under assets/
     roi   [x, y, w, h] as fractions of the picture: where the organ is
           inside it — that box is scaled onto the organ's outline on the plate
     box   optional plate target in plate coordinates (used where the plate's
           own paths are a poor guide, e.g. the rectum shares a path)
     pad   how far the soft window extends beyond the organ (fraction)
   Credits are shown on the plate and recorded in assets/photos/CREDITS.md. */
window.ZOOM_DETAIL = {
  "mouth": {
    "organ": "mouth",
    "img": "zoom/head-section.jpg",
    "roi": [
      0.06,
      0.52,
      0.5,
      0.3
    ],
    "window": [
      30,
      20,
      230,
      230
    ],
    "cover": true,
    "label": "The mouth, cut down the middle (side view)",
    "credit": "Patrick J. Lynch, CC BY 2.5"
  },
  "salivary-glands": {
    "organ": "salivary-glands",
    "img": "zoom/salivary-glands-illus.jpg",
    "roi": [
      0.15,
      0.05,
      0.85,
      0.75
    ],
    "window": [
      30,
      30,
      230,
      220
    ],
    "cover": true,
    "label": "The three pairs of salivary glands (side view)",
    "credit": "OpenStax College, CC BY 3.0"
  },
  "epiglottis": {
    "organ": "epiglottis",
    "img": "zoom/head-section.jpg",
    "w": 1200,
    "h": 1319,
    "roi": [
      0.385,
      0.635,
      0.2,
      0.26
    ],
    "window": [
      0,
      0,
      340,
      296
    ],
    "cover": true,
    "scale": 0.36,
    "label": "The throat, cut down the middle: the epiglottis sits at the base of the tongue, above the windpipe",
    "credit": "Patrick J. Lynch, CC BY 2.5"
  },
  "stomach": {
    "organ": "stomach",
    "img": "zoom/stomach-cutaway.jpg",
    "roi": [
      0.12,
      0.02,
      0.68,
      0.94
    ],
    "pad": 0.35,
    "label": "The stomach, cut open: rugae and the three muscle layers",
    "credit": "OpenStax College, CC BY 3.0"
  },
  "liver": {
    "organ": "liver",
    "img": "photos/biliary-system-plain.svg",
    "roi": [
      0.08,
      0,
      0.63,
      0.53
    ],
    "label": "Liver, gall bladder, bile ducts, pancreas and duodenum",
    "credit": "Biliary system, public domain (labels removed)",
    "fixed": [
      -8,
      362,
      340
    ],
    "window": [
      -24,
      346,
      372,
      349
    ]
  },
  "gall-bladder": {
    "organ": "gall-bladder",
    "img": "photos/biliary-system-plain.svg",
    "roi": [
      0.25,
      0.28,
      0.18,
      0.18
    ],
    "label": "The gall bladder stores bile; the bile duct carries it to the duodenum",
    "credit": "Biliary system, public domain (labels removed)",
    "fixed": [
      -8,
      362,
      340
    ],
    "window": [
      -24,
      346,
      372,
      349
    ]
  },
  "pancreas": {
    "organ": "pancreas",
    "img": "photos/biliary-system-plain.svg",
    "roi": [
      0.36,
      0.4,
      0.53,
      0.3
    ],
    "label": "The pancreas and its duct into the duodenum",
    "credit": "Biliary system, public domain (labels removed)",
    "fixed": [
      -8,
      362,
      340
    ],
    "window": [
      -24,
      346,
      372,
      349
    ]
  },
  "duodenum": {
    "organ": "duodenum",
    "img": "photos/biliary-system-plain.svg",
    "roi": [
      0.45,
      0.45,
      0.32,
      0.5
    ],
    "label": "The duodenum, where bile and pancreatic juice arrive",
    "credit": "Biliary system, public domain (labels removed)",
    "fixed": [
      -8,
      362,
      340
    ],
    "window": [
      -24,
      346,
      372,
      349
    ]
  },
  "ileum-villi": {
    "organ": "ileum-villi",
    "img": "zoom/small-intestine-illus.jpg",
    "roi": [
      0.41,
      0.08,
      0.4,
      0.78
    ],
    "pad": 0.35,
    "label": "The small intestine: duodenum, jejunum and ileum",
    "credit": "OpenStax College, CC BY 3.0 (labels removed)"
  },
  "colon": {
    "organ": "colon",
    "img": "zoom/large-intestine-illus.jpg",
    "roi": [
      0.25,
      0.02,
      0.55,
      0.96
    ],
    "pad": 0.25,
    "label": "The large intestine: colon, rectum and anus",
    "credit": "OpenStax College, CC BY 3.0 (labels removed)"
  },
  "rectum-anus": {
    "organ": "rectum-anus",
    "img": "zoom/large-intestine-illus.jpg",
    "roi": [
      0.46,
      0.62,
      0.12,
      0.36
    ],
    "box": [
      157,
      741,
      35,
      71
    ],
    "pad": 1,
    "label": "Rectum and anal canal",
    "credit": "OpenStax College, CC BY 3.0 (labels removed)"
  }
};
