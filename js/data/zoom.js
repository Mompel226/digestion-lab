/* The plate follows the text: what appears on the body plate at each
   station, and how it changes as the Learn text is scrolled.

   organ  — which plate organ the camera frames
   steps  — one entry per picture, in reading order; `at` is the index of
            the exam bullet that brings it on (with `sub`, a fraction of
            the way down that bullet). A station with one picture is a
            single object.
   img/roi/window/cover/scale/fixed — where the picture goes (see zoom.js)
   imgs   — several pictures placed explicitly, e.g. two photographs stacked
   labels — our own labels, `at` and `tx` in fractions of the picture
   spot   — highlight one organ of the biliary plate in full colour
   anim   — an animation drawn on the plate (plateanim.js)
   Fractions were measured from the pictures' pixels, not guessed. */
window.ZOOM_DETAIL = {
  "mouth": {
    "organ": "mouth",
    "steps": [
      {
        "at": 0,
        "label": "The mouth, cut down the middle (side view)",
        "labels": [
          {
            "t": "tongue",
            "at": [
              0.34,
              0.69
            ],
            "tx": [
              0.22,
              0.79
            ]
          },
          {
            "t": "incisors",
            "at": [
              0.175,
              0.605
            ],
            "tx": [
              0.165,
              0.505
            ]
          },
          {
            "t": "hard palate",
            "at": [
              0.3,
              0.56
            ],
            "tx": [
              0.2,
              0.47
            ]
          },
          {
            "t": "soft palate",
            "at": [
              0.455,
              0.6
            ],
            "tx": [
              0.43,
              0.53
            ]
          }
        ],
        "img": "zoom/head-section.jpg",
        "roi": [
          0.06,
          0.52,
          0.5,
          0.3
        ],
        "window": [
          30,
          24,
          230,
          246
        ],
        "cover": true,
        "credit": "Patrick J. Lynch, CC BY 2.5"
      },
      {
        "at": 3,
        "label": "The four types of tooth: from the front, and along the row",
        "px": 11.5,
        "insets": [
          {
            "img": "photos/incisors-real.jpg",
            "at": [
              60,
              194,
              72
            ],
            "labels": [
              {
                "t": "canine",
                "at": [
                  0.15,
                  0.52
                ],
                "tx": [
                  0.05,
                  0.8
                ],
                "anchor": "start"
              },
              {
                "t": "lateral incisor",
                "at": [
                  0.24,
                  0.42
                ],
                "tx": [
                  0.05,
                  0.2
                ],
                "anchor": "start"
              },
              {
                "t": "central incisors",
                "at": [
                  0.49,
                  0.4
                ],
                "tx": [
                  0.5,
                  0.13
                ],
                "anchor": "middle"
              },
              {
                "t": "lateral incisor",
                "at": [
                  0.745,
                  0.44
                ],
                "tx": [
                  0.96,
                  0.2
                ],
                "anchor": "end"
              },
              {
                "t": "canine",
                "at": [
                  0.86,
                  0.5
                ],
                "tx": [
                  0.96,
                  0.8
                ],
                "anchor": "end"
              }
            ]
          },
          {
            "img": "photos/premolars-molars-real.jpg",
            "at": [
              136,
              194,
              72
            ],
            "labels": [
              {
                "t": "molar",
                "at": [
                  0.37,
                  0.33
                ],
                "tx": [
                  0.22,
                  0.12
                ],
                "anchor": "middle"
              },
              {
                "t": "molar",
                "at": [
                  0.57,
                  0.4
                ],
                "tx": [
                  0.5,
                  0.12
                ],
                "anchor": "middle"
              },
              {
                "t": "premolar",
                "at": [
                  0.76,
                  0.42
                ],
                "tx": [
                  0.74,
                  0.12
                ],
                "anchor": "middle"
              },
              {
                "t": "premolar",
                "at": [
                  0.9,
                  0.5
                ],
                "tx": [
                  0.86,
                  0.9
                ],
                "anchor": "middle"
              }
            ]
          }
        ],
        "img": "zoom/head-section.jpg",
        "roi": [
          0.06,
          0.52,
          0.5,
          0.3
        ],
        "window": [
          30,
          24,
          230,
          160
        ],
        "cover": true,
        "credit": "Patrick J. Lynch, CC BY 2.5"
      },
      {
        "at": 4,
        "label": "A real molar cut in half: enamel, dentine and the pulp cavity",
        "insets": [
          {
            "img": "photos/tooth-cut-open.jpg",
            "at": [
              72,
              86,
              116
            ],
            "cap": "a real molar, cut in half — click to enlarge"
          }
        ],
        "img": "zoom/head-section.jpg",
        "roi": [
          0.06,
          0.52,
          0.5,
          0.3
        ],
        "window": [
          30,
          24,
          230,
          246
        ],
        "cover": true,
        "credit": "Patrick J. Lynch, CC BY 2.5"
      },
      {
        "at": 5,
        "label": "Tooth decay: a healthy tooth, then caries, then a cavity reaching the pulp",
        "insets": [
          {
            "img": "photos/tooth-decay.jpg",
            "at": [
              60,
              178,
              144
            ],
            "cap": "healthy · caries · cavity — click to enlarge"
          }
        ],
        "img": "zoom/head-section.jpg",
        "roi": [
          0.06,
          0.52,
          0.5,
          0.3
        ],
        "window": [
          30,
          24,
          230,
          142
        ],
        "cover": true,
        "credit": "Patrick J. Lynch, CC BY 2.5"
      }
    ]
  },
  "salivary-glands": {
    "organ": "salivary-glands",
    "img": "zoom/salivary-glands-illus.jpg",
    "window": [
      66,
      24,
      160,
      240
    ],
    "fit": true,
    "full": true,
    "label": "The three pairs of salivary glands, and the ducts that carry saliva into the mouth",
    "credit": "OpenStax College, CC BY 3.0"
  },
  "epiglottis": {
    "organ": "epiglottis",
    "img": "zoom/head-section.jpg",
    "w": 1200,
    "h": 1319,
    "fixed": [
      -50,
      -155,
      432
    ],
    "window": [
      0,
      0,
      340,
      296
    ],
    "anim": "swallow",
    "label": "Swallowing: the larynx rises and the epiglottis tips over the windpipe, so the bolus goes down the oesophagus",
    "credit": "Patrick J. Lynch, CC BY 2.5"
  },
  "oesophagus": {
    "organ": "oesophagus",
    "anim": "peristalsis",
    "noback": true,
    "label": "Peristalsis: the wall itself moves — circular muscle contracts behind the bolus and relaxes ahead of it"
  },
  "stomach": {
    "organ": "stomach",
    "steps": [
      {
        "at": 0,
        "anim": "churn",
        "animBox": [
          202,
          438,
          80,
          72
        ],
        "noback": true,
        "label": "Churning: waves of contraction mix the food with gastric juice — physical digestion"
      },
      {
        "at": 1,
        "img": "zoom/stomach-wall-block.jpg",
        "fixed": [
          154,
          372,
          168
        ],
        "window": [
          148,
          366,
          180,
          236
        ],
        "label": "The stomach wall: the lining with its gastric glands, then three layers of muscle",
        "credit": "Encyclopædia Britannica, from the 7.3 deck",
        "labels": [
          {
            "t": "gastric glands\nmake gastric juice",
            "at": [
              0.4,
              0.36
            ],
            "tx": [
              0.7,
              0.2
            ]
          },
          {
            "t": "mucus-coated lining",
            "at": [
              0.3,
              0.1
            ],
            "tx": [
              0.62,
              0.05
            ]
          },
          {
            "t": "three muscle layers\nrunning in different\ndirections",
            "at": [
              0.45,
              0.72
            ],
            "tx": [
              0.68,
              0.62
            ]
          }
        ]
      },
      {
        "at": 4,
        "img": "photos/stomach-inside.jpg",
        "fixed": [
          150,
          376,
          186
        ],
        "window": [
          144,
          370,
          198,
          198
        ],
        "label": "Inside the stomach: the lining is thrown into deep folds, the rugae",
        "credit": "3-D render from the 7.3 deck",
        "labels": [
          {
            "t": "from the oesophagus",
            "at": [
              0.44,
              0.06
            ],
            "tx": [
              0.56,
              0.05
            ],
            "anchor": "start"
          },
          {
            "t": "rugae — folds of\nthe lining",
            "at": [
              0.62,
              0.5
            ],
            "tx": [
              0.78,
              0.2
            ]
          },
          {
            "t": "muscular wall",
            "at": [
              0.89,
              0.6
            ],
            "tx": [
              0.7,
              0.86
            ]
          },
          {
            "t": "chyme leaves\nto the duodenum",
            "at": [
              0.11,
              0.86
            ],
            "tx": [
              0.16,
              0.95
            ],
            "anchor": "start"
          }
        ]
      }
    ]
  },
  "liver": {
    "organ": "liver",
    "keep": true,
    "noback": true,
    "anim": "bileflow",
    "focus": "liver",
    "paint": [
      {
        "organ": "liver",
        "largest": true,
        "fill": "none",
        "stroke": "#E8A33D",
        "sw": 2.2,
        "opacity": 0.95
      }
    ],
    "label": "The liver makes bile; the hepatic ducts carry it out, the gall bladder stores it, and the bile duct delivers it to the duodenum"
  },
  "gall-bladder": {
    "organ": "gall-bladder",
    "keep": true,
    "noback": true,
    "anim": "bileflow",
    "focus": "gall-bladder",
    "paint": [
      {
        "organ": "gall-bladder",
        "largest": false,
        "fill": "none",
        "stroke": "#E8A33D",
        "sw": 2,
        "opacity": 0.95,
        "only": [
          96,
          479,
          145,
          496
        ]
      }
    ],
    "label": "The gall bladder lies under the liver; it stores bile and empties it down the bile duct into the duodenum"
  },
  "pancreas": {
    "organ": "pancreas",
    "img": "zoom/pancreas-render2.jpg",
    "roi": [
      0.18,
      0.37,
      0.64,
      0.34
    ],
    "pad": 0.45,
    "label": "The pancreas, with its duct running along it into the duodenum",
    "credit": "OpenStax College / AnatomyZone, from the 7.4 deck",
    "labels": [
      {
        "t": "pancreas",
        "at": [
          0.5,
          0.6
        ],
        "tx": [
          0.56,
          0.86
        ],
        "anchor": "start"
      },
      {
        "t": "pancreatic duct",
        "at": [
          0.6,
          0.5
        ],
        "tx": [
          0.66,
          0.24
        ],
        "anchor": "start"
      },
      {
        "t": "duodenum",
        "at": [
          0.09,
          0.55
        ],
        "tx": [
          0.02,
          0.9
        ],
        "anchor": "start"
      }
    ],
    "box": [
      168,
      522,
      92,
      32
    ],
    "grow": 1.25,
    "crop": [
      0.17,
      0.02,
      1,
      1
    ],
    "anim": "juiceflow"
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
    "full": true,
    "label": "The small intestine: duodenum, jejunum and ileum, and what their linings look like",
    "credit": "OpenStax College, CC BY 3.0 · linings from the 7.5 deck",
    "labels": [
      {
        "t": "duodenum",
        "at": [
          0.5,
          0.2
        ],
        "tx": [
          0.64,
          0.08
        ],
        "anchor": "start"
      },
      {
        "t": "jejunum",
        "at": [
          0.5,
          0.38
        ],
        "tx": [
          0.41,
          0.3
        ],
        "anchor": "end"
      },
      {
        "t": "ileum",
        "at": [
          0.5,
          0.64
        ],
        "tx": [
          0.41,
          0.74
        ],
        "anchor": "end"
      }
    ],
    "insets": [
      {
        "img": "zoom/lining-duodenum.jpg",
        "at": [
          262,
          536,
          70
        ],
        "cap": "duodenum lining",
        "to": [
          0.5,
          0.2
        ]
      },
      {
        "img": "zoom/lining-jejunum.jpg",
        "at": [
          262,
          610,
          70
        ],
        "cap": "jejunum: the deepest folds",
        "to": [
          0.58,
          0.4
        ]
      },
      {
        "img": "zoom/lining-ileum.jpg",
        "at": [
          262,
          684,
          70
        ],
        "cap": "ileum: shallower folds",
        "to": [
          0.55,
          0.66
        ]
      },
      {
        "img": "zoom/pancreas-render2.jpg",
        "at": [
          46,
          500,
          66
        ],
        "cap": "where bile and pancreatic\njuice enter — click to enlarge",
        "to": [
          0.5,
          0.2
        ]
      }
    ]
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
    "credit": "OpenStax College, CC BY 3.0, labels ours",
    "labels": [
      {
        "t": "colon",
        "at": [
          0.72,
          0.42
        ],
        "tx": [
          0.5,
          0.3
        ],
        "anchor": "start"
      },
      {
        "t": "caecum",
        "at": [
          0.3,
          0.63
        ],
        "tx": [
          0.245,
          0.73
        ],
        "anchor": "start"
      },
      {
        "t": "appendix",
        "at": [
          0.37,
          0.72
        ],
        "tx": [
          0.245,
          0.81
        ],
        "anchor": "start"
      },
      {
        "t": "rectum",
        "at": [
          0.5,
          0.82
        ],
        "tx": [
          0.62,
          0.86
        ],
        "anchor": "start"
      },
      {
        "t": "anus",
        "at": [
          0.5,
          0.965
        ],
        "tx": [
          0.62,
          0.98
        ],
        "anchor": "start"
      }
    ]
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
    "credit": "OpenStax College, CC BY 3.0, labels ours",
    "labels": [
      {
        "t": "rectum — stores faeces",
        "at": [
          0.5,
          0.8
        ],
        "tx": [
          0.62,
          0.78
        ]
      },
      {
        "t": "anus — egestion",
        "at": [
          0.5,
          0.965
        ],
        "tx": [
          0.62,
          0.97
        ]
      }
    ]
  }
};
