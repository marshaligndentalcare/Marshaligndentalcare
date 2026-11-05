/**
 * scripts/process-doctor-photos.mjs
 *
 * Processes doctor portrait photos from gallery-originals/team/ into
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
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');

// ── Doctor configuration ──────────────────────────────────────────────────────

const DOCTORS = [
  {
    slug:     'dr-marshal-antony',
    input:    'dr-marshal-antony.jpeg',
    // centre crop for headshot with good framing
    cropPos3x4: 'centre',
    cropPosAvatar: 'centre',
  },
  {
    slug:     'dr-jose-olive',
    input:    'dr-jose-olive.jpeg',
    cropPos3x4: 'centre',
    cropPosAvatar: 'centre',
  },
  {
    slug:     'dr-meenakshi',
    input:    'dr-meenakshi.jpeg',
    // top crop to remove headroom (bias upward in physical photo)
    cropPos3x4: 'top',
    cropPosAvatar: 'top',
  },
  {
    slug:     'dr-j-sowmiya',
    input:    'dr-j-sowmiya.jpeg',
    cropPos3x4: 'top',
    cropPosAvatar: 'top',
  },
];

// ── Main pipeline ─────────────────────────────────────────────────────────────

for (const doc of DOCTORS) {
  const inputPath = join(ROOT, 'gallery-originals', 'team', doc.input);
  const outDir    = join(ROOT, 'public', 'doctors', doc.slug);

  mkdirSync(outDir, { recursive: true });

  console.log(`\nProcessing: ${doc.slug}`);

  // Read original into buffer once to avoid EBUSY on Windows
  const original = readFileSync(inputPath);

  // ── 900×1200 (3:4) ────────────────────────────────────────────────────────
  const buf900 = await sharp(original)
    .resize(900, 1200, { fit: 'cover', position: doc.cropPos3x4 })
    .webp({ quality: 85 })
    .toBuffer();
  writeFileSync(join(outDir, `${doc.slug}-900.webp`), buf900);
  console.log(`  ✓ ${doc.slug}-900.webp  (${(buf900.length / 1024).toFixed(1)} KB)`);

  // ── 450×600 (3:4) ─────────────────────────────────────────────────────────
  const buf450 = await sharp(original)
    .resize(450, 600, { fit: 'cover', position: doc.cropPos3x4 })
    .webp({ quality: 82 })
    .toBuffer();
  writeFileSync(join(outDir, `${doc.slug}-450.webp`), buf450);
  console.log(`  ✓ ${doc.slug}-450.webp  (${(buf450.length / 1024).toFixed(1)} KB)`);

  // ── 320×320 avatar (square) ───────────────────────────────────────────────
  const bufAvatar = await sharp(original)
    .resize(320, 320, { fit: 'cover', position: doc.cropPosAvatar })
    .webp({ quality: 82 })
    .toBuffer();
  writeFileSync(join(outDir, `${doc.slug}-avatar.webp`), bufAvatar);
  console.log(`  ✓ ${doc.slug}-avatar.webp  (${(bufAvatar.length / 1024).toFixed(1)} KB)`);

  // ── 24×32 blur placeholder ────────────────────────────────────────────────
  const bufPlaceholder = await sharp(original)
    .resize(24, 32, { fit: 'cover' })
    .blur(20)
    .webp({ quality: 50 })
    .toBuffer();
  writeFileSync(join(outDir, `${doc.slug}-placeholder.webp`), bufPlaceholder);
  console.log(`  ✓ ${doc.slug}-placeholder.webp  (${(bufPlaceholder.length / 1024).toFixed(1)} KB)`);
}

console.log('\n✅ All doctor photos processed successfully.\n');
