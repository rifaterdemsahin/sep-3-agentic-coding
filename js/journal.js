(function(){
  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

  var STAGE_LABELS = {
    'unknowns.html': '❓ Unknowns', 'index.html': '🔍 Research', 'arguments.html': '🧩 Arguments',
    'script.html': '📝 Script', 'design.html': '🎨 Design', 'previsualisation.html': '🎞️ Previsualisation',
    'todo.html': '✅ Pre Production Plan'
  };

  function renderDecisions(){
    var mount = document.getElementById('decisions-mount');
    if(!mount) return;
    var decisions = ItemNotes.getDecisions();
    var byPage = {};
    decisions.forEach(function(d){
      var block = ContentDB.getBlockById(d.id);
      var page = block ? block.page : 'other';
      (byPage[page] = byPage[page] || []).push(d);
    });
    var pages = Object.keys(byPage);
    if(!pages.length){
      mount.innerHTML = '<p class="intro">No decisions logged yet — tick "📓 This is a decision" on any per-item note across the pipeline.</p>';
      return;
    }
    mount.innerHTML = pages.map(function(page){
      var label = STAGE_LABELS[page] || page;
      var rows = byPage[page].map(function(d){
        return '<div class="decision-row">' + esc(d.text) +
          '<span class="d-id">' + esc(d.id) + (page !== 'other' ? ' — <a href="' + page + '">view on ' + label + '</a>' : '') + '</span>' +
        '</div>';
      }).join('');
      return '<div class="stage-group"><h3>' + label + '</h3>' + rows + '</div>';
    }).join('');
  }

  function renderFormula(){
    var mount = document.getElementById('formula-mount');
    if(!mount) return;
    Patterns.getOwnPattern().then(function(row){
      row = row || { id: null, formula: '', symbol: '', evidence: '' };
      mount.innerHTML =
        '<div class="formula-card">' +
          '<label>Reusable rule (TODO: fill in once you have one)</label>' +
          '<textarea id="f-formula" rows="2" placeholder="TODO: reusable rule">' + esc(row.formula) + '</textarea>' +
          '<label>Symbol / mnemonic</label>' +
          '<input id="f-symbol" type="text" placeholder="TODO: symbol" value="' + esc(row.symbol) + '">' +
          '<label>Evidence (which retro field supports it)</label>' +
          '<input id="f-evidence" type="text" placeholder="e.g. retention_note" value="' + esc(row.evidence) + '">' +
          '<div style="margin-top:12px;"><button type="button" class="lock-btn" id="f-save" style="border-color:var(--accent-2);color:var(--accent-2);">💾 Save Formula</button> ' +
          '<span id="f-status" style="font-size:11px;color:var(--text-dim);"></span></div>' +
        '</div>';
      document.getElementById('f-save').addEventListener('click', function(){
        var formula = document.getElementById('f-formula').value.trim();
        var symbol = document.getElementById('f-symbol').value.trim();
        var evidence = document.getElementById('f-evidence').value.trim();
        Patterns.saveOwnPattern(row.id, formula, symbol, evidence).then(function(saved){
          if(saved) row.id = saved.id;
          document.getElementById('f-status').textContent = '✅ saved';
          setTimeout(function(){ var s = document.getElementById('f-status'); if(s) s.textContent = ''; }, 1500);
        });
      });
    });
  }

  function renderOtherFormulas(){
    var mount = document.getElementById('other-formulas-mount');
    if(!mount) return;
    Patterns.getOtherPatterns().then(function(rows){
      if(!rows.length){
        mount.innerHTML = '<p class="intro">No other videos have saved a Formula yet.</p>';
        return;
      }
      mount.innerHTML = rows.map(function(r){
        return '<div class="other-formula"><b>' + esc(r.video_id) + '</b> — ' + esc(r.formula || '(no formula text)') +
          (r.symbol ? ' <i>(' + esc(r.symbol) + ')</i>' : '') + '</div>';
      }).join('');
    });
  }

  function renderVerdictBanner(){
    var mount = document.getElementById('retro-verdict-banner');
    if(!mount) return;
    window.sb.from('retros').select('hypothesis_verdict').eq('video_id', window.VIDEO_ID).maybeSingle().then(function(res){
      if(res.error || !res.data || !res.data.hypothesis_verdict) return;
      var v = res.data.hypothesis_verdict;
      var label = v === 'held' ? '✅ Hypothesis held' : (v === 'partly' ? '⚠️ Hypothesis partly held' : '❌ Hypothesis failed');
      mount.innerHTML = '<div class="verdict-banner ' + v + '">' + label + ' — see the full Retro.</div>';
    });
  }

  function init(){
    Promise.all([ContentDB.ready, ItemNotes.ready]).then(function(){
      renderDecisions();
      renderFormula();
      renderOtherFormulas();
      renderVerdictBanner();
    });
  }

  window.Journal = { init: init };
})();
