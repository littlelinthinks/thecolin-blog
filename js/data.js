/**
 * 小Lin思考 · 全站数据中心
 * 文章、人物、概念、合集 四层交叉链接系统
 */

window.COLIN_DATA = {

  // ─── 六大合集 ────────────────────────────────────────────
  collections: [
    { id: 'tiandao',   icon: '🌊', color: '#5DCAA5',
      name: { zh: '天道·人性', en: 'Tiandao · Human Nature' },
      desc: { zh: '用《遥远的救世主》解码人性真相', en: 'Decoding human nature through literature' } },
    { id: 'history',   icon: '📜', color: '#EF9F27',
      name: { zh: '资治通鉴·历史', en: 'Zizhi Tongjian · History' },
      desc: { zh: '1000年前的答案，今天依然有效', en: 'Answers from 1000 years ago still work today' } },
    { id: 'western',   icon: '🧠', color: '#7F77DD',
      name: { zh: '西方经典·思维模型', en: 'Western Classics · Mental Models' },
      desc: { zh: '达利欧·芒格·卡尼曼', en: 'Dalio · Munger · Kahneman' } },
    { id: 'education', icon: '🎓', color: '#F0997B',
      name: { zh: '精英教育', en: 'Elite Education' },
      desc: { zh: '给未来孩子的礼物', en: 'A gift for future children' } },
    { id: 'meta',      icon: '🔍', color: '#85B7EB',
      name: { zh: '元认知·底层内核', en: 'Metacognition · The Core' },
      desc: { zh: '对思维的思维', en: 'Thinking about thinking' } },
    { id: 'wisdom',    icon: '✦', color: '#C9A84C',
      name: { zh: '心智折叠', en: 'Mind Folding' },
      desc: { zh: '186位顶尖人物原则', en: '186 elite figures\' principles' } },
  ],

  // ─── 核心概念标签 ─────────────────────────────────────────
  concepts: [
    { id: 'big-cycle',       name: { zh: '大周期', en: 'Big Cycle' }, color: '#7F77DD' },
    { id: 'human-nature',    name: { zh: '人性规律', en: 'Human Nature' }, color: '#5DCAA5' },
    { id: 'inversion',       name: { zh: '逆向思维', en: 'Inversion' }, color: '#C9A84C' },
    { id: 'first-principles',name: { zh: '第一性原理', en: 'First Principles' }, color: '#85B7EB' },
    { id: 'mental-models',   name: { zh: '思维模型', en: 'Mental Models' }, color: '#7F77DD' },
    { id: 'metacognition',   name: { zh: '元认知', en: 'Metacognition' }, color: '#85B7EB' },
    { id: 'path-dependence', name: { zh: '路径依赖', en: 'Path Dependence' }, color: '#F0997B' },
    { id: 'strong-culture',  name: { zh: '强势文化', en: 'Strong Culture' }, color: '#5DCAA5' },
    { id: 'long-termism',    name: { zh: '长期主义', en: 'Long-termism' }, color: '#C9A84C' },
    { id: 'dao-shu-qi',      name: { zh: '道·术·器', en: 'Dao-Shu-Qi' }, color: '#C9A84C' },
    { id: 'elite-education', name: { zh: '精英教育', en: 'Elite Education' }, color: '#F0997B' },
    { id: 'history-cycle',   name: { zh: '历史周期', en: 'History Cycle' }, color: '#EF9F27' },
  ],

  // ─── 186位人物（初始6位，持续扩充）────────────────────────
  figures: [
    {
      id: 'ray-dalio',
      num: '#003', domain: { zh: '投资·宏观', en: 'Investing · Macro' },
      name: { zh: 'Ray Dalio · 瑞·达利欧', en: 'Ray Dalio' },
      role: { zh: 'Bridgewater Associates 创始人', en: 'Founder of Bridgewater Associates' },
      principle: { zh: '理解债务大周期和内部秩序周期，是在混沌时代做出正确决策的底层能力。', en: 'Understanding the big debt cycle and internal order cycle is the foundation for sound decisions in chaotic times.' },
      concepts: ['big-cycle', 'first-principles', 'mental-models', 'long-termism', 'history-cycle'],
      collections: ['western'],
      books: ['原则', '变化中的世界秩序'],
    },
    {
      id: 'charlie-munger',
      num: '#001', domain: { zh: '投资·认知', en: 'Investing · Cognition' },
      name: { zh: 'Charlie Munger · 查理·芒格', en: 'Charlie Munger' },
      role: { zh: 'Berkshire Hathaway 副董事长', en: 'Vice Chairman of Berkshire Hathaway' },
      principle: { zh: '把所有重大错误列成清单，然后努力避免它们。逆向思维能帮你躲开最大的坑。', en: 'List all major mistakes and work hard to avoid them. Inversion helps you dodge the biggest traps.' },
      concepts: ['inversion', 'mental-models', 'first-principles', 'long-termism'],
      collections: ['western'],
      books: ['穷查理宝典'],
    },
    {
      id: 'naval-ravikant',
      num: '#007', domain: { zh: '人生哲学', en: 'Life Philosophy' },
      name: { zh: 'Naval Ravikant · 纳瓦尔', en: 'Naval Ravikant' },
      role: { zh: 'AngelList 创始人 · 哲学投资人', en: 'Founder of AngelList · Philosopher Investor' },
      principle: { zh: '真正的财富来自拥有「无法被替代的知识」与可无限复制的杠杆——代码、媒体、资本，而非出售时间。', en: 'Real wealth comes from owning irreplaceable knowledge and infinitely scalable leverage — not selling time.' },
      concepts: ['long-termism', 'first-principles', 'mental-models'],
      collections: ['western'],
      books: ['纳瓦尔宝典'],
    },
    {
      id: 'ding-yuanying',
      num: '#015', domain: { zh: '天道·人性', en: 'Tiandao · Human Nature' },
      name: { zh: '丁元英', en: 'Ding Yuanying' },
      role: { zh: '《遥远的救世主》主角 · 强势文化代表', en: 'Protagonist of "The Visitor from Afar" · Strong Culture Representative' },
      principle: { zh: '强势文化造就强者，弱势文化造就弱者。文化属性决定命运上限，而非个人努力。', en: 'Strong culture creates the strong; weak culture creates the weak. Cultural identity, not individual effort, determines destiny.' },
      concepts: ['strong-culture', 'human-nature', 'dao-shu-qi'],
      collections: ['tiandao'],
      books: ['遥远的救世主'],
    },
    {
      id: 'duan-yongping',
      num: '#034', domain: { zh: '长期主义', en: 'Long-termism' },
      name: { zh: '段永平', en: 'Duan Yongping' },
      role: { zh: '步步高 · OPPO · vivo 创始人', en: 'Founder of BBK, OPPO, vivo' },
      principle: { zh: '停止做错的事，比开始做对的事更难，也更重要。本分是一切商业成功的底层逻辑。', en: 'Stopping wrong things is harder — and more important — than starting right ones. Staying in your lane is the foundation of business success.' },
      concepts: ['long-termism', 'first-principles', 'path-dependence'],
      collections: ['western'],
      books: ['段永平投资问答录'],
    },
    {
      id: 'sima-guang',
      num: '#042', domain: { zh: '历史·政治', en: 'History · Politics' },
      name: { zh: '司马光', en: 'Sima Guang' },
      role: { zh: '《资治通鉴》编著者 · 北宋政治家', en: 'Author of Zizhi Tongjian · Northern Song Statesman' },
      principle: { zh: '史外无学。一切学问追根溯源都是历史，历史是最好的预测模型。', en: 'All learning traces back to history. History is the best prediction model.' },
      concepts: ['history-cycle', 'human-nature', 'mental-models'],
      collections: ['history'],
      books: ['资治通鉴'],
    },
  ],

  // ─── 文章列表（每篇发布后在这里登记）────────────────────
  articles: [
    {
      id: 'dalio-history-fold-2026',
      date: '2026-04',
      title: { zh: '为什么越努力越焦虑？因为你正站在历史的"折叠点"上', en: 'Why the Harder You Work, the More Anxious You Feel' },
      excerpt: { zh: '读瑞·达利欧万字长文，我有三个脊背发凉的顿悟。我们正处于大周期第六阶段，历史的剧本早就写好了。', en: 'Three spine-chilling realizations from reading Ray Dalio\'s essay. We are in the sixth phase of the big cycle.' },
      collection: 'western',
      figures: ['ray-dalio', 'duan-yongping'],
      concepts: ['big-cycle', 'history-cycle', 'first-principles', 'path-dependence', 'dao-shu-qi'],
      url: 'articles/2026-04-dalio-history-fold.html',
      wechat_url: '', // 公众号链接，发布后填入
    },
  ],

};

// ─── 工具函数 ──────────────────────────────────────────────

/** 根据id获取人物 */
window.COLIN_DATA.getFigure = function(id) {
  return this.figures.find(f => f.id === id);
};

/** 根据id获取概念 */
window.COLIN_DATA.getConcept = function(id) {
  return this.concepts.find(c => c.id === id);
};

/** 获取某人物的相关文章 */
window.COLIN_DATA.getArticlesByFigure = function(figureId) {
  return this.articles.filter(a => a.figures && a.figures.includes(figureId));
};

/** 获取某概念的相关文章 */
window.COLIN_DATA.getArticlesByConcept = function(conceptId) {
  return this.articles.filter(a => a.concepts && a.concepts.includes(conceptId));
};

/** 获取某合集的文章 */
window.COLIN_DATA.getArticlesByCollection = function(collectionId) {
  return this.articles.filter(a => a.collection === collectionId);
};

/** 获取某文章的相关人物 */
window.COLIN_DATA.getFiguresByArticle = function(articleId) {
  const article = this.articles.find(a => a.id === articleId);
  if (!article) return [];
  return article.figures.map(id => this.getFigure(id)).filter(Boolean);
};
