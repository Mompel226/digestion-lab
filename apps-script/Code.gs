/**
 * Digestion Lab — submission receiver
 * ----------------------------------
 * Collects a row every time a student hands in completed work.
 *
 * SET UP (about five minutes)
 *  1. Make a new Google Sheet. Call the first tab  Submissions.
 *  2. Copy its ID out of the URL:
 *       docs.google.com/spreadsheets/d/ >>>THIS BIT<<< /edit
 *     and paste it into SHEET_ID below.
 *  3. Extensions ▸ Apps Script, paste this file in, Save.
 *  4. Deploy ▸ New deployment ▸ Web app
 *       Execute as:        Me
 *       Who has access:    Anyone
 *     Deploy, authorise, and copy the /exec URL.
 *  5. Paste that URL into js/config.js as submitUrl, then push.
 *
 * Re-deploy as a NEW VERSION whenever you edit this file, or the old
 * code keeps running.
 */

var SHEET_ID  = 'PASTE_YOUR_SHEET_ID_HERE';
var TAB_NAME  = 'Submissions';
var EXPECTED_TOTAL = 95;          // update if you add or remove questions

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.app !== 'digestion-lab') return _ok('ignored');

    var sheet = _sheet();
    var name  = String(d.name || '').trim().slice(0, 80);
    var form  = String(d.form || '').trim().slice(0, 20);
    var score = Number(d.score) || 0;
    var total = Number(d.total) || 0;

    /* Recompute the code from the fields we were sent. If it does not match
       the code the page produced, the payload was edited on the way here. */
    var expected = _code(name, form, score + '/' + total);
    var genuine  = (expected === String(d.code || ''));
    var complete = (score === total && total === EXPECTED_TOTAL);

    var flags = [];
    if (!genuine)  flags.push('CODE MISMATCH');
    if (!complete) flags.push('NOT COMPLETE');

    sheet.appendRow([
      new Date(),
      name,
      form,
      score + '/' + total,
      d.mode || '',
      d.code || '',
      genuine ? 'ok' : 'CHECK',
      flags.join('; '),
      JSON.stringify(d.stations || {})
    ]);
    return _ok('recorded');
  } catch (err) {
    return _ok('error: ' + err);
  }
}

/** Lets you open the /exec URL in a browser to confirm it is live. */
function doGet() {
  return _ok('Digestion Lab submission endpoint is running.');
}

/* ---------- helpers ---------- */

function _sheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(TAB_NAME) || ss.insertSheet(TAB_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['When', 'Name', 'Class', 'Score', 'Mode',
                  'Code', 'Code check', 'Flags', 'Per station']);
    sh.setFrozenRows(1);
    sh.getRange('A1:I1').setFontWeight('bold');
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

function _ok(msg) {
  return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.TEXT);
}

/** Run this once from the editor to check the Sheet ID works. */
function testSetup() {
  _sheet().appendRow([new Date(), 'TEST ROW', '—', '0/0', '—', '—', '—', 'delete me', '{}']);
  Logger.log('Wrote a test row. If you can see it, the Sheet ID is right.');
}
