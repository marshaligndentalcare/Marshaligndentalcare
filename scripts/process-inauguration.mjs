#!/usr/bin/env node
/**
 * scripts/process-inauguration.mjs
 * Processes the 2 clinic inauguration photos:
 *   1) inauguration-ribbon-cutting (PNG)
 *   2) inauguration-group (JPEG)
 *
 * Source: gallery-originals/events/inauguration/
 * Output: public/gallery/inauguration/
 *
 * Requirements:
 * - Output to public/gallery/inauguration/ as WebP at 1600w, 800w, 400w + a 24px blur placeholder.
 * - Strip ALL EXIF/GPS/device metadata. (In Sharp, omitting .withMetadata() strips all metadata).
 * - Keep original aspect ratio in files. Framing done with CSS object-position:
 *   ribbon ~ 50% 35%
 *   group  ~ 40% 30%
 */

import { mkdir, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');

const SRC_DIR = existsSync(join(ROOT, 'gallery-originals', 'events', 'inauguration'))
  ? join(ROOT, 'gallery-originals', 'events', 'inauguration')
  : join(ROOT, 'gallery-originals', 'inauguration');

const OUT_DIR = join(ROOT, 'public', 'gallery', 'inauguration');

const WIDTHS = [400, 800, 1600];
const PLACEHOLDER_W = 24;

const PHOTOS = [
  { file: 'inauguration-ribbon-cutting.png', slug: 'inauguration-ribbon-cutting' },
  { file: 'inauguration-group.jpeg',         slug: 'inauguration-group' },
];

async function run() {
  const { default: sharp } = await import('sharp');

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`\nProcessing inauguration photos from: ${SRC_DIR}`);
  console.log(`Destination: ${OUT_DIR}\n`);

  // Clean old files in OUT_DIR to ensure clean state
  const existingFiles = await readdir(OUT_DIR);
  for (const f of existingFiles) {
    await unlink(join(OUT_DIR, f));
  }

  for (const { file, slug } of PHOTOS) {
    const srcPath = join(SRC_DIR, file);
    console.log(`--- ${file} ---`);

    // Auto-orient based on EXIF before stripping, but do NOT call withMetadata()
    const base = sharp(srcPath).rotate();
    const rawMeta = await base.metadata();
    const origW = rawMeta.width;
    const origH = rawMeta.height;
    console.log(`  Original: ${origW}×${origH}`);

    // Output at each width: 400w, 800w, 1600w
    for (const w of WIDTHS) {
      if (w > origW * 1.5) {
        console.log(`  Skipping ${w}w (would upscale)`);
        continue;
      }
      const outName = `${slug}-${w}.webp`;
      const outPath = join(OUT_DIR, outName);
      
      // Do NOT call withMetadata() - this ensures Sharp strips all EXIF, GPS, device data
      await base.clone()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(outPath);

      const outMeta = await sharp(outPath).metadata();
      const hasExif = !!outMeta.exif;
      const outH = Math.round((origH / origW) * w);
      console.log(`  ✓ ${outName} (${w}×${outH}) [EXIF: ${hasExif ? 'PRESENT - ERROR' : 'STRIPPED'}]`);
      if (hasExif) throw new Error(`EXIF was not stripped from ${outName}`);
    }

    // 24px blur placeholder
    const placeholderName = `${slug}-placeholder.webp`;
    const placeholderPath = join(OUT_DIR, placeholderName);
    await base.clone()
      .resize({ width: PLACEHOLDER_W, withoutEnlargement: true })
      .blur(2)
      .webp({ quality: 40, effort: 2 })
      .toFile(placeholderPath);

    const plMeta = await sharp(placeholderPath).metadata();
    console.log(`  ✓ ${placeholderName} (${PLACEHOLDER_W}px blur) [EXIF: ${plMeta.exif ? 'PRESENT - ERROR' : 'STRIPPED'}]`);
    if (plMeta.exif) throw new Error(`EXIF was not stripped from ${placeholderName}`);
  }

  console.log('\n✅ All inauguration images generated with 0 EXIF/device metadata.\n');
}

run().catch((err) => {
  console.error('\n❌ process-inauguration.mjs failed:', err);
  process.exit(1);
});
