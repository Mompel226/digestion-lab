# Digestion Lab

An interactive revision simulation of **Cambridge IGCSE Biology 0610, Topic 7 — Human nutrition**.

**Live:** https://mompel226.github.io/digestion-lab/

Students click any organ on an anatomical plate of the digestive system and work
through that station: what the exam wants, what it actually looks like, and a set
of questions. A meal can also be sent along the whole alimentary canal, stopping
at each organ in turn.

---

## What is in it

**14 stations** — the alimentary canal overview, mouth and teeth, salivary glands,
epiglottis, oesophagus, stomach, liver, gall bladder, pancreas, duodenum, small
intestine, large intestine, rectum and anus, and a Molecules Lab that reaches back
into Topics 3, 4 and 5.

**95 questions** across seven kinds:

| Type | What the student does |
|---|---|
| Fill the gaps | types the missing words; spelling variants are accepted |
| Drag & drop | drags terms onto the right structure or stage |
| Multiple choice | picks an answer; every option explains itself afterwards |
| Put in order | sequences the steps of a process |
| Match up | pairs enzyme with substrate, product or pH |
| Sort into groups | e.g. physical vs chemical digestion, egestion vs excretion |
| Set the pH | moves a slider and watches the active site distort and denature |

**Ten animated diagrams** — peristalsis, churning, emulsification, the villus,
the surface-area multiplier, starch digestion, swallowing, water reabsorption,
egestion vs excretion, and the tooth section.

**Real images from the lesson slides** — photographs, micrographs and electron
micrographs taken from the class PowerPoints, so revision matches what was taught.
Click any image to see it full size.

Progress is saved in the browser. **Reset** clears it.

---

## Layout

```
index.html            the page
css/app.css           design system (Dr Mompel's IGCSE deck palette)
js/anatomy.js         the clickable plate: organ tagging, labels, the food tour
js/figures.js         the animated "See it" diagrams
js/engine.js          the activity engine (the seven question types)
js/app.js             wiring: plate ⇄ panel ⇄ rail, progress, tour
js/data/stations.js   ALL teaching content and questions — edit this to change wording
js/data/photos.js     which photographs appear at which station
js/data/anatomy-art.js  the body plate (public domain)
js/data/figure-art.js   the tooth and villus plates (public domain)
assets/photos/        the images, with CREDITS.md recording where each came from
```

### To change a question or a piece of wording

Everything a student reads lives in `js/data/stations.js`. Each station has
`learn.exam` (the mark-scheme answer), `learn.real` (above-syllabus notes),
`learn.golden` (the mistake to avoid), `keywords`, and `activities`.

After editing, bump the `?v=` numbers in `index.html` so browsers pick up the
change instead of serving a cached copy.

### To swap a photograph

Drop a replacement into `assets/photos/` with the same filename. Nothing else
needs to change.

---

## Design rules this follows

- The **exam answer is the main content**; true-but-above-level science sits in a
  separate blue "Real science — not examined" box and never displaces it.
- Syllabus wording: *physical digestion* (not "mechanical"), *faeces*, *oesophagus*,
  British spellings throughout.
- Labels are laid out at runtime with a collision pass, so **no two labels can
  overlap** on the plate or on any diagram, whatever is shown or hidden.
- Anything simplified is disclosed in the **How to use** panel.

## Credits

Anatomical plates are public domain from Wikimedia Commons: the body by
Mariana Ruiz (LadyofHats) and Jmarchn, the tooth section by Jak, the villus by
Snow93. Photographs and micrographs come from the class lesson slides — see
`assets/photos/CREDITS.md`. All labels, animations, questions, code and page
design are original to this simulation.
