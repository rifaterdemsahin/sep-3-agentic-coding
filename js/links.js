(function(){
  var catalogCache = {};
  var store = {};
  var ready = window.sb.from('links').select('key, linked_ids').eq('video_id', window.VIDEO_ID)
    .then(function(res){
      if(res.error){ console.error('Links load failed', res.error); return; }
      (res.data || []).forEach(function(row){ store[row.key] = row.linked_ids; });
    });

  function scopedKey(key){
    return window.VIDEO_ID + '|' + key;
  }

  function getSelected(key){
    return store[scopedKey(key)] || [];
  }
  function setSelected(key, ids){
    var sk = scopedKey(key);
    if(ids.length){ store[sk] = ids; } else { delete store[sk]; }
    if(ids.length){
      window.sb.from('links').upsert({ key: sk, linked_ids: ids, video_id: window.VIDEO_ID, updated_at: new Date().toISOString() })
        .then(function(res){ if(res.error) console.error('Links save failed', res.error); });
    } else {
      window.sb.from('links').delete().eq('key', sk)
        .then(function(res){ if(res.error) console.error('Links delete failed', res.error); });
    }
  }

  // Cross-stage catalogs are read live from the previous stage's own
  // content_blocks rows (the same content each card renders from), so
  // linking options always match its real content instead of a
  // hand-maintained duplicate list.
  function fetchCatalog(sourceFile){
    if(catalogCache[sourceFile]) return catalogCache[sourceFile];
    catalogCache[sourceFile] = ContentDB.ready.then(function(){
      return ContentDB.getBlocks(sourceFile).map(function(b){
        var d = b.data || {};
        return {
          id: b.id,
          title: d.title || d.fullTitle || d.emojiLabel || b.id,
          url: d.url || d.href || (sourceFile + (d.cardId ? '#' + d.cardId : ''))
        };
      });
    });
    return catalogCache[sourceFile];
  }

  function injectStyles(){
    if(document.getElementById('links-styles')) return;
    var style = document.createElement('style');
    style.id = 'links-styles';
    style.textContent =
      '.linker{margin-top:10px;position:relative;display:inline-block;}'+
      '.linker-toggle{font-size:11px;padding:4px 10px;border-radius:20px;'+
        'border:1px dashed var(--panel-border,#232838);background:transparent;'+
        'color:var(--text-dim,#9aa1b0);cursor:pointer;font-family:inherit;white-space:nowrap;}'+
      '.linker-toggle:hover{border-color:var(--accent-2,#5ab0ff);color:var(--text,#eef0f4);}'+
      '.linker-toggle.has-links{border-style:solid;border-color:var(--accent-2,#5ab0ff);color:var(--accent-2,#5ab0ff);}'+
      '.linker-toggle:disabled{opacity:.5;cursor:not-allowed;}'+
      '.linker-menu{position:absolute;top:calc(100% + 6px);left:0;z-index:60;'+
        'min-width:230px;max-height:230px;overflow-y:auto;background:var(--panel,#13161f);'+
        'border:1px solid var(--panel-border,#232838);border-radius:10px;padding:8px;'+
        'box-shadow:0 10px 30px rgba(0,0,0,.4);'+
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}'+
      '.linker-menu[hidden]{display:none;}'+
      '.linker-menu .lm-title{font-size:10px;text-transform:uppercase;letter-spacing:.06em;'+
        'color:var(--text-dim,#9aa1b0);font-weight:700;padding:2px 6px 6px;}'+
      '.linker-menu label{display:flex;align-items:flex-start;gap:7px;font-size:12px;'+
        'color:var(--text-dim,#9aa1b0);padding:6px;border-radius:6px;cursor:pointer;}'+
      '.linker-menu label:hover{background:rgba(127,127,127,.14);color:var(--text,#eef0f4);}'+
      '.linker-menu input{margin-top:2px;flex-shrink:0;}'+
      '.linker-chips{margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;max-width:260px;}'+
      '.linker-chip{font-size:10.5px;padding:3px 9px;border-radius:20px;'+
        'background:rgba(90,176,255,.12);color:var(--accent-2,#5ab0ff);text-decoration:none;'+
        'border:1px solid rgba(90,176,255,.3);}'+
      '.linker-chip:hover{text-decoration:underline;}';
    document.head.appendChild(style);
  }

  function buildLinker(btn, opts){
    var itemId = btn.getAttribute('data-id');
    var key = opts.file + '|' + itemId;

    var wrap = document.createElement('div');
    wrap.className = 'linker';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'linker-toggle';

    var menu = document.createElement('div');
    menu.className = 'linker-menu';
    menu.hidden = true;
    menu.innerHTML = '<div class="lm-title">🔗 Related ' + opts.sourceLabel + '</div>';

    var chips = document.createElement('div');
    chips.className = 'linker-chips';

    function refresh(){
      var ids = getSelected(key);
      toggle.textContent = ids.length
        ? '🔗 ' + ids.length + ' linked to ' + opts.sourceLabel
        : '🔗 Link to ' + opts.sourceLabel + '…';
      toggle.classList.toggle('has-links', ids.length > 0);

      chips.innerHTML = '';
      ids.forEach(function(id){
        var entry = opts.catalog.filter(function(c){ return c.id === id; })[0];
        if(!entry) return;
        var chip = document.createElement('a');
        chip.className = 'linker-chip';
        chip.href = entry.url;
        if(/^https?:\/\//.test(entry.url)){
          chip.target = '_blank';
          chip.rel = 'noopener';
        }
        chip.textContent = entry.title;
        chips.appendChild(chip);
      });
    }

    if(!opts.catalog.length){
      toggle.textContent = '🔗 Related ' + opts.sourceLabel + ' (none found)';
      toggle.disabled = true;
    } else {
      opts.catalog.forEach(function(entry){
        var label = document.createElement('label');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = entry.id;
        cb.checked = getSelected(key).indexOf(entry.id) !== -1;
        cb.addEventListener('change', function(){
          var ids = getSelected(key).slice();
          if(cb.checked){
            if(ids.indexOf(entry.id) === -1) ids.push(entry.id);
          } else {
            ids = ids.filter(function(id){ return id !== entry.id; });
          }
          setSelected(key, ids);
          refresh();
        });
        label.appendChild(cb);
        label.appendChild(document.createTextNode(entry.title));
        menu.appendChild(label);
      });

      toggle.addEventListener('click', function(e){
        e.stopPropagation();
        menu.hidden = !menu.hidden;
      });
      document.addEventListener('click', function(e){
        if(!menu.hidden && !wrap.contains(e.target)) menu.hidden = true;
      });
    }

    wrap.appendChild(toggle);
    wrap.appendChild(menu);
    wrap.appendChild(chips);
    btn.insertAdjacentElement('afterend', wrap);
    refresh();
  }

  function init(opts){
    document.addEventListener('DOMContentLoaded', function(){
      injectStyles();
      Promise.all([ready, fetchCatalog(opts.sourceFile)]).then(function(results){
        var catalog = results[1];
        document.querySelectorAll('.linker-anchor[data-id]').forEach(function(btn){
          buildLinker(btn, {
            file: opts.file,
            sourceFile: opts.sourceFile,
            sourceLabel: opts.sourceLabel,
            catalog: catalog
          });
        });
      }).catch(function(err){
        console.warn('Pipeline links: could not load catalog from ' + opts.sourceFile + ' — serve this project over http(s) for cross-stage linking to work.', err);
      });
    });
  }

  window.PipelineLinks = {
    ready: ready,
    init: init,
    getSelected: getSelected,
    setSelected: setSelected
  };
})();
