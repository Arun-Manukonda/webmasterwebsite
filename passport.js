/* ==========================================================================
   passport.js — draws the Explorer Passport (progress dashboard).
   ========================================================================== */
(function () {
  'use strict';

  function when(t) {
    const s = Math.round((Date.now() - t) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' hr ago';
    return new Date(t).toLocaleDateString();
  }

  function draw() {
    const W = window.Wayfinder, st = W.state(), r = W.rankInfo();

    document.getElementById('pp-rank').textContent = r.title;
    document.getElementById('pp-ranknum').textContent = r.number;
    document.getElementById('pp-xp').textContent = st.xp;
    document.getElementById('pp-next').textContent = r.next
      ? (r.next.min - st.xp) + ' XP to reach ' + r.next.title
      : 'Top rank reached. You made it to the summit!';
    document.getElementById('pp-bar').style.width = r.pct + '%';
    document.getElementById('pp-streak').textContent = W.streak();
    document.getElementById('pp-stamps').textContent = Object.keys(st.stamps).length + ' / ' + W.STAMPS.length;
    document.getElementById('pp-overall').textContent = Math.round(W.overall().frac * 100) + '%';

    // Rank ladder
    document.getElementById('pp-ladder').innerHTML = W.RANKS.map(function (rk, i) {
      const cls = i < r.index ? 'past' : (i === r.index ? 'now' : '');
      return '<li class="' + cls + '"><span>' + (i + 1) + '</span><b>' + rk.title + '</b><small>' + rk.min + ' XP</small></li>';
    }).join('');

    // Trail logbook
    document.getElementById('pp-trails').innerHTML = W.ORDER.map(function (k) {
      const tr = W.TRAILS[k], p = W.trailProgress(k), q = st.quizzes[k];
      return '<a class="card trail-log trail-' + k + '" href="' + tr.page + '">' +
        '<div class="tl-head"><h3>' + tr.title + '</h3><span class="tl-pct">' + p.pct + '%</span></div>' +
        '<div class="meter"><span style="width:' + p.pct + '%"></span></div>' +
        '<ul class="ticks">' +
        '<li class="' + (p.lessonsDone === tr.lessons ? 'ok' : '') + '">Waypoints ' + p.lessonsDone + '/' + tr.lessons + '</li>' +
        '<li class="' + (p.activity ? 'ok' : '') + '">Challenge</li>' +
        '<li class="' + (p.quizPassed ? 'ok' : '') + '">Checkpoint' + (q ? ' (best ' + q.best + '/5)' : '') + '</li>' +
        '</ul></a>';
    }).join('');

    // Stamps
    document.getElementById('pp-stampgrid').innerHTML = W.STAMPS.map(function (s, i) {
      const got = st.stamps[s.id];
      const tilt = [-6, 4, -3, 7, -5, 3, -2, 5][i % 8];
      return '<div class="stamp ' + (got ? 'got' : 'empty') + '" style="--sc:' + s.color + ';--tilt:' + tilt + 'deg">' +
        '<div class="stamp-ring">' + W.icon(got ? s.icon : 'lock') + '<span>' + s.name + '</span></div>' +
        '<p>' + s.desc + '</p><small>' + (got ? 'Stamped ' + new Date(got).toLocaleDateString() : 'Not yet') + '</small></div>';
    }).join('');

    // Journal
    document.getElementById('pp-log').innerHTML = st.log.length ? st.log.slice(0, 10).map(function (e) {
      return '<li><span>' + e.text + '<small>' + when(e.t) + '</small></span>' + (e.xp ? '<b>+' + e.xp + '</b>' : '') + '</li>';
    }).join('') : '<li><span>Your journal is empty. Head to <a href="trail-think.html">Trail 1</a> to begin!</span></li>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    draw();
    document.addEventListener('wayfinder:change', draw);
    const btn = document.getElementById('pp-reset');
    let armed = false, timer;
    btn.addEventListener('click', function () {
      if (!armed) {
        armed = true; btn.textContent = 'Click again to erase all progress';
        timer = setTimeout(function () { armed = false; btn.textContent = 'Start over'; }, 4000);
        return;
      }
      clearTimeout(timer); armed = false; btn.textContent = 'Start over';
      window.Wayfinder.reset();
    });
  });
})();
