/* ==========================================================================
   progress.js — the gamification engine (loaded on every page)
   Stores a student's XP, completed lessons, activities, quiz scores and
   badges in the browser's localStorage. No account or login needed.
   Exposes one global object: window.Synapse
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'synapse-progress-v1';

  // The three learning modules. "lessons" = number of lessons on that page.
  const MODULES = {
    fundamentals: { title: 'AI Fundamentals', lessons: 4, page: 'fundamentals.html', badge: 'neural-navigator' },
    tools:        { title: 'Tools & Techniques', lessons: 4, page: 'tools.html', badge: 'prompt-pro' },
    ethics:       { title: 'Ethical AI Use', lessons: 4, page: 'ethics.html', badge: 'ethics-guardian' }
  };

  // How many experience points (XP) each action is worth.
  const XP = { lesson: 20, activity: 50, quizCorrect: 10, quizPass: 25 };

  // Level thresholds. Max possible XP = 3 x (4x20 + 50 + 5x10 + 25) = 615.
  const LEVELS = [
    { min: 0,   title: 'Curious Beginner' },
    { min: 100, title: 'Data Explorer' },
    { min: 250, title: 'Model Builder' },
    { min: 400, title: 'Prompt Engineer' },
    { min: 550, title: 'AI Ambassador' }
  ];

  const BADGES = [
    { id: 'first-spark',      name: 'First Spark',      desc: 'Complete your first lesson.',          icon: 'spark',   c1: '#ffbd59', c2: '#ff7a9a' },
    { id: 'explorer',         name: 'Explorer',         desc: 'Open all three learning modules.',     icon: 'compass', c1: '#34e1c4', c2: '#4ade80' },
    { id: 'neural-navigator', name: 'Neural Navigator', desc: 'Finish the AI Fundamentals module.',   icon: 'network', c1: '#a194ff', c2: '#34e1c4' },
    { id: 'prompt-pro',       name: 'Prompt Pro',       desc: 'Finish the Tools & Techniques module.', icon: 'wand',   c1: '#34e1c4', c2: '#a194ff' },
    { id: 'ethics-guardian',  name: 'Ethics Guardian',  desc: 'Finish the Ethical AI Use module.',    icon: 'shield',  c1: '#ffbd59', c2: '#a194ff' },
    { id: 'flawless',         name: 'Flawless',         desc: 'Score 100% on any module quiz.',       icon: 'star',    c1: '#ffbd59', c2: '#ffe08a' },
    { id: 'ai-ambassador',    name: 'AI Ambassador',    desc: 'Complete all three modules.',          icon: 'trophy',  c1: '#ff7a9a', c2: '#a194ff' }
  ];

  // Simple line icons (24x24) used by badges and toasts.
  const ICONS = {
    spark:   '<path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.5 4.5-4.5 2.5 2.5-4.5z"/>',
    network: '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 7l3.5 3.5M7 17l3.5-3.5M13.5 10.5 17 7M13.5 13.5 17 17"/>',
    wand:    '<path d="M4 20 15 9M14 3v3M19.5 5.5 17.5 7.5M21 10h-3M12.5 4.5l1 1"/>',
    shield:  '<path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    star:    '<path d="M12 3l2.8 5.9 6.2.7-4.6 4.2 1.3 6.2L12 16.9 6.3 20l1.3-6.2L3 9.6l6.2-.7z"/>',
    trophy:  '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M10 17h4v4h-4z"/>',
    lock:    '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    bolt:    '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    level:   '<path d="M4 18l8-12 8 12M8 18l4-6 4 6"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  // ---- Saving and loading --------------------------------------------------
  function blank() {
    return { xp: 0, lessons: {}, activities: {}, quizzes: {}, visited: {}, badges: {}, log: [] };
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { /* storage blocked or corrupted: start fresh */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  let state = load();

  // ---- Core helpers ---------------------------------------------------------
  function addLog(text, xp) {
    state.log.unshift({ t: Date.now(), text: text, xp: xp || 0 });
    state.log = state.log.slice(0, 30);
  }

  function levelInfo(xp) {
    if (xp == null) xp = state.xp;
    let i = 0;
    LEVELS.forEach(function (lv, j) { if (xp >= lv.min) i = j; });
    const cur = LEVELS[i], next = LEVELS[i + 1];
    const pct = next ? ((xp - cur.min) / (next.min - cur.min)) * 100 : 100;
    return { index: i, number: i + 1, title: cur.title, next: next, pct: Math.round(pct), xp: xp };
  }

  function addXP(amount, reason) {
    if (amount <= 0) return;
    const before = levelInfo().index;
    state.xp += amount;
    addLog(reason, amount);
    toast('+' + amount + ' XP', reason, 'xp', 'bolt');
    const after = levelInfo().index;
    if (after > before) toast('Level up!', 'You reached Level ' + (after + 1) + ': ' + LEVELS[after].title, 'level', 'level');
  }

  function moduleProgress(m) {
    const mod = MODULES[m];
    let done = 0;
    for (let i = 0; i < mod.lessons; i++) if (state.lessons[m + '-' + i]) done++;
    const lessonsDone = done;
    if (state.activities[m]) done++;
    const quiz = state.quizzes[m];
    if (quiz && quiz.passed) done++;
    const total = mod.lessons + 2;
    return {
      done: done, total: total, pct: Math.round((done / total) * 100), complete: done === total,
      lessonsDone: lessonsDone, activity: !!state.activities[m], quizPassed: !!(quiz && quiz.passed)
    };
  }

  function award(id) {
    if (state.badges[id]) return;
    state.badges[id] = Date.now();
    const b = BADGES.find(function (x) { return x.id === id; });
    addLog('Earned badge: ' + b.name, 0);
    toast('Badge unlocked: ' + b.name, b.desc, 'badge', b.icon);
  }

  function checkBadges() {
    const keys = Object.keys(MODULES);
    if (Object.keys(state.lessons).length > 0) award('first-spark');
    if (keys.every(function (m) { return state.visited[m]; })) award('explorer');
    keys.forEach(function (m) { if (moduleProgress(m).complete) award(MODULES[m].badge); });
    if (keys.some(function (m) { return state.quizzes[m] && state.quizzes[m].perfect; })) award('flawless');
    if (keys.every(function (m) { return moduleProgress(m).complete; })) award('ai-ambassador');
  }

  function changed() {
    checkBadges();
    save();
    render();
    document.dispatchEvent(new CustomEvent('synapse:change'));
  }

  // ---- Public actions -------------------------------------------------------
  function completeLesson(m, i) {
    const id = m + '-' + i;
    if (state.lessons[id]) return false;
    state.lessons[id] = true;
    addXP(XP.lesson, MODULES[m].title + ': lesson ' + (i + 1) + ' complete');
    changed();
    return true;
  }

  function completeActivity(m, label) {
    if (state.activities[m]) return false;
    state.activities[m] = true;
    addXP(XP.activity, 'Activity complete: ' + label);
    changed();
    return true;
  }

  // XP is only given for improving your best score, so retakes can't farm XP.
  function recordQuiz(m, correct, total) {
    const q = state.quizzes[m] || { best: 0, passed: false, perfect: false, attempts: 0 };
    q.attempts++;
    let gain = 0;
    if (correct > q.best) { gain += (correct - q.best) * XP.quizCorrect; q.best = correct; }
    const passedNow = correct / total >= 0.8;
    if (passedNow && !q.passed) { q.passed = true; gain += XP.quizPass; }
    if (correct === total) q.perfect = true;
    state.quizzes[m] = q;
    if (gain) addXP(gain, MODULES[m].title + ' quiz: ' + correct + '/' + total);
    else addLog(MODULES[m].title + ' quiz attempt: ' + correct + '/' + total, 0);
    changed();
    return { passed: passedNow, gain: gain, best: q.best };
  }

  function visit(m) {
    if (state.visited[m]) return;
    state.visited[m] = true;
    changed();
  }

  function reset() {
    state = blank();
    save();
    render();
    document.dispatchEvent(new CustomEvent('synapse:change'));
  }

  function nextStep() {
    // Returns the page of the first module that is not finished yet.
    const keys = Object.keys(MODULES);
    for (let k = 0; k < keys.length; k++) if (!moduleProgress(keys[k]).complete) return MODULES[keys[k]].page;
    return 'dashboard.html';
  }

  // ---- Toast notifications --------------------------------------------------
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
    el.innerHTML = '<div class="t-icon">' + icon(iconName || 'bolt') + '</div><div><b></b><span></span></div>';
    el.querySelector('b').textContent = title;
    el.querySelector('span').textContent = text;
    box.appendChild(el);
    while (box.children.length > 3) box.firstElementChild.remove(); // keep the stack short
    setTimeout(function () { el.classList.add('out'); }, 3600);
    setTimeout(function () { el.remove(); }, 4000);
  }

  // ---- Update every progress display on the current page --------------------
  function render() {
    const lv = levelInfo();
    document.querySelectorAll('.xp-pill').forEach(function (pill) {
      pill.querySelector('.xp-level').textContent = 'Lv ' + lv.number;
      pill.querySelector('.xp-fill').style.width = lv.pct + '%';
      pill.querySelector('.xp-num').textContent = state.xp + ' XP';
      pill.setAttribute('aria-label', 'Level ' + lv.number + ', ' + lv.title + ', ' + state.xp + ' XP. Open dashboard.');
    });
    document.querySelectorAll('[data-module-fill]').forEach(function (el) {
      el.style.width = moduleProgress(el.dataset.moduleFill).pct + '%';
    });
    document.querySelectorAll('[data-module-text]').forEach(function (el) {
      const p = moduleProgress(el.dataset.moduleText);
      el.textContent = p.complete ? 'Complete! ' + p.total + ' of ' + p.total + ' steps' : p.done + ' of ' + p.total + ' steps';
    });
    document.querySelectorAll('[data-continue]').forEach(function (el) {
      el.href = nextStep();
      const any = state.xp > 0;
      el.textContent = nextStep() === 'dashboard.html' ? 'View your badges' : (any ? 'Continue learning' : 'Start learning');
    });
    document.querySelectorAll('[data-level-rung]').forEach(function (el) {
      el.classList.toggle('current', +el.dataset.levelRung === lv.index);
    });
  }

  // ---- Mobile navigation toggle -------------------------------------------
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
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  });

  window.Synapse = {
    MODULES: MODULES, LEVELS: LEVELS, BADGES: BADGES, XP: XP,
    state: function () { return state; },
    icon: icon, levelInfo: levelInfo, moduleProgress: moduleProgress,
    completeLesson: completeLesson, completeActivity: completeActivity,
    recordQuiz: recordQuiz, visit: visit, reset: reset, toast: toast
  };
})();
