# Marshalign Dental Care — AI Agent & Developer Security Guardrails

This document establishes the mandatory security policies, conventions, and engineering guardrails that must be strictly followed during all development, maintenance, and AI-assisted workflows in this project.

---

## 1. Secrets, Credentials & Token Management

1. **Zero Hardcoded Secrets Policy:** Never hardcode real API keys, tokens, passwords, private keys, database connection strings, or confidential credentials into source code, documentation, scripts, or commit messages.
2. **Environment File Isolation:** Never commit `.env`, `.env.*`, or local environment files containing real secrets to Git. Maintain only `.env.example` with non-sensitive placeholders in source control.
3. **Frontend Exposure Boundary:** Never expose confidential server-side secrets through browser code or Vite environment variables. Remember that any variable prefixed with `VITE_` is baked into client-side JavaScript bundles and is publicly accessible to any visitor.
4. **Secret Management:** Use environment variables and platform secret managers (e.g., Vercel / Netlify / Cloudflare environment variables) for production configurations.
5. **Masking & Redaction:** Never print full secrets, tokens, or private credentials in logs, test output, audit reports, or chat interfaces. Always redact sensitive values (e.g., `sk-***...1234`).
6. **Revocation & Rotation:** If a credential is ever suspected or confirmed to have been exposed, immediately report it, revoke/rotate the key through the provider dashboard, and replace it in the deployment secret manager. Deleting code from Git does not invalidate an active key.

---

## 2. Source Control & Git Hygiene

1. **Gitignore Alignment:** Maintain and adhere to `.gitignore` protection rules. Ensure all `.env*` files, private keys (`*.pem`, `*.key`), certificates (`*.crt`), and credential caches are strictly ignored.
2. **Pre-Commit Secret Scanning:** Always execute `npm run check:secrets` before staging or committing changes to verify that no credentials or private tokens are accidentally included.
3. **Investigate Before Committing:** Investigate any flagged string or suspected secret instead of blindly bypassing checks or deleting legitimate configuration without understanding its purpose.
4. **No Unapproved History Rewrites:** Never perform destructive Git operations (`git filter-branch`, force-pushes, branch deletions) without explicit plan explanation and authorization.

---

## 3. Application Security & Coding Standards

1. **Input Validation & Encoding:** Validate all user inputs and query parameters. Apply contextual output encoding when rendering content to prevent Cross-Site Scripting (XSS).
2. **No Unsafe DOM Injection:** Never use `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, or `eval()`. Use React's declarative JSX rendering which automatically escapes untrusted text.
3. **Secure External Links:** Every external hyperlink with `target="_blank"` must include `rel="noopener noreferrer"` to eliminate reverse tabnabbing and window hijacking risks.
4. **Safe URL Handling:** Ensure all dynamic redirects or external links (e.g., WhatsApp `wa.me`, Google Maps) use `encodeURIComponent()` and enforce strict HTTPS schemes.
5. **Rules of Hooks:** Adhere strictly to React Rules of Hooks. Hooks (including custom hooks like `useSEO`) must be invoked unconditionally at the top level of component functions.

---

## 4. Dependencies & Supply Chain Integrity

1. **Dependency Hygiene:** Avoid adding unnecessary dependencies. Use established, well-maintained libraries.
2. **Vulnerability Auditing:** Run `npm audit` and `npm run lint` during meaningful package or architectural updates to ensure 0 critical/high vulnerabilities exist.
3. **Lockfile Consistency:** Keep `package-lock.json` committed and synchronized with `package.json`.

---

## 5. Testing & Verification Integrity

1. **Build Validation:** Run `npm run build` (`tsc -b && vite build`) and `npm run lint` (`oxlint`) after security-sensitive changes to verify clean compilation.
2. **Honest Reporting:** Do not claim that a security control is implemented, tested, or verified unless verified with concrete evidence (e.g., terminal output, test results).
3. **Document Assumptions:** Document any unverified production settings (e.g., DNS, CDN HTTP headers, Google Search Console) clearly as `NOT VERIFIED` or `ACTION REQUIRED`.
