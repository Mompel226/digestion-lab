/* ============================================================
   config.js — the two settings Dr Mompel changes.
   ============================================================ */
window.LAB_CONFIG = {

  /* Where a finished student's submission is sent.
     Paste the /exec URL of your deployed Apps Script web app here.
     Leave it empty and the app still works — students get a completion
     code to paste into Google Classroom instead. */
  submitUrl: '',

  /* Shown on the submission form so you can tell classes apart. */
  classes: ['9A', '9B', '9C', '9D', '9E', 'Other'],

  /* The practice-mode password is NOT here — it is never in the site.
     It only exists as the key to js/data/keys.enc.js.
     To change it for a new year:   node tools/rekey.mjs            */
};
