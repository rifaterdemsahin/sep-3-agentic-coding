(function(){
  var STORAGE_KEY = 'taskDecomposition_theme_v1';

  var THEMES = [
    { id: 'dark', emoji: '🌑', label: 'Dark', vars: {
      bg: '#0b0d12', panel: '#13161f', panelBorder: '#232838',
      accent: '#e8b94a', accent2: '#5ab0ff', text: '#eef0f4', textDim: '#9aa1b0',
      cold: '#5ab0ff', warm: '#e8b94a'
    }},
    { id: 'light', emoji: '☀️', label: 'Light', vars: {
      bg: '#f7f7f5', panel: '#ffffff', panelBorder: '#d0d4dc',
      accent: '#a86208', accent2: '#0b60b6', text: '#111318', textDim: '#4e5564',
      cold: '#0b60b6', warm: '#a86208'
    }},
    { id: 'midnight', emoji: '🌌', label: 'Midnight', vars: {
      bg: '#05060a', panel: '#0d1220', panelBorder: '#1b2540',
      accent: '#f2c14e', accent2: '#6fb1ff', text: '#eef2ff', textDim: '#8892b0',
      cold: '#6fb1ff', warm: '#f2c14e'
    }},
    { id: 'sepia', emoji: '🍂', label: 'Sepia', vars: {
      bg: '#f4ecdd', panel: '#fdf6e9', panelBorder: '#d8c7a2',
      accent: '#944805', accent2: '#23653b', text: '#241a0e', textDim: '#584936',
      cold: '#23653b', warm: '#944805'
    }},
    { id: 'ocean', emoji: '🌊', label: 'Ocean', vars: {
      bg: '#061a1c', panel: '#0d2b2e', panelBorder: '#164447',
      accent: '#ffb454', accent2: '#37e5c4', text: '#e6fbf8', textDim: '#8dc2bf',
      cold: '#37e5c4', warm: '#ffb454'
    }},
    { id: 'grape', emoji: '🍇', label: 'Grape', vars: {
      bg: '#120c1e', panel: '#1d1430', panelBorder: '#33254f',
      accent: '#f6c453', accent2: '#b98cff', text: '#f1e9ff', textDim: '#b4a5d4',
      cold: '#b98cff', warm: '#f6c453'
    }},
    { id: 'contrast', emoji: '⬛', label: 'High Contrast', vars: {
      bg: '#000000', panel: '#050505', panelBorder: '#ffffff',
      accent: '#ffee00', accent2: '#00e5ff', text: '#ffffff', textDim: '#e6e6e6',
      cold: '#00e5ff', warm: '#ffee00'
    }}
  ];

  function cssForTheme(t){
    var v = t.vars;
    return ':root[data-theme="' + t.id + '"]{' +
      '--bg:' + v.bg + ';--panel:' + v.panel + ';--panel-border:' + v.panelBorder + ';' +
      '--accent:' + v.accent + ';--accent-2:' + v.accent2 + ';--text:' + v.text + ';' +
      '--text-dim:' + v.textDim + ';--cold:' + v.cold + ';--warm:' + v.warm + ';}';
  }

  function injectVarStyle(){
    if(document.getElementById('theme-vars')) return;
    var style = document.createElement('style');
    style.id = 'theme-vars';
    style.textContent = THEMES.map(cssForTheme).join('\n');
    document.head.appendChild(style);
  }

  function getCookie(name){
    try{
      var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    }catch(e){ return null; }
  }

  function setCookie(name, val, days){
    try{
      var exp = days ? '; max-age=' + (days * 24 * 60 * 60) : '';
      document.cookie = name + '=' + encodeURIComponent(val) + '; path=/; SameSite=Lax' + exp;
    }catch(e){}
  }

  function getSaved(){
    try{
      var cookieVal = getCookie(STORAGE_KEY);
      if(cookieVal) return cookieVal;
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    }catch(e){ return 'dark'; }
  }

  function save(id){
    try{
      localStorage.setItem(STORAGE_KEY, id);
      setCookie(STORAGE_KEY, id, 365);
    }catch(e){}
  }

  function apply(id){
    document.documentElement.setAttribute('data-theme', id);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: id } }));
  }

  // Runs synchronously as the page's <head> parses, before first paint,
  // so switching pages doesn't flash back to the default dark theme.
  injectVarStyle();
  apply(getSaved());

  function injectUiStyles(){
    if(document.getElementById('theme-ui-styles')) return;
    var style = document.createElement('style');
    style.id = 'theme-ui-styles';
    style.textContent =
      '.topnav #nav-theme-menu{left:auto;right:0;width:200px;}' +
      '.theme-option{display:flex;align-items:center;gap:9px;font-size:13px;' +
        'padding:8px 10px;border-radius:8px;border:1px solid transparent;background:none;' +
        'color:var(--text-dim,#9aa1b0);cursor:pointer;text-align:left;width:100%;font-family:inherit;}' +
      '.theme-option:hover{background:rgba(127,127,127,.14);color:var(--text,#eef0f4);}' +
      '.theme-option.active{border-color:var(--accent-2,#5ab0ff);color:var(--text,#eef0f4);}' +
      '.theme-option .tc-swatch{width:13px;height:13px;border-radius:50%;flex-shrink:0;' +
        'border:1px solid rgba(127,127,127,.4);}';
    document.head.appendChild(style);
  }

  // Mounts into the "#nav-theme-wrap" slot nav.js renders next to the
  // 🌐 Live link, reusing the same .menu-toggle/.menu-panel look as every
  // other nav dropdown instead of a separate floating button.
  function buildUi(){
    var wrap = document.getElementById('nav-theme-wrap');
    if(!wrap) return;
    injectUiStyles();

    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var currentTheme = THEMES.filter(function(t){ return t.id === current; })[0] || THEMES[0];

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-toggle';
    btn.id = 'nav-theme-toggle';
    btn.title = 'Change theme';
    btn.setAttribute('aria-label', 'Change theme');
    btn.innerHTML = currentTheme.emoji + ' Theme <span class="menu-caret">▾</span>';

    var menu = document.createElement('div');
    menu.className = 'menu-panel tools-menu';
    menu.id = 'nav-theme-menu';
    menu.hidden = true;

    function refreshActive(){
      var activeId = document.documentElement.getAttribute('data-theme') || 'dark';
      menu.querySelectorAll('.theme-option').forEach(function(opt){
        opt.classList.toggle('active', opt.dataset.id === activeId);
      });
    }

    THEMES.forEach(function(t){
      var opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'theme-option';
      opt.dataset.id = t.id;
      opt.innerHTML =
        '<span class="tc-swatch" style="background:' + t.vars.accent + ';"></span>' +
        t.emoji + ' ' + t.label;
      opt.addEventListener('click', function(){
        apply(t.id);
        save(t.id);
        btn.innerHTML = t.emoji + ' Theme <span class="menu-caret">▾</span>';
        refreshActive();
      });
      menu.appendChild(opt);
    });

    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var opening = menu.hidden;
      document.querySelectorAll('.topnav .menu-panel').forEach(function(m){
        if(m !== menu) m.hidden = true;
      });
      menu.hidden = !opening;
      if(!menu.hidden) refreshActive();
    });
    document.addEventListener('click', function(e){
      if(!wrap.contains(e.target)) menu.hidden = true;
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') menu.hidden = true;
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
  }

  document.addEventListener('DOMContentLoaded', buildUi);

  window.Theme = { THEMES: THEMES, apply: apply, save: save };
})();
