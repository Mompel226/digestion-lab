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
            "t": "hard palate (bone)",
            "at": [
              0.3,
              0.555
            ],
            "tx": [
              0.06,
              0.47
            ],
            "anchor": "start"
          },
          {
            "t": "soft palate",
            "at": [
              0.484,
              0.569
            ],
            "tx": [
              0.55,
              0.44
            ],
            "anchor": "start"
          },
          {
            "t": "upper incisor",
            "at": [
              0.175,
              0.584
            ],
            "tx": [
              0.02,
              0.6
            ],
            "anchor": "end"
          },
          {
            "t": "lower incisor",
            "at": [
              0.169,
              0.671
            ],
            "tx": [
              0.02,
              0.72
            ],
            "anchor": "end"
          },
          {
            "t": "tongue",
            "at": [
              0.34,
              0.655
            ],
            "tx": [
              0.235,
              0.83
            ],
            "anchor": "start"
          },
          {
            "t": "throat (pharynx)",
            "at": [
              0.545,
              0.7
            ],
            "tx": [
              0.575,
              0.712
            ],
            "anchor": "start"
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
                  0.24
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
                  0.08
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
                  0.24
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
    ],
    "keys": [
      {
        "t": "mastication",
        "kind": "act",
        "corner": "tl"
      },
      {
        "t": "food",
        "kind": "food",
        "corner": "tl"
      }
    ]
  },
  "salivary-glands": {
    "organ": "salivary-glands",
    "focus": "salivary-glands",
    "spotlight": [
      "salivary-glands"
    ],
    "keep": true,
    "noback": true,
    "paint": [
      {
        "organ": "salivary-glands",
        "fill": "none",
        "stroke": "#B07A12",
        "sw": 0.7,
        "opacity": 0.65
      }
    ],
    "label": "The three pairs of salivary glands, and the ducts that carry saliva into the mouth",
    "labels": [
      {
        "t": "parotid gland",
        "plate": true,
        "at": [
          172,
          133
        ],
        "tx": [
          190,
          116
        ],
        "anchor": "start"
      },
      {
        "t": "parotid duct",
        "plate": true,
        "at": [
          142,
          130
        ],
        "tx": [
          95,
          112
        ],
        "anchor": "start"
      },
      {
        "t": "submandibular gland",
        "plate": true,
        "at": [
          149,
          177
        ],
        "tx": [
          164,
          195
        ],
        "anchor": "start"
      },
      {
        "t": "sublingual gland",
        "plate": true,
        "at": [
          118,
          164
        ],
        "tx": [
          58,
          198
        ],
        "anchor": "start"
      }
    ],
    "keys": [
      {
        "t": "food",
        "kind": "food",
        "corner": "tl"
      }
    ],
    "anim": "saliva"
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
    "credit": "Patrick J. Lynch, CC BY 2.5",
    "keys": [
      {
        "t": "swallowing",
        "kind": "act",
        "corner": "tl"
      },
      {
        "t": "bolus",
        "kind": "food",
        "corner": "tl"
      }
    ]
  },
  "oesophagus": {
    "organ": "oesophagus",
    "anim": "peristalsis",
    "noback": true,
    "label": "Peristalsis: the wall itself moves — circular muscle contracts behind the bolus and relaxes ahead of it",
    "keys": [
      {
        "t": "peristalsis",
        "kind": "act",
        "corner": "tl"
      },
      {
        "t": "bolus",
        "kind": "food",
        "corner": "tl"
      }
    ],
    "animBox": [
      163,
      186,
      32,
      300
    ]
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
      },
      {
        "at": 5,
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
      }
    ],
    "keys": [
      {
        "t": "churning",
        "kind": "act",
        "corner": "tl"
      },
      {
        "t": "chyme",
        "kind": "food",
        "corner": "tl"
      }
    ]
  },
  "liver": {
    "organ": "liver",
    "label": "Bile: made in the liver, stored in the gall bladder, released into the duodenum",
    "steps": [
      {
        "at": 0,
        "focus": "liver-fill",
        "label": "Between meals: the liver keeps making bile, the way into the duodenum is shut, and the gall bladder fills and stores it",
        "keep": true,
        "noback": true,
        "anim": "bileflow",
        "hide": [
          {
            "organ": "gall-bladder"
          }
        ],
        "paint": [
          {
            "organ": "liver",
            "largest": true,
            "fill": "none",
            "stroke": "#E8A33D",
            "sw": 2.2,
            "opacity": 0.95
          }
        ]
      },
      {
        "at": 2,
        "focus": "liver",
        "label": "The cycle: the gall bladder fills between meals, then a meal arrives — it squeezes its stored bile out, and fresh bile from the liver flows straight down as well",
        "keep": true,
        "noback": true,
        "anim": "bileflow",
        "hide": [
          {
            "organ": "gall-bladder"
          }
        ],
        "paint": [
          {
            "organ": "liver",
            "largest": true,
            "fill": "none",
            "stroke": "#E8A33D",
            "sw": 2.2,
            "opacity": 0.95
          }
        ]
      },
      {
        "at": 4,
        "focus": "liver-release",
        "label": "During a meal: bile pours into the duodenum from the gall bladder and from the liver, to neutralise the chyme and emulsify the fats",
        "keep": true,
        "noback": true,
        "anim": "bileflow",
        "hide": [
          {
            "organ": "gall-bladder"
          }
        ],
        "paint": [
          {
            "organ": "liver",
            "largest": true,
            "fill": "none",
            "stroke": "#E8A33D",
            "sw": 2.2,
            "opacity": 0.95
          }
        ]
      },
      {
        "at": 8,
        "cam": {
          "cx": 206,
          "cy": 602,
          "w": 360
        },
        "keep": true,
        "noback": true,
        "anim": "portal",
        "animBox": [
          140,
          470,
          120,
          220
        ],
        "label": "The hepatic portal vein: the absorbed glucose and amino acids reach the liver first",
        "hide": [
          {
            "organ": "gall-bladder"
          }
        ],
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
        ]
      }
    ]
  },
  "pancreas": {
    "organ": "pancreas",
    "keep": true,
    "noback": true,
    "anim": "bileflow",
    "focus": "pancreas",
    "paint": [
      {
        "organ": "pancreas",
        "largest": true,
        "fill": "none",
        "stroke": "#E8A33D",
        "sw": 2.2,
        "opacity": 0.95
      }
    ],
    "insets": [
      {
        "img": "zoom/pancreas-acinar.png",
        "at": [
          52,
          400,
          84
        ],
        "cap": "zoomed in: where bile and\npancreatic juice enter the duodenum",
        "to": [
          0.65,
          0.55
        ],
        "bare": true
      }
    ],
    "label": "The pancreas makes pancreatic juice in its acinar cells; its duct carries the juice to the duodenum, where the bile duct joins it",
    "credit": "inset: OpenStax College, CC BY 3.0, from the 7.4 deck",
    "hide": [
      {
        "organ": "gall-bladder",
        "except": [
          94,
          477,
          147,
          498
        ]
      }
    ]
  },
  "ileum-villi": {
    "organ": "ileum-villi",
    "label": "The small intestine, level by level",
    "steps": [
      {
        "at": 0,
        "img": "zoom/small-intestine-illus.jpg",
        "roi": [
          0.41,
          0.08,
          0.4,
          0.78
        ],
        "full": true,
        "soft": 2,
        "noback": true,
        "label": "The small intestine — duodenum, jejunum and ileum — and where bile and pancreatic juice come in",
        "credit": "OpenStax College, CC BY 3.0",
        "labels": [
          {
            "t": "duodenum",
            "at": [
              0.5,
              0.2
            ],
            "tx": [
              0.62,
              0.13
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
              0.36,
              0.34
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
              0.36,
              0.7
            ],
            "anchor": "end"
          }
        ],
        "insets": [
          {
            "img": "zoom/pancreas-render2.jpg",
            "at": [
              185,
              424,
              118
            ],
            "cap": "the pancreas and the duodenum: where the bile duct and the pancreatic duct enter",
            "big": 1,
            "nocap": true
          }
        ],
        "dropWhite": true
      },
      {
        "at": 4,
        "cam": {
          "cx": 175,
          "cy": 640,
          "w": 280
        },
        "img": "photos/folds-real-photo.jpg",
        "fixed": [
          36,
          592,
          208
        ],
        "box": [
          36,
          592,
          208,
          117
        ],
        "window": [
          33,
          589,
          214,
          123
        ],
        "soft": 3,
        "label": "Level 1 — circular folds, inside a real small intestine: about three times the area of a flat tube",
        "credit": "photograph from the 7.5 deck",
        "labels": [
          {
            "t": "level 1 · circular folds · ×3",
            "at": [
              0.5,
              0.42
            ],
            "tx": [
              0.5,
              -0.17
            ],
            "anchor": "middle"
          }
        ],
        "dwell": 700,
        "fade": 520,
        "sub": 0.55
      },
      {
        "at": 7,
        "cam": {
          "cx": 175,
          "cy": 640,
          "w": 280
        },
        "img": "zoom/villi-lm.jpg",
        "fixed": [
          150,
          556,
          106
        ],
        "box": [
          150,
          556,
          106,
          207
        ],
        "window": [
          147,
          553,
          112,
          213
        ],
        "soft": 3,
        "label": "Level 2 — villi: finger-like projections all over every fold, about ten times more area again",
        "credit": "light micrograph, ×70, from the 7.5 deck",
        "labels": [
          {
            "t": "level 2 · villi · ×10 more",
            "at": [
              0.5,
              0.3
            ],
            "tx": [
              0.5,
              -0.08
            ],
            "anchor": "middle"
          }
        ],
        "insets": [
          {
            "img": "photos/folds-real-photo.jpg",
            "at": [
              40,
              612,
              94
            ],
            "cap": "one fold, close up",
            "link": [
              0.44,
              0.3,
              0.6,
              0.62
            ]
          }
        ],
        "dwell": 700,
        "scroll": 190,
        "fade": 520,
        "room": 380
      },
      {
        "at": 8,
        "cam": {
          "cx": 175,
          "cy": 640,
          "w": 280
        },
        "img": "zoom/microvilli-em.jpg",
        "fixed": [
          126,
          596,
          166
        ],
        "box": [
          126,
          596,
          166,
          124
        ],
        "window": [
          123,
          593,
          172,
          130
        ],
        "soft": 3,
        "label": "Level 3 — microvilli: folds of the cell membrane itself, only visible with an electron microscope; about twenty times more area again",
        "credit": "electron micrograph, ×18,000, from the 7.5 deck",
        "labels": [
          {
            "t": "level 3 · microvilli · ×20 more",
            "at": [
              0.78,
              0.5
            ],
            "tx": [
              0.5,
              -0.14
            ],
            "anchor": "middle"
          }
        ],
        "insets": [
          {
            "img": "zoom/villi-lm.jpg",
            "at": [
              40,
              588,
              68
            ],
            "cap": "one cell of a villus",
            "link": [
              0.33,
              0.09,
              0.47,
              0.28
            ]
          }
        ],
        "dwell": 700,
        "scroll": 190,
        "fade": 520,
        "room": 380
      },
      {
        "at": 9,
        "cam": {
          "cx": 175,
          "cy": 640,
          "w": 280
        },
        "noback": true,
        "label": "The three levels together: folds × villi × microvilli — up to 600 times the surface area of a flat tube",
        "credit": "from the 7.5 deck",
        "insets": [
          {
            "img": "photos/folds-real-photo.jpg",
            "at": [
              38,
              600,
              92
            ],
            "cap": "circular folds · ×3"
          },
          {
            "img": "zoom/villi-lm.jpg",
            "at": [
              138,
              576,
              46
            ],
            "cap": "villi · ×10"
          },
          {
            "img": "zoom/microvilli-em.jpg",
            "at": [
              192,
              600,
              92
            ],
            "cap": "microvilli · ×20"
          }
        ],
        "labels": [
          {
            "t": "together: up to 600× the area of a flat tube",
            "plate": true,
            "tx": [
              162,
              712
            ],
            "anchor": "middle"
          }
        ],
        "dwell": 700,
        "scroll": 150,
        "fade": 520
      },
      {
        "at": 10,
        "cam": {
          "cx": 175,
          "cy": 640,
          "w": 280
        },
        "anim": "maltase",
        "animBox": [
          48,
          600,
          194,
          126
        ],
        "label": "Where maltase works: embedded in the membrane of the microvilli, so maltose is split on the cell surface and the glucose goes straight in",
        "insets": [
          {
            "img": "zoom/microvilli-tem.jpg",
            "at": [
              118,
              486,
              140
            ],
            "cap": "the brush border of one cell: every microvillus\nis wrapped in the membrane where maltase sits",
            "capTop": true,
            "link": [
              0.3,
              0.04,
              0.72,
              0.5
            ]
          }
        ],
        "credit": "micrograph: L. Howard & K. Connolly, Dartmouth, public domain",
        "dwell": 700,
        "scroll": 190,
        "fade": 500,
        "room": 380
      },
      {
        "at": 11,
        "cam": {
          "cx": 175,
          "cy": 640,
          "w": 280
        },
        "img": "zoom/villi-lm.jpg",
        "fixed": [
          100,
          566,
          112
        ],
        "box": [
          100,
          566,
          112,
          219
        ],
        "window": [
          97,
          563,
          118,
          225
        ],
        "soft": 3,
        "label": "Inside a villus: a wall one cell thick, and capillaries and a lacteal running up the middle",
        "credit": "light micrograph, ×70, from the 7.5 deck",
        "labels": [
          {
            "t": "lumen",
            "at": [
              0.68,
              0.14
            ],
            "tx": [
              1.1,
              0.06
            ]
          },
          {
            "t": "epithelium —\none cell thick",
            "at": [
              0.81,
              0.305
            ],
            "tx": [
              1.1,
              0.3
            ]
          },
          {
            "t": "the core: capillaries\nand a lacteal",
            "at": [
              0.18,
              0.55
            ],
            "tx": [
              1.1,
              0.56
            ]
          }
        ],
        "dwell": 700,
        "scroll": 150,
        "fade": 500
      },
      {
        "at": 12,
        "cam": {
          "cx": 206,
          "cy": 602,
          "w": 360
        },
        "keep": true,
        "noback": true,
        "anim": "portal",
        "animBox": [
          140,
          470,
          120,
          220
        ],
        "label": "The hepatic portal vein: absorbed glucose and amino acids go straight to the liver",
        "hide": [
          {
            "organ": "gall-bladder"
          }
        ],
        "spotlight": [
          "liver"
        ]
      }
    ],
    "keys": [
      {
        "t": "absorption",
        "sub": "and digestion is completed",
        "kind": "act",
        "corner": "tl"
      },
      {
        "t": "chyme",
        "kind": "food",
        "corner": "tl"
      }
    ]
  },
  "colon": {
    "organ": "colon",
    "focus": "colon",
    "spotlight": [
      "colon",
      "rectum-anus"
    ],
    "keep": true,
    "noback": true,
    "paint": [
      {
        "organ": "colon",
        "fill": "none",
        "stroke": "#2F6B34",
        "sw": 1.1,
        "opacity": 0.6
      },
      {
        "organ": "rectum-anus",
        "fill": "none",
        "stroke": "#7A4E7A",
        "sw": 1.1,
        "opacity": 0.6
      }
    ],
    "label": "The large intestine: colon, caecum, rectum and anus",
    "labels": [
      {
        "t": "colon",
        "plate": true,
        "at": [
          190,
          566
        ],
        "tx": [
          190,
          536
        ],
        "anchor": "middle"
      },
      {
        "t": "caecum",
        "plate": true,
        "at": [
          98,
          713
        ],
        "tx": [
          98,
          744
        ],
        "anchor": "middle"
      },
      {
        "t": "rectum",
        "plate": true,
        "at": [
          177,
          760
        ],
        "tx": [
          210,
          754
        ],
        "anchor": "start"
      },
      {
        "t": "anus",
        "plate": true,
        "at": [
          177,
          794
        ],
        "tx": [
          210,
          798
        ],
        "anchor": "start"
      }
    ],
    "keys": [
      {
        "t": "reabsorption of water",
        "kind": "act",
        "corner": "tl"
      },
      {
        "t": "chyme → faeces",
        "kind": "food",
        "corner": "tl"
      }
    ]
  },
  "rectum-anus": {
    "organ": "rectum-anus",
    "focus": "rectum-anus",
    "spotlight": [
      "rectum-anus"
    ],
    "keep": true,
    "noback": true,
    "paint": [
      {
        "organ": "rectum-anus",
        "fill": "none",
        "stroke": "#7A4E7A",
        "sw": 0.7,
        "opacity": 0.7
      }
    ],
    "label": "Rectum and anal canal",
    "labels": [
      {
        "t": "rectum — stores faeces",
        "plate": true,
        "at": [
          177,
          764
        ],
        "tx": [
          196,
          756
        ],
        "anchor": "start"
      },
      {
        "t": "anus — egestion",
        "plate": true,
        "at": [
          177,
          796
        ],
        "tx": [
          196,
          800
        ],
        "anchor": "start"
      }
    ],
    "keys": [
      {
        "t": "egestion",
        "kind": "act",
        "corner": "tl"
      },
      {
        "t": "faeces",
        "kind": "food",
        "corner": "tl"
      }
    ]
  }
};
