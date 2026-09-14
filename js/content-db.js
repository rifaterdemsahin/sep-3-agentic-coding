// Shared fetch layer for public.content_blocks — the hand-authored
// production content (source links, arguments, beats, shots, etc.) that
// used to be hardcoded per-page HTML. Each page's own inline script still
// owns rendering (same markup as before); this module only owns the data.
(function(){
  var cache = [];
  var ready = window.sb.from('content_blocks').select('*').eq('video_id', window.VIDEO_ID).order('position', { ascending: true })
    .then(function(res){
      if(res.error){ console.error('Content blocks load failed', res.error); return; }
      cache = res.data || [];
    });

  function getBlocks(page, section){
    return cache
      .filter(function(b){ return b.page === page && (!section || b.section === section); })
      .sort(function(a, b){ return a.position - b.position; });
  }

  function getBlockById(id){
    return cache.filter(function(b){ return b.id === id; })[0] || null;
  }

  // Merges `patch` into a block's `data` jsonb, updates the in-memory
  // cache immediately, and persists in the background.
  function updateData(id, patch){
    var block = getBlockById(id);
    if(!block) return;
    Object.assign(block.data, patch);
    window.sb.from('content_blocks').update({ data: block.data, updated_at: new Date().toISOString() }).eq('id', id)
      .then(function(res){ if(res.error) console.error('ContentDB updateData failed', res.error); });
  }

  window.ContentDB = { ready: ready, getBlocks: getBlocks, getBlockById: getBlockById, updateData: updateData };
})();
