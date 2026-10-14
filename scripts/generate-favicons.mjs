/**
 * One-off favicon generation script using sharp.
 * Run with: node scripts/generate-favicons.mjs
 * NOT shipped in the bundle.
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SRC = path.join(PUBLIC, 'logo.png');

// 15% padding on each side so the logo breathes at small sizes
const PADDING_FACTOR = 0.12;

async function makeIcon(size, outFile, addPad = true) {
  const pad = addPad ? Math.round(size * PADDING_FACTOR) : 0;
  const inner = size - pad * 2;
  const buf = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: buf, top: pad, left: pad }])
    .png()
    .toFile(outFile);

  console.log(`  ✓ ${path.basename(outFile)} (${size}x${size})`);
}

console.log('\n── Generating favicon assets ──');

// icon-512.png — largest; used for manifest and PWA splash
await makeIcon(512, path.join(PUBLIC, 'icon-512.png'));

// icon-192.png — manifest standard
await makeIcon(192, path.join(PUBLIC, 'icon-192.png'));

// apple-touch-icon.png — 180x180, iOS home screen
await makeIcon(180, path.join(PUBLIC, 'apple-touch-icon.png'));

// favicon.ico — 32x32 embedded as PNG inside ICO
// sharp writes PNG by default at this path; browsers accept PNG-in-ICO
await makeIcon(32, path.join(PUBLIC, 'favicon.ico'), true);

console.log('\n✅ Favicon assets generated successfully.\n');
