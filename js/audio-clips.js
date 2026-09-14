// Manifest of Kokoro voice-over clips saved to Azure Blob Storage, kept in
// public.audio_clips so the app knows what's already backed up without
// relying solely on per-browser IndexedDB (same ready-promise pattern as
// notes.js/ratings.js/links.js).
(function(){
  var cache = [];
  var ready = window.sb.from('audio_clips').select('*').eq('video_id', window.VIDEO_ID)
    .then(function(res){
      if(res.error){ console.error('Audio clips load failed', res.error); return; }
      cache = res.data || [];
    });

  function keyOf(page, cardId, voice, speed){
    return window.VIDEO_ID + '|' + page + '|' + cardId + '|' + voice + '|' + speed;
  }

  function get(page, cardId, voice, speed){
    var k = keyOf(page, cardId, voice, speed);
    return cache.filter(function(r){ return r.id === k; })[0] || null;
  }

  function record(page, cardId, voice, speed, blobPath){
    var row = {
      id: keyOf(page, cardId, voice, speed),
      page: page,
      card_id: cardId,
      voice: voice,
      speed: String(speed),
      blob_path: blobPath,
      video_id: window.VIDEO_ID,
      updated_at: new Date().toISOString()
    };
    var i = cache.findIndex(function(r){ return r.id === row.id; });
    if(i >= 0){ cache[i] = row; } else { cache.push(row); }
    window.sb.from('audio_clips').upsert(row)
      .then(function(res){ if(res.error) console.error('Audio clip record failed', res.error); });
  }

  window.AudioClips = { ready: ready, get: get, record: record };
})();
