/* ============================================================
   marking.js — marks answers without holding them.

   Each question ships a salted SHA-256 hash of its correct answer.
   We hash what the student did and compare. A wrong answer can be
   reported as wrong; a right answer cannot be read out of the file.

   The plain answers and the explanations live in an AES-GCM blob that
   only opens with the teacher password. That password is typed into
   this browser, used to derive a key locally, and never sent anywhere.

   The canonical forms below must stay byte-identical to tools/build.mjs.
   ============================================================ */
(function (global) {
  'use strict';

  var enc = new TextEncoder();
  var vault = null;                       /* set once unlocked */

  function hex(buf) {
    var b = new Uint8Array(buf), s = '';
    for (var i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0');
    return s;
  }
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().trim()
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ').replace(/[.,;:!?]+$/, '').replace(/^(the|a|an)\s+/, '');
  }
  function H(parts) {
    var msg = (global.ANSWER_SALT || '') + '|' + parts.join('|');
    return crypto.subtle.digest('SHA-256', enc.encode(msg)).then(function (d) {
      return hex(d).slice(0, 32);
    });
  }

  /* ---------- canonical response for each type ---------- */
  function canon(a, id, r) {
    switch (a.type) {
      case 'mcq':   return H([id, 'mcq', r.slice().sort(function (x, y) { return x - y; }).join(',')]);
      case 'order': return H([id, 'order', r.join('~')]);
      case 'match': return H([id, 'match', r.map(function (p) { return p.join('-'); }).sort().join(',')]);
      case 'sort':  return H([id, 'sort', r.map(function (p) { return norm(p[0]) + '=' + p[1]; }).sort().join(',')]);
      case 'drag':  return H([id, 'drag', r.map(function (t, j) { return j + '=' + norm(t); }).join(',')]);
      case 'ph':    return H([id, 'ph', Number(r).toFixed(1)]);
    }
    return Promise.resolve('');
  }

  /* Returns {correct, score, total, gaps?} — never the answer itself. */
  function check(a, id, response) {
    if (a.type === 'blank') {
      var keys = Object.keys(a.k);
      return Promise.all(keys.map(function (g) {
        return H([id, 'g' + g, norm(response[g])]).then(function (h) {
          return a.k[g].indexOf(h) >= 0;
        });
      })).then(function (oks) {
        var right = oks.filter(Boolean).length, gaps = {};
        keys.forEach(function (g, i) { gaps[g] = oks[i]; });
        return { correct: right === keys.length, score: right, total: keys.length, gaps: gaps };
      });
    }
    if (a.type === 'ph') {
      return canon(a, id, response).then(function (h) {
        var ok = a.k.indexOf(h) >= 0;
        return { correct: ok, score: ok ? 1 : 0, total: 1 };
      });
    }
    return canon(a, id, response).then(function (h) {
      var ok = h === a.k;
      return { correct: ok, score: ok ? 1 : 0, total: 1 };
    });
  }

  /* ---------- unlocking practice mode ---------- */
  function fromHex(s) {
    var a = new Uint8Array(s.length / 2);
    for (var i = 0; i < a.length; i++) a[i] = parseInt(s.substr(i * 2, 2), 16);
    return a;
  }
  function fromB64(s) {
    var bin = atob(s), a = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return a;
  }

  function unlock(password) {
    var V = global.ANSWER_VAULT;
    if (!V) return Promise.reject(new Error('no vault'));
    return crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: fromHex(V.salt), iterations: V.iter, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (key) {
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromHex(V.iv) }, key, fromB64(V.ct));
      })
      .then(function (plain) {
        vault = JSON.parse(new TextDecoder().decode(plain));
        return true;
      });
      /* a wrong password fails the GCM auth tag and rejects — nothing to leak */
  }

  global.Marking = {
    check: check,
    norm: norm,
    unlock: unlock,
    isUnlocked: function () { return !!vault; },
    lock: function () { vault = null; },
    answer: function (id) { return vault ? vault[id] : null; }
  };
})(window);
