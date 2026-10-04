/**
 * <mind-fold-filter> — thecolin.vip 文章筛选 · v2
 * ============================================================
 * 独立组件（Web Component + Shadow DOM，零依赖，不碰老站任何代码）。
 *
 * v2 按 thecolin 真实结构重写：
 *  1. 自动发现文章：扫描 #articlesGrid 里的 .article-card（含异步渲染），
 *     按 dataset.category 归类，分类名直接取卡片上的 .article-category 文字；
 *  2. 折叠式：默认只占一行细条，点开才显示筛选面板——不占地方；
 *  3. 驱动站点原生筛选：点击分类调用页面已有的 window.filterByCategory(分类)，
 *     与站内搜索框天然兼容，绝不打架；站点没有该函数时自动降级为直接显隐；
 *  4. 主题贴合：直接消费站点 CSS 变量（--bg-card / --text-primary / --border…），
 *     亮色黑白极简，暗色模式（data-theme="dark"）自动跟随；
 *  5. 双语：跟随站点中/英文（html[lang]），标签自动切换。
 *
 * 嵌入步骤（2 行代码）：
 *   1) 在文章列表上方放：<mind-fold-filter grid="#articlesGrid"></mind-fold-filter>
 *   2) </body> 前放：<script src="mind-fold-filter.js"></script>
 */
(function () {
  "use strict";
  if (customElements.get("mind-fold-filter")) return;

  function currentLang() {
    var a = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    if (a.indexOf("zh") === 0) return "zh";
    if (a === "en") return "en";
    try {
      var s = localStorage.getItem("preferred-lang");
      if (s === "zh" || s === "en") return s;
    } catch (e) {}
    return (navigator.language || "zh").toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
  }

  var STYLE = [
    ":host{display:block;max-width:860px;margin:0 auto 14px;",
    "  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;}",
    "*{box-sizing:border-box;margin:0;padding:0;}",
    ".bar{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;",
    "  background:var(--bg-card,#FFFFFF);border:1px solid var(--border,#E5E5E5);border-radius:10px;",
    "  padding:9px 14px;transition:border-color .15s ease;}",
    ".bar:hover{border-color:var(--text-primary,#000);}",
    ".bar .ic{font-size:13px;line-height:1;}",
    ".bar .t{font-size:13px;font-weight:600;color:var(--text-primary,#000);}",
    ".bar .sum{font-size:12px;color:var(--text-secondary,#666);flex:1;min-width:0;",
    "  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".bar .chev{font-size:10px;color:var(--text-secondary,#666);transition:transform .18s ease;}",
    ".open .bar .chev{transform:rotate(180deg);}",
    ".panel{display:none;flex-wrap:wrap;gap:8px;padding:12px 14px;",
    "  background:var(--bg-card,#FFFFFF);border:1px solid var(--border,#E5E5E5);border-top:none;",
    "  border-radius:0 0 10px 10px;}",
    ".open .panel{display:flex;}",
    "button{cursor:pointer;border:1px solid var(--border,#E5E5E5);background:transparent;",
    "  color:var(--text-primary,#000);border-radius:999px;padding:6px 14px;font-size:13px;",
    "  font-weight:500;transition:all .15s ease;}",
    "button:hover{border-color:var(--text-primary,#000);}",
    "button.on{background:var(--button-bg-dark,#000);color:var(--button-text-dark,#fff);",
    "  border-color:var(--button-bg-dark,#000);}",
    "button .n{opacity:.55;font-size:12px;margin-left:4px;}"
  ].join("");

  function MindFoldFilter() {
    var self = Reflect.construct(HTMLElement, [], MindFoldFilter);
    self._active = "all";
    self._cats = []; // [{key,label,count}]
    self._lang = "zh";
    return self;
  }
  MindFoldFilter.prototype = Object.create(HTMLElement.prototype);

  MindFoldFilter.prototype.connectedCallback = function () {
    var self = this;
    this._sel = this.getAttribute("grid") || "#articlesGrid";
    this._lang = currentLang();

    var root = this.attachShadow({ mode: "open" });
    root.innerHTML =
      '<style>' + STYLE + '</style>' +
      '<div class="wrap">' +
      '  <div class="bar" part="bar">' +
      '    <span class="ic">\u2699</span>' +
      '    <span class="t"></span>' +
      '    <span class="sum"></span>' +
      '    <span class="chev">\u25BE</span>' +
      '  </div>' +
      '  <div class="panel"></div>' +
      '</div>';

    root.querySelector(".bar").addEventListener("click", function () {
      root.querySelector(".wrap").classList.toggle("open");
    });
    root.querySelector(".panel").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-cat]");
      if (b) self.pick(b.getAttribute("data-cat"));
    });

    // 异步渲染的文章卡片：监听网格变化，自动重扫分类
    if (window.MutationObserver) {
      var grid = document.querySelector(this._sel);
      if (grid) {
        this._mo = new MutationObserver(function () { self.scan(); });
        self._mo.observe(grid, { childList: true });
      }
    }
    // 跟随站点语言切换（switchLanguage 会改 html[lang]）
    if (window.MutationObserver) {
      this._moLang = new MutationObserver(function () {
        var l = currentLang();
        if (l !== self._lang) { self._lang = l; self.scan(); }
      });
      this._moLang.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    }

    this.scan();
  };

  MindFoldFilter.prototype.disconnectedCallback = function () {
    if (this._mo) this._mo.disconnect();
    if (this._moLang) this._moLang.disconnect();
  };

  MindFoldFilter.prototype.scan = function () {
    var grid = document.querySelector(this._sel);
    if (!grid) return;
    var cards = grid.querySelectorAll(".article-card");
    var map = {}; // key -> {label,count}
    var order = [];
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var key = c.getAttribute("data-category") || "";
      if (!key) continue;
      if (!map[key]) {
        var labelEl = c.querySelector(".article-category");
        map[key] = { key: key, label: labelEl ? labelEl.textContent.trim() : key, count: 0 };
        order.push(key);
      }
      map[key].count++;
    }
    this._cats = order.map(function (k) { return map[k]; });
    this.render();
  };

  MindFoldFilter.prototype.pick = function (key) {
    this._active = key;
    // 优先驱动站点原生筛选（与站内搜索天然兼容）
    if (typeof window.filterByCategory === "function") {
      try { window.filterByCategory(key === "all" ? "all" : key); } catch (e) {}
    } else {
      // 降级：直接显隐
      var grid = document.querySelector(this._sel);
      if (grid) {
        var cards = grid.querySelectorAll(".article-card");
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          c.style.display = (key === "all" || c.getAttribute("data-category") === key) ? "" : "none";
        }
      }
    }
    this.render();
  };

  MindFoldFilter.prototype.render = function () {
    var zh = this._lang === "zh";
    var root = this.shadowRoot;
    var total = 0;
    for (var i = 0; i < this._cats.length; i++) total += this._cats[i].count;

    var activeLabel = "";
    if (this._active !== "all") {
      for (var j = 0; j < this._cats.length; j++) {
        if (this._cats[j].key === this._active) activeLabel = this._cats[j].label;
      }
    }

    root.querySelector(".t").textContent = zh ? "筛选" : "Filter";
    root.querySelector(".sum").textContent =
      (this._active === "all")
        ? (zh ? "全部 · 共 " + total + " 篇" : "All · " + total + " articles")
        : (activeLabel + (zh ? " · 共 " + total + " 篇" : " · " + total + " articles"));

    var html = '<button data-cat="all" class="' + (this._active === "all" ? "on" : "") + '">' +
      (zh ? "全部" : "All") + ' <span class="n">' + total + '</span></button>';
    for (var k = 0; k < this._cats.length; k++) {
      var c = this._cats[k];
      html += '<button data-cat="' + c.key + '" class="' + (this._active === c.key ? "on" : "") + '">' +
        esc(c.label) + ' <span class="n">' + c.count + '</span></button>';
    }
    root.querySelector(".panel").innerHTML = html;
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  customElements.define("mind-fold-filter", MindFoldFilter);
})();
