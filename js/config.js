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

  /* Is Mastery available? Mastery lets a student check as often as they like, so with
     it open during a test they can grind the answers out there and then walk the test
     knowing them.

     With submitUrl set, the Sheet decides this live and you can ignore the two settings
     below — untick "Mastery open" in the Settings tab and every open page follows within
     two minutes.

     With no submitUrl, THIS is the switch: set masteryOpen to false, commit and push, and
     Mastery is closed for everyone on their next load. Set it back to true afterwards. */
  masteryOpen: true,
  masteryNote: 'Mastery is closed while the test is running.',

  /* The answers are not in the site at all, in any mode, so there is no
     password to set here. Students are told which parts are wrong and have
     to work out the rest.

     Mastery can be closed for everyone while a test is running: tick or
     untick "Mastery open" in the Settings tab of the Sheet above. The page
     asks the same web app for that setting, so no redeploy is needed. */
};
