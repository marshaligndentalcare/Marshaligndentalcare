# Cloudflare Workers Static Assets — Deployment Guide

## Overview

This site is a **static Vite + React SPA** deployed with **Cloudflare Workers static assets**
(`npx wrangler deploy`). No Cloudflare Functions, no R2, no server-side rendering.
The existing `vercel.json` remains in place until you confirm the cutover.

SPA routing (deep-link hard-refresh) is handled by `wrangler.jsonc`
`not_found_handling: "single-page-application"` — **not** by a catch-all in `_redirects`.

---

## Deploy Steps

```bash
# 1. Build the site
npm run build

# 2. Deploy to Cloudflare Workers (requires CLOUDFLARE_API_TOKEN in env or wrangler login)
npx wrangler deploy
```

`wrangler.jsonc` at the repo root tells Wrangler what to deploy:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "marshaligndentalcare",
  "compatibility_date": "2026-11-07",
  "assets": { "directory": "./dist", "not_found_handling": "single-page-application" }
}
```

---

## Environment Variables

Set these in Cloudflare dashboard → Workers & Pages → your worker → Settings → Variables,
**or** via `wrangler secret put` / `wrangler deploy --var` for CI.

### Production (marshaligndentalcare.in)

| Variable | Value | Visibility |
|---|---|---|
| `VITE_SITE_URL` | `https://marshaligndentalcare.in` | Plaintext |
| `VITE_SITE_INDEXABLE` | `true` | Plaintext |
| `VITE_WA_PHONE` | `919025655627` | Plaintext |
| `NODE_VERSION` | `20` | Plaintext |

### Staging / Preview (*.workers.dev)

| Variable | Value |
|---|---|
| `VITE_SITE_URL` | `https://marshaligndentalcare.in` *(keep canonical URL the same)* |
| `VITE_SITE_INDEXABLE` | `false` *(default — prevents staging from being indexed)* |
| `VITE_WA_PHONE` | `919025655627` |
| `NODE_VERSION` | `20` |

> [!IMPORTANT]
> **Never set `VITE_SITE_INDEXABLE=true` on the staging domain.**
> `public/_headers` already adds `X-Robots-Tag: noindex, nofollow` for both
> `*.pages.dev` and `*.workers.dev` URLs as a belt-and-suspenders guard.

---

## Node Version

Pinned to **20.19.0** via `.node-version` at the repo root. Also set
`NODE_VERSION=20` in Cloudflare environment variables for safety.

---

## How the Indexing Switch Works

The `VITE_SITE_INDEXABLE` env var is read at **build time** by `vite.config.ts`:

- **`false` (default):**
  - `index.html` → `<meta name="robots" content="noindex, nofollow">`
  - `public/robots.txt` → `Disallow: /`

- **`true` (set at launch):**
  - `index.html` → `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
  - `public/robots.txt` → `Allow: /` + `Sitemap: https://marshaligndentalcare.in/sitemap.xml`

To go live: set `VITE_SITE_INDEXABLE=true` in Cloudflare production env vars,
then run `npm run build && npx wrangler deploy`. The site instantly becomes
crawlable after that deploy.

---

## SPA Routing

`public/_redirects` handles **only** 301 permanent redirects:

1. Old individual doctor profile URLs → `/specialists#<slug>`

The SPA fallback (deep-link hard-refresh) is handled by `wrangler.jsonc`:
```jsonc
"assets": { "not_found_handling": "single-page-application" }
```

> [!WARNING]
> Do NOT add `/* /index.html 200` to `_redirects`. That line triggers Cloudflare
> error code 100324 (infinite loop) when deploying with Workers static assets.

---

## Security Headers

`public/_headers` mirrors all security headers from `vercel.json`:

- **CSP** — same policy as Vercel, covering fonts, images, WASM
- **HSTS** — `max-age=63072000; includeSubDomains; preload`
- **X-Content-Type-Options** — `nosniff`
- **Referrer-Policy** — `strict-origin-when-cross-origin`
- **Permissions-Policy** — camera, microphone, geolocation blocked
- **X-Frame-Options** — `SAMEORIGIN`
- **Cache-Control** — immutable for `/assets/*`, `/models/*`, `/draco/*`; `no-store` for HTML
- **X-Robots-Tag: noindex, nofollow** — applied to `*.pages.dev/*` and `*.workers.dev/*` staging URLs only

---

## Post-Deploy Checklist

Run these checks after every deploy before announcing to users.

### 1. Headers Present

```bash
curl -sI https://marshaligndentalcare.in/ | grep -i "content-security-policy\|x-frame\|strict-transport"
```

Expected: CSP, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security` are all visible.

### 2. SPA Routing — Hard Refresh

Open these URLs directly (not by navigating from home):

- `https://marshaligndentalcare.in/gallery`
- `https://marshaligndentalcare.in/specialists`
- `https://marshaligndentalcare.in/treatments/orthodontics`

Expected: page loads correctly, no 404.

### 3. Old Redirects Work

```bash
curl -sI https://marshaligndentalcare.in/specialists/dr-marshal-antony
```

Expected: `HTTP/2 301` with `Location: /specialists#dr-marshal-antony`.

### 4. robots.txt (Pre-launch — VITE_SITE_INDEXABLE=false)

```bash
curl https://marshaligndentalcare.in/robots.txt
```

Expected:
```
User-agent: *
Disallow: /
```

### 5. robots.txt (Post-launch — VITE_SITE_INDEXABLE=true)

Expected:
```
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://marshaligndentalcare.in/sitemap.xml
```

### 6. noindex Meta Tag (Pre-launch)

```bash
curl -s https://marshaligndentalcare.in/ | grep -i "robots"
```

Expected: `<meta name="robots" content="noindex, nofollow">`.

### 7. No Console Errors

Open DevTools → Console on home, gallery, and specialists pages. Expected: 0 errors.

### 8. Images Load

Verify doctor photos, gallery, and OG image (`/clinic-reception.jpg`) load with 200.

### 9. Staging Noindex Header

```bash
# workers.dev staging
curl -sI https://marshaligndentalcare.<account>.workers.dev/ | grep -i x-robots
# pages.dev preview
curl -sI https://marshaligndentalcare.pages.dev/ | grep -i x-robots
```

Expected: `x-robots-tag: noindex, nofollow` for both staging domains.
Expected: NO `x-robots-tag` for `marshaligndentalcare.in` (production).

---

## Custom Domain Setup (at launch)

1. Cloudflare Workers → your worker → **Triggers** → **Add Custom Domain** → `marshaligndentalcare.in`
2. Update DNS: Cloudflare will add a `CNAME` record pointing to your Worker.
3. SSL is provisioned automatically.
4. Set `VITE_SITE_INDEXABLE=true` in production env vars.
5. Run `npm run build && npx wrangler deploy`.
6. Verify all checklist items above.
7. Submit sitemap to Google Search Console.

---

## Files Changed for Cloudflare Readiness

| File | Change |
|---|---|
| `public/_headers` | Security headers + cache rules + workers.dev noindex guard |
| `public/_redirects` | 301 redirects for old doctor profile URLs only (no SPA catch-all) |
| `public/robots.txt` | Generated at build time by `vite.config.ts` plugin |
| `index.html` | `<meta name="robots">` uses `%VITE_ROBOTS_META%` placeholder |
| `vite.config.ts` | `generate-robots-txt` and `inject-robots-meta` build plugins; `sourcemap: false` |
| `.node-version` | Pins Node 20.19.0 for Cloudflare builds |
| `.env.example` | Documents `VITE_SITE_URL`, `VITE_SITE_INDEXABLE`, `VITE_WA_PHONE` |
| `wrangler.jsonc` | Workers static assets config: dist dir + SPA not_found_handling |
| `docs/CLOUDFLARE-DEPLOY.md` | This file — deployment guide |

`vercel.json` is **kept unchanged** until you confirm Vercel cutover.
