// Shared top navigation bar, rendered identically on every page so the menu
// only needs to be edited in one place. Five collapsible top-level menus,
// each with its own color — 🧠 Remember, 💡 Understand, 📊 Analysis,
// ⚖️ Evaluate, ✨ Create (which also holds Tasks + grouped external tools,
// each group itself collapsible) — plus one 🔎 Search entry point (a
// centered command-palette style search over pages, tools, AND every piece
// of Supabase content) — all built once here so every page stays in sync
// automatically.
(function(){
  var LIVE_BASE = 'https://sep-3-agentic-coding.polished-boat-17b2.workers.dev/html/';
  var RECENT_KEY = 'navSearchRecent';
  var RECENT_MAX = 5;

  var MENU_COLORS = {
    remember:   '#5ab0ff',
    understand: '#4bcfa1',
    search:     '#e8b94a',
    analysis:   '#b388ff',
    evaluate:   '#ffab40',
    create:     '#ff5252'
  };

  // Single-hue ramp (light -> dark) across the menu in this order, so each
  // stage gets a distinct but related color. 'todo' (Production Plan) is
  // surfaced separately as "✅ Tasks" inside the Tools menu, not in Pipeline.
  var PAGES = [
    { id: 'unknowns',         emoji: '❓', label: 'Unknowns',         file: 'unknowns.html',         color: '#ffd479' },
    { id: 'arguments',        emoji: '🧩', label: 'Arguments',        file: 'arguments.html',        color: '#bfe0ff' },
    { id: 'research',         emoji: '🔍', label: 'Research',         file: 'index.html',            color: '#8ecbff' },
    { id: 'script',           emoji: '📝', label: 'Script',           file: 'script.html',           color: '#5ab0ff' },
    { id: 'design',           emoji: '🎨', label: 'Design',           file: 'design.html',           color: '#3f8fe0' },
    { id: 'previsualisation', emoji: '🎞️', label: 'Previsualisation', file: 'previsualisation.html', color: '#2c6bb0' },
    { id: 'todo',             emoji: '✅', label: 'Production Plan',  file: 'todo.html',             color: '#7be08a' },
    { id: 'journal',          emoji: '📓', label: 'Journal',          file: 'journal.html',          color: '#c9f2a0' },
    { id: 'retro',            emoji: '🔁', label: 'Retro',            file: 'retro.html',            color: '#a0f2d0' }
  ];

  var REMEMBER_PAGES = PAGES.filter(function(p){ return p.id === 'unknowns' || p.id === 'arguments' || p.id === 'research'; });
  var UNDERSTAND_PAGES = PAGES.filter(function(p){ return p.id === 'script' || p.id === 'design' || p.id === 'previsualisation'; });
  var TASKS_PAGE = PAGES.filter(function(p){ return p.id === 'todo'; })[0];

  // Tools the production pipeline actually depends on — surfaced inside the
  // "🧰 Tools" dropdown as collapsible <details> groups so a long list stays
  // scannable, AND indexed into the search palette. Each group is
  // [emoji, label, [tool, tool, ...]].
  var TOOL_GROUPS = [
    ['🚀', 'Deployment', [
      { emoji: '⚡', label: 'Cloudflare Worker Live', url: 'https://sep-3-agentic-coding.polished-boat-17b2.workers.dev/html/', desc: 'Edge production deployment' },
      { emoji: '📄', label: 'GitHub Pages', url: 'https://rifaterdemsahin.github.io/sep-3-agentic-coding/html/index.html', desc: 'Legacy static hosting (forwards to Cloudflare)' },
      { emoji: '🐙', label: 'GitHub Repo', url: 'https://github.com/rifaterdemsahin/sep-3-agentic-coding', desc: 'Source code' }
    ]],
    ['🗄️', 'Data & Storage', [
      { emoji: '🗄️', label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard/project/mdsykpdkdprtmkccukle', desc: 'content_blocks, notes, ratings, audio_clips' },
      { emoji: '📋', label: 'Supabase Table Editor', url: 'https://supabase.com/dashboard/project/mdsykpdkdprtmkccukle/editor/17522', desc: 'Direct database table editor' },
      { emoji: '☁️', label: 'Azure Portal', url: 'https://portal.azure.com/auth/login/', desc: 'Azure Blob Storage — asset backup sync' },
      { emoji: '🖼️', label: 'Azure Container (sep-3-agentic-coding)', url: 'https://portal.azure.com/#view/Microsoft_Azure_Storage/ContainerMenuBlade/~/overview/storageAccountId/%2Fsubscriptions%2Fb85b029d-9f7c-4c5a-8939-819480780c5d%2FresourceGroups%2Fdeliverypilot-rg%2Fproviders%2FMicrosoft.Storage%2FstorageAccounts%2Fdpprojects/path/sep-3-agentic-coding/etag/%220x8DF0E4F96506ADE%22/defaultId//publicAccessVal/Blob', desc: 'Direct container view & image carousel assets' },
      { emoji: '🧠', label: 'Second Brain Server', url: 'http://localhost:30080/', desc: 'Must be running before opening any local page' },
      { emoji: '📓', label: 'Second Brain — Sample Note', url: 'http://localhost:30080/markdown_renderer.html?path=4_Archieve%2F2026%2F09%2F08%2F2026-09-08-nursery-financial-analysis-comprehensive-report.md', desc: 'Local notes vault (markdown renderer)' }
    ]],
    ['🎬', 'Production Tools', [
      { emoji: '🌊', label: 'Google Flow', url: 'https://flow.google.com/u/1/project/ec557d11-2773-4887-babb-f12b65e4b7b7/edit/88f11cfc-17da-476b-8ff3-7e8bb5790963', desc: 'AI video generation and asset pipeline' },
      { emoji: '🎙️', label: 'Kokoro Voices (TTS)', url: 'https://secondbrain-kokoro.fly.dev/voices', desc: 'Voice-over generation service' },
      { emoji: '🎨', label: 'Canva Design', url: 'https://www.canva.com/design/DAHTV1XbvSs/uyMkcD8cZwdHn03nhVnC_w/edit', desc: 'Pipeline design board' }
    ]],
    ['🔬', 'Research', [
      { emoji: '✨', label: 'Gemini Research Chat', url: 'https://gemini.google.com/app/732deb1f1441e2fd', desc: "Task Decomposition — research thread" },
      { emoji: '🤖', label: 'Grok', url: 'https://grok.com', desc: 'AI research & counterpoint checks' },
      { emoji: '▶️', label: 'YouTube', url: 'https://www.youtube.com', desc: 'Source videos & eventual upload destination' },
      { emoji: '📊', label: 'The Economist · Data', url: 'https://www.economist.com/', desc: 'Net AI jobs-impact charts' }
    ]],
    ['👥', 'Community', [
      { emoji: '🏫', label: 'Skool', url: 'https://www.skool.com', desc: 'Community CTA cross-link destination' },
      { emoji: '🎓', label: 'Course', url: 'https://www.skool.com/delivery-pilot-8938/classroom', desc: 'Delivery Pilot classroom' }
    ]],
    ['🧰', 'Browser Utilities', [
      { emoji: '🗂️', label: 'Tab to Top', url: 'https://chromewebstore.google.com/detail/tab-to-top-move-tabs-to-t/edncbfiemmpedhdjechpipmpnbcgipim?hl=en', desc: 'Chrome extension — manage & reorder tabs' }
    ]]
  ];

  // ---------------------------------------------------------------------
  // Search palette index — three sources merged into one list so the box
  // finds pages, tools, AND every piece of Supabase content (arguments,
  // research notes, script beats, design specs, shot panels, source links):
  //   1. Static PAGES  (kind: 'page', jumps within the site)
  //   2. Static TOOLS  (kind: 'tool', opens the external tool)
  //   3. content_blocks (kind: 'content', jumps to the page that holds it)
  // ---------------------------------------------------------------------
  var pageIndex = PAGES.map(function(p){
    return { kind: 'page', href: p.file, icon: p.emoji, title: p.label, sub: 'Page', haystack: p.label.toLowerCase() };
  });

  var toolIndex = [];
  TOOL_GROUPS.forEach(function(group){
    var groupLabel = group[1];
    group[2].forEach(function(t){
      toolIndex.push({
        kind: 'tool', href: t.url, icon: t.emoji, title: t.label,
        sub: '🧰 ' + groupLabel, haystack: (t.label + ' ' + t.desc + ' ' + groupLabel).toLowerCase()
      });
    });
  });

  function pageMeta(file){
    return PAGES.filter(function(p){ return p.file === file; })[0];
  }

  var contentIndex = [];
  var searchReady = (window.sb ? window.sb.from('content_blocks').select('page, section, type, data') : Promise.resolve({ data: [] }))
    .then(function(res){
      if(res.error){ console.error('Nav search index load failed', res.error); return; }
      contentIndex = (res.data || []).map(function(row){
        var d = row.data || {};
        var label = d.title || d.fullTitle || d.num || (row.section.replace(/-/g, ' '));
        // Strip any inline HTML tags authors embedded in title/body fields.
        label = String(label).replace(/<[^>]*>/g, '').trim();
        var meta = pageMeta(row.page);
        var pageLabel = meta ? (meta.emoji + ' ' + meta.label) : row.page;
        var haystack = (label + ' ' + JSON.stringify(d)).toLowerCase();
        return { kind: 'content', href: row.page, icon: '📄', title: label, sub: pageLabel, haystack: haystack };
      });
    });

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Wrap the first case-insensitive occurrence of `q` in <mark> so the
  // matched substring is visually obvious in the results list.
  function highlight(text, q){
    var safe = escapeHtml(text);
    if(!q) return safe;
    var idx = safe.toLowerCase().indexOf(q.toLowerCase());
    if(idx === -1) return safe;
    return safe.slice(0, idx) + '<mark>' + safe.slice(idx, idx + q.length) + '</mark>' + safe.slice(idx + q.length);
  }

  // Rank: page/tool title matches first, then content title matches, then
  // matches buried in a content block's body — so the most obviously
  // relevant thing always lands on top.
  function runSearch(query){
    var q = query.trim().toLowerCase();
    if(!q) return [];
    var all = pageIndex.concat(toolIndex, contentIndex);
    var scored = [];
    all.forEach(function(item){
      var titleHit = item.title.toLowerCase().indexOf(q) !== -1;
      var bodyHit = item.haystack.indexOf(q) !== -1;
      if(!titleHit && !bodyHit) return;
      var rank = titleHit ? (item.kind === 'content' ? 1 : 0) : 2;
      scored.push({ item: item, rank: rank });
    });
    scored.sort(function(a, b){ return a.rank - b.rank; });
    return scored.map(function(s){ return s.item; }).slice(0, 10);
  }

  function getRecent(){
    try{ return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }catch(e){ return []; }
  }
  function pushRecent(item){
    try{
      var recent = getRecent().filter(function(r){ return r.href !== item.href; });
      recent.unshift({ kind: item.kind, href: item.href, icon: item.icon, title: item.title, sub: item.sub });
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, RECENT_MAX)));
    }catch(e){}
  }

  function resultRowHtml(item, q, i){
    var extra = item.kind !== 'page' ? ' target="_blank" rel="noopener"' : '';
    var kindBadge = item.kind === 'tool' ? '🧰' : (item.kind === 'page' ? '🧭' : '📄');
    return '<a class="search-result" data-idx="' + i + '" href="' + escapeHtml(item.href) + '"' + extra + '>' +
      '<span class="sr-icon">' + item.icon + '</span>' +
      '<span class="sr-body">' +
        '<span class="sr-title">' + highlight(item.title, q) + '</span>' +
        '<span class="sr-page">' + kindBadge + ' ' + escapeHtml(item.sub) + '</span>' +
      '</span>' +
    '</a>';
  }

  // Generic collapsible dropdown wiring — used for the Pipeline and Tools
  // top-level menus so their open/close/outside-click/Escape behavior
  // stays identical.
  function wireDropdown(toggleId, menuId, wrapId){
    var toggle = document.getElementById(toggleId);
    var menu = document.getElementById(menuId);
    var wrap = document.getElementById(wrapId);
    if(!toggle || !menu || !wrap) return;

    toggle.addEventListener('click', function(e){
      e.stopPropagation();
      var opening = menu.hidden;
      document.querySelectorAll('.topnav .menu-panel').forEach(function(m){
        if(m !== menu) m.hidden = true;
      });
      menu.hidden = !opening;
    });
    document.addEventListener('click', function(e){
      if(!wrap.contains(e.target)) menu.hidden = true;
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') menu.hidden = true;
    });
  }

  // Search opens as a centered modal (command-palette style) rather than a
  // small anchored dropdown — easier to read, easier to scan results, works
  // with quick "jump to a page" / recent-search suggestions before you've
  // typed anything, and supports arrow-key navigation plus a ⌘K/Ctrl+K
  // shortcut from anywhere on the site.
  function wireSearchModal(){
    var toggle = document.getElementById('nav-search-toggle');
    var overlay = document.getElementById('nav-search-overlay');
    var input = document.getElementById('nav-search-input');
    var closeBtn = document.getElementById('nav-search-close');
    var results = document.getElementById('nav-search-results');
    if(!toggle || !overlay || !input || !results) return;

    var activeIndex = -1;
    var lastMatches = [];

    function quickSuggestions(){
      var recent = getRecent();
      var sections = [];
      if(recent.length){
        sections.push('<div class="search-section-label">Recent</div>' +
          recent.map(function(item, i){ return resultRowHtml(item, '', i); }).join(''));
        lastMatches = recent;
      } else {
        lastMatches = [];
      }
      sections.push('<div class="search-section-label">Jump to a page</div>' +
        pageIndex.map(function(item, i){
          var idx = recent.length + i;
          return resultRowHtml(item, '', idx);
        }).join(''));
      lastMatches = lastMatches.concat(pageIndex);
      return sections.join('');
    }

    function renderResults(){
      var q = input.value.trim();
      activeIndex = -1;
      if(!q){
        results.innerHTML = quickSuggestions();
        return;
      }
      var matches = runSearch(q);
      lastMatches = matches;
      if(!matches.length){
        results.innerHTML = '<div class="search-empty">No matches for "' + escapeHtml(q) + '" — try a different word, or browse 📂 Pipeline / 🧰 Tools.</div>';
        return;
      }
      results.innerHTML = matches.map(function(item, i){ return resultRowHtml(item, q, i); }).join('');
    }

    function setActive(i){
      var rows = results.querySelectorAll('.search-result');
      if(!rows.length) return;
      activeIndex = (i + rows.length) % rows.length;
      rows.forEach(function(r, idx){ r.classList.toggle('active', idx === activeIndex); });
      rows[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    function open(){
      overlay.hidden = false;
      document.querySelectorAll('.topnav .menu-panel').forEach(function(m){ m.hidden = true; });
      renderResults();
      input.focus();
      input.select();
    }
    function close(){
      overlay.hidden = true;
    }

    toggle.addEventListener('click', function(e){
      e.stopPropagation();
      if(overlay.hidden) open(); else close();
    });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e){
      if(e.target === overlay) close();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !overlay.hidden) close();
      // Cmd/Ctrl+K opens search from anywhere, like most command palettes.
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
        e.preventDefault();
        if(overlay.hidden) open(); else close();
      }
    });

    input.addEventListener('input', renderResults);
    input.addEventListener('keydown', function(e){
      var rows = results.querySelectorAll('.search-result');
      if(e.key === 'ArrowDown'){ e.preventDefault(); setActive(activeIndex + 1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); setActive(activeIndex - 1); }
      else if(e.key === 'Enter'){
        var target = activeIndex >= 0 ? rows[activeIndex] : rows[0];
        if(target){
          e.preventDefault();
          var idx = target.getAttribute('data-idx');
          var item = /^\d+$/.test(idx) ? lastMatches[idx] : null;
          if(item) pushRecent(item);
          target.click();
        }
      }
    });
    results.addEventListener('click', function(e){
      var row = e.target.closest ? e.target.closest('.search-result') : null;
      if(!row) return;
      var idx = row.getAttribute('data-idx');
      var item = /^\d+$/.test(idx) ? lastMatches[idx] : null;
      if(item) pushRecent(item);
    });

    searchReady.then(function(){
      if(!overlay.hidden && input.value) renderResults();
    });
  }

  function render(currentId){
    var mount = document.getElementById('nav-mount');
    if(!mount) return;

    var rememberActive = REMEMBER_PAGES.some(function(p){ return p.id === currentId; });
    var rememberItems = REMEMBER_PAGES.map(function(p){
      var cls = p.id === currentId ? ' class="tools-item active"' : ' class="tools-item"';
      var style = ' style="--nav-color:' + p.color + ';"';
      return '<a href="' + p.file + '"' + cls + style + '>' +
        '<span class="ti-label">' + p.emoji + ' ' + p.label + '</span>' +
      '</a>';
    }).join('');

    var understandActive = UNDERSTAND_PAGES.some(function(p){ return p.id === currentId; });
    var understandItems = UNDERSTAND_PAGES.map(function(p){
      var cls = p.id === currentId ? ' class="tools-item active"' : ' class="tools-item"';
      var style = ' style="--nav-color:' + p.color + ';"';
      return '<a href="' + p.file + '"' + cls + style + '>' +
        '<span class="ti-label">' + p.emoji + ' ' + p.label + '</span>' +
      '</a>';
    }).join('');

    var liveHref = LIVE_BASE + (PAGES.filter(function(p){ return p.id === currentId; })[0] || PAGES[0]).file;

    // Each tool group is its own native <details> accordion — collapsible
    // independently, open by default, no extra JS needed to wire it up.
    var toolGroups = TOOL_GROUPS.map(function(group){
      var groupEmoji = group[0], groupLabel = group[1], tools = group[2];
      var items = tools.map(function(t){
        return '<a class="tools-item" href="' + t.url + '" target="_blank" rel="noopener">' +
          '<span class="ti-label">' + t.emoji + ' ' + t.label + '</span>' +
          '<span class="ti-desc">' + t.desc + '</span>' +
        '</a>';
      }).join('');
      return '<details class="tools-group" open>' +
        '<summary class="tools-group-label">' + groupEmoji + ' ' + groupLabel + '</summary>' +
        items +
      '</details>';
    }).join('');

    var tasksActive = currentId === 'todo';
    var createActive = currentId === 'todo' || currentId === 'journal' || currentId === 'retro' || currentId === 'maturity';
    var tasksGroup =
      '<details class="tools-group" open>' +
        '<summary class="tools-group-label">✅ Tasks</summary>' +
        '<a class="tools-item' + (tasksActive ? ' active' : '') + '" href="' + TASKS_PAGE.file + '">' +
          '<span class="ti-label">' + TASKS_PAGE.emoji + ' ' + TASKS_PAGE.label + '</span>' +
        '</a>' +
      '</details>';

    var stats = getGamifiedStats();
    var gamifiedBadge =
      '<a class="nav-gamified-badge" href="todo.html" title="' + stats.rank + ' · ' + stats.done + ' Done, ' + stats.todo + ' Pending (' + stats.percent + '%) · Click to view Tasks">' +
        '<span class="ngb-lvl">⭐ Lvl ' + stats.level + '</span>' +
        '<div class="ngb-track">' +
          '<div class="ngb-fill done" style="width:' + stats.donePct + '%;"></div>' +
          '<div class="ngb-fill prog" style="width:' + stats.progPct + '%;"></div>' +
        '</div>' +
        '<span class="ngb-stats"><span class="ngb-done"><b>' + stats.done + '</b></span>/<span class="ngb-pending"><b>' + stats.todo + '</b></span> <span style="opacity:.7">(' + stats.percent + '%)</span></span>' +
      '</a>';

    mount.outerHTML =
      '<nav class="topnav">' +
        '<div class="topnav-inner">' +
          '<a class="brand" href="index.html">🧠 Task Decomposition <span>· Course Module</span></a>' +
          '<div class="links">' +
            '<div class="menu-wrap" id="nav-remember-wrap">' +
              '<button type="button" class="menu-toggle' + (rememberActive ? ' active' : '') + '" id="nav-remember-toggle" style="--nav-color:' + MENU_COLORS.remember + ';">🧠 Remember <span class="menu-caret">▾</span></button>' +
              '<div class="menu-panel tools-menu" id="nav-remember-menu" hidden>' + rememberItems + '</div>' +
            '</div>' +
            '<div class="menu-wrap" id="nav-understand-wrap">' +
              '<button type="button" class="menu-toggle' + (understandActive ? ' active' : '') + '" id="nav-understand-toggle" style="--nav-color:' + MENU_COLORS.understand + ';">💡 Understand <span class="menu-caret">▾</span></button>' +
              '<div class="menu-panel tools-menu" id="nav-understand-menu" hidden>' + understandItems + '</div>' +
            '</div>' +
            '<div class="menu-wrap" id="nav-analysis-wrap">' +
              '<button type="button" class="menu-toggle' + ((currentId === 'sanity-check' || currentId === 'about' || currentId === 'task-report' || currentId === 'script-v2-report') ? ' active' : '') + '" id="nav-analysis-toggle" style="--nav-color:' + MENU_COLORS.analysis + ';">📊 Analysis <span class="menu-caret">▾</span></button>' +
              '<div class="menu-panel tools-menu" id="nav-analysis-menu" hidden>' +
                '<a class="tools-item' + (currentId === 'about' ? ' active' : '') + '" href="about.html">' +
                  '<span class="ti-label">🎬 About this video</span>' +
                  '<span class="ti-desc">The 5W1H behind the video</span>' +
                '</a>' +
                '<a class="tools-item' + (currentId === 'sanity-check' ? ' active' : '') + '" href="sanity-check.html">' +
                  '<span class="ti-label">🩺 Sanity Check Report</span>' +
                  '<span class="ti-desc">Project health & logic checks</span>' +
                '</a>' +
                '<a class="tools-item' + (currentId === 'task-report' ? ' active' : '') + '" href="task-report.html">' +
                  '<span class="ti-label">📊 Task Report</span>' +
                  '<span class="ti-desc">Progress by stage & recommended focus</span>' +
                '</a>' +
                '<a class="tools-item' + (currentId === 'script-v2-report' ? ' active' : '') + '" href="script-v2-report.html">' +
                  '<span class="ti-label">📏 Script v2 Sanity Check</span>' +
                  '<span class="ti-desc">Length audit & trim recommendations</span>' +
                '</a>' +
              '</div>' +
            '</div>' +
            '<div class="menu-wrap" id="nav-evaluate-wrap">' +
              '<button type="button" class="menu-toggle' + ((currentId === 'confidence_check' || currentId === 'plain-english' || currentId === 'script-review') ? ' active' : '') + '" id="nav-evaluate-toggle" style="--nav-color:' + MENU_COLORS.evaluate + ';">⚖️ Evaluate <span class="menu-caret">▾</span></button>' +
              '<div class="menu-panel tools-menu" id="nav-evaluate-menu" hidden>' +
                '<a class="tools-item' + (currentId === 'confidence_check' ? ' active' : '') + '" href="confidence_check.html">' +
                  '<span class="ti-label">📈 Confidence Check</span>' +
                  '<span class="ti-desc">Live confidence score for the project — updates as you work</span>' +
                '</a>' +
                '<a class="tools-item' + (currentId === 'plain-english' ? ' active' : '') + '" href="plain-english.html">' +
                  '<span class="ti-label">🗣️ Plain English Review</span>' +
                  '<span class="ti-desc">Before/after: script jargon vs. layman\'s terms</span>' +
                '</a>' +
                '<a class="tools-item' + (currentId === 'script-review' ? ' active' : '') + '" href="script-review.html">' +
                  '<span class="ti-label">📝 Script Review</span>' +
                  '<span class="ti-desc">Full-argument rewrite: all 22 arguments, cherry-picked</span>' +
                '</a>' +
              '</div>' +
            '</div>' +
            '<div class="menu-wrap" id="nav-create-wrap">' +
              '<button type="button" class="menu-toggle' + (createActive ? ' active' : '') + '" id="nav-create-toggle" style="--nav-color:' + MENU_COLORS.create + ';">✨ Create <span class="menu-caret">▾</span></button>' +
              '<div class="menu-panel tools-menu" id="nav-create-menu" hidden>' +
                '<a class="tools-item' + (currentId === 'journal' ? ' active' : '') + '" href="journal.html">' +
                  '<span class="ti-label">📓 Journal</span>' +
                '</a>' +
                '<a class="tools-item' + (currentId === 'retro' ? ' active' : '') + '" href="retro.html">' +
                  '<span class="ti-label">🔁 Retro</span>' +
                '</a>' +
                '<a class="tools-item' + (currentId === 'maturity' ? ' active' : '') + '" href="maturity.html">' +
                  '<span class="ti-label">🌱 Maturity</span>' +
                  '<span class="ti-desc">What we\'ve learned from old projects</span>' +
                '</a>' +
                '<a class="tools-item" href="todo.html?newTask=1">' +
                  '<span class="ti-label">➕ Create Task</span>' +
                  '<span class="ti-desc">Quick-add a task to the Production Plan</span>' +
                '</a>' +
                '<a class="tools-item" href="https://www.canva.com/design/DAHTV1XbvSs/uyMkcD8cZwdHn03nhVnC_w/edit" target="_blank" rel="noopener">' +
                  '<span class="ti-label">🎨 Canva Workshop</span>' +
                  '<span class="ti-desc">Visual design pipeline</span>' +
                '</a>' +
                '<a class="tools-item" href="https://studio.youtube.com/" target="_blank" rel="noopener">' +
                  '<span class="ti-label">▶️ YouTube Studio</span>' +
                  '<span class="ti-desc">Upload and publish</span>' +
                '</a>' +
                tasksGroup + toolGroups +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="right-links" style="display:flex;align-items:center;gap:12px;">' +
            '<div class="menu-wrap" id="nav-search-wrap">' +
              '<button type="button" class="menu-toggle" id="nav-search-toggle" style="--nav-color:' + MENU_COLORS.search + ';">🔎 Search <span class="menu-shortcut">⌘K</span></button>' +
            '</div>' +
            gamifiedBadge +
            '<div class="menu-wrap" id="nav-theme-wrap"></div>' +
            '<a class="live" href="' + liveHref + '" target="_blank" rel="noopener">🌐 Live</a>' +
          '</div>' +
        '</div>' +
        '<div class="nav-xp-bar" title="Production XP: ' + stats.xp + ' / ' + stats.maxXP + ' XP (' + stats.percent + '%)">' +
          '<div class="nav-xp-fill-done" style="width:' + stats.donePct + '%;"></div>' +
          '<div class="nav-xp-fill-prog" style="width:' + stats.progPct + '%;"></div>' +
        '</div>' +
      '</nav>' +
      '<div class="search-overlay" id="nav-search-overlay" hidden>' +
        '<div class="search-modal">' +
          '<div class="search-modal-head">' +
            '<span class="search-modal-icon">🔎</span>' +
            '<input type="text" id="nav-search-input" placeholder="Search pages, tools, arguments, research…" autocomplete="off" spellcheck="false">' +
            '<button type="button" class="search-modal-close" id="nav-search-close" aria-label="Close search">✕</button>' +
          '</div>' +
          '<div class="search-results" id="nav-search-results"></div>' +
          '<div class="search-modal-foot"><span>↑↓</span> navigate · <span>↵</span> open · <span>esc</span> close</div>' +
        '</div>' +
      '</div>';

    wireDropdown('nav-remember-toggle', 'nav-remember-menu', 'nav-remember-wrap');
    wireDropdown('nav-understand-toggle', 'nav-understand-menu', 'nav-understand-wrap');
    wireDropdown('nav-analysis-toggle', 'nav-analysis-menu', 'nav-analysis-wrap');
    wireDropdown('nav-evaluate-toggle', 'nav-evaluate-menu', 'nav-evaluate-wrap');
    wireDropdown('nav-create-toggle', 'nav-create-menu', 'nav-create-wrap');
    wireSearchModal();
  }

  // Base task distribution for gamified stats calculation across all pages
  var BASE_TASKS = [
    { id: 'research', count: 8, done: 8, prog: 0 },
    { id: 'arguments', count: 7, done: 6, prog: 1 },
    { id: 'script', count: 7, done: 5, prog: 1 },
    { id: 'design', count: 6, done: 6, prog: 0 },
    { id: 'previsualisation', count: 5, done: 5, prog: 0 },
    { id: 'voice', count: 5, done: 0, prog: 0 },
    { id: 'footage', count: 4, done: 0, prog: 0 },
    { id: 'edit', count: 5, done: 0, prog: 0 },
    { id: 'review', count: 5, done: 0, prog: 0 },
    { id: 'publish', count: 10, done: 0, prog: 0 }
  ];

  window.PRODUCTION_PLAN = [
    {
      id: 'research', emoji: '🔍', name: 'Research', status: 'done',
      tasks: [
        { title: 'Collect source links (pro/con)', status: 'done' },
        { title: 'Pro/con video comparison table', status: 'done' },
        { title: 'Perspective comparison (Apocalypse vs. Permutation vs. Skeptic)', status: 'done' },
        { title: 'Economist AI jobs-impact charts (hard-hat labour & STEM)', status: 'done' },
        { title: 'Transcript pulled for key counter-source ("The REAL Reason…")', status: 'done' },
        { title: 'Mark research-verified findings on premise-supporting sources', status: 'done' },
        { title: 'Close & prune Chrome tabs (diverge/converge cleanup cycle)', status: 'done', recurring: true, cadence: 'Continuous · Per Stage' },
        { title: 'Ongoing research & counter-argument tracking (decaying cadence)', status: 'done', recurring: true, cadence: 'Decays with Confidence' }
      ]
    },
    {
      id: 'arguments', emoji: '🧩', name: 'Arguments', status: 'progress', wipLimit: 1,
      tasks: [
        { title: 'Core message', status: 'done' },
        { title: 'Premise', status: 'done' },
        { title: 'Audience transformation (before/after)', status: 'done' },
        { title: '20 argument cards', status: 'done' },
        { title: 'Argument 16 added: Moravec\'s Paradox', status: 'done' },
        { title: 'Argument 17 added: Velocity of money', status: 'done' },
        { title: 'Argument 18 added: The Stripe Indicator', status: 'done' },
        { title: 'Argument 19 added: Digital Leapfrog', status: 'done' },
        { title: 'Argument 20 added: Steelman Rebuttal', status: 'done' },
        { title: 'Conclusion', status: 'done' },
        { title: '7 Sanity-check cards', status: 'done' },
        { title: 'Commit + push wording refresh', status: 'progress' }
      ]
    },
    {
      id: 'script', emoji: '📝', name: 'Script', status: 'progress', wipLimit: 1,
      tasks: [
        { title: 'Hook (0:00–0:30)', status: 'done' },
        { title: 'Section 1 — Productivity Fallacy (0:30–1:45)', status: 'done' },
        { title: 'Section 2 — Infinite Permutation (1:45–2:45)', status: 'done' },
        { title: 'Section 3 — Education Democratization (2:45–3:45)', status: 'done' },
        { title: 'Conclusion & Outro (3:45–4:30)', status: 'done' },
        { title: 'Convert script into layman\'s terms', status: 'done' },
        { title: 'Commit + push beat-timing refresh', status: 'progress' }
      ]
    },
    {
      id: 'design', emoji: '🎨', name: 'Design', status: 'done',
      tasks: [
        { title: 'Three-act structure', status: 'done' },
        { title: 'Core editing rule', status: 'done' },
        { title: 'Palette & theme tokens', status: 'done' },
        { title: 'Typography samples', status: 'done' },
        { title: 'Motion specs table', status: 'done' },
        { title: 'Pacing bar across the timeline', status: 'done' }
      ]
    },
    {
      id: 'previsualisation', emoji: '🎞️', name: 'Previsualisation', status: 'done',
      tasks: [
        { title: 'Shot board: 9 panels boarded', status: 'done' },
        { title: 'Panel images generated for all 9 shots', status: 'done' },
        { title: 'Image-gen prompts written', status: 'done' },
        { title: '"Plain English" explainer per panel', status: 'done' },
        { title: 'VO line paired to each panel', status: 'done' }
      ]
    },
    {
      id: 'voice', emoji: '🎙️', name: 'Voice Recording', status: 'todo',
      tasks: [
        { title: 'Record/generate VO for Hook beat', status: 'todo' },
        { title: 'Record/generate VO for Section 1–3 beats', status: 'todo' },
        { title: 'Record/generate VO for Outro', status: 'todo' },
        { title: 'Cache generated audio (ElevenLabs)', status: 'todo' },
        { title: 'Time VO against each shot\'s timecode', status: 'todo' }
      ]
    },
    {
      id: 'footage', emoji: '🎥', name: 'Footage & Graphics Sourcing', status: 'todo',
      tasks: [
        { title: 'Generate/commission motion graphics', status: 'todo' },
        { title: 'Shoot or source talking-head footage', status: 'todo' },
        { title: 'Pull licensed news-headline montage clips', status: 'todo' },
        { title: 'Verify usage rights on every sourced clip', status: 'todo' }
      ]
    },
    {
      id: 'edit', emoji: '✂️', name: 'Edit', status: 'todo',
      tasks: [
        { title: 'Assemble rough cut', status: 'todo' },
        { title: 'Sync VO to visuals', status: 'todo' },
        { title: 'Color grade: cold slate-blue → warm gold arc', status: 'todo' },
        { title: 'Sound design & music bed', status: 'todo' },
        { title: 'Captions/subtitles', status: 'todo' }
      ]
    },
    {
      id: 'review', emoji: '✅', name: 'Review & QA', status: 'todo',
      tasks: [
        { title: 'Fact-check every on-screen claim', status: 'todo' },
        { title: 'Walk the 3 sanity-check items', status: 'todo' },
        { title: 'Layman\'s terms & clarity review pass', status: 'todo' },
        { title: 'Visual pacing test', status: 'todo' },
        { title: 'Check all CTA links and text overlays', status: 'todo' }
      ]
    },
    {
      id: 'publish', emoji: '🚀', name: 'Publish & Distribute', status: 'todo',
      tasks: [
        { title: 'Export final master', status: 'todo' },
        { title: 'Thumbnail design', status: 'todo' },
        { title: 'Title & description SEO optimization', status: 'todo' },
        { title: 'Upload to YouTube & schedule', status: 'todo' },
        { title: 'Shorts/Reels cutdowns', status: 'todo' },
        { title: 'Cross-post to Twitter/X & LinkedIn', status: 'todo' },
        { title: 'Skool community announcement', status: 'todo' },
        { title: 'Update project status on repo', status: 'todo' },
        { title: 'Email list blast', status: 'todo' },
        { title: 'Monitor first 24h metrics', status: 'todo' }
      ]
    }
  ];

  function getGamifiedStats(){
    var overrides = {};
    var custom = {};
    try{ overrides = JSON.parse(localStorage.getItem('todoStatusOverrides') || '{}'); }catch(e){}
    try{ custom = JSON.parse(localStorage.getItem('todoCustomTasks') || '{}'); }catch(e){}

    var done = 0;
    var prog = 0;
    var total = 0;
    
    var inProgressTasks = [];

    window.PRODUCTION_PLAN.forEach(function(st, sIndex){
      st.tasks.forEach(function(t, tIndex){
        total++;
        var taskId = 'todo-' + st.id + '-' + tIndex;
        var status = overrides[taskId] || t.status;
        if(status === 'done') done++;
        else if(status === 'progress') {
          prog++;
          inProgressTasks.push({ id: taskId, title: st.emoji + ' ' + t.title });
        }
      });
      var cList = custom[st.id] || [];
      cList.forEach(function(ct){
        total++;
        var status = overrides[ct.id] || ct.status || 'todo';
        if(status === 'done') done++;
        else if(status === 'progress') {
          prog++;
          inProgressTasks.push({ id: ct.id, title: st.emoji + ' ' + ct.title });
        }
      });
    });

    var todo = total - done - prog;
    var percent = total > 0 ? Math.round((done / total) * 100) : 0;
    var donePct = total > 0 ? ((done / total) * 100).toFixed(1) : 0;
    var progPct = total > 0 ? ((prog / total) * 100).toFixed(1) : 0;
    var xp = (done * 100) + (prog * 35);
    var maxXP = total * 100;

    var lvl = 1;
    var rank = 'Concept Novice 🌱';
    if(percent >= 100){ lvl = 'MAX'; rank = 'Production Deity 🏆'; }
    else if(percent >= 80){ lvl = 5; rank = 'Master Producer ⚡'; }
    else if(percent >= 60){ lvl = 4; rank = 'Previz Maestro 🎬'; }
    else if(percent >= 40){ lvl = 3; rank = 'Visual Director 🎨'; }
    else if(percent >= 20){ lvl = 2; rank = 'Script Architect 📝'; }

    return {
      done: done, prog: prog, todo: todo, total: total,
      percent: percent, donePct: donePct, progPct: progPct,
      xp: xp, maxXP: maxXP, level: lvl, rank: rank,
      inProgressTasks: inProgressTasks
    };
  }

  function renderBottomBar() {
    var existing = document.getElementById('nav-bottom-bar');
    if (existing) existing.remove();

    var stats = getGamifiedStats();
    if (!stats.inProgressTasks || stats.inProgressTasks.length === 0) {
      document.body.style.paddingBottom = '';
      return;
    }
    
    var container = document.getElementById('agent-bottom-bars');
    if(!container){
      container = document.createElement('div');
      container.id = 'agent-bottom-bars';
      container.style.position = 'fixed';
      container.style.bottom = '0';
      container.style.left = '0';
      container.style.right = '0';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column-reverse'; // Stack from bottom up
      document.body.appendChild(container);
    }
    
    var bar = document.createElement('div');
    bar.id = 'nav-bottom-bar';
    bar.style.width = '100%';
    bar.style.boxSizing = 'border-box';
    bar.style.background = 'rgba(15, 15, 18, 0.95)';
    bar.style.backdropFilter = 'blur(10px)';
    bar.style.borderTop = '1px solid var(--panel-border)';
    bar.style.boxShadow = '0 -4px 12px rgba(0,0,0,0.3)';
    bar.style.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
    
    var header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.padding = '8px 24px';
    header.style.cursor = 'pointer';
    header.style.userSelect = 'none';
    
    var title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.color = 'var(--accent)';
    title.style.marginRight = '16px';
    title.style.whiteSpace = 'nowrap';
    title.style.fontSize = '12.5px';
    title.style.textTransform = 'uppercase';
    title.style.letterSpacing = '.06em';
    title.innerHTML = '⚡ ' + stats.inProgressTasks.length + ' Tasks In Progress';
    
    var caret = document.createElement('span');
    caret.innerHTML = '▲';
    caret.style.fontSize = '11px';
    caret.style.color = 'var(--text-dim, #9aa1b0)';
    caret.style.marginLeft = 'auto';
    caret.style.transition = 'transform .15s ease';
    
    header.appendChild(title);
    header.appendChild(caret);
    
    var body = document.createElement('div');
    body.style.display = 'none'; // Collapsed by default
    body.style.padding = '0 24px 12px';
    
    var list = document.createElement('div');
    list.style.display = 'flex';
    list.style.gap = '12px';
    list.style.overflowX = 'auto';
    list.style.whiteSpace = 'nowrap';
    list.style.scrollbarWidth = 'none';
    list.style.paddingTop = '4px';
    
    stats.inProgressTasks.forEach(function(t) {
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.style.background = 'rgba(232,185,74,.15)';
      pill.style.border = '1px solid rgba(232,185,74,.3)';
      pill.style.color = '#fff';
      pill.style.padding = '4px 12px';
      pill.style.borderRadius = '999px';
      pill.style.fontSize = '11.5px';
      pill.style.cursor = 'pointer';
      pill.style.transition = 'background 0.2s';
      pill.innerText = t.title;
      pill.onmouseover = function() { pill.style.background = 'rgba(232,185,74,.3)'; };
      pill.onmouseout = function() { pill.style.background = 'rgba(232,185,74,.15)'; };
      
      pill.onclick = function(e) {
        e.stopPropagation();
        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0,0,0,0.6)';
        overlay.style.zIndex = '10000';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.innerHTML = '<div style="background: var(--panel, #13161f); border: 1px solid var(--panel-border, #232838); border-radius: 12px; padding: 24px; max-width: 400px; width: 100%; font-family: -apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">' +
          '<h3 style="margin-top:0; color: var(--text, #fff); font-size: 16px;">Update Task</h3>' +
          '<p style="color: var(--text-dim, #ccc); font-size: 13.5px; margin-bottom: 24px; line-height: 1.4;">' + t.title + '</p>' +
          '<div style="display:flex; flex-direction: column; gap: 8px;">' +
            '<button id="btn-done" style="background: #7be08a; color: #13161f; border:none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer;">✅ Mark as Done</button>' +
            '<button id="btn-todo" style="background: transparent; color: var(--text, #fff); border: 1px solid var(--panel-border, #232838); padding: 10px; border-radius: 6px; cursor: pointer;">↩️ Revert to To-Do</button>' +
            '<button id="btn-go" style="background: transparent; color: var(--accent-2, #5ab0ff); border: 1px solid var(--panel-border, #232838); padding: 10px; border-radius: 6px; cursor: pointer;">📋 Open in Production Plan</button>' +
            '<button id="btn-cancel" style="background: transparent; color: var(--text-dim, #ccc); border: none; padding: 10px; margin-top: 8px; cursor: pointer;">Cancel</button>' +
          '</div></div>';
        
        document.body.appendChild(overlay);

        function close() { overlay.remove(); }
        function setStatus(s) {
           var overrides = {};
           try { overrides = JSON.parse(localStorage.getItem('todoStatusOverrides') || '{}'); } catch(err){}
           overrides[t.id] = s;
           localStorage.setItem('todoStatusOverrides', JSON.stringify(overrides));
           renderBottomBar();
           if (typeof renderSummary === 'function') renderSummary();
           if (typeof renderBoard === 'function') renderBoard();
           close();
        }

        overlay.querySelector('#btn-done').onclick = function() { setStatus('done'); };
        overlay.querySelector('#btn-todo').onclick = function() { setStatus('todo'); };
        overlay.querySelector('#btn-go').onclick = function() { location.href = 'todo.html'; close(); };
        overlay.querySelector('#btn-cancel').onclick = close;
      };
      
      list.appendChild(pill);
    });
    
    body.appendChild(list);
    
    header.addEventListener('click', function() {
      var isOpen = body.style.display === 'block';
      body.style.display = isOpen ? 'none' : 'block';
      caret.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });
    
    bar.appendChild(header);
    bar.appendChild(body);
    container.appendChild(bar);
    
    // Add padding to body so content isn't obscured
    document.body.style.paddingBottom = '80px';
  }

  // Auto-render bottom bar on all pages
  window.addEventListener('DOMContentLoaded', renderBottomBar);

  window.Nav = { PAGES: PAGES, render: render, getGamifiedStats: getGamifiedStats, renderBottomBar: renderBottomBar };
})();
