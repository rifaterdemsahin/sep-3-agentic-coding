(function(){
  var cache = {};
  var ready = window.sb.from('ratings').select('id, stars').eq('video_id', window.VIDEO_ID)
    .then(function(res){
      if(res.error){ console.error('Ratings load failed', res.error); return; }
      (res.data || []).forEach(function(row){ cache[row.id] = row.stars; });
    });

  function getRating(id){
    return cache[id] || 0;
  }
  function setRating(id, stars){
    cache[id] = stars;
    window.sb.from('ratings').upsert({ id: id, stars: stars, video_id: window.VIDEO_ID, updated_at: new Date().toISOString() })
      .then(function(res){ if(res.error) console.error('Ratings save failed', res.error); });
  }

  function renderStars(el, current){
    var stars = el.querySelectorAll('.star');
    stars.forEach(function(s){
      var v = parseInt(s.getAttribute('data-value'), 10);
      s.classList.toggle('filled', v <= current);
    });
  }

  function createStarWidget(id){
    var wrap = document.createElement('div');
    wrap.className = 'star-rating';
    wrap.setAttribute('data-for', id);
    for(var i=1;i<=5;i++){
      var star = document.createElement('span');
      star.className = 'star';
      star.setAttribute('data-value', i);
      star.textContent = '★';
      wrap.appendChild(star);
    }
    renderStars(wrap, getRating(id));
    return wrap;
  }

  // Sets up star widgets on every item inside `container` and keeps the
  // container live-sorted by rating (highest first) as ratings change.
  // opts: { container, itemSelector, getId(item), mountStars(item, starEl) }
  function makeSortable(opts){
    var container = opts.container;
    if(!container) return null;
    var itemSelector = opts.itemSelector;
    var getId = opts.getId;
    var mountStars = opts.mountStars;

    var items = Array.prototype.slice.call(container.querySelectorAll(itemSelector));
    var originalOrder = items.slice();

    items.forEach(function(item){
      var id = getId(item);
      var starEl = createStarWidget(id);
      mountStars(item, starEl);
      starEl.addEventListener('click', function(e){
        var star = e.target.closest('.star');
        if(!star) return;
        var value = parseInt(star.getAttribute('data-value'), 10);
        var current = getRating(id);
        var next = (value === current) ? 0 : value;
        setRating(id, next);
        renderStars(starEl, next);
        resort();
      });
    });

    function resort(){
      var current = Array.prototype.slice.call(container.querySelectorAll(itemSelector));
      current.sort(function(a, b){
        return getRating(getId(b)) - getRating(getId(a));
      });
      current.forEach(function(it){ container.appendChild(it); });
    }

    resort();

    return {
      reset: function(){ originalOrder.forEach(function(it){ container.appendChild(it); }); },
      resort: resort
    };
  }

  window.Ratings = {
    ready: ready,
    getRating: getRating,
    setRating: setRating,
    createStarWidget: createStarWidget,
    makeSortable: makeSortable
  };
})();
