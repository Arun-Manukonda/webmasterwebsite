/* ==========================================================================
   progress.js — Wayfinder's game engine (loaded on every page)
   Tracks XP, ranks, trail progress, passport stamps, and a daily streak.
   Everything is saved in the browser's localStorage (no login needed).
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'wayfinder-progress-v1';

  const TRAILS = {
    think: { title: 'How AI Thinks',    lessons: 4, page: 'trail-think.html', stamp: 'summit-think' },
    use:   { title: 'Working With AI',  lessons: 4, page: 'trail-use.html',   stamp: 'summit-use' },
    right: { title: 'Using AI Right',   lessons: 4, page: 'trail-right.html', stamp: 'summit-right' }
  };
  const ORDER = ['think', 'use', 'right'];

  const XP = { lesson: 20, activity: 50, quizCorrect: 10, quizPass: 25 };

  const RANKS = [
    { min: 0,   title: 'Trailhead Rookie' },
    { min: 100, title: 'Pathfinder' },
    { min: 250, title: 'Navigator' },
    { min: 400, title: 'Trailblazer' },
    { min: 550, title: 'Summit Scout' }
  ];

  const STAMPS = [
    { id: 'first-step',   name: 'First Step',      desc: 'Finish your first waypoint.',           icon: 'boot',    color: '#e0723b' },
    { id: 'scout',        name: 'Scout',           desc: 'Visit all three trails.',               icon: 'compass', color: '#3b7dd8' },
    { id: 'streak-3',     name: 'Steady Hiker',    desc: 'Learn on 3 different days in a row.',   icon: 'flame',   color: '#d9452b' },
    { id: 'summit-think', name: 'Model Mountain',  desc: 'Complete the How AI Thinks trail.',     icon: 'peak',    color: '#2f6f5e' },
    { id: 'summit-use',   name: 'Prompt Pass',     desc: 'Complete the Working With AI trail.',   icon: 'map',     color: '#3b7dd8' },
    { id: 'summit-right', name: 'Integrity Ridge', desc: 'Complete the Using AI Right trail.',    icon: 'shield',  color: '#8a5cc7' },
    { id: 'sharp-eye',    name: 'Sharp Eye',       desc: 'Score 5/5 on any trail quiz.',          icon: 'eye',     color: '#c99a1e' },
    { id: 'summit-scout', name: 'Summit Scout',    desc: 'Complete all three trails.',            icon: 'flag',    color: '#1d2a3a' }
  ];

  const ICONS = {
    boot:    '<path d="M7 3h5v9l6 2a3 3 0 0 1 2 3v2H4V4z"/><path d="M4 16h16"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.5 4.5-4.5 2.5 2.5-4.5z"/>',
    flame:   '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5 1-2 1-5 0-8z"/>',
    peak:    '<path d="M3 20 10 7l4 6 2-3 5 10z"/><path d="m8.5 10 1.5 2 1.5-1.5"/>',
    map:     '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    shield:  '<path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    eye:     '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    flag:    '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    lock:    '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    plus:    '<path d="M12 5v14M5 12h14"/>',
    up:      '<path d="m6 15 6-6 6 6"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  // ---- Save / load -----------------------------------------------------------
  function blank() {
    return { xp: 0, lessons: {}, activities: {}, quizzes: {}, visited: {}, stamps: {}, days: [], log: [] };
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { /* storage blocked: start fresh */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  let state = load();

  // ---- Daily streak ----------------------------------------------------------
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function streak() {
    let count = 0;
    const d = new Date();
    if (state.days.indexOf(dayKey(d)) === -1) d.setDate(d.getDate() - 1); // today not logged yet
    while (state.days.indexOf(dayKey(d)) !== -1) { count++; d.setDate(d.getDate() - 1); }
    return count;
  }
  function logToday() {
    const k = dayKey(new Date());
    if (state.days.indexOf(k) === -1) { state.days.push(k); state.days = state.days.slice(-60); }
  }

  // ---- Core ------------------------------------------------------------------
  function addLog(text, xp) {
    state.log.unshift({ t: Date.now(), text: text, xp: xp || 0 });
    state.log = state.log.slice(0, 30);
  }
  function rankInfo(xp) {
    if (xp == null) xp = state.xp;
    let i = 0;
    RANKS.forEach(function (r, j) { if (xp >= r.min) i = j; });
    const cur = RANKS[i], next = RANKS[i + 1];
    return { index: i, number: i + 1, title: cur.title, next: next, xp: xp,
      pct: Math.round(next ? ((xp - cur.min) / (next.min - cur.min)) * 100 : 100) };
  }
  function addXP(amount, reason) {
    if (amount <= 0) return;
    const before = rankInfo().index;
    state.xp += amount;
    logToday();
    addLog(reason, amount);
    toast('+' + amount + ' XP', reason, 'xp', 'plus');
    const after = rankInfo().index;
    if (after > before) toast('New rank: ' + RANKS[after].title, 'You climbed to rank ' + (after + 1) + ' of 5.', 'rank', 'up');
  }
  function trailProgress(t) {
    const tr = TRAILS[t];
    let lessonsDone = 0;
    for (let i = 0; i < tr.lessons; i++) if (state.lessons[t + '-' + i]) lessonsDone++;
    const activity = !!state.activities[t];
    const quizPassed = !!(state.quizzes[t] && state.quizzes[t].passed);
    const done = lessonsDone + (activity ? 1 : 0) + (quizPassed ? 1 : 0);
    const total = tr.lessons + 2;
    return { done: done, total: total, pct: Math.round((done / total) * 100), complete: done === total,
      lessonsDone: lessonsDone, activity: activity, quizPassed: quizPassed };
  }
  function overall() {
    let done = 0, total = 0;
    ORDER.forEach(function (t) { const p = trailProgress(t); done += p.done; total += p.total; });
    return { done: done, total: total, frac: done / total };
  }
  function stamp(id) {
    if (state.stamps[id]) return;
    state.stamps[id] = Date.now();
    const s = STAMPS.find(function (x) { return x.id === id; });
    addLog('Passport stamp: ' + s.name, 0);
    toast('Stamp collected: ' + s.name, s.desc, 'stamp', s.icon);
  }
  function checkStamps() {
    if (Object.keys(state.lessons).length) stamp('first-step');
    if (ORDER.every(function (t) { return state.visited[t]; })) stamp('scout');
    if (streak() >= 3) stamp('streak-3');
    ORDER.forEach(function (t) { if (trailProgress(t).complete) stamp(TRAILS[t].stamp); });
    if (ORDER.some(function (t) { return state.quizzes[t] && state.quizzes[t].perfect; })) stamp('sharp-eye');
    if (ORDER.every(function (t) { return trailProgress(t).complete; })) stamp('summit-scout');
  }
  function changed() {
    checkStamps();
    save();
    render();
    document.dispatchEvent(new CustomEvent('wayfinder:change'));
  }

  // ---- Public actions ----------------------------------------------------------
  function completeLesson(t, i) {
    const id = t + '-' + i;
    if (state.lessons[id]) return false;
    state.lessons[id] = true;
    addXP(XP.lesson, TRAILS[t].title + ': waypoint ' + (i + 1));
    changed();
    return true;
  }
  function completeActivity(t, label) {
    if (state.activities[t]) return false;
    state.activities[t] = true;
    addXP(XP.activity, 'Challenge complete: ' + label);
    changed();
    return true;
  }
  // XP only for beating your best score, so retakes can't farm points.
  function recordQuiz(t, correct, total) {
    const q = state.quizzes[t] || { best: 0, passed: false, perfect: false, attempts: 0 };
    q.attempts++;
    let gain = 0;
    if (correct > q.best) { gain += (correct - q.best) * XP.quizCorrect; q.best = correct; }
    const passedNow = correct / total >= 0.8;
    if (passedNow && !q.passed) { q.passed = true; gain += XP.quizPass; }
    if (correct === total) q.perfect = true;
    state.quizzes[t] = q;
    if (gain) addXP(gain, TRAILS[t].title + ' checkpoint: ' + correct + '/' + total);
    else addLog(TRAILS[t].title + ' checkpoint attempt: ' + correct + '/' + total, 0);
    changed();
    return { passed: passedNow, gain: gain, best: q.best };
  }
  function visit(t) {
    if (state.visited[t]) return;
    state.visited[t] = true;
    changed();
  }
  function reset() {
    state = blank();
    save();
    render();
    document.dispatchEvent(new CustomEvent('wayfinder:change'));
  }
  function nextPage() {
    for (let k = 0; k < ORDER.length; k++) if (!trailProgress(ORDER[k]).complete) return TRAILS[ORDER[k]].page;
    return 'passport.html';
  }

  // ---- Toasts ------------------------------------------------------------------
  function toast(title, text, kind, iconName) {
    let box = document.querySelector('.toasts');
    if (!box) {
      box = document.createElement('div');
      box.className = 'toasts';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.innerHTML = '<div class="t-icon">' + icon(iconName) + '</div><div><b></b><span></span></div>';
    el.querySelector('b').textContent = title;
    el.querySelector('span').textContent = text;
    box.appendChild(el);
    while (box.children.length > 3) box.firstElementChild.remove();
    setTimeout(function () { el.classList.add('out'); }, 3600);
    setTimeout(function () { el.remove(); }, 4000);
  }

  // ---- Render shared progress displays -------------------------------------------
  function placeHiker() {
    // Moves the "you are here" hiker along the home-page trail map.
    const path = document.getElementById('trail-path');
    const hiker = document.getElementById('hiker');
    if (!path || !hiker || !path.getTotalLength) return;
    const len = path.getTotalLength();
    const pt = path.getPointAtLength(len * Math.min(overall().frac, 1));
    hiker.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
    const done = document.getElementById('trail-done');
    if (done) done.style.strokeDashoffset = (len * (1 - overall().frac)).toFixed(1);
    if (done) done.style.strokeDasharray = len.toFixed(1);
  }

  function render() {
    const r = rankInfo();
    document.querySelectorAll('.rank-chip').forEach(function (chip) {
      chip.querySelector('.rc-xp').textContent = state.xp + ' XP';
      chip.querySelector('.rc-rank').textContent = r.title;
      chip.querySelector('.rc-streak').textContent = streak();
      chip.setAttribute('aria-label', 'Rank: ' + r.title + '. ' + state.xp + ' XP. ' + streak() + ' day streak. Open passport.');
    });
    document.querySelectorAll('[data-trail-fill]').forEach(function (el) {
      el.style.width = trailProgress(el.dataset.trailFill).pct + '%';
    });
    document.querySelectorAll('[data-trail-text]').forEach(function (el) {
      const p = trailProgress(el.dataset.trailText);
      el.textContent = p.complete ? 'Summit reached!' : p.done + ' / ' + p.total + ' steps';
    });
    document.querySelectorAll('[data-station]').forEach(function (el) {
      el.classList.toggle('reached', trailProgress(el.dataset.station).complete);
    });
    document.querySelectorAll('[data-continue]').forEach(function (el) {
      const n = nextPage();
      el.href = n;
      el.textContent = n === 'passport.html' ? 'See your passport' : (state.xp > 0 ? 'Continue the trail' : 'Start the trail');
    });
    placeHiker();
  }

  function initNav() {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    render();
    window.addEventListener('resize', placeHiker);
  });

  window.Wayfinder = {
    TRAILS: TRAILS, ORDER: ORDER, RANKS: RANKS, STAMPS: STAMPS, XP: XP,
    state: function () { return state; },
    icon: icon, rankInfo: rankInfo, trailProgress: trailProgress, overall: overall, streak: streak,
    completeLesson: completeLesson, completeActivity: completeActivity, recordQuiz: recordQuiz,
    visit: visit, reset: reset
  };
})();
