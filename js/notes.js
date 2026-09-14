(function(){
  function currentPage(){
    var path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  var notesCache = [];
  var notesReady = window.sb.from('notes').select('*').eq('video_id', window.VIDEO_ID).order('created_at', { ascending: true })
    .then(function(res){
      if(res.error){ console.error('Notes load failed', res.error); return; }
      notesCache = (res.data || []).map(function(row){
        return { id: row.id, text: row.text, page: row.page };
      });
    });

  function loadNotes(){
    return notesCache;
  }
  // Persists one note. New notes (no id) are inserted and get their id
  // back from Supabase; existing notes are left alone (list is append/remove only).
  function insertNote(note){
    return window.sb.from('notes').insert({ page: note.page, text: note.text, video_id: window.VIDEO_ID }).select().then(function(res){
      if(res.error){ console.error('Notes insert failed', res.error); return; }
      if(res.data && res.data[0]) note.id = res.data[0].id;
    });
  }
  function deleteNoteRow(id){
    if(!id) return;
    window.sb.from('notes').delete().eq('id', id).then(function(res){
      if(res.error) console.error('Notes delete failed', res.error);
    });
  }

  function copyText(text, status){
    function done(ok){
      status.textContent = ok ? '✅ copied' : '⚠️ copy failed';
      setTimeout(function(){ status.textContent = ''; }, 1500);
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ done(true); }, function(){ done(false); });
    } else {
      var tmp = document.createElement('textarea');
      tmp.value = text;
      tmp.style.position = 'fixed';
      tmp.style.opacity = '0';
      document.body.appendChild(tmp);
      tmp.select();
      try{ document.execCommand('copy'); done(true); }
      catch(err){ done(false); }
      document.body.removeChild(tmp);
    }
  }

  function injectStyles(){
    if(document.getElementById('notes-styles')) return;
    var style = document.createElement('style');
    style.id = 'notes-styles';
    style.textContent =
      '.notes-bar{width:100%;box-sizing:border-box;background:var(--panel,#13161f);border-top:1px solid var(--panel-border,#232838);' +
        'box-shadow:0 -6px 20px rgba(0,0,0,.35);' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}' +
      '.notes-bar-header{display:flex;align-items:center;gap:8px;padding:8px 14px;cursor:pointer;' +
        'color:var(--text,#eef0f4);user-select:none;}' +
      '.notes-bar-header .nb-title{font-size:12.5px;font-weight:700;text-transform:uppercase;' +
        'letter-spacing:.06em;color:var(--text-dim,#9aa1b0);flex:1;}' +
      '.notes-bar-header .nb-count{font-size:11px;color:var(--text-dim,#9aa1b0);}' +
      '.notes-bar-header .nb-caret{font-size:11px;color:var(--text-dim,#9aa1b0);transition:transform .15s ease;}' +
      '.notes-bar.open .nb-caret{transform:rotate(180deg);}' +
      '.notes-body{display:none;padding:0 14px 12px;}' +
      '.notes-bar.open .notes-body{display:block;}' +
      '.notes-list{max-height:28vh;overflow-y:auto;display:flex;flex-direction:column;gap:6px;' +
        'margin-bottom:8px;}' +
      '.notes-list:empty{display:none;}' +
      '.notes-item{display:flex;align-items:flex-start;gap:8px;background:var(--bg,#0b0d12);' +
        'border:1px solid var(--panel-border,#232838);border-radius:8px;padding:8px 10px;}' +
      '.notes-item .ni-body{flex:1;min-width:0;}' +
      '.notes-item .ni-page{display:inline-block;font-size:10.5px;font-weight:700;' +
        'text-transform:uppercase;letter-spacing:.04em;color:var(--accent,#e8b94a);' +
        'background:rgba(232,185,74,.12);border-radius:4px;padding:1px 6px;margin-bottom:4px;}' +
      '.notes-item .ni-text{font-size:13px;line-height:1.45;color:var(--text,#eef0f4);' +
        'white-space:pre-wrap;word-break:break-word;}' +
      '.notes-item button{flex-shrink:0;border:1px solid var(--panel-border,#232838);' +
        'background:transparent;color:var(--text-dim,#9aa1b0);border-radius:6px;' +
        'width:26px;height:26px;font-size:12px;cursor:pointer;line-height:1;' +
        'display:flex;align-items:center;justify-content:center;}' +
      '.notes-item button:hover{border-color:var(--accent-2,#5ab0ff);color:var(--text,#eef0f4);}' +
      '.notes-input-row{display:flex;gap:8px;}' +
      '.notes-input-row textarea{flex:1;min-height:44px;max-height:30vh;resize:vertical;' +
        'background:var(--bg,#0b0d12);color:var(--text,#eef0f4);' +
        'border:1px solid var(--panel-border,#232838);border-radius:8px;padding:9px 11px;' +
        'font-size:13px;line-height:1.5;font-family:inherit;box-sizing:border-box;}' +
      '.notes-input-row textarea:focus{outline:none;border-color:var(--accent-2,#5ab0ff);}' +
      '.notes-actions{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;}' +
      '.notes-actions button{border:1px solid var(--panel-border,#232838);background:var(--bg,#0b0d12);' +
        'color:var(--text,#eef0f4);border-radius:7px;padding:7px 12px;font-size:12.5px;cursor:pointer;' +
        'font-family:inherit;transition:border-color .15s ease,color .15s ease;}' +
      '.notes-actions button:hover{border-color:var(--accent-2,#5ab0ff);}' +
      '.notes-actions .nb-add{border-color:var(--accent,#e8b94a);color:var(--accent,#e8b94a);}' +
      '.notes-actions .nb-clear:hover{border-color:#e05a5a;color:#e05a5a;}' +
      '.notes-actions .nb-status{font-size:11.5px;color:var(--text-dim,#9aa1b0);margin-left:auto;}' +
      '.item-note-wrap{margin-top:6px;}' +
      '.item-note-toggle{align-self:flex-start;font-size:11px;padding:4px 10px;border-radius:20px;' +
        'border:1px solid var(--panel-border,#232838);background:transparent;' +
        'color:var(--text-dim,#9aa1b0);cursor:pointer;white-space:nowrap;' +
        'transition:border-color .15s ease,color .15s ease,background .15s ease;}' +
      '.item-note-toggle:hover{border-color:var(--accent-2,#5ab0ff);color:var(--text,#eef0f4);}' +
      '.item-note-toggle.has-note{border-color:var(--accent,#e8b94a);color:var(--accent,#e8b94a);' +
        'background:rgba(232,185,74,.08);}' +
      '.item-note-panel{margin-top:6px;display:flex;flex-direction:column;gap:6px;}' +
      '.item-note-panel textarea{width:100%;min-height:52px;max-height:30vh;resize:vertical;' +
        'background:var(--bg,#0b0d12);color:var(--text,#eef0f4);' +
        'border:1px solid var(--panel-border,#232838);border-radius:8px;padding:8px 10px;' +
        'font-size:12.5px;line-height:1.45;font-family:inherit;box-sizing:border-box;}' +
      '.item-note-panel textarea:focus{outline:none;border-color:var(--accent-2,#5ab0ff);}' +
      '.item-note-actions{display:flex;gap:6px;}' +
      '.item-note-actions button{border:1px solid var(--panel-border,#232838);background:transparent;' +
        'color:var(--text-dim,#9aa1b0);border-radius:7px;padding:4px 10px;font-size:11px;cursor:pointer;' +
        'font-family:inherit;transition:border-color .15s ease,color .15s ease;}' +
      '.item-note-actions button:hover{border-color:var(--accent-2,#5ab0ff);color:var(--text,#eef0f4);}' +
      '.item-note-actions .in-delete:hover{border-color:#e05a5a;color:#e05a5a;}' +
      '.nb-db-btn{font-size:11px;padding:4px 10px;border-radius:20px;' +
        'border:1px solid var(--accent-2,#5ab0ff);background:transparent;color:var(--accent-2,#5ab0ff);' +
        'cursor:pointer;white-space:nowrap;font-family:inherit;}' +
      '.nb-db-btn:hover{background:var(--accent-2,#5ab0ff);color:var(--bg,#0b0d12);}' +
      '.db-modal-overlay{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.6);' +
        'display:flex;align-items:center;justify-content:center;padding:20px;}' +
      '.db-modal-overlay[hidden]{display:none;}' +
      '.db-modal-card{max-width:560px;width:100%;max-height:80vh;overflow-y:auto;' +
        'background:var(--panel,#13161f);border:1px solid var(--panel-border,#232838);' +
        'border-radius:12px;padding:22px 24px;color:var(--text,#eef0f4);' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}' +
      '.db-modal-card h3{margin:0 0 4px;font-size:17px;}' +
      '.db-modal-card .db-sub{color:var(--text-dim,#9aa1b0);font-size:12.5px;margin-bottom:14px;}' +
      '.db-modal-card table{width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:14px;}' +
      '.db-modal-card th{text-align:left;color:var(--text-dim,#9aa1b0);font-weight:600;' +
        'padding:4px 8px 4px 0;border-bottom:1px solid var(--panel-border,#232838);}' +
      '.db-modal-card td{padding:6px 8px 6px 0;border-bottom:1px solid var(--panel-border,#232838);' +
        'vertical-align:top;}' +
      '.db-modal-card td code{color:var(--accent,#e8b94a);font-family:ui-monospace,Menlo,monospace;' +
        'font-size:11.5px;}' +
      '.db-modal-card ol{margin:0 0 14px;padding-left:18px;font-size:13px;line-height:1.6;}' +
      '.db-modal-card .db-close{border:1px solid var(--panel-border,#232838);background:transparent;' +
        'color:var(--text,#eef0f4);border-radius:8px;padding:7px 14px;font-size:12.5px;cursor:pointer;' +
        'font-family:inherit;}' +
      '.db-modal-card .db-close:hover{border-color:var(--accent-2,#5ab0ff);}';
    document.head.appendChild(style);
  }

  function buildUi(){
    injectStyles();

    var notes = loadNotes();

    var bar = document.createElement('div');
    bar.className = 'notes-bar';

    var header = document.createElement('div');
    header.className = 'notes-bar-header';
    header.innerHTML =
      '<span>📝</span>' +
      '<span class="nb-title">Notes for Video Production Agent</span>' +
      '<span class="nb-count"></span>' +
      '<button type="button" class="nb-db-btn">🗄️ Database</button>' +
      '<span class="nb-caret">▲</span>';
    var countEl = header.querySelector('.nb-count');
    var dbBtn = header.querySelector('.nb-db-btn');

    var body = document.createElement('div');
    body.className = 'notes-body';

    var list = document.createElement('div');
    list.className = 'notes-list';

    var inputRow = document.createElement('div');
    inputRow.className = 'notes-input-row';
    var textarea = document.createElement('textarea');
    textarea.placeholder = 'Jot an update you want to prompt back with, e.g. "swap the hero image on index.html"… (Enter to add, Shift+Enter for a new line)';
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '➕ Add';
    inputRow.appendChild(textarea);
    inputRow.appendChild(addBtn);

    var actions = document.createElement('div');
    actions.className = 'notes-actions';
    var copyAllBtn = document.createElement('button');
    copyAllBtn.type = 'button';
    copyAllBtn.className = 'nb-copy-all';
    copyAllBtn.textContent = '📋 Copy All Notes';
    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'nb-clear';
    clearBtn.textContent = '🗑️ Clear All';
    var status = document.createElement('span');
    status.className = 'nb-status';
    actions.appendChild(copyAllBtn);
    actions.appendChild(clearBtn);
    actions.appendChild(status);

    body.appendChild(list);
    body.appendChild(inputRow);
    body.appendChild(actions);

    bar.appendChild(header);
    bar.appendChild(body);

    function noteText(note){
      return '[' + note.page + '] ' + note.text;
    }

    function allNotesText(){
      return notes.map(function(n){ return '- ' + noteText(n); }).join('\n');
    }

    function refreshCount(){
      countEl.textContent = notes.length + (notes.length === 1 ? ' note' : ' notes');
    }

    function renderList(){
      list.innerHTML = '';
      notes.forEach(function(note, idx){
        var item = document.createElement('div');
        item.className = 'notes-item';

        var bodyEl = document.createElement('div');
        bodyEl.className = 'ni-body';

        var pageEl = document.createElement('div');
        pageEl.className = 'ni-page';
        pageEl.textContent = note.page;

        var textEl = document.createElement('div');
        textEl.className = 'ni-text';
        textEl.textContent = note.text;

        bodyEl.appendChild(pageEl);
        bodyEl.appendChild(textEl);

        var copyOneBtn = document.createElement('button');
        copyOneBtn.type = 'button';
        copyOneBtn.title = 'Copy this note';
        copyOneBtn.textContent = '📋';
        copyOneBtn.addEventListener('click', function(){
          copyText(noteText(note), status);
        });

        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.title = 'Remove this note';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', function(){
          deleteNoteRow(note.id);
          notes.splice(idx, 1);
          renderList();
          refreshCount();
        });

        item.appendChild(bodyEl);
        item.appendChild(copyOneBtn);
        item.appendChild(removeBtn);
        list.appendChild(item);
      });
      refreshCount();
    }

    function addNote(){
      var text = textarea.value.trim();
      if(!text) return;
      var note = { text: text, page: currentPage() };
      notes.push(note);
      insertNote(note).then(renderList);
      textarea.value = '';
      renderList();
      if(!bar.classList.contains('open')) bar.classList.add('open');
    }

    header.addEventListener('click', function(){
      bar.classList.toggle('open');
    });

    function openDbModal(){
      var page = currentPage();
      var overlay = document.getElementById('db-modal-overlay');
      if(!overlay){
        overlay = document.createElement('div');
        overlay.id = 'db-modal-overlay';
        overlay.className = 'db-modal-overlay';
        overlay.hidden = true;
        overlay.innerHTML =
          '<div class="db-modal-card">' +
            '<h3>🗄️ How this page loads from the database</h3>' +
            '<div class="db-sub">Page: <code>' + page + '</code> — everything below is fetched from Supabase (Postgres) at load time, not hardcoded in the HTML.</div>' +
            '<ol>' +
              '<li>A single shared client (<code>window.sb</code>) is created once per page from the Supabase project URL + anon key.</li>' +
              '<li>Each data module below fires its own <code>window.sb.from(table).select(\'*\')</code> as soon as its script loads, and exposes a <code>.ready</code> promise.</li>' +
              '<li>The page\'s render code does <code>Promise.all([...ready promises]).then(render)</code> — nothing is drawn until the real rows come back.</li>' +
              '<li>Edits (add/remove/rate/comment/link) update the in-memory copy immediately for a snappy UI, then write to Supabase in the background.</li>' +
            '</ol>' +
            '<table>' +
              '<tr><th>Table</th><th>What it holds on this page</th></tr>' +
              '<tr><td><code>content_blocks</code></td><td>The cards/rows/panels you see (filtered to <code>page = \'' + page + '\'</code>) — source links, arguments, script beats, design specs, or shot panels.</td></tr>' +
              '<tr><td><code>assets</code></td><td>Items saved via any "➕ Add to Assets" button, shown on the Assets page.</td></tr>' +
              '<tr><td><code>ratings</code></td><td>⭐ star ratings attached to an item id.</td></tr>' +
              '<tr><td><code>notes</code> / <code>item_notes</code></td><td>This notes bar, plus the 💬 per-item note boxes.</td></tr>' +
              '<tr><td><code>links</code></td><td>The "🔗 Linked to…" cross-stage pickers.</td></tr>' +
              '<tr><td><code>audio_clips</code></td><td>Manifest of Kokoro voice-over clips already saved to Azure Blob Storage, so re-listening skips the API.</td></tr>' +
            '</table>' +
            '<button type="button" class="db-close">Close</button>' +
          '</div>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e){
          if(e.target === overlay) overlay.hidden = true;
        });
        overlay.querySelector('.db-close').addEventListener('click', function(){
          overlay.hidden = true;
        });
      }
      overlay.hidden = false;
    }

    dbBtn.addEventListener('click', function(e){
      e.stopPropagation();
      openDbModal();
    });

    addBtn.addEventListener('click', function(e){
      e.stopPropagation();
      addNote();
    });

    textarea.addEventListener('keydown', function(e){
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        addNote();
      }
    });

    copyAllBtn.addEventListener('click', function(e){
      e.stopPropagation();
      if(!notes.length){
        status.textContent = '⚠️ no notes yet';
        setTimeout(function(){ status.textContent = ''; }, 1500);
        return;
      }
      copyText(allNotesText(), status);
    });

    clearBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var toDelete = notes.slice();
      notes.length = 0;
      toDelete.forEach(function(n){ deleteNoteRow(n.id); });
      renderList();
      status.textContent = '🗑️ cleared';
      setTimeout(function(){ status.textContent = ''; }, 1500);
    });

    renderList();
    
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
      container.style.flexDirection = 'column-reverse'; // Stack them from bottom up
      document.body.appendChild(container);
    }
    container.appendChild(bar);
  }

  document.addEventListener('DOMContentLoaded', function(){
    notesReady.then(buildUi);
  });

  var itemNotesCache = {};
  var itemNotesDecisionCache = {};
  var itemNotesReady = window.sb.from('item_notes').select('id, text, decision').eq('video_id', window.VIDEO_ID)
    .then(function(res){
      if(res.error){ console.error('Item notes load failed', res.error); return; }
      (res.data || []).forEach(function(row){
        itemNotesCache[row.id] = row.text;
        itemNotesDecisionCache[row.id] = !!row.decision;
      });
    });

  function saveItemNote(id, text, decision){
    itemNotesCache[id] = text;
    if(decision !== undefined) itemNotesDecisionCache[id] = decision;
    window.sb.from('item_notes').upsert({
      id: id,
      text: text,
      decision: !!itemNotesDecisionCache[id],
      video_id: window.VIDEO_ID,
      updated_at: new Date().toISOString()
    }).then(function(res){ if(res.error) console.error('Item note save failed', res.error); });
  }
  function deleteItemNote(id){
    delete itemNotesCache[id];
    delete itemNotesDecisionCache[id];
    window.sb.from('item_notes').delete().eq('id', id).eq('video_id', window.VIDEO_ID)
      .then(function(res){ if(res.error) console.error('Item note delete failed', res.error); });
  }

  function attachItemNotes(opts){
    injectStyles();
    var container = opts.container;
    var itemSelector = opts.itemSelector;
    var getId = opts.getId;
    var mount = opts.mount;
    if(!container) return;

    var notesMap = itemNotesCache;
    var entries = [];

    Array.prototype.forEach.call(container.querySelectorAll(itemSelector), function(item){
      var id = getId(item);
      if(!id) return;

      var wrap = document.createElement('div');
      wrap.className = 'item-note-wrap';

      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'item-note-toggle';

      var panel = document.createElement('div');
      panel.className = 'item-note-panel';
      panel.style.display = 'none';

      var textarea = document.createElement('textarea');
      textarea.placeholder = 'Note about this item…';
      textarea.value = notesMap[id] || '';

      var decisionLabel = document.createElement('label');
      decisionLabel.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text-dim,#9aa1b0);cursor:pointer;';
      var decisionCb = document.createElement('input');
      decisionCb.type = 'checkbox';
      decisionCb.checked = !!itemNotesDecisionCache[id];
      decisionLabel.appendChild(decisionCb);
      decisionLabel.appendChild(document.createTextNode('📓 This is a decision (cut/keep/change) — show in Journal'));

      var actions = document.createElement('div');
      actions.className = 'item-note-actions';
      var saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.textContent = '💾 Save';
      var deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'in-delete';
      deleteBtn.textContent = '🗑️ Delete';
      actions.appendChild(saveBtn);
      actions.appendChild(deleteBtn);

      panel.appendChild(textarea);
      panel.appendChild(decisionLabel);
      panel.appendChild(actions);

      function refreshToggle(){
        var has = !!(notesMap[id] && notesMap[id].trim());
        toggle.textContent = has ? '📝 Note ✓' : '📝 Add note';
        toggle.classList.toggle('has-note', has);
      }
      refreshToggle();

      toggle.addEventListener('click', function(){
        panel.style.display = (panel.style.display === 'none') ? 'flex' : 'none';
        if(panel.style.display === 'flex') textarea.focus();
      });
      saveBtn.addEventListener('click', function(){
        var text = textarea.value.trim();
        if(text){ saveItemNote(id, text, decisionCb.checked); } else { deleteItemNote(id); }
        refreshToggle();
      });
      deleteBtn.addEventListener('click', function(){
        deleteItemNote(id);
        textarea.value = '';
        refreshToggle();
        panel.style.display = 'none';
      });

      wrap.appendChild(toggle);
      wrap.appendChild(panel);
      mount(item, wrap);

      entries.push({ id: id, textarea: textarea, refreshToggle: refreshToggle });
    });
  }

  function attachItemNotesWhenReady(opts){
    itemNotesReady.then(function(){ attachItemNotes(opts); });
  }

  function getDecisions(){
    return Object.keys(itemNotesDecisionCache)
      .filter(function(id){ return itemNotesDecisionCache[id] && (itemNotesCache[id] || '').trim(); })
      .map(function(id){ return { id: id, text: itemNotesCache[id] }; });
  }

  window.ItemNotes = { ready: itemNotesReady, attach: attachItemNotesWhenReady, getDecisions: getDecisions };
})();
