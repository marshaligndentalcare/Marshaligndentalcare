#!/usr/bin/env node
/**
 * scripts/build-gallery.mjs
 * npm run gallery
 *
 * Reads gallery-originals/<category>/<NNN-slug>.(jpg|jpeg|png|webp|gif|mp4|mov|webm)
 * Optionally reads gallery-originals/meta.json for captions, alt, focus, featured.
 *
 * Outputs:
 *   public/gallery/                   — optimised images (WebP @ 480/960/1600) and videos (H.264 720p)
 *   src/data/gallery.generated.json   — manifest consumed by the React gallery
 *
 * Design:
 *  - Images  : sharp → WebP variants at 480 / 960 / 1600 px wide
 *  - Videos  : ffmpeg (optional) → poster.jpg + 720p H.264 MP4
 *              If no ffmpeg: look for a same-name .jpg/.webp in the same folder as poster
 *              If neither: emit a styled placeholder entry + print a clear warning
 *  - Skips unreadable/broken files instead of crashing
 *  - Vercel build does NOT need ffmpeg (video assets should be committed pre-built)
 */

import { readdir, readFile, writeFile, mkdir, copyFile, stat } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join, extname, basename, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');
const SRC        = join(ROOT, 'gallery-originals');
const OUT_IMG    = join(ROOT, 'public', 'gallery');
const MANIFEST   = join(ROOT, 'src', 'data', 'gallery.generated.json');

const IMAGE_WIDTHS  = [480, 960, 1600];
const VIDEO_EXTS    = new Set(['.mp4', '.mov', '.webm', '.mkv']);
const IMAGE_EXTS    = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

// ── Helpers ──────────────────────────────────────────────────────────────────

function titleCase(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/\band\b/gi, '&')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugFromFilename(name) {
  // "001-reception.jpg" → "001-reception"
  return basename(name, extname(name));
}

function captionFromSlug(slug) {
  // "001-reception" → "Reception"
  return titleCase(slug.replace(/^\d+-/, ''));
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

function ffmpegAvailable() {
  const r = spawnSync('ffmpeg', ['-version'], { stdio: 'pipe' });
  return r.status === 0;
}

// ── Sharp image processing ────────────────────────────────────────────────────

async function processImage(src, outDir, slug, meta = {}) {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('  ✗  sharp not available — install it with: npm install sharp');
    return null;
  }

  await ensureDir(outDir);

  let img;
  try {
    img = sharp(src);
  } catch (err) {
    console.warn(`  ⚠  Could not read image ${src}: ${err.message} — skipping`);
    return null;
  }

  const metadata = await img.metadata();
  const { width: origW, height: origH } = metadata;

  const srcset = [];

  for (const w of IMAGE_WIDTHS) {
    if (w > origW * 1.5) continue; // don't upscale beyond 150% of original
    const outName = `${slug}-${w}.webp`;
    const outPath = join(outDir, outName);
    try {
      await img
        .clone()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(outPath);
      const outH = Math.round((origH / origW) * w);
      srcset.push({ w, url: `/gallery/${outName}`, width: w, height: outH });
    } catch (err) {
      console.warn(`  ⚠  Could not write ${outName}: ${err.message}`);
    }
  }

  if (srcset.length === 0) {
    // Fallback: just copy original as a single WebP
    const outName = `${slug}.webp`;
    const outPath = join(outDir, outName);
    try {
      await img.webp({ quality: 82 }).toFile(outPath);
      srcset.push({ w: origW, url: `/gallery/${outName}`, width: origW, height: origH });
    } catch (err) {
      console.warn(`  ⚠  Fallback also failed for ${src}: ${err.message} — skipping`);
      return null;
    }
  }

  const largest = srcset[srcset.length - 1];
  return {
    src:    largest.url,
    srcset: srcset.map((s) => `${s.url} ${s.w}w`).join(', '),
    sizes:  '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px',
    width:  largest.width,
    height: largest.height,
  };
}

// ── Video processing ──────────────────────────────────────────────────────────

async function processVideo(src, outDir, slug, meta = {}) {
  await ensureDir(outDir);

  const hasFfmpeg = ffmpegAvailable();
  const outMp4    = join(outDir, `${slug}.mp4`);
  const outPoster = join(outDir, `${slug}-poster.jpg`);

  // ── Poster ──
  let posterUrl = null;
  const srcDir  = dirname(src);
  const srcBase = basename(src, extname(src));

  if (hasFfmpeg) {
    try {
      execSync(
        `ffmpeg -y -i "${src}" -ss 00:00:01 -vframes 1 -vf scale=960:-1 "${outPoster}" 2>/dev/null`,
        { stdio: 'pipe' }
      );
      posterUrl = `/gallery/${slug}-poster.jpg`;
    } catch {
      console.warn(`  ⚠  ffmpeg poster extraction failed for ${src}`);
    }
  }

  if (!posterUrl) {
    // Look for same-name jpg/webp in originals folder
    for (const ext of ['.jpg', '.jpeg', '.webp', '.png']) {
      const candidate = join(srcDir, `${srcBase}${ext}`);
      if (existsSync(candidate)) {
        await copyFile(candidate, outPoster);
        posterUrl = `/gallery/${slug}-poster.jpg`;
        break;
      }
    }
  }

  if (!posterUrl) {
    console.warn(`  ⚠  No poster for video ${src} — will use placeholder in UI`);
  }

  // ── Video MP4 ──
  let videoUrl = null;
  let duration  = null;

  if (hasFfmpeg) {
    try {
      execSync(
        `ffmpeg -y -i "${src}" -vcodec libx264 -acodec aac -vf "scale='min(1280,iw)':-2" -crf 23 -preset fast -movflags +faststart "${outMp4}" 2>/dev/null`,
        { stdio: 'pipe' }
      );
      videoUrl = `/gallery/${slug}.mp4`;

      // Get duration
      try {
        const probe = execSync(
          `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${src}"`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        duration = Math.round(parseFloat(probe.trim()));
      } catch { /* ignore */ }
    } catch (err) {
      console.warn(`  ⚠  ffmpeg encode failed for ${src}: ${err.message}`);
    }
  }

  if (!videoUrl) {
    // If src is already an MP4, just copy it
    if (extname(src).toLowerCase() === '.mp4') {
      try {
        await copyFile(src, outMp4);
        videoUrl = `/gallery/${slug}.mp4`;
        console.log(`  →  Copied MP4 directly (no ffmpeg): ${slug}`);
      } catch (err) {
        console.warn(`  ⚠  Could not copy ${src}: ${err.message} — skipping`);
        return null;
      }
    } else {
      console.warn(`  ✗  No video output for ${src} — skipping`);
      return null;
    }
  }

  return {
    src:      videoUrl,
    poster:   posterUrl,
    duration: duration,
    width:    1280,
    height:   720,
  };
}

// ── Category scanner ──────────────────────────────────────────────────────────

async function scanCategory(catDir, catSlug, meta, categoryLabels) {
  let files;
  try {
    files = await readdir(catDir);
  } catch {
    return [];
  }

  // Sort by numeric prefix, filter out hidden / meta files
  const mediaFiles = files
    .filter((f) => {
      const ext = extname(f).toLowerCase();
      return (IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext)) && !f.startsWith('.');
    })
    .sort();

  const items = [];

  for (const file of mediaFiles) {
    const filePath = join(catDir, file);
    const slug     = slugFromFilename(file);
    const metaKey  = `${catSlug}/${slug}`;
    const fileMeta = meta.items?.[metaKey] ?? {};

    const ext     = extname(file).toLowerCase();
    const isVideo = VIDEO_EXTS.has(ext);

    const outDir  = join(OUT_IMG);
    const outSlug = `${catSlug}-${slug}`;

    console.log(`  Processing: ${catSlug}/${file}`);

    let result;
    if (isVideo) {
      result = await processVideo(filePath, outDir, outSlug, fileMeta);
      if (!result) continue;
      items.push({
        id:       outSlug,
        type:     'video',
        category: catSlug,
        caption:  fileMeta.caption ?? captionFromSlug(slug),
        alt:      fileMeta.alt     ?? captionFromSlug(slug),
        src:      result.src,
        poster:   result.poster,
        duration: result.duration,
        width:    result.width,
        height:   result.height,
        focus:    fileMeta.focus   ?? '50% 50%',
        featured: fileMeta.featured ?? false,
      });
    } else {
      result = await processImage(filePath, outDir, outSlug, fileMeta);
      if (!result) continue;
      items.push({
        id:       outSlug,
        type:     'image',
        category: catSlug,
        caption:  fileMeta.caption ?? captionFromSlug(slug),
        alt:      fileMeta.alt     ?? captionFromSlug(slug),
        src:      result.src,
        srcset:   result.srcset,
        sizes:    result.sizes,
        width:    result.width,
        height:   result.height,
        focus:    fileMeta.focus   ?? '50% 50%',
        featured: fileMeta.featured ?? false,
      });
    }
  }

  return items;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  build-gallery.mjs — Marshalign Dental Care');
  console.log('═══════════════════════════════════════════════════\n');

  if (!existsSync(SRC)) {
    console.error(`✗  gallery-originals/ not found at ${SRC}`);
    console.error('   Create it and add category subfolders with images/videos.');
    process.exit(1);
  }

  // Load meta
  let meta = { items: {}, categoryLabels: {} };
  const metaPath = join(SRC, 'meta.json');
  if (existsSync(metaPath)) {
    try {
      meta = JSON.parse(await readFile(metaPath, 'utf8'));
      console.log('  ✓  Loaded meta.json\n');
    } catch (err) {
      console.warn(`  ⚠  Could not parse meta.json: ${err.message}\n`);
    }
  }

  await ensureDir(OUT_IMG);

  // Scan categories (top-level dirs in gallery-originals)
  const entries   = await readdir(SRC, { withFileTypes: true });
  const catDirs   = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  const allItems  = [];
  const categories = [];

  for (const catSlug of catDirs) {
    const catDir   = join(SRC, catSlug);
    const catLabel = meta.categoryLabels?.[catSlug] ?? titleCase(catSlug);
    console.log(`\n── Category: ${catLabel} (${catSlug}/) ──`);
    const items = await scanCategory(catDir, catSlug, meta, meta.categoryLabels ?? {});
    allItems.push(...items);
    if (items.length > 0) {
      categories.push({ slug: catSlug, label: catLabel, count: items.length });
    }
  }

  // Write manifest
  const manifest = { categories, items: allItems };
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`\n\n═══════════════════════════════════════════════════`);
  console.log(`✅  Gallery build complete`);
  console.log(`    Items   : ${allItems.length}`);
  console.log(`    Categories: ${categories.map((c) => `${c.label} (${c.count})`).join(', ')}`);
  console.log(`    Manifest: src/data/gallery.generated.json`);
  console.log(`    Assets  : public/gallery/`);
  console.log(`═══════════════════════════════════════════════════\n`);
}

main().catch((err) => {
  console.error('\n✗  build-gallery.mjs failed:', err);
  process.exit(1);
});
