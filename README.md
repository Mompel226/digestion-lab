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

**Two real animations** lifted from the lesson slides — a bolus travelling by
peristalsis, and absorption at the villi — converted from ~5 MB GIFs to H.264
video under 300 KB each.

**Ten animated diagrams** — peristalsis, churning, emulsification, the villus,
the surface-area multiplier, starch digestion, swallowing, water reabsorption,
egestion vs excretion, and the tooth section.

**Real images from the lesson slides** — photographs, micrographs and electron
micrographs taken from the class PowerPoints, so revision matches what was taught.
Click any image to see it full size.

Progress is saved in the browser. **Reset** clears it.

---

## The three modes

| Mode | Attempts | Shows the answer? | For |
|---|---|---|---|
| **Mastery** (default) | unlimited | no — only which parts are wrong | homework; students must reach 95/95 to hand in |
| **Test** | one per question | no | a timed check under exam conditions |
| **Practice** 🔒 | unlimited | yes, with explanations | revision, after you release the password |

Each mode keeps its own record, so a Test attempt never wipes Mastery progress.

## How the answers are kept out of the page

This is a static site: everything is downloaded to the student's browser. So the
answers are not shipped at all.

* Every question carries a **salted SHA-256 hash** of its correct answer. That is
  enough to mark an answer right or wrong, and not enough to read it.
* The plain answers and the explanations sit in **`js/data/keys.enc.js`**, an
  AES-GCM blob. It opens only with the practice password, which is typed into the
  browser, used to derive a key locally with PBKDF2, and **never sent anywhere**.
* Ordering questions ship **pre-shuffled**, so the file never lists the right sequence.

Honest limits: multiple-choice and drag questions have small answer spaces, so a
student who opens the developer tools and writes a brute-force loop could work
some out. Typed answers are genuinely hard to reverse. And once you release the
password, it will be shared — release it when you mean to.

### Changing the password each year

```bash
node tools/rekey.mjs "Biology2026" "Biology2027"
git commit -am "new password for 2027" && git push
```

The master content is never needed for this, and the answers never touch the disk.

### Editing a question

The only file with the answers in plain text is **`../digestion-lab-source/stations.master.js`**,
which deliberately lives *outside* this repo so it is never published. Edit it, then:

```bash
node tools/build.mjs "Biology2026"
```

which regenerates `js/data/stations.js` (presentation + hashes) and `js/data/keys.enc.js`.

## Collecting who has finished

`apps-script/Code.gs` is a small Apps Script web app that appends a row to a Google
Sheet each time a student hands in. Set-up instructions are in the file. Paste the
deployed `/exec` URL into **`js/config.js`** as `submitUrl`.

Each submission carries a **completion code** derived from the student's name, class
and score. The Apps Script recomputes it and writes `CHECK` in the Code-check column
if the two disagree, so an edited payload is visible at a glance. If the network call
fails, the student still gets the code on screen to paste into Google Classroom.

---

## Layout

```
index.html            the page
css/app.css           design system (Dr Mompel's IGCSE deck palette)
js/anatomy.js         the clickable plate: organ tagging, labels, the food tour
js/figures.js         the animated "See it" diagrams
js/engine.js          the activity engine (the seven question types)
js/app.js             wiring: plate ⇄ panel ⇄ rail, progress, tour
js/config.js          your Apps Script URL and class list — the two things you edit
js/marking.js         hash-based marking, and the password unlock
js/terms.js           the colour language of the Learn tab
js/data/stations.js   GENERATED — presentation + hashes, no answers
js/data/keys.enc.js   GENERATED — the answers, encrypted
tools/build.mjs       master content -> the two generated files
tools/rekey.mjs       change the practice password
apps-script/Code.gs   the submission receiver
js/data/photos.js     which photographs appear at which station
js/data/anatomy-art.js  the body plate (public domain)
js/data/figure-art.js   the tooth and villus plates (public domain)
assets/photos/        the images, with CREDITS.md recording where each came from
assets/video/         the two animations, each with a poster frame
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
- **Highlighted words are actionable.** A dotted underline opens a small picture
  in place (what fats, protein or iron actually look like); a solid underline
  jumps to the station that explains the term. Which treatment a word gets is set
  in `PEEK` and `JUMP` in `js/terms.js`. A word never links to the station you are
  already on.
- **Images only where they earn it.** The alimentary canal station has none: the
  plate on the left already is the canal, so it offers "trace it on the diagram"
  instead of repeating itself as a picture.
- **Colour coding never stands alone.** Each of the five processes wears a chip
  carrying its number in the sequence, so the coding survives colour blindness and
  greyscale printing — and the number teaches the order, which is examinable.
  Green is not used for meaning anywhere, because green is the app's own colour.
  Seven categories, inside the six-to-eight limit the research supports. Every ink
  clears WCAG AA on both backgrounds; the weakest measured on the live page is
  5.78:1. See the notes at the top of `js/terms.js`.
- Anything simplified is disclosed in the **How to use** panel.

## Credits

Anatomical plates are public domain from Wikimedia Commons: the body by
Mariana Ruiz (LadyofHats) and Jmarchn, the tooth section by Jak, the villus by
Snow93. Photographs and micrographs come from the class lesson slides — see
`assets/photos/CREDITS.md`. All labels, animations, questions, code and page
design are original to this simulation.
