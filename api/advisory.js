/**
 * api/advisory.js — 智囊团后端（Vercel Serverless Function，Node.js）
 * ============================================================
 * 这是「新增文件」，不改动你任何现有接口（含 api/sync-book）。
 * 直接放进你现有仓库根目录的  api/  文件夹即可，Vercel 会自动识别为 Serverless 接口。
 *
 * 环境变量（Vercel → Settings → Environment Variables，可只填第一个）：
 *   DEEPSEEK_API_KEY   （可选）不填则自动返回高质量 mock 四阶段诊断，绝不报错
 *   DEEPSEEK_MODEL     （可选）默认 deepseek-chat
 *   DEEPSEEK_BASE_URL  （可选）默认 https://api.deepseek.com
 *
 * 行为：
 *   - 单访客每日 5 次免费（Cookie + IP 双重计数，取更严格者）。
 *   - 超限返回 429 + { limited:true }，前端据此显示公众号引流文案。
 *   - 有 Key 走真实 DeepSeek；无 Key / 调用失败 / 超时 自动回退 mock。
 *
 * 注意：Serverless 内存不持久，IP 计数会随时重置，属「基础防刷」。
 *       若要严格单 IP 级限流，需接 Vercel KV / Upstash Redis（代码里已留注释位置）。
 */

const MASTERS = {
  ding: "丁元英",
  munger: "查理·芒格",
  musk: "埃隆·马斯克",
  dalio: "瑞·达利欧",
  zeng: "曾国藩",
  kahneman: "丹尼尔·卡尼曼"
};

const DAILY_LIMIT = 5;

// 文风锚点：Colin 标准声音（三篇代表作）
const STYLE_ANCHOR =
  "你是 Colin 的思想分身。文风铁律：冷酷、求真、不奉承、不灌鸡汤；中西互证（中国智慧 × 西方理性）；" +
  "用「1-3-1」漏斗：1 句锐利判断 → 3 层解构 → 1 个可执行的微行动。参考锚点：" +
  "《修筑内心防波堤》（项飙「附近」× 斯多葛「控制二分法」）、" +
  "《豆豆三部曲：见路不走》（丁元英「见路不走」、强势/弱势文化）、" +
  "《第一性原理与系统思维》（马斯克拆解到底层真相 + 达利欧系统机器）。";

// 四阶段（严格按拍板命名）
const PHASE_TITLES = [
  "第一阶段 · 丁元英破局",
  "第二阶段 · 芒格思维模型",
  "第三阶段 · 马斯克第一性原理",
  "第四阶段 · 达利欧原则"
];

// 内存计数（尽力而为，重启即失效；严格限流请接 KV）
const ipStore = new Map();

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function clientIP(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  String(header).split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function readBody(req) {
  return new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => {
      try { resolve(d ? JSON.parse(d) : {}); } catch (e) { resolve({}); }
    });
  });
}

/** 高质量 mock：即使没有 Key，也给出节奏正确的四阶段诊断 */
function buildMock(question, masters) {
  const names = (masters || []).map((id) => MASTERS[id]).filter(Boolean);
  const summary =
    `关于「${question}」，先压一句冷话：真正的局，往往不在你盯着的那个问题上，` +
    `而在你默认的思维方式里。` +
    (names.length ? `你点将了 ${names.join("、")}，` : "") +
    `下面按四阶段给你一张可执行的解法图，不是安慰。`;
  const bodies = [
    `放下「救主心态」。${names.includes("丁元英") ? "丁元英会先问：你是在等别人给答案，还是在造自己的因果？" : "先看清你困在哪种「文化属性」里——盼人救的弱势，还是自己扛的强势。"} 对你的问题「${question}」，第一刀先剖开：真正能掌控的变量是什么，哪些只是情绪里的假问题。`,
    `${names.includes("查理·芒格") ? "芒格会说：先别急着行动，先检查你脑子里的模型有没有用错。" : "用多元思维模型替你过一遍。"} 反过来的想法是否成立？有没有「激励导致的偏差」在骗你？有没有把相关性当因果？把「${question}」放在几个彼此独立的模型下照一遍，漏洞自然现形。`,
    `${names.includes("埃隆·马斯克") ? "马斯克式拆解：别类比别人怎么做，回到最底层的事实重算一遍。" : "把它拆到底层事实。"} 抛开「大家都这么干」的成法，问：这件事不可再分的最小真理是什么？从那里重新推演「${question}」的解法，往往会得出和主流完全不同的路径。`,
    `${names.includes("瑞·达利欧") ? "达利欧会把它画成一台机器。" : "把局面当成一台系统机器。"} 哪些是可调的齿轮（你的原则、复盘、反馈回路）？写下属于你自己的原则：面对「${question}」这类问题，今后一律按哪条规则决策，让下次不再重蹈。`
  ];
  return {
    summary,
    phases: PHASE_TITLES.map((t, i) => ({ title: t, body: bodies[i] }))
  };
}

/** 真实调用 DeepSeek；任何异常都抛出，由调用方回退 mock */
async function callDeepSeek(question, masters) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("no key");
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const base = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const names = (masters || []).map((id) => MASTERS[id]).filter(Boolean);

  const prompt =
    `${STYLE_ANCHOR}\n\n用户提问：${question}\n参与诊断的大师：${names.join("、") || "全部六位"}\n\n` +
    `请严格按以下 JSON 输出，不要多余解释：\n` +
    `{\n "summary": "一段冷酷求真的开场总括（中文，80-140字）",\n "phases": [\n` +
    PHASE_TITLES.map((t) => `  { "title": "${t}", "body": "..." }`).join(",\n") +
    `\n ]\n}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      }),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error("http " + res.status);
    const json = await res.json();
    const text = json.choices && json.choices[0] && json.choices[0].message
      ? json.choices[0].message.content
      : "";
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("no json");
    const parsed = JSON.parse(m[0]);
    if (!parsed.summary || !Array.isArray(parsed.phases)) throw new Error("bad shape");
    // 规整为固定四阶段
    const phases = PHASE_TITLES.map((t, i) => {
      const hit = parsed.phases.find((p) => String(p.title || "").indexOf(t.split("·")[1].trim()) > -1);
      return { title: t, body: (hit && hit.body) || (parsed.phases[i] && parsed.phases[i].body) || "" };
    }).filter((p) => p.body);
    if (!phases.length) throw new Error("empty phases");
    return { summary: parsed.summary, phases };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "POST only" }));
  }

  // ---- 限流：Cookie + IP 双计数，取更严格者 ----
  const today = todayUTC();
  const cookies = parseCookies(req.headers.cookie);
  let used = 0;
  if (cookies.adv_quota && cookies.adv_quota.startsWith(today + ":")) {
    used = parseInt(cookies.adv_quota.split(":")[1], 10) || 0;
  }
  const ip = clientIP(req);
  const ipKey = today + "|" + ip;
  const ipUsed = ipStore.get(ipKey) || 0;
  const effective = Math.max(used, ipUsed);

  if (effective >= DAILY_LIMIT) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ limited: true, usageLeft: 0 }));
  }

  const next = effective + 1;
  ipStore.set(ipKey, next);
  res.setHeader("Set-Cookie", `adv_quota=${today}:${next}; Path=/; Max-Age=86400`);

  const body = await readBody(req);
  const question = String(body.question || "").slice(0, 500) || "（未填写问题）";
  const masters = Array.isArray(body.masters) ? body.masters : [];

  let payload, model;
  try {
    payload = await callDeepSeek(question, masters);
    model = "deepseek";
  } catch (e) {
    payload = buildMock(question, masters);
    model = "mock";
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({
    summary: payload.summary,
    phases: payload.phases,
    usageLeft: Math.max(0, DAILY_LIMIT - next),
    model
  }));
};
