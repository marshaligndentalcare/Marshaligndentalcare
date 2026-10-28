/**
 * Favicon generation script using sharp.
 * Run with: node scripts/generate-favicons.mjs
 * Generates all favicon variants directly from the official /public/logo.png
 */
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SRC = path.join(PUBLIC, 'logo.png');

async function makeIcon(size, outFile, padRatio = 0.02) {
  const pad = Math.round(size * padRatio);
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

async function makeSvgFavicon(outFile) {
  // 256x256 crisp PNG embedded into SVG so SVG favicon renderers get the exact official logo
  const buf = await sharp(SRC)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const b64 = buf.toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 256" width="256" height="256">
  <image width="256" height="256" href="data:image/png;base64,${b64}" xlink:href="data:image/png;base64,${b64}"/>
</svg>
`;
  fs.writeFileSync(outFile, svg, 'utf8');
  console.log(`  ✓ ${path.basename(outFile)} (SVG with embedded official logo)`);
}

console.log('\n── Generating official logo favicon assets ──');

// Large sizes for PWA / manifest
await makeIcon(512, path.join(PUBLIC, 'icon-512.png'), 0.04);
await makeIcon(192, path.join(PUBLIC, 'icon-192.png'), 0.04);

// Apple touch icon (180x180)
await makeIcon(180, path.join(PUBLIC, 'apple-touch-icon.png'), 0.04);

// Standard browser tab sizes (minimal padding so it is crisp and clear at 16/32px)
await makeIcon(32, path.join(PUBLIC, 'favicon-32x32.png'), 0);
await makeIcon(16, path.join(PUBLIC, 'favicon-16x16.png'), 0);

// favicon.ico (32x32)
await makeIcon(32, path.join(PUBLIC, 'favicon.ico'), 0);

// favicon.svg
await makeSvgFavicon(path.join(PUBLIC, 'favicon.svg'));

console.log('\n✅ All official logo favicon assets generated successfully.\n');
