/* ==========================================================================
   module.js — interactivity for the three module pages:
   lesson completion buttons, the lesson sidebar, quizzes, and activities.
   The page tells us which module it is with <body data-module="...">.
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const m = document.body.dataset.module;
    if (!m || !window.Synapse) return;
    const C = window.SYNAPSE_CONTENT;

    Synapse.visit(m);

    // ---- Lesson "mark complete" buttons --------------------------------------
    document.querySelectorAll('.lesson-done').forEach(function (btn) {
      btn.addEventListener('click', function () { Synapse.completeLesson(m, +btn.dataset.lesson); });
    });

    function sync() {
      const s = Synapse.state();
      const p = Synapse.moduleProgress(m);
      document.querySelectorAll('.lesson-done').forEach(function (btn) {
        const done = !!s.lessons[m + '-' + btn.dataset.lesson];
        btn.disabled = done;
        btn.classList.toggle('is-done', done);
        btn.textContent = done ? '✓ Lesson complete' : 'Mark lesson complete · +' + Synapse.XP.lesson + ' XP';
      });
      document.querySelectorAll('.lesson-nav a[data-step]').forEach(function (a) {
        const step = a.dataset.step;
        let done = false;
        if (step.indexOf('lesson-') === 0) done = !!s.lessons[m + '-' + step.slice(7)];
        if (step === 'activity') done = p.activity;
        if (step === 'quiz') done = p.quizPassed;
        a.classList.toggle('done', done);
      });
    }
    document.addEventListener('synapse:change', sync);
    sync();

    // ---- Quiz ------------------------------------------------------------------
    const form = document.querySelector('form.quiz');
    if (form) initQuiz(form, C.quizzes[m]);

    function initQuiz(form, qs) {
      function draw() {
        form.innerHTML = qs.map(function (q, i) {
          return '<fieldset class="q" data-i="' + i + '"><legend><span class="q-num">' + (i + 1) + '</span><span>' + q.q + '</span></legend>' +
            q.options.map(function (o, j) {
              return '<label class="opt"><input type="radio" name="q' + i + '" value="' + j + '" required><span>' + o + '</span></label>';
            }).join('') +
            '<p class="q-feedback" hidden></p></fieldset>';
        }).join('') +
          '<div class="quiz-actions"><button type="submit" class="btn btn-primary">Check my answers</button>' +
          '<button type="button" class="btn btn-ghost quiz-retry" hidden>Try again</button></div>' +
          '<p class="quiz-result" role="status" aria-live="polite"></p>';
      }
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
        const r = Synapse.recordQuiz(m, correct, qs.length);
        const out = form.querySelector('.quiz-result');
        out.className = 'quiz-result ' + (r.passed ? 'pass' : 'fail');
        out.textContent = 'You scored ' + correct + ' / ' + qs.length + '. ' +
          (r.passed ? 'Passed! ' : 'You need 4 / 5 to pass. Review the explanations and try again. ') +
          (r.gain ? '+' + r.gain + ' XP earned.' : 'Best score: ' + r.best + ' / ' + qs.length + '.');
        form.querySelector('[type="submit"]').hidden = true;
        form.querySelector('.quiz-retry').hidden = false;
        out.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      form.addEventListener('click', function (e) {
        if (e.target.classList.contains('quiz-retry')) { draw(); form.scrollIntoView({ behavior: 'smooth' }); }
      });
    }

    // ---- Choice-card activity (used by the sorter and the ethics judge) ---------
    function initChoices(root, data, label) {
      const items = data.items;
      root.innerHTML = '<div class="choice-list">' + items.map(function (it, i) {
        return '<div class="choice-card" data-i="' + i + '"><p class="choice-text">' + it.text + '</p>' +
          '<div class="choice-btns" role="group" aria-label="Choose an answer for scenario ' + (i + 1) + '">' +
          data.options.map(function (o, j) {
            return '<button type="button" class="chip' + (o.tone ? ' chip-' + o.tone : '') + '" data-j="' + j + '">' + o.label + '</button>';
          }).join('') +
          '</div><p class="choice-fb" aria-live="polite"></p></div>';
      }).join('') + '</div><p class="choice-progress"></p>';

      const solved = new Set();
      const prog = root.querySelector('.choice-progress');

      root.addEventListener('click', function (e) {
        const b = e.target.closest('.chip');
        if (!b) return;
        const card = b.closest('.choice-card');
        const i = +card.dataset.i;
        if (solved.has(i)) return;
        const it = items[i];
        const fb = card.querySelector('.choice-fb');
        if (+b.dataset.j === it.answer) {
          solved.add(i);
          card.classList.add('solved');
          b.classList.add('picked');
          card.querySelectorAll('.chip').forEach(function (c) { c.disabled = true; });
          fb.innerHTML = '<strong>Right!</strong> ' + it.why;
        } else {
          card.classList.remove('shake');
          void card.offsetWidth; // restart the animation
          card.classList.add('shake');
          fb.innerHTML = '<strong>Not quite.</strong> Hint: ' + it.hint;
        }
        update();
      });

      function update() {
        prog.textContent = solved.size + ' of ' + items.length + ' solved';
        if (solved.size === items.length) {
          const first = Synapse.completeActivity(m, label);
          prog.textContent += first ? '. Activity complete!' : '. Nice replay!';
        }
      }
      update();
    }

    const sorter = document.getElementById('sorter');
    if (sorter) initChoices(sorter, C.sorter, 'Learning-type sorter');
    const judge = document.getElementById('judge');
    if (judge) initChoices(judge, C.judge, 'Green, Yellow, Red');

    // ---- Next-word predictor demo (Fundamentals, lesson 3) -------------------------
    const nw = document.getElementById('nextword');
    if (nw) {
      const data = C.nextWord;
      const slider = nw.querySelector('#nw-temp');
      const tempOut = nw.querySelector('#nw-temp-val');
      const bars = nw.querySelector('.nw-bars');
      const sentence = nw.querySelector('.nw-sentence');
      let probs = [];

      // Temperature reshapes the probabilities: p^(1/T), then normalize.
      function compute() {
        const T = +slider.value;
        const raw = data.words.map(function (x) { return Math.pow(x.p, 1 / T); });
        const sum = raw.reduce(function (a, b) { return a + b; }, 0);
        probs = raw.map(function (r) { return r / sum; });
        tempOut.textContent = T.toFixed(1);
        bars.innerHTML = data.words.map(function (x, i) {
          const pct = (probs[i] * 100).toFixed(1);
          return '<div class="nw-row" data-i="' + i + '"><span class="nw-word">' + x.w + '</span>' +
            '<span class="nw-track"><span style="width:' + pct + '%"></span></span><span class="nw-pct">' + pct + '%</span></div>';
        }).join('');
      }
      function sample() {
        let r = Math.random(), i = 0;
        while (i < probs.length - 1 && r > probs[i]) { r -= probs[i]; i++; }
        sentence.innerHTML = data.prompt + ' <mark>' + data.words[i].w + '</mark>';
        bars.querySelectorAll('.nw-row').forEach(function (row) { row.classList.toggle('hit', +row.dataset.i === i); });
      }
      slider.addEventListener('input', compute);
      nw.querySelector('#nw-sample').addEventListener('click', sample);
      compute();
    }

    // ---- Prompt builder (Tools) ----------------------------------------------------
    const pb = document.getElementById('prompt-builder');
    if (pb) {
      const $ = function (sel) { return pb.querySelector(sel); };
      const fields = ['#pb-role', '#pb-task', '#pb-context', '#pb-format'];
      const useBtn = $('#pb-use');

      function build() {
        const role = $('#pb-role').value;
        let task = $('#pb-task').value.trim();
        const context = $('#pb-context').value.trim();
        const format = $('#pb-format').value;
        const cons = Array.prototype.map.call(pb.querySelectorAll('.checks input:checked'), function (c) { return c.value; });

        if (task && !/[.?!]$/.test(task)) task += '.';
        const parts = [];
        if (role) parts.push('Act as ' + role + '.');
        if (task) parts.push(task);
        if (context) parts.push('Context: ' + context);
        if (format) parts.push('Format: respond as ' + format + '.');
        if (cons.length) parts.push('Also: ' + cons.join('; ') + '.');
        $('#pb-preview').textContent = parts.length ? parts.join('\n') : 'Your prompt will appear here as you fill in the fields...';

        const checks = [
          [!!role, 'Pick a role so the AI knows what expert to be.'],
          [task.length >= 15, 'Describe the task in a full sentence (15+ characters).'],
          [context.length >= 20, 'Add context: your grade, class, or what you already know.'],
          [!!format, 'Choose a format for the answer.'],
          [cons.length > 0, 'Add at least one constraint.']
        ];
        const score = checks.filter(function (c) { return c[0]; }).length;
        pb.querySelectorAll('.strength i').forEach(function (seg, i) { seg.classList.toggle('on', i < score); });
        $('#pb-score').textContent = ['Empty', 'Weak', 'Getting there', 'Okay', 'Strong', 'Excellent'][score] + ' (' + score + '/5)';
        $('.tips').innerHTML = checks.filter(function (c) { return !c[0]; }).map(function (c) { return '<li>' + c[1] + '</li>'; }).join('') ||
          '<li>Great prompt! Every part is there.</li>';
        useBtn.disabled = score < 4;
      }

      fields.forEach(function (f) { $(f).addEventListener('input', build); });
      pb.querySelectorAll('.checks input').forEach(function (c) { c.addEventListener('change', build); });
      useBtn.addEventListener('click', function () {
        const text = $('#pb-preview').textContent;
        try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch (e) { /* ignore */ }
        const first = Synapse.completeActivity(m, 'Prompt builder');
        $('#pb-msg').textContent = 'Prompt copied to your clipboard. ' + (first ? 'Activity complete!' : 'Try it in an AI tool your school allows.');
      });
      build();
    }
  });
})();
