/* ============================================================
   config.js — the three settings Dr Mompel changes.
   ============================================================ */
window.LAB_CONFIG = {

  /* Where a finished student's submission is sent.
     Paste the /exec URL of your deployed Apps Script web app here.
     Leave it empty and the app still works — students get a completion
     code to paste into Google Classroom instead. */
  submitUrl: 'https://script.google.com/macros/s/AKfycbzwjMHaa88OL_GzR8wZ2mV6a8rs1CKYahbW5iOTQPyzWzCGIrAZPApGsP2oujK34tRc/exec',

  /* Shown on the submission form so you can tell classes apart. */
  classes: ['9A', '9B', '9C', '9D', '9E', 'Other'],

  /* Signing in, so a hand-in can be attributed.

     These labs are public: anyone in the world can use one, and should. But only your own
     students' results should reach your spreadsheet, so a hand-in is recorded when the
     Google account that signed in is on your Students tab, and ignored otherwise. Everyone
     still gets their completion code on screen.

     Paste the OAuth Client ID here (it ends .apps.googleusercontent.com), and the SAME id
     into CLIENT_ID at the top of the Apps Script. Leave it empty and nothing is recorded
     anywhere — the lab still works, and everyone still gets a code.

     To make one: console.cloud.google.com ▸ APIs & Services ▸ Credentials ▸ Create
     credentials ▸ OAuth client ID ▸ Web application, with
     https://mompel226.github.io as an authorised JavaScript origin. */
  googleClientId: '',
};
