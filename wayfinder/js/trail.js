/* ==========================================================================
   trail.js — interactivity on the three trail pages:
   waypoint completion, the trail sidebar, checkpoint quizzes, and the
   three challenges (Teach the Machine, Hallucination Hunt, Privacy Check).
   The page names its trail with <body data-trail="...">.
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const t = document.body.dataset.trail;
    if (!t || !window.Wayfinder) return;
    const W = window.Wayfinder;
    const C = window.WAYFINDER_CONTENT;
    W.visit(t);

    // ---- Waypoint buttons and sidebar --------------------------------------------
    document.querySelectorAll('.waypoint-done').forEach(function (btn) {
      btn.addEventListener('click', function () { W.completeLesson(t, +btn.dataset.lesson); });
    });
    function sync() {
      const s = W.state(), p = W.trailProgress(t);
      document.querySelectorAll('.waypoint-done').forEach(function (btn) {
        const done = !!s.lessons[t + '-' + btn.dataset.lesson];
        btn.disabled = done;
        btn.classList.toggle('is-done', done);
        btn.textContent = done ? '✓ Waypoint reached' : 'I\'ve got it: mark waypoint · +20 XP';
      });
      document.querySelectorAll('.trail-steps a[data-step]').forEach(function (a) {
        const st = a.dataset.step;
        let done = false;
        if (st.indexOf('lesson-') === 0) done = !!s.lessons[t + '-' + st.slice(7)];
        if (st === 'activity') done = p.activity;
        if (st === 'quiz') done = p.quizPassed;
        a.classList.toggle('done', done);
      });
    }
    document.addEventListener('wayfinder:change', sync);
    sync();

    // ---- Checkpoint quiz ----------------------------------------------------------------
    const form = document.querySelector('form.quiz');
    if (form) {
      const qs = C.quizzes[t];
      const draw = function () {
        form.innerHTML = qs.map(function (q, i) {
          return '<fieldset class="q" data-i="' + i + '"><legend><span class="q-num">' + (i + 1) + '</span><span>' + q.q + '</span></legend>' +
            q.options.map(function (o, j) {
              return '<label class="opt"><input type="radio" name="q' + i + '" value="' + j + '" required><span>' + o + '</span></label>';
            }).join('') + '<p class="q-feedback" hidden></p></fieldset>';
        }).join('') +
          '<div class="quiz-actions"><button type="submit" class="btn btn-primary">Check my answers</button>' +
          '<button type="button" class="btn btn-ghost quiz-retry" hidden>Try again</button></div>' +
          '<p class="quiz-result" role="status" aria-live="polite"></p>';
      };
      draw();
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        let correct = 0;
        qs.forEach(function (q, i) {
          const fs = form.querySelector('[data-i="' + i + '"]');
          const picked = form.querySelector('input[name="q' + i + '"]:checked');
          const ok = picked && +picked.value === q.answer;
          if (ok) correct++;
          fs.classList.add(ok ? 'right' : 'wrong');
          fs.querySelectorAll('.opt')[q.answer].classList.add('is-answer');
          const fb = fs.querySelector('.q-feedback');
          fb.hidden = false;
          fb.innerHTML = (ok ? '<strong>Correct.</strong> ' : '<strong>Not quite.</strong> ') + q.why;
          fs.querySelectorAll('input').forEach(function (x) { x.disabled = true; });
        });
        const r = W.recordQuiz(t, correct, qs.length);
        const out = form.querySelector('.quiz-result');
        out.className = 'quiz-result ' + (r.passed ? 'pass' : 'fail');
        out.textContent = 'You scored ' + correct + ' / ' + qs.length + '. ' +
          (r.passed ? 'Checkpoint cleared! ' : 'You need 4 / 5 to clear the checkpoint. Read the explanations and try again. ') +
          (r.gain ? '+' + r.gain + ' XP.' : 'Best score: ' + r.best + ' / ' + qs.length + '.');
        form.querySelector('[type="submit"]').hidden = true;
        form.querySelector('.quiz-retry').hidden = false;
      });
      form.addEventListener('click', function (e) {
        if (e.target.classList.contains('quiz-retry')) { draw(); form.scrollIntoView({ behavior: 'smooth' }); }
      });
    }

    // ---- Choice cards (Privacy Check) -------------------------------------------------
    const privacy = document.getElementById('privacy');
    if (privacy) {
      const data = C.privacy, items = data.items, solved = new Set();
      privacy.innerHTML = '<div class="choice-list">' + items.map(function (it, i) {
        return '<div class="choice-card" data-i="' + i + '"><p class="choice-text">' + it.text + '</p>' +
          '<div class="choice-btns" role="group" aria-label="Your answer for item ' + (i + 1) + '">' +
          data.options.map(function (o, j) {
            return '<button type="button" class="chip chip-' + o.tone + '" data-j="' + j + '">' + o.label + '</button>';
          }).join('') + '</div><p class="choice-fb" aria-live="polite"></p></div>';
      }).join('') + '</div><p class="challenge-status"></p>';
      const status = privacy.querySelector('.challenge-status');
      const update = function () {
        status.textContent = solved.size + ' of ' + items.length + ' sorted correctly';
        if (solved.size === items.length) status.textContent += W.completeActivity(t, 'Privacy Check') ? '. Challenge complete!' : '. Nice replay!';
      };
      privacy.addEventListener('click', function (e) {
        const b = e.target.closest('.chip');
        if (!b) return;
        const card = b.closest('.choice-card'), i = +card.dataset.i, it = items[i];
        if (solved.has(i)) return;
        const fb = card.querySelector('.choice-fb');
        if (+b.dataset.j === it.answer) {
          solved.add(i);
          card.classList.add('solved');
          b.classList.add('picked');
          card.querySelectorAll('.chip').forEach(function (c) { c.disabled = true; });
          fb.innerHTML = '<strong>Right.</strong> ' + it.why;
        } else {
          card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
          fb.innerHTML = '<strong>Think again.</strong> Hint: ' + it.hint;
        }
        update();
      });
      update();
    }

    // ---- Hallucination Hunt -------------------------------------------------------------
    const hunt = document.getElementById('hunt');
    if (hunt) {
      const h = C.hunt;
      const body = hunt.querySelector('.ai-answer');
      body.innerHTML = h.claims.map(function (c, i) {
        return '<button type="button" class="claim" data-i="' + i + '" aria-pressed="false">' + c.text + '</button>';
      }).join(' ');
      const notes = hunt.querySelector('.hunt-notes');
      const status = hunt.querySelector('.challenge-status');
      body.addEventListener('click', function (e) {
        const b = e.target.closest('.claim');
        if (!b) return;
        const on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.classList.remove('hit', 'miss', 'oops');
      });
      hunt.querySelector('#hunt-check').addEventListener('click', function () {
        let hits = 0, misses = 0, oops = 0;
        const lines = [];
        h.claims.forEach(function (c, i) {
          const b = body.querySelector('[data-i="' + i + '"]');
          const flagged = b.getAttribute('aria-pressed') === 'true';
          b.classList.remove('hit', 'miss', 'oops');
          if (c.fake && flagged) { hits++; b.classList.add('hit'); lines.push('<li class="n-hit"><strong>Caught it:</strong> ' + c.note + '</li>'); }
          else if (c.fake && !flagged) { misses++; b.classList.add('miss'); }
          else if (!c.fake && flagged) { oops++; b.classList.add('oops'); lines.push('<li class="n-oops"><strong>This one checks out:</strong> "' + c.text + '" is accurate.</li>'); }
        });
        notes.innerHTML = lines.join('');
        const fakes = h.claims.filter(function (c) { return c.fake; }).length;
        if (hits === fakes && oops === 0) {
          status.textContent = 'You found all ' + fakes + ' invented claims. ' + (W.completeActivity(t, 'Hallucination Hunt') ? 'Challenge complete!' : 'Sharp eyes!');
        } else {
          status.textContent = 'Found ' + hits + ' of ' + fakes + ' invented claims' + (oops ? ', and flagged ' + oops + ' true claim' + (oops > 1 ? 's' : '') : '') + '. Adjust your flags and check again.';
        }
      });
    }

    // ---- Teach the Machine (nearest-neighbor classifier) ---------------------------------
    const canvas = document.getElementById('knn');
    if (canvas) initKnn(canvas);

    function initKnn(cv) {
      const ctx = cv.getContext('2d');
      const Wd = cv.width, Ht = cv.height, PAD = 44;
      const CLASSES = [{ name: 'Apple', color: '#d9452b' }, { name: 'Lime', color: '#3e9b4f' }];
      let points = [], tests = [], mode = 0; // 0 = apple, 1 = lime, 2 = mystery
      const status = document.getElementById('knn-status');
      const pred = document.getElementById('knn-pred');

      function nearest(x, y) {
        // k-nearest neighbors with k = 3 (or fewer if we don't have 3 points yet)
        const k = Math.min(3, points.length);
        const sorted = points.slice().sort(function (a, b) {
          return Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y);
        }).slice(0, k);
        const votes = [0, 0];
        sorted.forEach(function (p) { votes[p.c]++; });
        return { c: votes[0] >= votes[1] ? 0 : 1, votes: votes, k: k };
      }
      function counts() {
        return [points.filter(function (p) { return p.c === 0; }).length, points.filter(function (p) { return p.c === 1; }).length];
      }
      function draw() {
        ctx.clearRect(0, 0, Wd, Ht);
        const n = counts();
        // Shade the "decision regions" once both classes have examples.
        if (n[0] && n[1]) {
          const step = 12;
          for (let x = PAD; x < Wd; x += step) {
            for (let y = 0; y < Ht - PAD; y += step) {
              ctx.fillStyle = nearest(x + step / 2, y + step / 2).c === 0 ? 'rgba(217,69,43,.13)' : 'rgba(62,155,79,.13)';
              ctx.fillRect(x, y, step, step);
            }
          }
        }
        // Axes
        ctx.strokeStyle = '#1d2a3a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(PAD, 0); ctx.lineTo(PAD, Ht - PAD); ctx.lineTo(Wd, Ht - PAD); ctx.stroke();
        ctx.fillStyle = '#4b5666'; ctx.font = '14px "DM Sans", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Weight: light → heavy', (Wd + PAD) / 2, Ht - 14);
        ctx.save(); ctx.translate(16, (Ht - PAD) / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText('Color: green → red', 0, 0); ctx.restore();
        // Points
        points.forEach(function (p) {
          ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
          ctx.fillStyle = CLASSES[p.c].color; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
        });
        tests.forEach(function (p) {
          ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
          ctx.fillStyle = '#fffaf0'; ctx.fill();
          ctx.lineWidth = 3; ctx.strokeStyle = CLASSES[p.c].color; ctx.stroke();
          ctx.fillStyle = '#1d2a3a'; ctx.font = 'bold 13px "DM Sans", sans-serif'; ctx.fillText('?', p.x, p.y + 5);
        });
        status.textContent = 'Apples: ' + n[0] + ' · Limes: ' + n[1] + ' · Mystery fruits tested: ' + tests.length +
          '. Goal: at least 3 of each fruit, then test 3 mystery fruits.';
      }
      function add(x, y) {
        if (x < PAD || y > Ht - PAD) return;
        if (mode < 2) {
          points.push({ x: x, y: y, c: mode });
        } else {
          const n = counts();
          if (!n[0] || !n[1]) { pred.textContent = 'Teach the machine at least one apple and one lime first!'; return; }
          const r = nearest(x, y);
          tests.push({ x: x, y: y, c: r.c });
          pred.innerHTML = 'The machine predicts: <strong>' + CLASSES[r.c].name + '</strong> (' + r.votes[r.c] + ' of its ' + r.k +
            ' nearest examples were ' + CLASSES[r.c].name.toLowerCase() + 's).';
        }
        draw();
        const n2 = counts();
        if (n2[0] >= 3 && n2[1] >= 3 && tests.length >= 3) {
          if (W.completeActivity(t, 'Teach the Machine')) pred.innerHTML += ' <strong>Challenge complete!</strong>';
        }
      }
      cv.addEventListener('click', function (e) {
        const r = cv.getBoundingClientRect();
        add((e.clientX - r.left) * (Wd / r.width), (e.clientY - r.top) * (Ht / r.height));
      });
      document.querySelectorAll('[data-knn-mode]').forEach(function (b) {
        b.addEventListener('click', function () {
          mode = +b.dataset.knnMode;
          document.querySelectorAll('[data-knn-mode]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        });
      });
      // Keyboard-friendly option: drop a realistic random example for the current mode.
      document.getElementById('knn-random').addEventListener('click', function () {
        const usable = Wd - PAD, tall = Ht - PAD;
        let x, y;
        if (mode === 0) { x = PAD + usable * (0.55 + Math.random() * 0.4); y = tall * (0.05 + Math.random() * 0.4); }
        else if (mode === 1) { x = PAD + usable * (0.05 + Math.random() * 0.4); y = tall * (0.55 + Math.random() * 0.4); }
        else { x = PAD + usable * Math.random(); y = tall * Math.random(); }
        add(x, y);
      });
      document.getElementById('knn-clear').addEventListener('click', function () {
        points = []; tests = []; pred.textContent = ''; draw();
      });
      draw();
    }
  });
})();
