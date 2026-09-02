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
  "mouth": { "organ": "mouth", "steps": [
    { "at": 0, "img": "zoom/head-section.jpg", "roi": [0.06, 0.52, 0.5, 0.3], "window": [30, 20, 230, 230], "cover": true,
      "label": "The mouth, cut down the middle (side view)", "credit": "Patrick J. Lynch, CC BY 2.5",
      "labels": [
        { "t": "tongue", "at": [0.34, 0.69], "tx": [0.22, 0.79] },
        { "t": "incisors", "at": [0.175, 0.605], "tx": [0.165, 0.505] },
        { "t": "hard palate", "at": [0.30, 0.56], "tx": [0.20, 0.47] },
        { "t": "soft palate", "at": [0.455, 0.60], "tx": [0.43, 0.53] } ] },
    { "at": 3, "window": [54, 6, 156, 214], "px": 11.5,
      "label": "The four types of tooth — from the front, and along the row", "credit": "photographs from the 7.2 deck",
      "imgs": [
        { "img": "photos/incisors-real.jpg", "fixed": [62, 12, 140], "labels": [
          { "t": "canine", "at": [0.15, 0.52], "tx": [0.05, 0.78], "anchor": "start" },
          { "t": "lateral incisor", "at": [0.24, 0.42], "tx": [0.06, 0.22], "anchor": "start" },
          { "t": "central incisors", "at": [0.49, 0.40], "tx": [0.50, 0.14], "anchor": "middle" },
          { "t": "lateral incisor", "at": [0.745, 0.44], "tx": [0.95, 0.22], "anchor": "end" },
          { "t": "canine", "at": [0.86, 0.50], "tx": [0.96, 0.78], "anchor": "end" } ] },
        { "img": "photos/premolars-molars-real.jpg", "fixed": [62, 104, 140], "labels": [
          { "t": "molar", "at": [0.37, 0.33], "tx": [0.22, 0.12], "anchor": "middle" },
          { "t": "molar", "at": [0.57, 0.40], "tx": [0.50, 0.12], "anchor": "middle" },
          { "t": "premolar", "at": [0.76, 0.42], "tx": [0.74, 0.12], "anchor": "middle" },
          { "t": "premolar", "at": [0.90, 0.50], "tx": [0.86, 0.90], "anchor": "middle" } ] } ] },
    { "at": 4, "img": "photos/tooth-cut-open.jpg", "roi": [0, 0, 1, 1], "window": [54, 6, 156, 214], "cover": true,
      "label": "A real molar cut in half: enamel, dentine and the pulp cavity", "credit": "photograph from the 7.2 deck" },
    { "at": 5, "img": "photos/tooth-decay.jpg", "fixed": [58, 62, 148], "window": [52, 54, 160, 92],
      "label": "Tooth decay: a healthy tooth, then caries, then a cavity reaching the pulp", "credit": "photograph from the 7.2 deck" } ] },

  "salivary-glands": { "organ": "salivary-glands",
    "img": "zoom/salivary-glands-illus.jpg", "window": [66, 24, 160, 240], "fit": true, "full": true,
    "label": "The three pairs of salivary glands, and the ducts that carry saliva into the mouth", "credit": "OpenStax College, CC BY 3.0" },

  "epiglottis": { "organ": "epiglottis",
    "img": "zoom/head-section.jpg", "w": 1200, "h": 1319, "fixed": [-50, -155, 432], "window": [0, 0, 340, 296], "anim": "swallow",
    "label": "Swallowing: the larynx rises and the epiglottis tips over the windpipe, so the bolus goes down the oesophagus", "credit": "Patrick J. Lynch, CC BY 2.5" },

  "oesophagus": { "organ": "oesophagus", "anim": "peristalsis", "noback": true,
    "label": "Peristalsis: the wall itself moves — circular muscle contracts behind the bolus and relaxes ahead of it" },

  "stomach": { "organ": "stomach", "steps": [
    { "at": 0, "anim": "churn", "animBox": [202, 438, 80, 72], "noback": true,
      "label": "Churning: waves of contraction mix the food with gastric juice — physical digestion" },
    { "at": 1, "img": "zoom/stomach-wall-block.jpg", "fixed": [154, 372, 168], "window": [148, 366, 180, 236],
      "label": "The stomach wall: the lining with its gastric glands, then three layers of muscle", "credit": "Encyclopædia Britannica, from the 7.3 deck",
      "labels": [
        { "t": "gastric glands\nmake gastric juice", "at": [0.40, 0.36], "tx": [0.70, 0.20] },
        { "t": "mucus-coated lining", "at": [0.30, 0.10], "tx": [0.62, 0.05] },
        { "t": "three muscle layers\nrunning in different\ndirections", "at": [0.45, 0.72], "tx": [0.68, 0.62] } ] },
    { "at": 4, "img": "photos/stomach-inside.jpg", "fixed": [150, 376, 186], "window": [144, 370, 198, 198],
      "label": "Inside the stomach: the lining is thrown into deep folds, the rugae", "credit": "3-D render from the 7.3 deck",
      "labels": [
        { "t": "from the oesophagus", "at": [0.44, 0.06], "tx": [0.56, 0.05], "anchor": "start" },
        { "t": "rugae — folds of\nthe lining", "at": [0.62, 0.50], "tx": [0.78, 0.20] },
        { "t": "muscular wall", "at": [0.89, 0.60], "tx": [0.70, 0.86] },
        { "t": "chyme leaves\nto the duodenum", "at": [0.11, 0.86], "tx": [0.16, 0.95], "anchor": "start" } ] } ] },

  "liver": { "organ": "liver", "img": "photos/biliary-system-plain.svg", "roi": [0.08, 0, 0.63, 0.53], "fixed": [-8, 362, 340], "window": [-24, 346, 372, 349], "spot": "liver",
    "label": "The liver makes bile; the gall bladder stores it and the bile duct carries it to the duodenum", "credit": "Biliary system, public domain",
    "labels": "BILIARY" },
  "gall-bladder": { "organ": "gall-bladder", "img": "photos/biliary-system-plain.svg", "roi": [0.25, 0.28, 0.18, 0.18], "fixed": [-8, 362, 340], "window": [-24, 346, 372, 349], "spot": "gall-bladder",
    "label": "The gall bladder stores bile; the bile duct carries it to the duodenum", "credit": "Biliary system, public domain",
    "labels": "BILIARY" },
  "pancreas": { "organ": "pancreas", "img": "photos/biliary-system-plain.svg", "roi": [0.36, 0.4, 0.53, 0.3], "fixed": [-8, 362, 340], "window": [-24, 346, 372, 349], "spot": "pancreas",
    "label": "The pancreas: pancreatic juice reaches the duodenum through the pancreatic duct", "credit": "Biliary system, public domain",
    "labels": "BILIARY" },
  "duodenum": { "organ": "duodenum", "img": "photos/biliary-system-plain.svg", "roi": [0.45, 0.45, 0.32, 0.5], "fixed": [-8, 362, 340], "window": [-24, 346, 372, 349], "spot": "duodenum",
    "label": "The duodenum, where bile and pancreatic juice arrive", "credit": "Biliary system, public domain",
    "labels": "BILIARY" },

  "ileum-villi": { "organ": "ileum-villi", "img": "zoom/small-intestine-illus.jpg", "roi": [0.41, 0.08, 0.4, 0.78], "full": true,
    "label": "The small intestine: duodenum, jejunum and ileum", "credit": "OpenStax College, CC BY 3.0, labels ours",
    "labels": [
      { "t": "duodenum", "at": [0.50, 0.20], "tx": [0.66, 0.08] },
      { "t": "jejunum", "at": [0.58, 0.38], "tx": [0.80, 0.32] },
      { "t": "ileum", "at": [0.55, 0.64], "tx": [0.80, 0.66] },
      { "t": "large intestine,\nbehind", "at": [0.41, 0.58], "tx": [0.16, 0.56] } ] },
  "colon": { "organ": "colon", "img": "zoom/large-intestine-illus.jpg", "roi": [0.25, 0.02, 0.55, 0.96], "pad": 0.25,
    "label": "The large intestine: colon, rectum and anus", "credit": "OpenStax College, CC BY 3.0, labels ours",
    "labels": [
      { "t": "colon", "at": [0.72, 0.42], "tx": [0.50, 0.30], "anchor": "start" },
      { "t": "caecum", "at": [0.30, 0.63], "tx": [0.245, 0.73], "anchor": "start" },
      { "t": "appendix", "at": [0.37, 0.72], "tx": [0.245, 0.81], "anchor": "start" },
      { "t": "rectum", "at": [0.50, 0.82], "tx": [0.62, 0.86], "anchor": "start" },
      { "t": "anus", "at": [0.50, 0.965], "tx": [0.62, 0.98], "anchor": "start" } ] },
  "rectum-anus": { "organ": "rectum-anus", "img": "zoom/large-intestine-illus.jpg", "roi": [0.46, 0.62, 0.12, 0.36], "box": [157, 741, 35, 71], "pad": 1,
    "label": "Rectum and anal canal", "credit": "OpenStax College, CC BY 3.0, labels ours",
    "labels": [
      { "t": "rectum — stores faeces", "at": [0.50, 0.80], "tx": [0.62, 0.78] },
      { "t": "anus — egestion", "at": [0.50, 0.965], "tx": [0.62, 0.97] } ] }
};
/* the biliary plate's labels are shared by its four stations */
(function () {
  var B = [
    { t:'liver', at:[0.30, 0.20], tx:[0.10, 0.09], anchor:'start' },
    { t:'gall bladder', at:[0.34, 0.40], tx:[0.10, 0.55], anchor:'start' },
    { t:'bile duct', at:[0.47, 0.50], tx:[0.52, 0.35], anchor:'start' },
    { t:'pancreas', at:[0.70, 0.55], tx:[0.66, 0.80], anchor:'start' },
    { t:'pancreatic duct', at:[0.62, 0.53], tx:[0.64, 0.34], anchor:'start' },
    { t:'duodenum', at:[0.42, 0.86], tx:[0.32, 0.99], anchor:'start' }
  ];
  ['liver', 'gall-bladder', 'pancreas', 'duodenum'].forEach(function (k) { window.ZOOM_DETAIL[k].labels = B; });
})();
