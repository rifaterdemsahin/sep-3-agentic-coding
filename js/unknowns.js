// Stage 0 — Unknowns. Renders question-card content_blocks, implements the
// Snapshot lock (prior_belief + falsifier become read-only, status/answer
// stay editable), and shows the retro verdict banner once a retro exists.
(function(){
  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

  function saveBlockData(block){
    return window.sb.from('content_blocks').update({ data: block.data, updated_at: new Date().toISOString() })
      .eq('id', block.id).eq('video_id', window.VIDEO_ID)
      .then(function(res){ if(res.error) console.error('Question save failed', res.error); });
  }

  function renderCard(block){
    var d = block.data;
    var locked = !!d.snapshot_locked;
    var card = document.createElement('div');
    card.className = 'question-card';
    card.innerHTML =
      '<div class="q-title">' + esc(d.question) + '</div>' +
      '<label>Prior belief</label>' +
      '<textarea class="f-prior" rows="2" ' + (locked ? 'readonly' : '') + '>' + esc(d.prior_belief || '') + '</textarea>' +
      '<label>Falsifier — what would prove this wrong</label>' +
      '<textarea class="f-falsifier" rows="2" ' + (locked ? 'readonly' : '') + '>' + esc(d.falsifier || '') + '</textarea>' +
      '<label>Answer (fill in once you know)</label>' +
      '<textarea class="f-answer" rows="2">' + esc(d.answer || '') + '</textarea>' +
      '<div class="q-status-row">' +
        '<label style="margin:0;">Status</label>' +
        '<select class="f-status">' +
          ['open', 'answered', 'changed-my-mind', 'still-open'].map(function(s){
            return '<option value="' + s + '"' + (d.status === s ? ' selected' : '') + '>' + s + '</option>';
          }).join('') +
        '</select>' +
        (locked
          ? '<span class="lock-badge">🔒 snapshot locked</span>'
          : '<button type="button" class="lock-btn">🔒 Lock snapshot</button>') +
        '<span class="save-status"></span>' +
      '</div>';

    var status = card.querySelector('.save-status');
    function flash(msg){ status.textContent = msg; setTimeout(function(){ status.textContent = ''; }, 1200); }

    card.querySelector('.f-answer').addEventListener('change', function(e){
      d.answer = e.target.value;
      saveBlockData(block).then(function(){ flash('✅ saved'); });
    });
    card.querySelector('.f-status').addEventListener('change', function(e){
      d.status = e.target.value;
      saveBlockData(block).then(function(){ flash('✅ saved'); });
    });
    if(!locked){
      card.querySelector('.f-prior').addEventListener('change', function(e){ d.prior_belief = e.target.value; saveBlockData(block); });
      card.querySelector('.f-falsifier').addEventListener('change', function(e){ d.falsifier = e.target.value; saveBlockData(block); });
      card.querySelector('.lock-btn').addEventListener('click', function(){
        d.prior_belief = card.querySelector('.f-prior').value;
        d.falsifier = card.querySelector('.f-falsifier').value;
        d.snapshot_locked = true;
        saveBlockData(block).then(function(){ renderAll(); });
      });
    }
    return card;
  }

  var list = null;
  function renderAll(){
    list = document.getElementById('questions-list');
    if(!list) return;
    var blocks = ContentDB.getBlocks('unknowns.html', 'questions');
    list.innerHTML = '';
    blocks.forEach(function(b){ list.appendChild(renderCard(b)); });
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
    ContentDB.ready.then(function(){
      renderAll();
      renderVerdictBanner();
    });
  }

  window.Unknowns = { init: init };
})();
