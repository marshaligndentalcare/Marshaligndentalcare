/**
 * scripts/process-doctor-photos.mjs
 *
 * Processes doctor portrait photos from gallery-originals/doctors/ into
 * optimised WebP variants under public/doctors/<slug>/.
 *
 * Usage: node scripts/process-doctor-photos.mjs
 *
 * Outputs per doctor:
 *   <slug>-900.webp       — 900×1200 (3:4) cover crop
 *   <slug>-450.webp       — 450×600  (3:4) cover crop
 *   <slug>-avatar.webp    — 320×320  square cover crop
 *   <slug>-placeholder.webp — 24×32  blurred placeholder
 *
 * All EXIF is stripped (sharp default). No .withMetadata() call.
 * Files are written synchronously to avoid EBUSY on Windows.
 *
 * Padding rule: if the source image has insufficient headroom for a 3:4 crop
 * (height / width < 4/3), pad the top with #FAF8F6 (--color-ivoire) before resizing.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Doctor configuration ──────────────────────────────────────────────────────

const DOCTORS = [
  {
    slug: 'dr-marshal-antony',
    input: 'dr-marshal-antony.jpeg',
    cropPos3x4: 'top',
    cropPosAvatar: 'top',
  },
  {
    slug: 'dr-jose-olive',
    input: 'dr-jose-olive.jpeg',
    cropPos3x4: 'top',
    cropPosAvatar: 'top',
  },
  {
    slug: 'dr-j-sowmiya',
    input: 'dr-j-sowmiya.jpeg',
    cropPos3x4: 'top',
    cropPosAvatar: 'top',
  },
  {
    slug: 'dr-meenakshi',
    input: 'dr-meenakshi.jpeg',
    cropPos3x4: 'top',
    cropPosAvatar: 'top',
  },
];

// Ivoire background colour (#FAF8F6)
const IVOIRE_BG = { r: 250, g: 248, b: 246, alpha: 1 };

// ── Main pipeline ─────────────────────────────────────────────────────────────

for (const doc of DOCTORS) {
  const inputPath = join(ROOT, 'gallery-originals', 'team', doc.input);
  const outDir = join(ROOT, 'public', 'doctors', doc.slug);

  mkdirSync(outDir, { recursive: true });

  console.log(`\nProcessing: ${doc.slug}`);

  // Read original into buffer once to avoid EBUSY on Windows
  const original = readFileSync(inputPath);

  // ── Check dimensions and apply padding if needed ──────────────────────────
  const meta = await sharp(original).metadata();
  const { width, height } = meta;
  console.log(`  Source dimensions: ${width}x${height} (ratio: ${(height / width).toFixed(3)})`);

  let processedBuffer = original;

  if (height / width < 4 / 3) {
    // Image is wider than 3:4 portrait — pad top with ivoire
    const targetHeight = Math.ceil(width * 4 / 3);
    const topPadding = targetHeight - height;
    console.log(`  WARNING: Insufficient headroom. Adding ${topPadding}px top padding to reach ${width}x${targetHeight}.`);

    processedBuffer = await sharp(original)
      .extend({
        top: topPadding,
        bottom: 0,
        left: 0,
        right: 0,
        background: IVOIRE_BG,
      })
      .toBuffer();
  } else {
    console.log(`  OK: Sufficient headroom -- no padding needed.`);
  }

  // ── 900×1200 (3:4) ────────────────────────────────────────────────────────
  const buf900 = await sharp(processedBuffer)
    .resize(900, 1200, { fit: 'cover', position: doc.cropPos3x4 })
    .webp({ quality: 85 })
    .toBuffer();
  writeFileSync(join(outDir, `${doc.slug}-900.webp`), buf900);
  console.log(`  OK ${doc.slug}-900.webp  (${(buf900.length / 1024).toFixed(1)} KB)`);

  // ── 450×600 (3:4) ─────────────────────────────────────────────────────────
  const buf450 = await sharp(processedBuffer)
    .resize(450, 600, { fit: 'cover', position: doc.cropPos3x4 })
    .webp({ quality: 82 })
    .toBuffer();
  writeFileSync(join(outDir, `${doc.slug}-450.webp`), buf450);
  console.log(`  OK ${doc.slug}-450.webp  (${(buf450.length / 1024).toFixed(1)} KB)`);

  // ── 320×320 avatar (square) ───────────────────────────────────────────────
  const bufAvatar = await sharp(processedBuffer)
    .resize(320, 320, { fit: 'cover', position: doc.cropPosAvatar })
    .webp({ quality: 82 })
    .toBuffer();
  writeFileSync(join(outDir, `${doc.slug}-avatar.webp`), bufAvatar);
  console.log(`  OK ${doc.slug}-avatar.webp  (${(bufAvatar.length / 1024).toFixed(1)} KB)`);

  // ── 24×32 blur placeholder ────────────────────────────────────────────────
  const bufPlaceholder = await sharp(processedBuffer)
    .resize(24, 32, { fit: 'cover' })
    .blur(20)
    .webp({ quality: 50 })
    .toBuffer();
  writeFileSync(join(outDir, `${doc.slug}-placeholder.webp`), bufPlaceholder);
  console.log(`  OK ${doc.slug}-placeholder.webp  (${(bufPlaceholder.length / 1024).toFixed(1)} KB)`);
}

console.log('\nAll doctor photos processed successfully.\n');
