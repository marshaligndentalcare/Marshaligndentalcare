#!/usr/bin/env node
/**
 * Marshalign Dental Care — Secret & Credential Pre-Commit / CI Scanner
 *
 * Scans source files and configuration files for sensitive credentials.
 * Masks all findings so secret values are never exposed in logs or terminal output.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const SECRET_PATTERNS = [
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/g },
  { name: 'GitHub Personal Access Token', regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}|github_pat_[A-Za-z0-9_]{82}/g },
  { name: 'OpenAI Secret Key', regex: /sk-[A-Za-z0-9]{20,}/g },
  { name: 'AWS Access Key ID', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g },
  { name: 'Stripe Secret Key', regex: /sk_(?:live|test)_[0-9a-zA-Z]{24,}/g },
  { name: 'Slack Bot/User Token', regex: /xox[baprs]-[0-9a-zA-Z]{10,}/g },
  { name: 'Private Key Block', regex: /-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----/g },
  { name: 'Database Connection URI with Password', regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/[^:\s"']+:[^@\s"']+@[^\s"'<>]+/gi },
  { name: 'Hardcoded Secret / Password Assignment', regex: /(?:secret_key|api_secret|password|private_key)\s*[:=]\s*["']([^"'\s]{8,})["']/gi },
];

function redact(val) {
  if (!val || val.length < 8) return '[REDACTED]';
  return val.slice(0, 3) + '***' + val.slice(-3);
}

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'dist-ssr', 'build', 'scratch']);
const SCANNABLE_EXTS = new Set([
  '.js', '.cjs', '.mjs', '.ts', '.tsx', '.html', '.css', '.json',
  '.env', '.yaml', '.yml', '.sh', '.ps1', '.bash'
]);

let findingsCount = 0;

function scanContent(filePath, content) {
  const relPath = path.relative(ROOT_DIR, filePath);
  for (const rule of SECRET_PATTERNS) {
    const regex = new RegExp(rule.regex);
    let match;
    while ((match = regex.exec(content)) !== null) {
      const matchVal = match[1] || match[0];
      // Skip placeholders and CSS variables
      if (
        matchVal.includes('your_') ||
        matchVal.includes('placeholder') ||
        matchVal.includes('example') ||
        matchVal.includes('var(--')
      ) {
        continue;
      }
      findingsCount++;
      console.error(`[VIOLATION] ${rule.name} detected in: ${relPath}`);
      console.error(`            Fingerprint: ${redact(matchVal)} (${matchVal.length} chars)`);
    }
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Only scan source code and config files, not markdown documentation
      if (!SCANNABLE_EXTS.has(ext) && !entry.name.startsWith('.env')) continue;
      // Skip example templates
      if (entry.name.endsWith('.example')) continue;
      try {
        const text = fs.readFileSync(fullPath, 'utf8');
        scanContent(fullPath, text);
      } catch {
        // Binary or unreadable
      }
    }
  }
}

console.log('🔒 Running Marshalign Dental Care Secret & Credential Guardrail Check...');
scanDir(ROOT_DIR);

if (findingsCount > 0) {
  console.error(`\n❌ FAILED: ${findingsCount} potential secret(s) detected!`);
  console.error('Do not commit credentials to Git. Use .env.local and environment variables.');
  process.exit(1);
} else {
  console.log('✅ PASSED: No secrets or credentials found in tracked source files.');
  process.exit(0);
}
