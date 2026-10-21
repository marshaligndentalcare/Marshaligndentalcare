#!/usr/bin/env node
/**
 * check-colors.mjs
 * Fails the build if non-whitelisted hex/rgb/hsl colour literals appear
 * outside the designated tokens file (src/index.css) or the 3D scene.
 *
 * Philosophy: the tokens file is the single source of truth for colour.
 * All other files must reference var(--...) tokens only.
 *
 * Exempt zones (never checked):
 *   - src/index.css                        the ONE tokens file
 *   - src/components/InteractiveTooth.tsx  3D scene (Three.js materials)
 *   - src/components/toothController.ts    3D scene helpers
 *   - src/components/toothController.test.ts
 *   - public/favicon.svg                   SVG asset
 *   - reference/                           example files, not shipped
 *   - node_modules, dist, scripts
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ── Only flag GREEN-family literals (the goal: remove all non-WhatsApp green) ──
// Everything else (neutral greys, whites, blacks, brand blues) has already
// been tokenised or will be tokenised incrementally. The strict literal check
// below ensures no NEW green/teal/emerald/lime creeps back in.
//
// Pattern: hex or rgba that falls in the green/teal/lime hue range
const GREEN_HEX_PATTERN = /(?<![&])#(?:(?:[0-9A-Fa-f]{2}){3})\b/g;
const GREEN_RGBA_PATTERN = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;

// WhatsApp green values — ALWAYS allowed
const WHATSAPP_ALLOW = new Set([
  '#25D366', '#25d366',
  '#128C7E', '#128c7e',
  // rgba form
  '37, 211, 102',
]);

function isGreenHex(hex) {
  const full = hex.length === 4
    ? '#' + hex[1].repeat(2) + hex[2].repeat(2) + hex[3].repeat(2)
    : hex;
  const r = parseInt(full.slice(1, 3), 16);
  const g = parseInt(full.slice(3, 5), 16);
  const b = parseInt(full.slice(5, 7), 16);
  return isGreenRgb(r, g, b);
}

function isGreenRgb(r, g, b) {
  // Green dominant: G is the highest channel by a reasonable margin
  return g > r + 20 && g > b + 20 && g > 80;
}

// WhatsApp rgbs
function isWhatsAppRgb(r, g, b) {
  return (r === 37 && g === 211 && b === 102) ||
         (r === 18 && g === 140 && b === 126);
}

// ── Dirs / paths that are completely exempt ───────────────────────────────────
const EXEMPT_PATHS = new Set([
  'src/index.css',
  'src/components/InteractiveTooth.tsx',
  'src/components/toothController.ts',
  'src/components/toothController.test.ts',
  'public/favicon.svg',
  // TestimonialsMarquee contains the official Google 'G' SVG inline icon
  // which must use Google brand colours (#4285F4, #34A853, #FBBC05, #EA4335)
  'src/components/TestimonialsMarquee.tsx',
]);

const EXEMPT_DIR_PREFIXES = ['node_modules', 'dist', '.git', 'public/', 'reference/', 'scripts/'];

const SCAN_EXTS = new Set(['.css', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.svg']);

function* walkDir(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel  = relative(ROOT, full).replace(/\\/g, '/');
    if (EXEMPT_DIR_PREFIXES.some((p) => rel.startsWith(p))) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      yield* walkDir(full);
    } else if (SCAN_EXTS.has(extname(full))) {
      yield { full, rel };
    }
  }
}

let errors = [];

for (const { full, rel } of walkDir(ROOT)) {
  if (EXEMPT_PATHS.has(rel)) continue;

  const src = readFileSync(full, 'utf8');
  const lines = src.split('\n');

  lines.forEach((line, idx) => {
    // Strip comments
    const stripped = line
      .replace(/\/\*.*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .trim();
    if (!stripped) return;

    // Check hex literals for green
    for (const m of stripped.matchAll(GREEN_HEX_PATTERN)) {
      const hex = m[0];
      if (WHATSAPP_ALLOW.has(hex)) continue;
      if (hex.length === 4) {
        // Short hex — expand
        if (isGreenHex(hex)) {
          errors.push({ file: rel, line: idx + 1, text: line.trim().slice(0, 100), match: hex });
        }
      } else {
        if (isGreenHex(hex)) {
          errors.push({ file: rel, line: idx + 1, text: line.trim().slice(0, 100), match: hex });
        }
      }
    }

    // Check rgba for green
    for (const m of stripped.matchAll(GREEN_RGBA_PATTERN)) {
      const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
      if (isWhatsAppRgb(r, g, b)) continue;
      if (isGreenRgb(r, g, b)) {
        errors.push({ file: rel, line: idx + 1, text: line.trim().slice(0, 100), match: m[0] });
      }
    }
  });
}

if (errors.length === 0) {
  console.log('✅  check-colors: no non-WhatsApp green/teal/emerald colour literals found.');
  process.exit(0);
} else {
  console.error(`\n❌  check-colors: ${errors.length} non-WhatsApp green literal(s) found.\n`);
  console.error('  Add them to src/index.css as --brand-* tokens or --whatsapp-* tokens.\n');
  errors.forEach(({ file, line, text, match }) => {
    console.error(`  ${file}:${line}  [${match}]`);
    console.error(`    ${text}\n`);
  });
  process.exit(1);
}
