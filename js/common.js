(function(){
  var theme = localStorage.getItem('preferred-theme') || 'light';
  var lang = localStorage.getItem('preferred-lang') || 'zh';
  
  // 立即设置属性，CSS会根据这个属性显示正确语言
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-lang', lang);
  
  document.addEventListener('DOMContentLoaded', function(){
    // 主题图标
    var icon = document.querySelector('.theme-icon');
    if(icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    
    // 语言按钮状态
    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('active', btn.dataset.lang === lang);
      btn.addEventListener('click', function(){
        lang = this.dataset.lang;
        localStorage.setItem('preferred-lang', lang);
        document.documentElement.setAttribute('data-lang', lang);
        document.querySelectorAll('.lang-btn').forEach(function(b){
          b.classList.toggle('active', b.dataset.lang === lang);
        });
      });
    });
    
    // 主题按钮
    var tsBtn = document.getElementById('themeSwitcherBtn') || document.querySelector('.theme-switcher');
    if(tsBtn){
      tsBtn.addEventListener('click', function(){
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        var ic = document.querySelector('.theme-icon');
        if(ic) ic.textContent = theme === 'dark' ? '🌙' : '☀️';
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
        hBtn.setAttribute('aria-expanded', String(o));
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
