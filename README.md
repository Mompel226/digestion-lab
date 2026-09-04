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

## The two modes

| Mode | Attempts | Shows the answer? | For |
|---|---|---|---|
| **Mastery** (default) | unlimited | **no** — only which parts are wrong | homework; every question must be right before it can be handed in |
| **Test** | one per question | **no** | a check under exam conditions; hand in whatever you scored |

The answers are never shown, in either mode, and are not in the site at all (see below).
Each mode keeps its own record, so a Test never wipes Mastery progress.

### Closing Mastery during a test

Mastery lets a student check as often as they like. If it is open during a test they can
grind the answers out there and then walk through the test knowing them, and the test
measures nothing. So Mastery can be **closed for everyone, live**:

> Open the Sheet the submissions go to ▸ **Settings** tab ▸ untick **Mastery open**.

Every open page picks that up within a couple of minutes — on load, whenever the tab is
brought back, and every three minutes — puts the student into Test mode, and greys out
Mastery with the message you typed in **B2**. Tick it again afterwards. No redeploy, no
new version of the site.

Two honest limits. It needs the Apps Script set up (below): with no `submitUrl` there is
nothing to ask, and Mastery stays open. And it is a classroom control, not security — this
is a static site, and a determined student can work around anything the browser is told.
It stops the ordinary case and makes the rule visible, which is what it is for. If the
Sheet cannot be reached the page keeps the last answer it had, so a dropped connection
never locks a class out of their homework.

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

## Collecting the results, in a Google Sheet

`apps-script/Code.gs` does two jobs: it records a row every time a student hands in, and it
serves the Mastery switch above. Set-up is about five minutes.

1. **New Google Sheet.** The name does not matter.
2. **Copy its ID** out of the address bar — `docs.google.com/spreadsheets/d/`**`THIS BIT`**`/edit`.
3. **Extensions ▸ Apps Script.** Delete what is there, paste in the whole of
   [`apps-script/Code.gs`](apps-script/Code.gs) (reproduced below so you can copy it from
   here), put the ID into `SHEET_ID`, and Save.
4. **Run ▸ `setup`.** Pick `setup` in the function list and press Run. Authorise it when
   asked — it is your own script, on your own Sheet. It builds both tabs.
5. **Deploy ▸ New deployment ▸ Web app**, with *Execute as* **Me** and *Who has access*
   **Anyone**. Deploy, then copy the `/exec` URL.
6. **Paste that URL into `js/config.js`** as `submitUrl`, commit, push. Done.

Whenever you edit the script afterwards: **Deploy ▸ Manage deployments ▸ pencil ▸ Version:
New version ▸ Deploy.** Editing alone changes nothing — the old version keeps serving.

You get two tabs. **Submissions**: when, name, class, mode, score, out of, %, the completion
code, whether that code checks out, any flags, and the per-station breakdown. **Settings**:
the *Mastery open* checkbox and the message shown when it is closed.

Every submission carries a **completion code** derived from the name, class and score. The
script recomputes it and writes `CHECK` if the two disagree, so an edited payload is visible
at a glance. If the network call fails the student still gets the code on screen to paste
into Google Classroom, so no work is lost.

### Putting the marks into Google Classroom

Classroom will only let a script grade work that **the same script created** — an assignment
you made by hand in the Classroom UI cannot be graded through the API. So there are two
routes, and the first needs no setup at all:

**A — the code (works today).** Set a Classroom assignment that asks for the completion code.
Students paste theirs in; you have the Sheet beside it as the record of who scored what.

**B — marks pushed automatically.** The script creates the assignment, and then writes each
student's score into it whenever you ask:

1. In the Apps Script editor: **Services (+) ▸ Classroom ▸ Add**.
2. Put your course ID in `COURSE_ID` — the long number in the Classroom address bar,
   `classroom.google.com/c/`**`THIS BIT`**.
3. Run **`createAssignment`** once. It publishes the assignment and writes its ID into the
   Settings tab.
4. After a test, run **`pushGrades`**. It takes each student's best score from the Sheet and
   patches it into their submission, matching on name against the class list. A name it
   cannot match is left alone and listed in the log — nothing is guessed.

The whole file, ready to copy:

```javascript
/**
 * Digestion Lab — submissions, and the Mastery switch
 * ---------------------------------------------------
 * One Apps Script does two jobs:
 *   1. records a row in a Google Sheet every time a student hands in;
 *   2. tells the site whether Mastery mode is open, so you can close it
 *      for everyone while a test is running.
 *
 * SET UP  (about five minutes, once)
 *  1. New Google Sheet. Name does not matter.
 *  2. Copy its ID out of the address bar:
 *       docs.google.com/spreadsheets/d/ >>>THIS BIT<<< /edit
 *     and paste it into SHEET_ID below.
 *  3. Extensions ▸ Apps Script. Delete what is there, paste this file, Save.
 *  4. Run ▸ setup   (choose "setup" in the function list, press Run).
 *     Authorise it when asked. It builds both tabs for you.
 *  5. Deploy ▸ New deployment ▸ Web app
 *       Execute as:      Me
 *       Who has access:  Anyone
 *     Deploy, copy the /exec URL.
 *  6. Paste that URL into js/config.js as submitUrl, then commit and push.
 *
 * WHENEVER YOU EDIT THIS FILE: Deploy ▸ Manage deployments ▸ pencil ▸
 * Version: New version ▸ Deploy. Editing alone changes nothing — the old
 * version keeps serving until you redeploy.
 */

var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
var TAB_SUBMISSIONS = 'Submissions';
var TAB_SETTINGS    = 'Settings';
var EXPECTED_TOTAL  = 113;        // questions in the app; update if you add or remove some

/* ============================================================
   1. Recording a hand-in
   ============================================================ */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.app !== 'digestion-lab') return _text('ignored');

    var name  = String(d.name || '').trim().slice(0, 80);
    var form  = String(d.form || '').trim().slice(0, 20);
    var mode  = String(d.mode || '').trim().slice(0, 20);
    var score = Number(d.score) || 0;
    var total = Number(d.total) || 0;

    /* Recompute the code from the fields we were sent. If it does not match the
       code the page produced, the payload was edited on the way here. */
    var genuine = (_code(name, form, score + '/' + total) === String(d.code || ''));

    var flags = [];
    if (!genuine) flags.push('CODE MISMATCH');
    if (total !== EXPECTED_TOTAL) flags.push('NOT ALL QUESTIONS');
    if (mode === 'mastery' && score !== total) flags.push('MASTERY NOT COMPLETE');

    _sheet().appendRow([
      new Date(), name, form, mode,
      score, total, total ? Math.round(score / total * 100) : 0,
      d.code || '', genuine ? 'ok' : 'CHECK', flags.join('; '),
      JSON.stringify(d.stations || {})
    ]);
    return _text('recorded');
  } catch (err) {
    return _text('error: ' + err);
  }
}

/* ============================================================
   2. The Mastery switch
   The site asks this on load, when the tab is brought back, and every few
   minutes. Untick "Mastery open" in the Settings tab and every student is
   in Test mode within a couple of minutes, with no redeploy.
   ============================================================ */
function doGet(e) {
  var q = (e && e.parameter) || {};
  if (q.q === 'gate') {
    var body = JSON.stringify({ masteryOpen: _masteryOpen(), note: _note() });
    /* JSONP: the site is served from github.io, a different origin to this script */
    if (q.callback) return _js(q.callback + '(' + body + ');');
    return _json(body);
  }
  return _text('Digestion Lab endpoint is running. Mastery open: ' + _masteryOpen());
}

function _settings() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(TAB_SETTINGS);
  if (!sh) {
    sh = ss.insertSheet(TAB_SETTINGS);
    sh.getRange('A1').setValue('Mastery open').setFontWeight('bold');
    sh.getRange('B1').insertCheckboxes().setValue(true);
    sh.getRange('A2').setValue('Message when closed').setFontWeight('bold');
    sh.getRange('B2').setValue('Mastery is closed while the test is running.');
    sh.getRange('A4').setValue('Untick B1 during a test: everyone is put into Test mode within a couple of minutes.');
    sh.setColumnWidth(1, 190); sh.setColumnWidth(2, 380);
  }
  return sh;
}
function _masteryOpen() {
  try { return _settings().getRange('B1').getValue() !== false; }
  catch (err) { return true; }         /* if the sheet is unreachable, do not lock anyone out */
}
function _note() {
  try { return String(_settings().getRange('B2').getValue() || ''); }
  catch (err) { return ''; }
}

/* ============================================================
   3. Helpers
   ============================================================ */
function _sheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(TAB_SUBMISSIONS) || ss.insertSheet(TAB_SUBMISSIONS);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['When', 'Name', 'Class', 'Mode', 'Score', 'Out of', '%',
                  'Code', 'Code check', 'Flags', 'Per station']);
    sh.setFrozenRows(1);
    sh.getRange('A1:K1').setFontWeight('bold');
    sh.setColumnWidth(1, 150); sh.setColumnWidth(2, 190); sh.setColumnWidth(11, 320);
  }
  return sh;
}

/** Must stay identical to completionCode() in js/app.js. */
function _code(name, form, score) {
  var raw = String(name).trim().toLowerCase() + '|' + form + '|' + score + '|digestion-lab';
  var s1 = 0, s2 = 0;
  for (var i = 0; i < raw.length; i++) {
    s1 = (s1 * 31 + raw.charCodeAt(i)) >>> 0;
    s2 = (s2 ^ (s1 + i)) >>> 0;
  }
  var A = 'ACDEFGHJKLMNPQRTUVWXY3479';
  function chunk(n) {
    var o = '';
    for (var i = 0; i < 4; i++) { o += A.charAt(n % A.length); n = Math.floor(n / A.length); }
    return o;
  }
  return 'DL-' + chunk(s1) + '-' + chunk(s2);
}

function _text(m) { return ContentService.createTextOutput(m).setMimeType(ContentService.MimeType.TEXT); }
function _json(m) { return ContentService.createTextOutput(m).setMimeType(ContentService.MimeType.JSON); }
function _js(m)   { return ContentService.createTextOutput(m).setMimeType(ContentService.MimeType.JAVASCRIPT); }

/** Run this once from the editor: builds both tabs and proves the Sheet ID works. */
function setup() {
  _sheet(); _settings();
  Logger.log('Both tabs are ready. Mastery open: ' + _masteryOpen());
}

/* ============================================================
   4. OPTIONAL — putting the marks into Google Classroom
   ------------------------------------------------------------
   Classroom will only let a script grade work that the SAME script created.
   So the assignment has to be made from here, once, and then marks can be
   pushed to it whenever you like.

   To switch this on:
     a. Services (+) ▸ Classroom ▸ Add.        (the advanced service)
     b. Put your course ID in COURSE_ID below. It is the long number in the
        Classroom address bar: classroom.google.com/c/ >>>THIS BIT<<<
     c. Run  createAssignment  once. It writes the new assignment's ID into
        the Settings tab for you.
     d. After a test, run  pushGrades.

   pushGrades matches a student by name against the class list. A name that
   does not match is left alone and listed in the log — nothing is guessed.
   ============================================================ */
var COURSE_ID   = '';                 // e.g. '742193845012'
var MAX_POINTS  = 113;                // usually the same as EXPECTED_TOTAL

function createAssignment() {
  if (!COURSE_ID) throw new Error('Put your course ID in COURSE_ID first.');
  var work = Classroom.Courses.CourseWork.create({
    title: 'Digestion Lab — Topic 7',
    description: 'Open the lab, work through every station, then hand in.',
    materials: [{ link: { url: 'https://mompel226.github.io/digestion-lab/' } }],
    workType: 'ASSIGNMENT',
    state: 'PUBLISHED',
    maxPoints: MAX_POINTS
  }, COURSE_ID);
  _settings().getRange('A3').setValue('Classroom assignment ID').setFontWeight('bold');
  _settings().getRange('B3').setValue(work.id);
  Logger.log('Created assignment ' + work.id + ' — the ID is now in the Settings tab.');
}

function pushGrades() {
  var workId = String(_settings().getRange('B3').getValue() || '');
  if (!COURSE_ID || !workId) throw new Error('Run createAssignment first.');

  /* the class list, by tidied-up name */
  var roster = {}, page = null;
  do {
    var r = Classroom.Courses.Students.list(COURSE_ID, { pageSize: 100, pageToken: page });
    (r.students || []).forEach(function (s) { roster[_tidy(s.profile.name.fullName)] = s.userId; });
    page = r.nextPageToken;
  } while (page);

  /* the best score each student has handed in */
  var rows = _sheet().getDataRange().getValues(), best = {};
  for (var i = 1; i < rows.length; i++) {
    var name = _tidy(rows[i][1]), score = Number(rows[i][4]) || 0;
    if (!name) continue;
    if (!(name in best) || score > best[name]) best[name] = score;
  }

  var done = 0, missing = [];
  Object.keys(best).forEach(function (name) {
    var userId = roster[name];
    if (!userId) { missing.push(name); return; }
    var subs = Classroom.Courses.CourseWork.StudentSubmissions.list(COURSE_ID, workId, { userId: userId });
    var sub = (subs.studentSubmissions || [])[0];
    if (!sub) { missing.push(name + ' (no submission)'); return; }
    Classroom.Courses.CourseWork.StudentSubmissions.patch(
      { assignedGrade: best[name], draftGrade: best[name] },
      COURSE_ID, workId, sub.id, { updateMask: 'assignedGrade,draftGrade' });
    done++;
  });
  Logger.log('Graded ' + done + '. Not matched: ' + (missing.join(', ') || 'none'));
}

function _tidy(s) { return String(s || '').toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim(); }
```

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
js/data/keys.enc.js   GENERATED — the answers, encrypted
tools/build.mjs       master content -> the two generated files
tools/rekey.mjs       kept from when answers could be released; nothing uses it now
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
