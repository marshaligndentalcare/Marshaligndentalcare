# Cloudflare Pages — Deployment Guide

## Overview

This site is a **static Vite + React SPA** deployed on Cloudflare Pages. No
Cloudflare Functions, no R2, no server-side rendering. The existing `vercel.json`
remains in place until you confirm the cutover.

---

## Cloudflare Pages Dashboard Settings

| Setting | Value |
|---|---|
| **Framework preset** | `None` (plain static site — do NOT select Vite, it overrides the build command) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | *(leave blank — repo root)* |
| **Node.js version** | `20.19.0` (set in `.node-version`; also set `NODE_VERSION=20` in CF env vars for safety) |

---

## Environment Variables (Cloudflare Pages → Settings → Environment Variables)

Set these for **Production** and **Preview** environments separately.

### Production (marshaligndentalcare.in)

| Variable | Value | Visibility |
|---|---|---|
| `VITE_SITE_URL` | `https://marshaligndentalcare.in` | Plaintext |
| `VITE_SITE_INDEXABLE` | `true` | Plaintext |
| `VITE_WA_PHONE` | `919025655627` | Plaintext |
| `NODE_VERSION` | `20` | Plaintext |

### Preview / Staging (*.pages.dev)

| Variable | Value |
|---|---|
| `VITE_SITE_URL` | `https://marshaligndentalcare.in` *(keep canonical URL the same)* |
| `VITE_SITE_INDEXABLE` | `false` *(default — prevents staging from being indexed)* |
| `VITE_WA_PHONE` | `919025655627` |
| `NODE_VERSION` | `20` |

> [!IMPORTANT]
> **Never set `VITE_SITE_INDEXABLE=true` on the `*.pages.dev` domain.**
> The `public/_headers` file already adds `X-Robots-Tag: noindex, nofollow` for
> all `*.pages.dev` URLs as a belt-and-suspenders guard.

---

## How the Indexing Switch Works

The `VITE_SITE_INDEXABLE` env var is read at **build time** by `vite.config.ts`:

- **`false` (default):**
  - `index.html` → `<meta name="robots" content="noindex, nofollow">`
  - `public/robots.txt` → `Disallow: /`

- **`true` (set at launch):**
  - `index.html` → `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
  - `public/robots.txt` → `Allow: /` + `Sitemap: https://marshaligndentalcare.in/sitemap.xml`

To go live: set `VITE_SITE_INDEXABLE=true` in Cloudflare Pages production env vars,
then trigger a new deploy (re-deploy the latest commit). The site instantly becomes
crawlable after that deploy.

---

## SPA Routing

`public/_redirects` handles two things:

1. **301 redirects** — old individual doctor profile URLs redirect permanently to
   `/specialists#<slug>` (matching the redirects already in `vercel.json`).
2. **SPA fallback** — `/* /index.html 200` lets React Router handle all deep
   links (e.g. `/gallery`, `/specialists`, `/treatments/orthodontics`) on hard
   refresh.

Cloudflare Pages serves real static files in `dist/` before consulting `_redirects`,
so `robots.txt`, `sitemap.xml`, favicon files, and all assets are served correctly.

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

### 9. *.pages.dev Noindex Header

```bash
curl -sI https://<your-project>.pages.dev/ | grep -i x-robots
```

Expected: `x-robots-tag: noindex, nofollow`.

---

## Custom Domain Setup (at launch)

1. Cloudflare Pages → **Custom domains** → Add `marshaligndentalcare.in`.
2. Update DNS: Cloudflare will add a `CNAME` record pointing to your Pages project.
3. SSL is provisioned automatically.
4. Set `VITE_SITE_INDEXABLE=true` in production env vars.
5. Trigger a new deploy.
6. Verify all checklist items above.
7. Submit sitemap to Google Search Console.

---

## Files Changed for Cloudflare Readiness

| File | Change |
|---|---|
| `public/_headers` | New — security headers + cache rules for Cloudflare Pages |
| `public/_redirects` | New — SPA fallback + 301 redirects for old doctor profile URLs |
| `public/robots.txt` | Generated at build time by `vite.config.ts` plugin |
| `index.html` | `<meta name="robots">` now uses `%VITE_ROBOTS_META%` placeholder |
| `vite.config.ts` | Added `generate-robots-txt` and `inject-robots-meta` build plugins |
| `.node-version` | New — pins Node 20.19.0 for Cloudflare Pages builds |
| `.env.example` | Fixed wrong domain (`marshaligndental.com` → `marshaligndentalcare.in`), added `VITE_SITE_INDEXABLE` |
| `docs/CLOUDFLARE-DEPLOY.md` | This file — deployment guide |

`vercel.json` is **kept unchanged** until you confirm Vercel cutover.

