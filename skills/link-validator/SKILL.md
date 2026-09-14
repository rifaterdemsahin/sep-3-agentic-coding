---
name: link-validator
description: >-
  Automated test suite, link checker, and auto-repair engine for project links,
  Cloudflare Worker edge deployments, GitHub Pages redirects, and external tools.
  Use whenever testing live URLs, debugging 404s, fixing redirect loops, or verifying deployment health.
---

# 🔗 Link Validator & Route Repair Skill

This skill provides an automated testing and repair workflow to ensure all internal routes, live Cloudflare Worker deployments, GitHub Pages forwarding scripts, and external tool references remain functional and return valid HTTP status codes.

---

## 🚀 Quick Start Commands

### 1. Run Link Audit & Route Verification
Scans all local HTML files, tests live endpoints on Cloudflare Workers and GitHub Pages, checks asset dependencies, and validates external citations:
```bash
node scripts/check-links.js
```

### 2. Auto-Repair Broken Links & Forwarding Scripts
Repairs canonical URLs, injects proper repo-subpath cleaning scripts into all HTML files, updates `LIVE_BASE` in `js/nav.js`, and ensures root redirects function properly:
```bash
node scripts/fix-links.js
```

---

## 🛠️ Key Architectural Rules for Live Links

### 1. The GitHub Pages Subpath vs Cloudflare Worker Root Mismatch
* **The Problem:** GitHub Pages serves projects under a subpath (e.g. `/sep-3-agentic-coding/html/index.html`), whereas Cloudflare Workers routes directly from root (e.g. `/html/index.html`). A naive `location.replace(WORKER_BASE + location.pathname)` causes **HTTP 404** because the repo name prefix is invalid on the worker.
* **The Solution:** Always strip the repository name before forwarding:
```html
<script>
  if(location.hostname.endsWith('github.io')){
    var cleanPath = location.pathname.replace(/^\/sep-3-agentic-coding/, '').replace(/^\/[^/]+(?=\/html\/)/, '');
    if(!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    location.replace('https://sep-3-agentic-coding.polished-boat-17b2.workers.dev' + cleanPath + location.search + location.hash);
  }
</script>
```

### 2. Canonical `LIVE_BASE` Navigation Link
In `js/nav.js`, ensure `LIVE_BASE` points directly to the canonical deployment URL:
```javascript
var LIVE_BASE = 'https://sep-3-agentic-coding.polished-boat-17b2.workers.dev/html/';
```

### 3. Root Domain Index Forwarding
Ensure the root `index.html` file includes both a meta-refresh and JS redirect to `/html/index.html` so hitting the bare domain resolves instantly to the active research deck.

---

## 📋 Standard Test Checklist

When executing link validation, verify:
1. [ ] **Local Files:** All 7 pipeline HTML files exist in `html/`.
2. [ ] **Assets:** Shared CSS, JS bundles, and preview images exist and load without 404s.
3. [ ] **Cloudflare Edge Routes:** Each `https://<worker-domain>/html/<page>.html` returns `HTTP 200`.
4. [ ] **GitHub Pages Forwarding:** Forwarding script correctly strips repo prefix.
5. [ ] **External Tools:** Key external services (YouTube, Azure Blob Portal, Supabase, Skool, Kokoro TTS) are reachable.

---

## 🔄 Integration with Diverge & Converge Lifecycle
As production evolves and new pages or tools are added (divergence), periodically run `node scripts/check-links.js` and `node scripts/fix-links.js` during the convergence phase to keep the link registry clean and dead-link free.
