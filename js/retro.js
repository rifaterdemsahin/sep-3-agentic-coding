// Stage 9 — single form bound to this video's row in public.retros
// (created on first save). Saving never touches videos.status.
(function(){
  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

  function renderTakeawayBanner(){
    window.sb.from('videos').select('viewer_takeaway, video_type').eq('id', window.VIDEO_ID).maybeSingle().then(function(res){
      if(res.error || !res.data) return;
      if(res.data.viewer_takeaway){
        document.getElementById('viewer-takeaway-banner').innerHTML =
          '<div class="vt-banner" style="max-width:1000px;margin:0 auto 8px;">🧠 <b>Viewer takeaway:</b> After this video the viewer can ' + esc(res.data.viewer_takeaway) + '</div>';
      }
      if(res.data.video_type === 'weekly-video'){
        document.getElementById('r-source-comparison-wrap').hidden = false;
      }
    });
  }

  var questions = [];
  function renderQuestions(){
    var mount = document.getElementById('r-questions');
    mount.innerHTML = questions.map(function(q, i){
      return '<div class="qrow"><input type="text" data-i="' + i + '" value="' + esc(q) + '" placeholder="TODO: a question viewers asked"><button type="button" data-remove="' + i + '">✕</button></div>';
    }).join('');
    Array.prototype.forEach.call(mount.querySelectorAll('input'), function(inp){
      inp.addEventListener('input', function(){ questions[+inp.dataset.i] = inp.value; });
    });
    Array.prototype.forEach.call(mount.querySelectorAll('[data-remove]'), function(btn){
      btn.addEventListener('click', function(){ questions.splice(+btn.dataset.remove, 1); renderQuestions(); });
    });
  }
  document.addEventListener('DOMContentLoaded', function(){
    var addBtn = document.getElementById('r-add-question');
    if(addBtn) addBtn.addEventListener('click', function(){ questions.push(''); renderQuestions(); });
  });

  function loadExisting(){
    window.sb.from('retros').select('*').eq('video_id', window.VIDEO_ID).maybeSingle().then(function(res){
      if(res.error || !res.data) return;
      var r = res.data;
      if(r.hypothesis_verdict){
        var radio = document.querySelector('input[name="verdict"][value="' + r.hypothesis_verdict + '"]');
        if(radio) radio.checked = true;
      }
      document.getElementById('r-retention').value = r.retention_note || '';
      document.getElementById('r-ctr').value = r.ctr || '';
      document.getElementById('r-duration').value = r.avg_view_duration_s != null ? r.avg_view_duration_s : '';
      document.getElementById('r-change').value = r.what_id_change || '';
      document.getElementById('r-source').value = r.source_comparison || '';
      questions = (r.top_comment_questions || []).slice();
      renderQuestions();
    });
  }

  function save(){
    var verdictEl = document.querySelector('input[name="verdict"]:checked');
    var row = {
      video_id: window.VIDEO_ID,
      hypothesis_verdict: verdictEl ? verdictEl.value : null,
      retention_note: document.getElementById('r-retention').value,
      ctr: document.getElementById('r-ctr').value,
      avg_view_duration_s: parseInt(document.getElementById('r-duration').value, 10) || null,
      top_comment_questions: questions.filter(function(q){ return q.trim(); }),
      what_id_change: document.getElementById('r-change').value,
      source_comparison: document.getElementById('r-source').value,
      updated_at: new Date().toISOString()
    };
    var status = document.getElementById('r-status');
    window.sb.from('retros').upsert(row).then(function(res){
      if(res.error){ console.error('Retro save failed', res.error); status.textContent = '⚠️ save failed'; return; }
      status.textContent = '✅ saved';
      setTimeout(function(){ status.textContent = ''; }, 1500);
    });
  }

  function init(){
    renderTakeawayBanner();
    renderQuestions();
    loadExisting();
    document.getElementById('r-save').addEventListener('click', save);
  }

  window.Retro = { init: init };
})();
