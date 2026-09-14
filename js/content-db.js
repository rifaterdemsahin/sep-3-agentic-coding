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

  window.ContentDB = { ready: ready, getBlocks: getBlocks, getBlockById: getBlockById };
})();
