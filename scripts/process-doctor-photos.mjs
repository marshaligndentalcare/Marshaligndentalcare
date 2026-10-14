/**
 * One-off image processing script for doctor photos.
 * Run with: node scripts/process-doctor-photos.mjs
 * NOT shipped in the bundle – devDependency only.
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

// Shared light-enhancement pipeline (no face retouching)
function enhance(pipeline) {
  return pipeline
    .normalise()                          // auto-contrast / levels
    .modulate({ saturation: 1.04 })       // slight saturation boost
    .linear(1.03, -(0.03 * 128))          // contrast x1.03
    .sharpen({ sigma: 1, m1: 0, m2: 3 }); // mild sharpening, radius ~1
}

async function processDoctor({ name, srcFile, resize, cropRect, avatarCrop }) {
  console.log(`\n── Processing ${name} ──`);

  const src = path.join(PUBLIC, srcFile);

  // Base pipeline: optional crop → resize to 900×1200 → enhance
  const base = () => {
    let p = sharp(src);
    if (cropRect) {
      p = p.extract({ left: cropRect.left, top: cropRect.top, width: cropRect.width, height: cropRect.height });
    }
    return enhance(p.resize(resize.w, resize.h, { fit: 'fill' }));
  };

  // 1. Full WebP 900×1200 q84
  await base()
    .webp({ quality: 84 })
    .toFile(path.join(PUBLIC, `${name}.webp`));
  console.log(`  ✓ ${name}.webp`);

  // 2. Progressive JPEG 900×1200 q88
  await base()
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile(path.join(PUBLIC, `${name}.jpg`));
  console.log(`  ✓ ${name}.jpg`);

  // 3. Half-res WebP 450×600
  await base()
    .resize(450, 600, { fit: 'fill' })
    .webp({ quality: 84 })
    .toFile(path.join(PUBLIC, `${name}-450.webp`));
  console.log(`  ✓ ${name}-450.webp`);

  // 4. Avatar 320×320 square – crop from ORIGINAL (before main crop/resize)
  const avatarPipeline = sharp(src)
    .extract({
      left: avatarCrop.left,
      top: avatarCrop.top,
      width: avatarCrop.width,
      height: avatarCrop.height,
    });
  await enhance(avatarPipeline)
    .resize(320, 320, { fit: 'fill' })
    .webp({ quality: 84 })
    .toFile(path.join(PUBLIC, `${name}-avatar.webp`));
  console.log(`  ✓ ${name}-avatar.webp`);
}

// ── Marshal Antony – full frame 1086×1448 → 900×1200 ──────────────────────
await processDoctor({
  name: 'dr-marshal-antony',
  srcFile: 'dr-marshal-antony.png',
  cropRect: null,                    // full frame
  resize: { w: 900, h: 1200 },
  avatarCrop: {                      // x=280..800, y=80..600 of original
    left: 280, top: 80, width: 520, height: 520,
  },
});

// ── Jose Olive – crop x=130..1070 (940w), full height 1254, → 900×1200 ────
await processDoctor({
  name: 'dr-jose-olive',
  srcFile: 'dr-jose-olive.png',
  cropRect: { left: 130, top: 0, width: 940, height: 1254 },
  resize: { w: 900, h: 1200 },
  avatarCrop: {                      // x=340..860, y=130..650 of original
    left: 340, top: 130, width: 520, height: 520,
  },
});

console.log('\n✅ All doctor photos processed successfully.\n');
