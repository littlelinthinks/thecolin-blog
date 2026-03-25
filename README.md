# COLIN - Personal Thought Blog

🌐 **Website**: [thecolin.vip](https://thecolin.vip)

> 探索深邃思想，创造有意义的人生。
> Deep thinking · Lifelong learning · Continuous growth

---

## 📊 Performance Score

[![Lighthouse](https://img.shields.io/badge/Lighthouse-91%2F100-orange)](https://thecolin.vip)
[![Performance](https://img.shields.io/badge/Performance-95%2F100-success)](https://thecolin.vip)
[![PWA](https://img.shields.io/badge/PWA-80%2F100-blue)](https://thecolin.vip)

**Optimized for:**
- ⚡ **First Contentful Paint**: < 1.5s
- 🚀 **Time to Interactive**: < 2.5s
- 📱 **Offline Support**: ✅ Service Worker
- 🎨 **PWA Ready**: ✅ Installable

---

## ✨ Features

### Content
- 📝 Medium-style article reading experience
- 🔍 Full-text search with instant results
- 📑 Category filtering
- 📡 RSS feed subscription
- 💬 Comment system UI

### Design
- 🌓 Auto dark/light theme (with manual toggle)
- 🌍 Bilingual support (中文/English)
- 📱 Fully responsive (mobile-first)
- ☕ Buy me a coffee support
- 🎨 Beautiful animations & micro-interactions

### Performance
- ⚡ **Critical CSS inlined** - Above-the-fold rendered instantly
- 🔄 **Async CSS loading** - Non-blocking resource loading
- 💾 **Service Worker** - Offline access & instant repeat visits
- 🖼️ **Lazy loading images** - Load on demand
- 🌐 **CDN cached** - Global edge caching via Vercel

---

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Serve locally (any static server)
python3 -m http.server 8000
# or
npx serve .
# or
vercel dev
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo to [Vercel Dashboard](https://vercel.com).

---

## 📁 Project Structure

```
.
├── index.html              # Homepage (optimized)
├── article.html            # Article detail page
├── products.html           # Resource bundles page
├── archive.html            # Article archive
├── subscribe.html          # Newsletter subscription
├── css/
│   ├── common.css          # Shared styles (7.3KB)
│   ├── home.css            # Homepage styles (15KB)
│   └── images.css          # Image optimizations
├── js/
│   └── common.js           # Shared JavaScript
├── images/                 # Static images
├── articles/               # Markdown articles
├── sw.js                   # Service Worker
├── manifest.json           # PWA manifest
├── vercel.json             # Vercel config
└── .github/
    └── workflows/
        └── deploy.yml      # Auto-deployment
```

---

## 🎯 Performance Optimizations

### Implemented

| Optimization | Status | Impact |
|-------------|--------|--------|
| Critical CSS inline | ✅ | -40% FCP |
| Async CSS loading | ✅ | -200ms render |
| Service Worker | ✅ | <100ms repeat visits |
| Resource preloading | ✅ | -300ms DNS |
| Lazy loading images | ✅ | -30% page weight |
| Brotli compression | ✅ | -20% transfer |
| HTTP/2 Push | ✅ | Auto by Vercel |
| Edge Caching | ✅ | Global CDN |

### Web Vitals Targets

| Metric | Target | Current |
|--------|--------|---------|
| FCP | < 1.8s | ✅ 1.2s |
| LCP | < 2.5s | ✅ 1.8s |
| TTI | < 3.8s | ✅ 2.3s |
| CLS | < 0.1 | ✅ 0.02 |
| FID | < 100ms | ✅ 12ms |

---

## 🛠️ Tech Stack

- **Core**: Pure HTML5, CSS3, Vanilla JavaScript
- **Build**: None (static site)
- **Hosting**: Vercel Edge Network
- **CI/CD**: GitHub Actions
- **PWA**: Service Worker + Web App Manifest
- **Analytics**: Google Analytics 4

**Zero Dependencies** - No build step required!

---

## 📦 Build & Deploy

### Automatic (Recommended)

Push to `main` branch → Auto-deploy to Vercel:

```bash
git add .
git commit -m "feat: new article"
git push origin main
```

### Manual

```bash
# Deploy to production
vercel --prod
```

---

## 🧪 Testing

### Local

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

### Online

- [PageSpeed Insights](https://pagespeed.web.dev)
- [WebPageTest](https://webpagetest.org)
- [GTmetrix](https://gtmetrix.com)

---

## 📈 Monitoring

### Vercel Analytics

Enable in Dashboard → Analytics:
- Real User Monitoring (RUM)
- Core Web Vitals
- Traffic insights

### Google Analytics

Configured in `index.html`:
```javascript
// G-MPQTS8G2HD
```

---

## 📝 Documentation

- [Optimization Report](./OPTIMIZATION_REPORT.md) - Detailed performance changes
- [Vercel Deployment Guide](./DEPLOY_VERCEL.md) - Deployment instructions
- [Image Optimization](./image_optimization_guide.md) - Image compression guide

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'feat: add something'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT © 2026 COLIN

---

## 🔗 Links

- 🌐 **Live Site**: [thecolin.vip](https://thecolin.vip)
- 📧 **Email**: hello@thecolin.com
- 🐦 **Twitter**: [@thecolin](https://twitter.com/thecolin)
- 📡 **RSS**: [thecolin.vip/rss.xml](https://thecolin.vip/rss.xml)

---

<p align="center">
  <strong>用心思考 · 持续创作 · 终身成长</strong><br>
  <em>Deep thinking · Continuous creation · Lifelong growth</em>
</p>
