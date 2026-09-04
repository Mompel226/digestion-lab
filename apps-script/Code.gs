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
    if (d.complete === false) flags.push('PROGRESS — not finished');

    _sheet().appendRow([
      new Date(), name, form, mode,
      score, total, total ? Math.round(score / total * 100) : 0,
      d.complete === false ? 'progress' : 'complete',
      Number(d.checks) || '', Number(d.firstTime) || '', _since(d.from),
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
    sh.appendRow(['When', 'Name', 'Class', 'Mode', 'Score', 'Out of', '%', 'Finished?',
                  'Checks', 'Right first time', 'Working since',
                  'Code', 'Code check', 'Flags', 'Per station']);
    sh.setFrozenRows(1);
    sh.getRange('A1:O1').setFontWeight('bold');
    sh.setColumnWidth(1, 150); sh.setColumnWidth(2, 190); sh.setColumnWidth(15, 340);
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

/** "3 days" / "40 minutes" — how long ago the first question was checked. */
function _since(iso) {
  if (!iso) return '';
  var then = new Date(iso);
  if (isNaN(then)) return '';
  var mins = Math.round((new Date() - then) / 60000);
  if (mins < 90) return mins + ' min';
  if (mins < 60 * 36) return Math.round(mins / 60) + ' h';
  return Math.round(mins / 1440) + ' days';
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
    if (!name) continue;                       /* the best score anyone handed in, finished or not */
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
