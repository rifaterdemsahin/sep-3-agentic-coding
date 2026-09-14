// Stage 8 — this video's Formula row in the shared public.patterns table,
// plus a read-only list of formulas from other videos. Reads across every
// video_id (cross-video library); writes only ever carry window.VIDEO_ID.
(function(){
  function getOwnPattern(){
    return window.sb.from('patterns').select('*').eq('video_id', window.VIDEO_ID)
      .order('created_at', { ascending: false }).limit(1).maybeSingle().then(function(res){
        if(res.error){ console.error('Pattern load failed', res.error); return null; }
        return res.data;
      });
  }

  function saveOwnPattern(id, formula, symbol, evidence){
    var row = { video_id: window.VIDEO_ID, formula: formula, symbol: symbol, evidence: evidence };
    var q = id
      ? window.sb.from('patterns').update(row).eq('id', id).eq('video_id', window.VIDEO_ID).select()
      : window.sb.from('patterns').insert(row).select();
    return q.then(function(res){
      if(res.error){ console.error('Pattern save failed', res.error); return null; }
      return res.data && res.data[0];
    });
  }

  function getOtherPatterns(){
    return window.sb.from('patterns').select('video_id, formula, symbol').neq('video_id', window.VIDEO_ID)
      .order('created_at', { ascending: false }).then(function(res){
        if(res.error){ console.error('Other patterns load failed', res.error); return []; }
        return res.data || [];
      });
  }

  window.Patterns = { getOwnPattern: getOwnPattern, saveOwnPattern: saveOwnPattern, getOtherPatterns: getOtherPatterns };
})();
