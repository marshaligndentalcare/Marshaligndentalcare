# HANDOVER — Marshalign Dental Care Website

> Prepared: 2026-10-25 | Status: **Ready for client review. Blocked on CLIENT_CONFIRMATIONS.**

---

## 1. Project Overview

| Item | Value |
|---|---|
| Site name | Marshalign Dental Care |
| Framework | React 19 + TypeScript + Vite 8 |
| Styling | Vanilla CSS Modules + CSS Custom Properties |
| 3D | Three.js + React Three Fiber (3D tooth on homepage) |
| Deployment | Vercel (preview) |
| Real domain | marshaligndentalcare.in |
| Node version | 20+ (LTS) |
| Build command | npm run build |
| Output directory | dist/ |

---

## 2. Going Live — DNS & Deployment Steps

1. Log in to your domain registrar for marshaligndentalcare.in
2. Add a CNAME record pointing to cname.vercel-dns.com
   - Or use the Vercel A-record IPs: 76.76.21.21 and 76.76.21.22
3. In the Vercel dashboard → Settings → Domains → Add Domain: marshaligndentalcare.in
4. Vercel will auto-provision a free TLS/HTTPS certificate via Let's Encrypt
5. Wait up to 24–48 hours for DNS propagation
6. Test: curl -I https://marshaligndentalcare.in should return 200 OK

---

## 3. Environment Variables

No .env secrets are required for the frontend. The site is fully static.

If you add analytics, form handling, or a CMS in future, create a .env file and NEVER commit it.

---

## 4. Single Source of Truth for Clinic Data

All clinic facts (phone, address, hours, domain, WhatsApp, doctors) are in:

`
src/config.ts     — the PRIMARY source of truth
src/data/clinic.ts — supplementary/future use
`

To update the phone number, address, or hours: **edit only src/config.ts**.
All components import from this file. Never hardcode clinic data in component files.

---

## 5. Doctors Data

Doctor bios and cards are in src/components/Specialists.tsx.

- **Dr. Marshal Antony M.** — BDS, MDS (Orthodontics & Dentofacial Orthopedics). Bio is written and factual.
- **Dr. Jose Olive A.** — Currently shows Profile coming soon. because her qualifications could not be verified. See CLIENT_CONFIRMATIONS.md item 1 to fill this in.

---

## 6. SEO Architecture

- **Static fallback** in index.html — the og:*, twitter:*, canonical, and JSON-LD that bots/crawlers see
- **Dynamic** via useSEO() in src/lib/seo.ts — overwrites the static tags when React mounts each page

To change any per-page SEO meta: edit the useSEO({...}) call at the top of the relevant page file in src/pages/.

---

## 7. Security Headers (vercel.json)

- HSTS (2 years, preload) ✅
- X-Frame-Options: SAMEORIGIN ✅
- X-Content-Type-Options: nosniff ✅
- Referrer-Policy: strict-origin-when-cross-origin ✅
- CSP enforcing (script, style, font, img, frame-src, worker-src) ✅
- Permissions-Policy: camera, microphone, geolocation denied ✅

---

## 8. Build & Lint Commands

`ash
npm run build         # Full build: check-treatment-links + check-colors + tsc + vite build
npm run lint          # oxlint
npm run check:secrets # Secret scanning (run before every commit)
npm run dev           # Local dev server (http://localhost:5173)
`

---

## 9. Before Launch Checklist

- [ ] All items in CLIENT_CONFIRMATIONS.md reviewed and responded to
- [ ] Dr. Jose Olive A. bio and confirmed qualifications added
- [ ] Real clinic photos supplied and replaced in public/ directory
- [ ] Domain DNS pointed to Vercel
- [ ] Google Search Console domain ownership verified
- [ ] Google Business Profile updated to link to marshaligndentalcare.in
- [ ] WhatsApp number confirmed (+91 90256 55627)
- [ ] Opening hours confirmed
- [ ] npm run build passes (exit 0)
- [ ] npm run check:secrets passes (no secrets in code)

---

## 10. Files Created by This Audit

| File | Purpose |
|---|---|
| CLIENT_CONFIRMATIONS.md | 10 items needing doctor/owner confirmation |
| HANDOVER.md | This file — deployment and maintenance guide |
| HANDOVER_PROGRESS.md | Audit findings log (all phases) |
| src/config.ts | Updated with SITE_URL — single source of truth |
| src/data/clinic.ts | Supplementary clinic data module |

---

*Handover prepared by Antigravity AI. Reviewed by: [PENDING]*
