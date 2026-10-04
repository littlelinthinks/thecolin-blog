/**
 * <advisory-widget> — Colin 智囊团 · v2（thecolin.vip 主题版）
 * ============================================================
 * 独立组件（Web Component + Shadow DOM，零依赖，不碰老站任何代码）。
 *
 * v2 变更：视觉整体换成 thecolin 黑白极简风——
 *  直接消费站点 CSS 变量（--bg-card / --text-primary / --border / --button-bg-dark…），
 *  亮色白底黑字、暗色模式（data-theme="dark"）自动跟随；大师头像改为单色圆徽。
 *  交互逻辑与 v1 完全一致：点将大师 → 提问 → 四阶段结构化诊断；
 *  每日免费次数用尽 → 公众号【小Lin思考】引流弹层。
 *
 * 嵌入步骤（2 行代码）：
 *   1) 想放的位置放：<advisory-widget endpoint="/api/advisory"></advisory-widget>
 *      （position="fixed" 则变右下角浮窗）
 *   2) </body> 前放：<script src="advisory-widget.js"></script>
 * 后端：把 api/advisory.js 放进 Vercel 仓库 api/ 目录，环境变量 DEEPSEEK_API_KEY
 *      （不设置则自动返回高质量 mock 诊断，功能完整可演示）。
 */
(function () {
  "use strict";

  const MASTERS = [
    { id: "ding", name: "丁元英", initial: "丁", lens: "破局 · 文化属性" },
    { id: "munger", name: "查理·芒格", initial: "芒", lens: "思维模型" },
    { id: "musk", name: "埃隆·马斯克", initial: "马", lens: "第一性原理" },
    { id: "dalio", name: "瑞·达利欧", initial: "达", lens: "原则系统" },
    { id: "zeng", name: "曾国藩", initial: "曾", lens: "扎硬寨打呆仗" },
    { id: "kahneman", name: "丹尼尔·卡尼曼", initial: "卡", lens: "认知偏误审计" }
  ];

  const STYLE = `
    :host { display:block; max-width:420px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif; }
    :host([position="fixed"]) { position:fixed; right:20px; bottom:20px; z-index:9999; max-width:380px; }
    * { box-sizing:border-box; }
    .box { background:var(--bg-card,#FFFFFF); border:1px solid var(--border,#E5E5E5); border-radius:14px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,.08); color:var(--text-primary,#000); }
    .head { display:flex; align-items:center; gap:8px; padding:14px 16px; border-bottom:1px solid var(--border,#E5E5E5); }
    .head .ic { font-size:15px; }
    .head h3 { margin:0; font-size:15px; font-weight:700; }
    .head .sub { font-size:11px; color:var(--text-secondary,#666); }
    .masters { display:flex; flex-wrap:wrap; gap:6px; padding:12px 16px; }
    .m { display:flex; align-items:center; gap:6px; border:1px solid var(--border,#E5E5E5); background:transparent; border-radius:10px; padding:5px 8px; cursor:pointer; font-size:12px; color:var(--text-primary,#000); transition:all .12s; }
    .m:hover { border-color:var(--text-primary,#000); }
    .m.on { background:var(--button-bg-dark,#000); color:var(--button-text-dark,#fff); border-color:var(--button-bg-dark,#000); }
    .m .av { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; border:1px solid var(--text-secondary,#666); color:inherit; flex:none; }
    .chat { height:260px; overflow-y:auto; padding:12px 16px; display:flex; flex-direction:column; gap:10px; background:var(--bg-primary,#FFFFFF); }
    .row { display:flex; } .row.u { justify-content:flex-end; } .row.a { justify-content:flex-start; }
    .bubble { max-width:88%; padding:10px 12px; border-radius:12px; font-size:13px; line-height:1.6; white-space:pre-wrap; }
    .row.u .bubble { background:var(--button-bg-dark,#000); color:var(--button-text-dark,#fff); }
    .row.a .bubble { background:var(--bg-card,#FFF); border:1px solid var(--border,#E5E5E5); color:var(--text-primary,#000); }
    .phase { margin-top:8px; border:1px solid var(--border,#E5E5E5); border-left:3px solid var(--text-primary,#000); border-radius:8px; padding:8px 10px; background:var(--bg-card,#FFF); }
    .phase .pt { font-size:11px; font-weight:700; color:var(--text-primary,#000); margin-bottom:3px; letter-spacing:.04em; }
    .phase .pb { font-size:12px; color:var(--text-secondary,#444); white-space:pre-wrap; line-height:1.55; }
    .limit { display:flex; gap:8px; align-items:flex-start; }
    .limit .g { flex:none; }
    .limit p { margin:0; font-size:12px; color:var(--text-primary,#000); line-height:1.6; }
    .limit b { font-weight:700; }
    .usage { text-align:right; font-size:11px; color:var(--text-secondary,#666); padding:0 16px 6px; }
    .input { display:flex; gap:8px; padding:12px 16px; border-top:1px solid var(--border,#E5E5E5); background:var(--bg-card,#FFF); }
    textarea { flex:1; resize:none; height:42px; border-radius:10px; border:1px solid var(--border,#E5E5E5); background:var(--bg-primary,#FFF); color:var(--text-primary,#000); padding:10px 12px; font-size:13px; outline:none; font-family:inherit; }
    textarea:focus { border-color:var(--text-primary,#000); }
    textarea::placeholder { color:var(--text-secondary,#999); }
    .send { border:none; border-radius:10px; background:var(--button-bg-dark,#000); color:var(--button-text-dark,#fff); font-weight:600; padding:0 18px; cursor:pointer; font-size:13px; }
    .send:hover { background:var(--accent-hover,#333); }
    .send:disabled { opacity:.5; cursor:default; }
    .empty { color:var(--text-secondary,#999); font-size:13px; text-align:center; margin:auto; }
  `;

  const DEFAULT_LIMIT = "今日免费诊断已用完 🎯 关注微信公众号【小Lin思考】，发送【智囊团】获取无限制使用口令。";

  class AdvisoryWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._selected = new Set(MASTERS.map((m) => m.id));
      this._loading = false;
      this._usageLeft = null;
    }
    connectedCallback() {
      this._endpoint = this.getAttribute("endpoint") || "/api/advisory";
      this._limitText = this.getAttribute("limit-text") || DEFAULT_LIMIT;
      this.render();
    }
    render() {
      const masters = MASTERS.map((m) => `
        <div class="m ${this._selected.has(m.id) ? "on" : ""}" data-id="${m.id}" title="${m.lens}">
          <span class="av">${m.initial}</span>${m.name}
        </div>`).join("");
      this.shadowRoot.innerHTML = `
        <style>${STYLE}</style>
        <div class="box">
          <div class="head">
            <span class="ic">🧠</span>
            <div><h3>Colin 智囊团</h3><div class="sub">6 位大师 · 结构化诊断</div></div>
          </div>
          <div class="masters">${masters}</div>
          <div class="chat"><div class="empty">向大师们抛一个真实的商业 / 人生难题。</div></div>
          <div class="usage"></div>
          <div class="input">
            <textarea placeholder="描述你的难题，回车发送…"></textarea>
            <button class="send">诊断</button>
          </div>
        </div>`;
      this.shadowRoot.querySelectorAll(".m").forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.getAttribute("data-id");
          if (this._selected.has(id)) this._selected.delete(id); else this._selected.add(id);
          el.classList.toggle("on");
        });
      });
      const ta = this.shadowRoot.querySelector("textarea");
      const send = this.shadowRoot.querySelector(".send");
      ta.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.send(); }
      });
      send.addEventListener("click", () => this.send());
    }
    addMsg(role, data) {
      const chat = this.shadowRoot.querySelector(".chat");
      const empty = chat.querySelector(".empty");
      if (empty) empty.remove();
      const row = document.createElement("div");
      row.className = "row " + role;
      const b = document.createElement("div");
      b.className = "bubble";
      if (data.limited) {
        b.innerHTML = `<div class="limit"><span class="g">🎁</span><p>${escapeHtml(this._limitText)}</p></div>`;
      } else {
        if (data.content) b.textContent = data.content;
        (data.phases || []).forEach((p) => {
          const ph = document.createElement("div");
          ph.className = "phase";
          ph.innerHTML = `<div class="pt">${escapeHtml(p.title)}</div><div class="pb">${escapeHtml(p.body)}</div>`;
          b.appendChild(ph);
        });
      }
      row.appendChild(b);
      chat.appendChild(row);
      chat.scrollTop = chat.scrollHeight;
    }
    async send() {
      if (this._loading) return;
      const ta = this.shadowRoot.querySelector("textarea");
      const q = ta.value.trim();
      if (!q) return;
      if (this._selected.size === 0) { ta.focus(); return; }
      ta.value = "";
      this.addMsg("u", { content: q });
      this._loading = true;
      const send = this.shadowRoot.querySelector(".send");
      send.disabled = true;
      this.addMsg("a", { content: "智囊团诊断中…" });
      try {
        const res = await fetch(this._endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, masters: Array.from(this._selected) })
        });
        const data = await res.json().catch(() => ({}));
        // 移除“诊断中”占位
        const chat = this.shadowRoot.querySelector(".chat");
        const last = chat.querySelector(".row.a:last-child");
        if (last && last.textContent.indexOf("诊断中") >= 0) chat.removeChild(last);
        if (res.status === 429 || data.limited) {
          this.addMsg("a", { limited: true });
        } else {
          if (typeof data.usageLeft === "number") {
            this._usageLeft = data.usageLeft;
            this.shadowRoot.querySelector(".usage").textContent =
              `今日免费剩余 ${data.usageLeft} 次`;
          }
          this.addMsg("a", { content: data.summary || "", phases: data.phases || [] });
        }
      } catch (e) {
        const chat = this.shadowRoot.querySelector(".chat");
        const last = chat.querySelector(".row.a:last-child");
        if (last && last.textContent.indexOf("诊断中") >= 0) chat.removeChild(last);
        this.addMsg("a", { content: "请求失败，请确认后端已部署（api/advisory）。" });
      } finally {
        this._loading = false;
        send.disabled = false;
      }
    }
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  if (!customElements.get("advisory-widget")) {
    customElements.define("advisory-widget", AdvisoryWidget);
  }
})();
