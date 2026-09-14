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
```bash
node scripts/check-links.js
```

### 2. Auto-Repair Broken Links & Forwarding Scripts
```bash
node scripts/fix-links.js
```

---

## 🛠️ Key Architectural Rules for Live Links

1. **GitHub Pages Subpath Stripping:** Always strip the repository name prefix before redirecting to Cloudflare Workers to prevent 404s.
2. **Canonical LIVE_BASE:** In `js/nav.js`, set `LIVE_BASE` directly to `https://sep-3-agentic-coding.polished-boat-17b2.workers.dev/html/`.
3. **Root Domain Forwarding:** Ensure root `index.html` forwards to `/html/index.html`.
