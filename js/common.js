(function(){
  // 立即应用主题和语言，避免闪烁
  var theme = localStorage.getItem('preferred-theme') || 'light';
  var lang = localStorage.getItem('preferred-lang') || 'zh';
  document.documentElement.setAttribute('data-theme', theme);

  function applyLang(lang){
    document.querySelectorAll('[data-zh][data-en]').forEach(function(el){
      var txt = el.dataset[lang];
      if(!txt) return;
      if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){
        el.placeholder = el.dataset[lang+'Placeholder'] || txt;
      } else { el.textContent = txt; }
    });
    document.documentElement.lang = lang==='zh' ? 'zh-CN' : 'en';
  }

  document.addEventListener('DOMContentLoaded', function(){
    // 应用主题图标
    var icon = document.querySelector('.theme-icon');
    if(icon) icon.textContent = theme==='dark' ? '🌙' : '☀️';

    // 应用语言
    applyLang(lang);
    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('active', btn.dataset.lang===lang);
      btn.addEventListener('click', function(){
        lang = this.dataset.lang;
        localStorage.setItem('preferred-lang', lang);
        applyLang(lang);
        document.querySelectorAll('.lang-btn').forEach(function(b){
          b.classList.toggle('active', b.dataset.lang===lang);
        });
      });
    });

    // 主题切换
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

    // 汉堡菜单
    var hBtn = document.getElementById('hamburgerBtn');
    var nav = document.getElementById('mainNavLinks');
    if(hBtn && nav){
      hBtn.addEventListener('click', function(){
        var o = nav.classList.toggle('mobile-open');
        hBtn.classList.toggle('active', o);
        hBtn.setAttribute('aria-expanded', o);
      });
      document.addEventListener('click', function(e){
        if(!hBtn.contains(e.target) && !nav.contains(e.target)){
          nav.classList.remove('mobile-open');
          hBtn.classList.remove('active');
        }
      });
    }

    // 返回顶部
    var btt = document.getElementById('backToTop');
    if(btt){
      window.addEventListener('scroll', function(){
        btt.classList.toggle('visible', window.scrollY > 400);
      },{passive:true});
      btt.addEventListener('click', function(){
        window.scrollTo({top:0, behavior:'smooth'});
      });
    }
  });
})();
