# Digestion Lab

An interactive revision simulation of **Cambridge IGCSE Biology 0610, Topic 7 — Human nutrition**.

**Live:** https://mompel226.github.io/digestion-lab/

Students click any organ on an anatomical plate of the digestive system and work
through that station: what the exam wants, what it actually looks like, and a set
of questions. A meal can also be sent along the whole alimentary canal, stopping
at each organ in turn.

---

## What is in it

**13 stations** — a balanced diet, the alimentary canal overview, mouth and teeth, salivary glands,
epiglottis, oesophagus, stomach, liver and gall bladder, pancreas, small intestine (duodenum,
jejunum and ileum), large intestine, rectum and anus, and a Molecules Lab that reaches back
into Topics 3, 4 and 5.

**107 questions** across seven kinds:

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

**Thirteen drawn diagrams** — peristalsis, churning, emulsification, the villus,
the surface-area multiplier, starch digestion, swallowing, water reabsorption,
egestion vs excretion, and the tooth section.

**The plate follows the text.** As a station is read, the camera on the anatomical plate flies to the organ and a professional illustration of that organ fades in on the plate itself, registered over its outline. As the Learn text is scrolled, the picture gives way to the next one — the four tooth types photographed and labelled, a real molar cut open, the stomach wall — and three processes are animated on the plate: swallowing on the head section, peristalsis on the oesophagus, churning on the stomach. The liver, gall bladder, pancreas and duodenum share one labelled plate on which the organ being read about is spotlit. Nothing pops up over the page, and nothing on the plate is repeated in the text.

**Real images from the lesson slides** — photographs, micrographs and electron
micrographs taken from the class PowerPoints, so revision matches what was taught.
Click any image to see it full size.

Progress is saved in the browser. **Reset** clears it.

---

## How it works

Check as often as you like. You are told which parts are wrong, **never the answer** — you
have to work it out. Keep going until every question is right, then hand in. You can also
hand in part way, to show the work so far; the row says `progress` rather than `complete`.

There are no modes and no test: this is a revision app, and a test in a page the student
controls could not be enforced anyway. What is worth having is the record of the work —
how many checks it took and how many were right first time — and that is what a hand-in
carries.

## How the answers are kept out of the page

This is a static site: everything is downloaded to the student's browser. So the answers
are not shipped at all.

* Every question carries a **salted SHA-256 hash** of its correct answer. That is enough
  to mark an answer right or wrong, and not enough to read it.
* There is **no mode that reveals an answer**, so nothing in the site needs the plain text
  and nothing in the site contains it. `js/marking.js` can say *wrong*, and cannot say *what*.
* Ordering questions ship **pre-shuffled**, so the file never lists the right sequence.

Honest limit: multiple-choice and drag questions have small answer spaces, so a student
with the developer tools open and a brute-force loop could work some out. Typed answers
are genuinely hard to reverse.

### Editing a question

The only file with the answers in plain text is **`../digestion-lab-source/stations.master.js`**,
which deliberately lives *outside* this repo so it is never published. Edit it, then:

```bash
node tools/build.mjs
```

which regenerates `js/data/stations.js` (presentation + hashes). Add `--vault` if you want
the encrypted answer key written out for your own checking — the site never loads it, and
`.gitignore` keeps it out of the repo.

## Collecting the results

The marks do not live here. One Google Sheet collects **every** Biology Lab — a tab per lab,
with your Google Classroom rosters beside them. One script, one deployment, one URL.

**Set it up once, in the hub repo:**
[IGCSE-revision-app ▸ The marks spreadsheet](https://github.com/Mompel226/IGCSE-revision-app#the-marks-spreadsheet)
— five minutes, with both files in full, ready to copy.

Then paste the deployed `/exec` URL into [`js/config.js`](js/config.js) as `submitUrl`, and
the OAuth Client ID as `googleClientId`. A hand-in is then written to the **Digestion** tab,
with the work behind the score: how many checks it took, how many were right first time, how
long they had been at it, and the per-station breakdown.

**The lab is public and stays public.** Anyone in the world can work through it and hand in.
Signing in is what lets a hand-in be attributed: it is recorded only when the Google account
that signed in is on the teacher's Students tab, and ignored otherwise — nothing is written
down for anyone else, not even their email. Everybody gets their completion code on screen.

Leave either setting empty and nothing is recorded anywhere; the lab still works and still
gives out codes.

Every submission carries a **completion code** derived from the name, class and score,
salted with the lab's id. The script recomputes it and writes `CHECK` if the two disagree,
so an edited payload is visible at a glance.

---

## Layout

```
index.html            the page
css/app.css           design system (Dr Mompel's IGCSE deck palette)
js/anatomy.js         the clickable plate: organ tagging, labels, the food tour
js/zoom.js            the plate follows the text: camera, scroll-linked steps, labels, spotlight
js/data/zoom.js       what each station shows on the plate, step by step, with credits
js/plateanim.js       swallowing, peristalsis and churning, drawn on the plate itself
js/figures.js         the animated "See it" diagrams
js/engine.js          the activity engine (the seven question types)
js/app.js             wiring: plate ⇄ panel ⇄ rail, progress, tour
js/config.js          your Apps Script URL and class list — the two things you edit
js/marking.js         hash-based marking — it can say wrong, not what
js/terms.js           the colour language of the Learn tab
js/data/stations.js   GENERATED — presentation + hashes, no answers
tools/build.mjs       master content -> the two generated files
tools/rekey.mjs       kept from when answers could be released; nothing uses it now
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

- The **exam answer is the main content**, badged Core, `S` (Supplement) or
  `extension`. Everything past it — links to other 0610 topics, what IB adds, and
  the real science 0610 leaves out — sits in one tagged "Going further" section
  and never displaces it; nothing appears in both. Stations with a big exam
  footprint also carry an amber "In the exam — what to write here" box.
- Syllabus wording: *physical digestion* (not "mechanical"), *faeces*, *oesophagus*,
  British spellings throughout.
- Labels are laid out at runtime with a collision pass, so **no two labels can
  overlap** on the plate or on any diagram, whatever is shown or hidden.
- **Highlighted words are actionable.** A dotted underline opens a small picture
  in place (what fats, protein or iron actually look like); a solid underline
  scrolls to the exact sentence that explains the term, flashes it, and offers a
  way back. Which treatment a word gets is set
  in `PEEK` and `JUMP` in `js/terms.js`. A word never links to the station you are
  already on.
- **No image is ever upscaled.** Each carries a `maxw` equal to half its own pixel
  width, so on a 2x screen it is drawn at most 1:1. A small sharp picture beats a
  large soft one; if a source is too small to be useful at any size, it is dropped
  rather than stretched.
- **Every image must pass a test: does it teach something the words cannot?**
  Food groups get a picture of the foods, because a student may not know tofu is
  protein. Vitamins and minerals get a picture of the *deficiency*, because that
  is the memorable and examinable part. Water gets nothing.
- **Images only where they earn it.** The alimentary canal station has none: the
  plate on the left already is the canal, so it offers "trace it on the diagram"
  instead of repeating itself as a picture.
- **Colour coding never stands alone.** Each of the five processes wears a chip
  carrying its number in the sequence, so the coding survives colour blindness and
  greyscale printing — and the number teaches the order, which is examinable.
  Green is not used for meaning anywhere, because green is the app's own colour.
  Seven categories, inside the six-to-eight limit the research supports. Every ink
  clears WCAG AA on both backgrounds; the weakest measured on the live page is
  4.64:1. See the notes at the top of `js/terms.js`.
- Anything simplified is disclosed in the **How to use** panel.

## Credits

The high-fibre foods photograph is by **formulatehealth** from Wikimedia Commons,
**CC BY 2.0** — attribution required, and it is credited both in
`assets/photos/CREDITS.md` and inside the pop-up where the image appears.


Anatomical plates are public domain from Wikimedia Commons: the body by
Mariana Ruiz (LadyofHats) and Jmarchn, the tooth section by Jak, the villus by
Snow93. Photographs and micrographs come from the class lesson slides — see
`assets/photos/CREDITS.md`. All labels, animations, questions, code and page
design are original to this simulation.
