(function(){
  // The pre-production pipeline: each stage feeds the next. Display order
  // starts with Arguments (matches the top nav), the underlying
  // dependency each "feeds" line describes is unchanged.
  var STAGES = [
    {
      id: 'unknowns',
      emoji: '❓',
      label: 'Unknowns',
      file: 'unknowns.html',
      tagline: 'Prior beliefs, open questions, falsification conditions',
      feeds: 'Feeds Research: what I believe going in is what Research has to test.'
    },
    {
      id: 'research',
      emoji: '🔍',
      label: 'Research',
      file: 'index.html',
      tagline: 'Source links, counter-arguments, footage leads',
      feeds: 'Feeds Arguments: raw sources and counter-evidence get distilled into a premise, arguments, and conclusion.'
    },
    {
      id: 'arguments',
      emoji: '🧩',
      label: 'Arguments',
      file: 'arguments.html',
      tagline: 'Premise, arguments, conclusion',
      feeds: 'Feeds the script: each argument becomes a voiceover beat and shot direction.'
    },
    {
      id: 'script',
      emoji: '📝',
      label: 'Script',
      file: 'script.html',
      tagline: 'Voiceover beats, timed sections',
      feeds: 'Feeds the design: each beat\'s mood drives the visual style rules.'
    },
    {
      id: 'design',
      emoji: '🎨',
      label: 'Design',
      file: 'design.html',
      tagline: 'Palette, typography, pacing, motion specs',
      feeds: 'Feeds the previsualisation: the three-act pacing and motion specs become the shot list.'
    },
    {
      id: 'previsualisation',
      emoji: '🎞️',
      label: 'Previsualisation',
      file: 'previsualisation.html',
      tagline: 'Shot-by-shot board, ready for the edit',
      feeds: 'Feeds Assets: each shot becomes a B-roll/asset item to source.'
    },
    {
      id: 'assets',
      emoji: '🗂️',
      label: 'Assets',
      file: 'assets.html',
      tagline: 'B-roll catalog, audience deliverable',
      feeds: 'Feeds the production plan: saved assets become checklist items.'
    },
    {
      id: 'todo',
      emoji: '✅',
      label: 'Production Plan',
      file: 'todo.html',
      tagline: 'Kanban board through to publish',
      feeds: 'Feeds the Journal: decisions made while executing tasks get logged.'
    },
    {
      id: 'journal',
      emoji: '📓',
      label: 'Journal',
      file: 'journal.html',
      tagline: 'Decision log + this video\'s Formula',
      feeds: 'Feeds Retro: the decision trail is what gets tested against results.'
    },
    {
      id: 'retro',
      emoji: '🔁',
      label: 'Retro',
      file: 'retro.html',
      tagline: 'Hypothesis verdict, retention, what to change',
      feeds: 'Closes the loop back to Stage 0 — Unknowns gets its answers.'
    }
  ];

  function injectStyles(){
    if(document.getElementById('pipeline-styles')) return;
    var style = document.createElement('style');
    style.id = 'pipeline-styles';
    style.textContent =
      '.pipeline-wrap{max-width:1000px;margin:0 auto;padding:0 24px 32px;}'+
      '.pipeline-toggle{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;'+
        'background:var(--panel,#13161f);border:1px solid var(--panel-border,#232838);'+
        'border-radius:10px;padding:10px 14px;}'+
      '.pipeline-toggle:hover{border-color:var(--accent-2,#5ab0ff);}'+
      '.pipeline-toggle .pt-emoji{font-size:16px;}'+
      '.pipeline-toggle .pt-label{font-size:12.5px;font-weight:600;color:var(--text,#eef0f4);flex:1;}'+
      '.pipeline-toggle .pt-label b{color:var(--accent-2,#5ab0ff);}'+
      '.pipeline-toggle .pt-caret{font-size:11px;color:var(--text-dim,#9aa1b0);transition:transform .15s ease;}'+
      '.pipeline-wrap.open .pt-caret{transform:rotate(180deg);}'+
      '.pipeline-body{display:none;margin-top:10px;}'+
      '.pipeline-wrap.open .pipeline-body{display:block;}'+
      '.pipeline-track{display:flex;align-items:stretch;gap:0;flex-wrap:wrap;'+
        'background:var(--panel,#13161f);border:1px solid var(--panel-border,#232838);'+
        'border-radius:12px;padding:14px 10px;}'+
      '.pipeline-node{flex:1;min-width:120px;display:flex;flex-direction:column;align-items:center;'+
        'gap:2px;text-decoration:none;padding:8px 6px;border-radius:8px;text-align:center;'+
        'transition:background .15s ease;}'+
      '.pipeline-node:hover{background:rgba(255,255,255,.04);}'+
      '.pipeline-node .pn-num{font-size:10px;color:var(--text-dim,#9aa1b0);font-weight:700;}'+
      '.pipeline-node .pn-emoji{font-size:20px;line-height:1.2;}'+
      '.pipeline-node .pn-label{font-size:12px;font-weight:600;color:var(--text-dim,#9aa1b0);}'+
      '.pipeline-node .pn-tagline{font-size:10px;color:var(--text-dim,#9aa1b0);opacity:.75;max-width:140px;}'+
      '.pipeline-node.current .pn-label{color:var(--accent-2,#5ab0ff);}'+
      '.pipeline-node.current{background:rgba(90,176,255,.08);border:1px solid var(--accent-2,#5ab0ff);}'+
      '.pipeline-node.done .pn-label{color:var(--text,#eef0f4);}'+
      '.pipeline-node.done .pn-emoji{opacity:.85;}'+
      '.pipeline-arrow{align-self:center;color:var(--text-dim,#9aa1b0);font-size:16px;padding:0 4px;opacity:.5;}'+
      '.pipeline-arrow.done{opacity:1;color:var(--accent,#e8b94a);}'+
      '.pipeline-feeds{margin:10px 2px 0;font-size:12px;color:var(--text-dim,#9aa1b0);}'+
      '.pipeline-nextprev{display:flex;justify-content:space-between;margin-top:10px;font-size:12.5px;}'+
      '.pipeline-nextprev a{color:var(--accent-2,#5ab0ff);text-decoration:none;}'+
      '.pipeline-nextprev a:hover{text-decoration:underline;}'+
      '.pipeline-nextprev span{color:var(--text-dim,#9aa1b0);}';
    document.head.appendChild(style);
  }

  function render(currentId){
    var mount = document.getElementById('pipeline-stepper');
    if(!mount) return;
    injectStyles();

    var idx = STAGES.findIndex(function(s){ return s.id === currentId; });
    var track = '<div class="pipeline-track">';
    STAGES.forEach(function(s, i){
      var state = i < idx ? 'done' : (i === idx ? 'current' : 'upcoming');
      track +=
        '<a class="pipeline-node ' + state + '" href="' + s.file + '">' +
          '<span class="pn-num">STAGE ' + i + '</span>' +
          '<span class="pn-emoji">' + s.emoji + '</span>' +
          '<span class="pn-label">' + s.label + '</span>' +
          '<span class="pn-tagline">' + s.tagline + '</span>' +
        '</a>';
      if(i < STAGES.length - 1){
        track += '<span class="pipeline-arrow ' + (i < idx ? 'done' : '') + '">→</span>';
      }
    });
    track += '</div>';

    var current = STAGES[idx];
    var feeds = current && current.feeds
      ? '<p class="pipeline-feeds">➡️ ' + current.feeds + '</p>'
      : '';

    var prev = STAGES[idx - 1];
    var next = STAGES[idx + 1];
    var nextprev =
      '<div class="pipeline-nextprev">' +
        (prev ? '<a href="' + prev.file + '">← Back to ' + prev.label + '</a>' : '<span></span>') +
        (next ? '<a href="' + next.file + '">Next: ' + next.label + ' →</a>' : '<span></span>') +
      '</div>';

    var toggle =
      '<div class="pipeline-toggle">' +
        '<span class="pt-emoji">' + (current ? current.emoji : '🧭') + '</span>' +
        '<span class="pt-label">Stage ' + idx + ' of ' + (STAGES.length - 1) + ': <b>' + (current ? current.label : '') + '</b> — ' + (current ? current.tagline : '') + '</span>' +
        '<span class="pt-caret">▾</span>' +
      '</div>';

    mount.className = 'pipeline-wrap';
    mount.innerHTML = toggle + '<div class="pipeline-body">' + track + feeds + nextprev + '</div>';

    mount.querySelector('.pipeline-toggle').addEventListener('click', function(){
      mount.classList.toggle('open');
    });
  }

  window.Pipeline = {
    STAGES: STAGES,
    render: render
  };
})();
