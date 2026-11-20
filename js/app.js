/* Rustling — app logic */
(function () {
  "use strict";

  const { lessons, cheatSheet } = window.COURSE;
  const highlight = window.RustHighlight.highlight;
  const escapeHtml = window.RustHighlight.escapeHtml;
  const STORAGE_KEY = "rustling-state-v1";

  const el = {
    content: document.getElementById("content"),
    sidebarNav: document.getElementById("sidebarNav"),
    sidebar: document.getElementById("sidebar"),
    overlay: document.getElementById("sidebarOverlay"),
    menuBtn: document.getElementById("menuBtn"),
    search: document.getElementById("searchInput"),
    themeBtn: document.getElementById("themeBtn"),
    resetBtn: document.getElementById("resetBtn"),
    topFill: document.getElementById("topProgressFill"),
    topNum: document.getElementById("topProgressNum"),
    sideFill: document.getElementById("sidebarProgressFill"),
    sideNum: document.getElementById("sidebarProgressNum"),
    toast: document.getElementById("toast")
  };

  /* ---------------------------------------------------------------- state */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          completed: Array.isArray(parsed.completed) ? parsed.completed : [],
          quiz: parsed.quiz && typeof parsed.quiz === "object" ? parsed.quiz : {},
          theme: parsed.theme === "light" || parsed.theme === "dark" ? parsed.theme : "dark"
        };
      }
    } catch (e) { /* ignore corrupt state */ }
    return { completed: [], quiz: {}, theme: "dark" };
  }

  let state = loadState();

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  function isDone(id) { return state.completed.indexOf(id) !== -1; }
  function progress() {
    const total = lessons.length;
    const done = lessons.filter(function (l) { return isDone(l.id); }).length;
    return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  /* ------------------------------------------------------------- helpers */
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.toast.classList.remove("show"); }, 2200);
  }

  function lessonById(id) {
    return lessons.find(function (l) { return l.id === id; });
  }

  function route() {
    const hash = (location.hash || "#/").replace(/^#\/?/, "");
    const parts = hash.split("/").filter(Boolean);
    if (parts[0] === "lesson" && parts[1]) return { name: "lesson", id: parts[1] };
    if (parts[0] === "cheatsheet") return { name: "cheatsheet" };
    return { name: "home" };
  }

  function navigate(path) {
    location.hash = path;
    closeSidebar();
  }

  function openSidebar() { el.sidebar.classList.add("open"); el.overlay.classList.add("show"); }
  function closeSidebar() { el.sidebar.classList.remove("open"); el.overlay.classList.remove("show"); }

  /* ------------------------------------------------------------- sidebar */
  function renderSidebar() {
    let html = "";
    html += '<button class="nav-item" data-nav="#/"><span class="nav-num">⌂</span><span class="nav-label">Home</span></button>';
    html += '<div class="nav-section-title">Curriculum</div>';
    lessons.forEach(function (l) {
      const active = route().name === "lesson" && route().id === l.id;
      html += '<button class="nav-item ' + (active ? "active" : "") + '" data-nav="#/lesson/' + l.id + '" ' +
        'data-search-text="' + escapeHtml((l.title + " " + l.desc + " " + l.tags.join(" ")).toLowerCase()) + '">' +
          '<span class="nav-num">' + String(l.num).padStart(2, "0") + '</span>' +
          '<span class="nav-label">' + escapeHtml(l.title) + '</span>' +
          (isDone(l.id) ? '<span class="nav-check">✓</span>' : "") +
        '</button>';
    });
    html += '<div class="nav-section-title">Reference</div>';
    html += '<button class="nav-item ' + (route().name === "cheatsheet" ? "active" : "") + '" data-nav="#/cheatsheet">' +
      '<span class="nav-num">⌘</span><span class="nav-label">Cheat Sheet</span></button>';
    el.sidebarNav.innerHTML = html;

    const p = progress();
    el.sideFill.style.width = p.pct + "%";
    el.sideNum.textContent = p.done + " / " + p.total;
    el.topFill.style.width = p.pct + "%";
    el.topNum.textContent = p.pct + "%";
  }

  /* ---------------------------------------------------------------- home */
  function renderHome() {
    const p = progress();
    const next = lessons.find(function (l) { return !isDone(l.id); });
    const quizCount = Object.keys(state.quiz).reduce(function (n, k) {
      return n + Object.keys(state.quiz[k] || {}).length;
    }, 0);

    let cards = "";
    lessons.forEach(function (l) {
      const done = isDone(l.id);
      cards += '<button class="lesson-card ' + (done ? "done" : "") + '" data-go="#/lesson/' + l.id + '">' +
        '<span class="lc-num">' + String(l.num).padStart(2, "0") + '</span>' +
        '<span class="lc-body">' +
          '<span class="lc-title">' + escapeHtml(l.title) + (done ? '<span class="badge-done">DONE</span>' : "") + '</span>' +
          '<span class="lc-desc">' + escapeHtml(l.desc) + '</span>' +
        '</span>' +
        '<span class="lc-arrow">' + (done ? "✓" : "→") + '</span>' +
      '</button>';
    });

    el.content.innerHTML =
      '<div class="hero">' +
        '<div class="eyebrow">Interactive Rust course</div>' +
        '<h1>Learn Rust,<br><span class="accent">by actually doing it.</span></h1>' +
        '<p>A hands-on introduction for programmers who already know another language. Short lessons, real code, and quizzes that explain <em>why</em> — especially the parts that make Rust different.</p>' +
        '<div class="hero-actions">' +
          '<button class="btn primary" data-go="#/lesson/' + (next ? next.id : lessons[0].id) + '">' +
            (p.done === 0 ? "Start learning" : next ? "Continue: " + escapeHtml(next.title) : "Review the course") + '  →</button>' +
          '<button class="btn ghost" data-go="#/cheatsheet">Open cheat sheet</button>' +
        '</div>' +
      '</div>' +
      '<div class="stat-row">' +
        '<div class="stat-card a"><div class="stat-num">' + p.done + '/' + p.total + '</div><div class="stat-label">Lessons completed</div></div>' +
        '<div class="stat-card b"><div class="stat-num">' + quizCount + '</div><div class="stat-label">Quiz answers submitted</div></div>' +
        '<div class="stat-card c"><div class="stat-num">' + p.pct + '%</div><div class="stat-label">Course progress</div></div>' +
      '</div>' +
      '<div class="curriculum-head"><h2>The curriculum</h2><span>' + lessons.length + ' lessons · ~' +
        lessons.reduce(function (n, l) { return n + l.readMin; }, 0) + ' min</span></div>' +
      '<div class="lesson-list">' + cards + '</div>';
  }

  /* --------------------------------------------------------------- lesson */
  function codeBlock(c) {
    return '<div class="code-block">' +
      '<div class="code-head">' +
        '<div class="code-filename"><span class="dot"></span>' + escapeHtml(c.file) + '</div>' +
        '<div class="code-actions">' +
          '<span class="code-lang">rust</span>' +
          '<button class="copy-btn" data-copy="' + escapeHtml(c.source) + '">Copy</button>' +
        '</div>' +
      '</div>' +
      '<pre class="code"><code>' + highlight(c.source) + '</code></pre>' +
      (c.note ? '<div class="code-note">' + c.note + '</div>' : "") +
    '</div>';
  }

  function quizHtml(lesson) {
    const answers = state.quiz[lesson.id] || {};
    let body = "";
    lesson.quiz.forEach(function (q, qi) {
      const chosen = answers[qi];
      const answered = chosen !== undefined;
      let opts = "";
      q.options.forEach(function (opt, oi) {
        let cls = "option";
        let icon = "";
        if (answered) {
          if (oi === q.answer) { cls += " correct"; icon = '<span class="icon">✓</span>'; }
          else if (oi === chosen) { cls += " wrong"; icon = '<span class="icon">✕</span>'; }
        }
        opts += '<button class="' + cls + '" data-lesson="' + lesson.id + '" data-q="' + qi + '" data-opt="' + oi + '" ' + (answered ? "disabled" : "") + '>' +
          '<span class="letter">' + String.fromCharCode(65 + oi) + '</span>' +
          '<span>' + escapeHtml(opt) + '</span>' + icon + '</button>';
      });
      let feedback = "";
      if (answered) {
        const good = chosen === q.answer;
        feedback = '<div class="feedback show ' + (good ? "good" : "bad") + '">' +
          '<strong>' + (good ? "Correct!" : "Not quite.") + '</strong>' + q.explain +
          '<div style="margin-top:9px"><button class="copy-btn" data-retry="' + qi + '">Try again</button></div>' +
        '</div>';
      }
      body += '<div class="quiz-q">' +
        '<p class="quiz-question"><span class="quiz-question-num">Q' + (qi + 1) + '</span>' + escapeHtml(q.q) + '</p>' +
        opts + feedback + '</div>';
    });
    return '<div class="quiz">' +
      '<div class="quiz-head">' +
        '<div class="quiz-head-icon">?</div>' +
        '<div><h3>Check your understanding</h3><p>' + lesson.quiz.length + ' questions · instant feedback</p></div>' +
      '</div>' +
      '<div class="quiz-body">' + body + '</div>' +
    '</div>';
  }

  function renderLesson(lesson) {
    if (!lesson) {
      el.content.innerHTML = '<div class="empty-state"><div class="big">🦀</div><h2>Lesson not found</h2>' +
        '<p>That lesson doesn\'t exist. Head back to the curriculum.</p>' +
        '<button class="btn primary" data-go="#/">Back home</button></div>';
      return;
    }

    let sections = "";
    lesson.sections.forEach(function (s) {
      let html = '<h2 class="heading">' + s.h + '</h2>' + s.body;
      if (s.code) s.code.forEach(function (c) { html += codeBlock(c); });
      if (s.callout) {
        html += '<div class="callout ' + s.callout.type + '">' +
          '<div class="callout-title">' + escapeHtml(s.callout.title) + '</div>' + s.callout.body + '</div>';
      }
      sections += html;
    });

    let kp = "";
    lesson.keypoints.forEach(function (k) { kp += '<div class="kp-card"><span class="bullet">◆</span><span>' + k + '</span></div>'; });
    let pf = "";
    lesson.pitfalls.forEach(function (k) { pf += '<div class="kp-card pitfall"><span class="bullet">▲</span><span>' + k + '</span></div>'; });

    const idx = lessons.indexOf(lesson);
    const prev = lessons[idx - 1];
    const next = lessons[idx + 1];
    const done = isDone(lesson.id);

    el.content.innerHTML =
      '<div class="eyebrow">Lesson ' + String(lesson.num).padStart(2, "0") + ' &nbsp;·&nbsp; ' + lesson.readMin + ' min read</div>' +
      '<h1 class="title">' + escapeHtml(lesson.title) + '</h1>' +
      '<p class="lede">' + escapeHtml(lesson.desc) + '</p>' +
      '<div class="tag-row">' + lesson.tags.map(function (t, i) {
        return '<span class="tag ' + (i === 0 ? "accent" : "") + '">' + escapeHtml(t) + '</span>';
      }).join("") + '</div>' +
      lesson.intro + sections +
      '<h2 class="heading">Key takeaways</h2><div class="kp-grid">' + kp + '</div>' +
      '<h2 class="heading">Common pitfalls</h2><div class="kp-grid">' + pf + '</div>' +
      quizHtml(lesson) +
      '<div class="lesson-footer">' +
        (prev ? '<button class="btn ghost" data-go="#/lesson/' + prev.id + '">← ' + escapeHtml(prev.title) + '</button>' : '<span></span>') +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
          '<button class="btn ' + (done ? "completed" : "primary") + '" id="completeBtn" data-complete="' + lesson.id + '">' +
            (done ? "✓ Completed" : "Mark as complete") + '</button>' +
          (next ? '<button class="btn" data-go="#/lesson/' + next.id + '">Next: ' + escapeHtml(next.title) + ' →</button>' :
            '<button class="btn" data-go="#/cheatsheet">Cheat Sheet →</button>') +
        '</div>' +
      '</div>';
  }

  /* ----------------------------------------------------------- cheat sheet */
  function renderCheatSheet() {
    let groups = "";
    cheatSheet.groups.forEach(function (g) {
      let rows = "";
      g.rows.forEach(function (r) {
        rows += '<tr><td>' + escapeHtml(r[0]) + '</td><td>' + r[1] + '</td></tr>';
      });
      groups += '<h2 class="heading">' + escapeHtml(g.title) + '</h2>' +
        '<table class="cheat-table"><thead><tr><th>Syntax</th><th>Meaning</th></tr></thead><tbody>' + rows + '</tbody></table>';
    });
    el.content.innerHTML =
      '<div class="eyebrow">Reference</div>' +
      '<h1 class="title">' + escapeHtml(cheatSheet.title) + '</h1>' +
      '<p class="lede">' + escapeHtml(cheatSheet.desc) + '</p>' +
      groups +
      '<div class="lesson-footer"><span></span><button class="btn primary" data-go="#/">Back to curriculum →</button></div>';
  }

  /* --------------------------------------------------------------- search */
  function searchableText(l) {
    if (l._search) return l._search;
    let parts = [l.title, l.desc, l.tags.join(" ")];
    l.sections.forEach(function (s) {
      parts.push(s.h);
      if (s.body) parts.push(s.body.replace(/<[^>]*>/g, " "));
      if (s.code) s.code.forEach(function (c) { parts.push(c.source); });
      if (s.callout) parts.push(s.callout.body.replace(/<[^>]*>/g, " "));
    });
    l._search = { title: l.title, desc: l.desc, text: parts.join(" ").replace(/<[^>]*>/g, " ").toLowerCase() };
    return l._search;
  }

  function mark(text, q) {
    const escaped = escapeHtml(text);
    if (!q) return escaped;
    const i = escaped.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return escaped;
    return escaped.slice(0, i) + "<em>" + escaped.slice(i, i + q.length) + "</em>" + escaped.slice(i + q.length);
  }

  function renderSearch(q) {
    q = q.trim();
    let results = "";
    let count = 0;
    lessons.forEach(function (l) {
      const s = searchableText(l);
      if (s.text.indexOf(q.toLowerCase()) !== -1) {
        count++;
        results += '<div class="search-result" data-go="#/lesson/' + l.id + '">' +
          '<div class="sr-title">' + mark(s.title, q) + '</div>' +
          '<div class="sr-snippet">' + mark(s.desc, q) + ' · lesson ' + l.num + '</div>' +
        '</div>';
      }
    });
    el.content.innerHTML = results
      ? '<div class="eyebrow">Search results</div><h1 class="title">' + count + ' match' +
        (count === 1 ? "" : "es") + ' for “' + escapeHtml(q) + '”</h1>' + results
      : '<div class="empty-state"><div class="big">🔍</div><h2>No results for “' + escapeHtml(q) + '”</h2>' +
        '<p>Try a different keyword, like “borrow”, “match”, or “cargo”.</p></div>';
  }

  /* --------------------------------------------------------------- render */
  function render() {
    renderSidebar();
    const r = route();
    if (r.name === "lesson") renderLesson(lessonById(r.id));
    else if (r.name === "cheatsheet") renderCheatSheet();
    else renderHome();
    el.content.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  /* -------------------------------------------------------------- actions */
  function markComplete(id, btn) {
    const i = state.completed.indexOf(id);
    if (i === -1) {
      state.completed.push(id);
      saveState();
      toast("Lesson complete! 🎉");
      btn.classList.remove("primary");
      btn.classList.add("completed");
      btn.textContent = "✓ Completed";
      renderSidebar();
    } else {
      state.completed.splice(i, 1);
      saveState();
      toast("Marked as incomplete");
      btn.classList.remove("completed");
      btn.classList.add("primary");
      btn.textContent = "Mark as complete";
      renderSidebar();
    }
  }

  function answer(lessonId, qi, oi) {
    if (!state.quiz[lessonId]) state.quiz[lessonId] = {};
    state.quiz[lessonId][qi] = oi;
    saveState();
    const l = lessonById(lessonId);
    if (l) {
      // Re-render only the quiz area for smooth feedback.
      const old = el.content.querySelector(".quiz");
      if (old) {
        const tmp = document.createElement("div");
        tmp.innerHTML = quizHtml(l);
        old.replaceWith(tmp.firstElementChild);
      }
    }
  }

  function retry(qi) {
    const r = route();
    if (r.name !== "lesson") return;
    if (state.quiz[r.id]) delete state.quiz[r.id][qi];
    saveState();
    const l = lessonById(r.id);
    const old = el.content.querySelector(".quiz");
    if (old && l) {
      const tmp = document.createElement("div");
      tmp.innerHTML = quizHtml(l);
      old.replaceWith(tmp.firstElementChild);
    }
  }

  function copyText(text, btn) {
    const done = function () {
      const old = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(function () { btn.textContent = old; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { toast("Copy failed"); });
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed"); }
      document.body.removeChild(ta);
    }
  }

  /* --------------------------------------------------------------- events */
  el.content.addEventListener("click", function (e) {
    const go = e.target.closest("[data-go]");
    if (go) { navigate(go.getAttribute("data-go")); return; }

    const opt = e.target.closest(".option");
    if (opt && !opt.disabled) {
      answer(opt.getAttribute("data-lesson"), parseInt(opt.getAttribute("data-q"), 10), parseInt(opt.getAttribute("data-opt"), 10));
      return;
    }

    const retryBtn = e.target.closest("[data-retry]");
    if (retryBtn) { retry(parseInt(retryBtn.getAttribute("data-retry"), 10)); return; }

    const copy = e.target.closest("[data-copy]");
    if (copy) { copyText(copy.getAttribute("data-copy"), copy); return; }

    const complete = e.target.closest("[data-complete]");
    if (complete) { markComplete(complete.getAttribute("data-complete"), complete); return; }
  });

  el.sidebarNav.addEventListener("click", function (e) {
    const item = e.target.closest("[data-nav]");
    if (item) { navigate(item.getAttribute("data-nav")); }
  });

  el.menuBtn.addEventListener("click", function () {
    el.sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  el.overlay.addEventListener("click", closeSidebar);

  el.themeBtn.addEventListener("click", function () {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    saveState();
    toast(state.theme === "dark" ? "Dark theme" : "Light theme");
  });

  el.resetBtn.addEventListener("click", function () {
    if (confirm("Reset all progress and quiz answers? This can't be undone.")) {
      state = { completed: [], quiz: {}, theme: state.theme };
      saveState();
      render();
      toast("Progress reset");
    }
  });

  el.search.addEventListener("input", function () {
    const q = el.search.value;
    if (q.trim()) renderSearch(q);
    else render();
  });
  el.search.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { el.search.value = ""; render(); el.search.blur(); }
    if (e.key === "Enter") { e.preventDefault(); el.search.blur(); }
  });

  document.addEventListener("keydown", function (e) {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (e.key === "/" && !typing) { e.preventDefault(); el.search.focus(); }
    if (e.key === "Escape") closeSidebar();
  });

  window.addEventListener("hashchange", function () {
    if (el.search.value) { el.search.value = ""; }
    render();
  });

  /* ----------------------------------------------------------------- init */
  document.documentElement.setAttribute("data-theme", state.theme);
  render();
})();
