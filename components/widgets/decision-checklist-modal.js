/**
 * <decision-checklist-modal> — Colin 智库 · 可交互决策检查清单（暗金风，数据驱动）
 * ============================================================
 * 独立组件（Web Component + Shadow DOM，零依赖，不碰老站任何代码/样式）。
 * 预检勾选项 + 进度条 + 实时评估报告。点触发按钮弹出模态框，勾选越多，报告越具体。
 * 默认用内置 7 项；若提供 src 属性则异步拉取 JSON 渲染。
 *
 * 数据格式（data/decision-checklists.json）：
 * { "title": "决策预检清单 · Decision Pre-flight",
 *   "items": [ { "label":"安全边际 / 逆向思维", "note":"芒格：我为最坏情况预留了缓冲吗？" } ] }
 *
 * 嵌入步骤（2 行代码）：
 *   1) 想放的位置放：<decision-checklist-modal src="data/decision-checklists.json" trigger="开始决策体检"></decision-checklist-modal>
 *   2) </body> 前放：<script src="components/widgets/decision-checklist-modal.js"></script>
 */
(function () {
  "use strict";
  if (customElements.get("decision-checklist-modal")) return;

  // 内置回退清单（无 src 或拉取失败时渲染）
  var FALLBACK = {
    title: "决策预检清单 · Decision Pre-flight", items: [
      { label: "安全边际 / 逆向思维", note: "芒格：我为最坏情况预留了缓冲吗？若失败，是否会清零？" },
      { label: "主要矛盾识别", note: "毛选：我是否抓住了那唯一一个主要矛盾，而非四处设防？" },
      { label: "第一性原理拆解", note: "马斯克：我剥离了经验类比，直接推演物理 / 经济底牌吗？" },
      { label: "盟友生态安全", note: "资治通鉴：我的伙伴是否仍有安全感与合理利润空间？" },
      { label: "反脆弱结构", note: "塔勒布：下行风险有限、上行空间无限吗？" },
      { label: "一手调查取证", note: "毛选：我是否做过真实用户 / 市场的一手调查，而非拍脑袋？" },
      { label: "价值真实性", note: "YC：是否真有人愿意为我的东西付出注意力或金钱？" }
    ]
  };

  var STYLE = [
    ":host{display:inline-block;",
    "  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;",
    "  --bg:#020617;--panel:#0b1120;--border:#1e293b;--gold:#f59e0b;--gold-soft:#fbbf24;",
    "  --text:#e8e6e1;--muted:#94a3b8;}",
    "*{box-sizing:border-box;margin:0;padding:0;}",
    ".trigger{border:1px solid var(--gold);background:transparent;color:var(--gold-soft);",
    "  border-radius:999px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;}",
    ".trigger:hover{background:rgba(245,158,11,.12);}",
    ".overlay{position:fixed;inset:0;background:rgba(2,6,23,.78);backdrop-filter:blur(4px);",
    "  display:none;align-items:center;justify-content:center;z-index:99999;padding:20px;}",
    ".overlay.show{display:flex;}",
    ".modal{background:var(--panel);border:1px solid var(--border);border-radius:18px;max-width:520px;width:100%;",
    "  max-height:88vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,.6);}",
    ".mhead{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border);",
    "  position:sticky;top:0;background:var(--panel);}",
    ".mhead h3{color:var(--gold-soft);font-size:16px;font-weight:700;}",
    ".close{background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;line-height:1;}",
    ".close:hover{color:var(--text);}",
    ".body{padding:18px 20px;}",
    ".barwrap{height:8px;background:#1e293b;border-radius:999px;overflow:hidden;margin-bottom:6px;}",
    ".bar{height:100%;width:0;background:linear-gradient(90deg,var(--gold),var(--gold-soft));transition:width .25s ease;}",
    ".bartxt{font-size:12px;color:var(--muted);margin-bottom:16px;}",
    ".item{display:flex;gap:12px;align-items:flex-start;padding:12px;border:1px solid var(--border);border-radius:12px;margin-bottom:10px;cursor:pointer;transition:border-color .15s;}",
    ".item:hover{border-color:rgba(245,158,11,.4);}",
    ".item.on{border-color:var(--gold);background:rgba(245,158,11,.06);}",
    ".box{flex:none;width:20px;height:20px;border-radius:6px;border:1.5px solid var(--muted);display:flex;align-items:center;justify-content:center;margin-top:1px;transition:all .15s;}",
    ".item.on .box{background:var(--gold);border-color:var(--gold);color:#020617;font-size:13px;font-weight:700;}",
    ".lab{font-size:14px;font-weight:600;color:var(--text);}",
    ".note{font-size:12px;color:var(--muted);line-height:1.55;margin-top:4px;}",
    ".report{margin-top:18px;border:1px solid var(--gold);border-radius:14px;padding:16px;background:rgba(245,158,11,.05);}",
    ".report h4{color:var(--gold-soft);font-size:14px;margin-bottom:10px;}",
    ".report p{font-size:13px;color:var(--text);line-height:1.7;margin-bottom:8px;}",
    ".report .miss{color:#fca5a5;}",
    ".report .pass{color:var(--gold-soft);}",
    ".verdict{font-weight:700;}",
    ".loading,.error{display:inline-block;color:var(--muted);font-size:13px;padding:10px;}",
    ".error{color:#fca5a5;}"
  ].join("");

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function DecisionChecklistModal() {
    var self = Reflect.construct(HTMLElement, [], DecisionChecklistModal);
    return self;
  }
  DecisionChecklistModal.prototype = Object.create(HTMLElement.prototype);

  DecisionChecklistModal.prototype.connectedCallback = function () {
    var triggerText = this.getAttribute("trigger") || "开始决策体检";
    var titleAttr = this.getAttribute("title");
    var src = this.getAttribute("src");
    var root = this.attachShadow({ mode: "open" });
    root.innerHTML = '<style>' + STYLE + '</style><button class="trigger">' + esc(triggerText) + '</button><span class="loading">载入中…</span>';
    var self = this;
    var build = function (data) {
      var items = (data && data.items) ? data.items : FALLBACK.items;
      var modalTitle = titleAttr || (data && data.title) || FALLBACK.title;
      paint(root, items, modalTitle);
    };
    if (!src) { build(FALLBACK); return; }
    fetch(src).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) { build(data); })
      .catch(function (err) {
        var el = root.querySelector(".loading"); if (el) { el.className = "error"; el.textContent = "载入失败：" + err.message + "（回退内置清单）"; }
        build(FALLBACK);
      });
  };

  function paint(root, ITEMS, modalTitle) {
    var old = root.querySelector(".loading"); if (old) old.remove();
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="overlay">' +
      '  <div class="modal">' +
      '    <div class="mhead"><h3>' + esc(modalTitle) + '</h3><button class="close">×</button></div>' +
      '    <div class="body">' +
      '      <div class="barwrap"><div class="bar"></div></div>' +
      '      <div class="bartxt">已通过 0 / ' + ITEMS.length + ' 项</div>' +
      '      <div class="list"></div>' +
      '      <div class="report" style="display:none;"></div>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    root.appendChild(wrap.firstChild);

    var overlay = root.querySelector(".overlay");
    var bar = root.querySelector(".bar");
    var bartxt = root.querySelector(".bartxt");
    var list = root.querySelector(".list");
    var report = root.querySelector(".report");
    var done = {};

    ITEMS.forEach(function (it, idx) {
      var row = document.createElement("div");
      row.className = "item";
      row.innerHTML = '<div class="box">✓</div><div><div class="lab">' + esc(it.label) +
        '</div><div class="note">' + esc(it.note) + '</div></div>';
      row.addEventListener("click", function () {
        if (done[idx]) { delete done[idx]; row.classList.remove("on"); }
        else { done[idx] = true; row.classList.add("on"); }
        update();
      });
      list.appendChild(row);
    });

    function update() {
      var n = Object.keys(done).length;
      bar.style.width = (n / ITEMS.length * 100) + "%";
      bartxt.textContent = "已通过 " + n + " / " + ITEMS.length + " 项";
      if (n === 0) { report.style.display = "none"; return; }
      var passed = ITEMS.filter(function (i, i2) { return done[i2]; });
      var missed = ITEMS.filter(function (i, i2) { return !done[i2]; });
      var pct = Math.round(n / ITEMS.length * 100);
      var verdict, vclass;
      if (pct === 100) { verdict = "决策免疫系统完整，可果断出击。"; vclass = "pass"; }
      else if (pct >= 60) { verdict = "主体框架过关，但仍有致命盲区待补。"; vclass = "pass"; }
      else { verdict = "底盘薄弱，建议先补强再行动。"; vclass = "miss"; }
      var html = '<h4>评估报告 · ' + pct + '% 通过</h4>' +
        '<p class="' + vclass + ' verdict">结论：' + verdict + '</p>' +
        '<p class="pass">已夯实：' + passed.map(function (i) { return i.label; }).join("、") + '。</p>';
      if (missed.length) {
        html += '<p class="miss">仍暴露盲区：' + missed.map(function (i) { return i.label; }).join("、") +
          '。逐项追问其下方提示，补齐后再决策。</p>';
      } else {
        html += '<p class="pass">所有维度全部通过——你已具备在混沌中冷静下注的底气。</p>';
      }
      report.innerHTML = html;
      report.style.display = "block";
    }

    root.querySelector(".trigger").addEventListener("click", function () { overlay.classList.add("show"); });
    root.querySelector(".close").addEventListener("click", function () { overlay.classList.remove("show"); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.classList.remove("show"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") overlay.classList.remove("show"); });
  }

  customElements.define("decision-checklist-modal", DecisionChecklistModal);
})();
