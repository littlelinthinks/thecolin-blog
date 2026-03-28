(function(){
  var theme = localStorage.getItem('preferred-theme') || 'light';
  var lang = localStorage.getItem('preferred-lang') || 'zh';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-lang', lang);
  if(lang === 'en') document.documentElement.lang = 'en';
  
  window._applyLang = function(l){
    document.querySelectorAll('[data-zh][data-en]').forEach(function(el){
      var txt = el.getAttribute('data-' + l);
      if(!txt) return;
      if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){
        var ph = el.getAttribute('data-' + l + '-placeholder');
        if(ph) el.placeholder = ph;
      } else {
        el.textContent = txt;
      }
    });
    document.documentElement.lang = l==='zh' ? 'zh-CN' : 'en';
    localStorage.setItem('preferred-lang', l);
  };
  
  window._initUI = function(theme, lang){
    var icon = document.querySelector('.theme-icon');
    if(icon) icon.textContent = theme==='dark' ? '🌙' : '☀️';
    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('active', btn.dataset.lang === lang);
      btn.addEventListener('click', function(){
        lang = this.dataset.lang;
        window._applyLang(lang);
        document.querySelectorAll('.lang-btn').forEach(function(b){
          b.classList.toggle('active', b.dataset.lang === lang);
        });
      });
    });
    var tsBtn = document.getElementById('themeSwitcherBtn') || document.querySelector('.theme-switcher');
    if(tsBtn){
      tsBtn.addEventListener('click', function(){
        theme = theme==='dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        var ic = document.querySelector('.theme-icon');
        if(ic) ic.textContent = theme==='dark' ? '🌙' : '☀️';
        localStorage.setItem('preferred-theme', theme);
      });
    }
    var hBtn = document.getElementById('hamburgerBtn');
    var nav = document.getElementById('mainNavLinks');
    if(hBtn && nav){
      hBtn.addEventListener('click', function(){
        var o = nav.classList.toggle('mobile-open');
        hBtn.classList.toggle('active', o);
        hBtn.setAttribute('aria-expanded', String(o));
      });
      document.addEventListener('click', function(e){
        if(!hBtn.contains(e.target) && !nav.contains(e.target)){
          nav.classList.remove('mobile-open');
          hBtn.classList.remove('active');
        }
      });
    }
    var btt = document.getElementById('backToTop');
    if(btt){
      window.addEventListener('scroll', function(){
        btt.classList.toggle('visible', window.scrollY > 400);
      },{passive:true});
      btt.addEventListener('click', function(){
        window.scrollTo({top:0, behavior:'smooth'});
      });
    }
  };
  
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      window._applyLang(lang);
      window._initUI(theme, lang);
    });
  } else {
    window._applyLang(lang);
    window._initUI(theme, lang);
  }
})();
