/* ==========================================================================
   dashboard.js — draws the progress dashboard from the saved progress data.
   ========================================================================== */
(function () {
  'use strict';

  function timeAgo(t) {
    const s = Math.round((Date.now() - t) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' hr ago';
    return new Date(t).toLocaleDateString();
  }

  function draw() {
    const S = window.Synapse, st = S.state(), lv = S.levelInfo();
    const keys = Object.keys(S.MODULES);

    // Level card
    document.getElementById('level-orb').style.setProperty('--p', lv.pct);
    document.getElementById('level-num').textContent = lv.number;
    document.getElementById('level-title').textContent = lv.title;
    document.getElementById('level-next').textContent = lv.next
      ? (lv.next.min - st.xp) + ' XP to Level ' + (lv.number + 1) + ': ' + lv.next.title
      : 'Maximum level reached. Amazing work!';
    document.getElementById('xp-total').textContent = st.xp;

    // Stats
    let lessons = 0, acts = 0, quizzes = 0, lessonTotal = 0;
    keys.forEach(function (m) {
      const p = S.moduleProgress(m);
      lessons += p.lessonsDone; lessonTotal += S.MODULES[m].lessons;
      if (p.activity) acts++;
      if (p.quizPassed) quizzes++;
    });
    document.getElementById('st-lessons').textContent = lessons + '/' + lessonTotal;
    document.getElementById('st-acts').textContent = acts + '/3';
    document.getElementById('st-quiz').textContent = quizzes + '/3';
    document.getElementById('st-badges').textContent = Object.keys(st.badges).length + '/' + S.BADGES.length;

    // Module rings (circumference of r=52 is about 326.7)
    const C = 2 * Math.PI * 52;
    document.getElementById('rings').innerHTML = keys.map(function (m) {
      const mod = S.MODULES[m], p = S.moduleProgress(m);
      const q = st.quizzes[m];
      return '<a class="card ring-card mod-' + m + '" href="' + mod.page + '">' +
        '<svg class="ring" viewBox="0 0 130 130" role="img" aria-label="' + mod.title + ' ' + p.pct + ' percent complete">' +
        '<circle class="track" cx="65" cy="65" r="52"/>' +
        '<circle class="bar" cx="65" cy="65" r="52" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - p.pct / 100)).toFixed(1) + '"/>' +
        '<text x="65" y="73" text-anchor="middle">' + p.pct + '%</text></svg>' +
        '<h3>' + mod.title + '</h3>' +
        '<ul class="checklist">' +
        '<li class="' + (p.lessonsDone === mod.lessons ? 'ok' : '') + '">Lessons: ' + p.lessonsDone + ' of ' + mod.lessons + '</li>' +
        '<li class="' + (p.activity ? 'ok' : '') + '">Interactive activity</li>' +
        '<li class="' + (p.quizPassed ? 'ok' : '') + '">Quiz' + (q ? ' (best ' + q.best + '/5)' : '') + '</li>' +
        '</ul></a>';
    }).join('');

    // Badges
    document.getElementById('badges').innerHTML = S.BADGES.map(function (b) {
      const got = st.badges[b.id];
      return '<div class="card badge-tile ' + (got ? 'earned' : 'locked') + '">' +
        '<div class="badge-hex" style="--c1:' + b.c1 + ';--c2:' + b.c2 + '">' + S.icon(got ? b.icon : 'lock') + '</div>' +
        '<h3>' + b.name + '</h3><p>' + b.desc + '</p>' +
        '<small>' + (got ? 'Earned ' + new Date(got).toLocaleDateString() : 'Locked') + '</small></div>';
    }).join('');

    // Activity log
    const log = document.getElementById('log');
    log.innerHTML = st.log.length ? st.log.slice(0, 12).map(function (e) {
      return '<li><span>' + e.text + '<br><span class="when">' + timeAgo(e.t) + '</span></span>' +
        (e.xp ? '<span class="plus">+' + e.xp + ' XP</span>' : '') + '</li>';
    }).join('') : '<li><span class="muted">No activity yet. Start with <a href="fundamentals.html">AI Fundamentals</a>!</span></li>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    draw();
    document.addEventListener('synapse:change', draw);

    // Two-step reset so progress isn't wiped by accident.
    const btn = document.getElementById('reset');
    let armed = false, timer;
    btn.addEventListener('click', function () {
      if (!armed) {
        armed = true;
        btn.textContent = 'Click again to confirm reset';
        timer = setTimeout(function () { armed = false; btn.textContent = 'Reset my progress'; }, 4000);
        return;
      }
      clearTimeout(timer);
      armed = false;
      btn.textContent = 'Reset my progress';
      window.Synapse.reset();
    });
  });
})();
