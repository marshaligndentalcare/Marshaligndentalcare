/**
 * DriftingGallery.tsx
 * Two-row auto-drifting strip below the coverflow stage.
 *
 * Row 0: drifts right-to-left (drift-rtl)
 * Row 1: drifts left-to-right (drift-ltr)
 * • 45-60 s seamless loop via CSS @keyframes on the track.
 * • Each tile floats gently (8 px, 5-8 s, ease-in-out, staggered).
 * • Tile height fixed per row (~220 px desktop / 160 px mobile).
 * • Tile width follows real aspect ratio, clamped 0.7–1.6.
 * • Up to 20 items per row from the current filter; looped if too few.
 * • Looped duplicates are aria-hidden + tabIndex=-1.
 * • Soft edge fade via mask-image.
 * • Hover/focus pauses the whole row. Tile lifts on hover.
 * • Click / Enter → opens lightbox at that item's index in filteredItems.
 * • Video tiles: show poster + play badge; no autoplay.
 * • IntersectionObserver: pause animations when off-screen.
 * • document visibilitychange: pause when tab hidden.
 * • prefers-reduced-motion: no drift / float; rows become scroll-snap strips.
 */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Play } from 'lucide-react';
import type { GalleryItem, GalleryVideoItem } from '../../data/galleryTypes';
import { isPortrait } from '../../data/galleryTypes';
import styles from './DriftingGallery.module.css';

const TILE_H_DESKTOP = 220; // px
const TILE_H_MOBILE  = 160; // px
const MAX_PER_ROW    = 20;
const MIN_ITEMS_TO_SHOW = 4; // hide section when total < 4
const MIN_FILL_ITEMS = 6;    // minimum copies to guarantee off-screen fill

interface Props {
  items: GalleryItem[];           // current filtered items
  onOpenLightbox: (filteredIndex: number) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Clamp aspect ratio 0.7–1.6 */
function clampAspect(item: GalleryItem): number {
  if (!item.width || !item.height) return 1;
  return Math.min(1.6, Math.max(0.7, item.width / item.height));
}

/**
 * Build the looped tile list for one row.
 * Returns pairs of { item, originalIndex } (index into filteredItems).
 * Duplicates are marked duplicate=true → aria-hidden.
 */
function buildRowTiles(
  items: GalleryItem[],
  rowIndex: 0 | 1,
  tileH: number,
): { item: GalleryItem; filteredIndex: number; duplicate: boolean; tileWidth: number; floatDelay: number }[] {
  // Split alternately: even indices → row 0, odd → row 1
  const rowItems: { item: GalleryItem; filteredIndex: number }[] = [];
  items.forEach((item, idx) => {
    if (idx % 2 === rowIndex) rowItems.push({ item, filteredIndex: idx });
  });

  // Cap at MAX_PER_ROW
  const capped = rowItems.slice(0, MAX_PER_ROW);

  // Build base tile list
  const base = capped.map(({ item, filteredIndex }, slotIdx) => ({
    item,
    filteredIndex,
    duplicate: false,
    tileWidth: Math.round(clampAspect(item) * tileH),
    floatDelay: (slotIdx * 0.7) % 8,
  }));

  if (base.length === 0) return [];

  // Repeat until we have at least MIN_FILL_ITEMS real copies
  const needed = Math.max(MIN_FILL_ITEMS, Math.ceil(MIN_FILL_ITEMS / base.length) * base.length);
  const filled: typeof base = [];
  while (filled.length < needed) {
    base.forEach((t) => {
      filled.push({
        ...t,
        duplicate: filled.length >= base.length,
        floatDelay: ((filled.length * 0.7)) % 8,
      });
    });
  }

  // We need 2× copies so the seamless loop works: one visible, one offscreen
  const doubled: typeof base = [...filled, ...filled.map((t) => ({ ...t, duplicate: true }))];
  return doubled;
}

// ── Component ─────────────────────────────────────────────────────────────────

const DriftingGallery: React.FC<Props> = ({ items, onOpenLightbox }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const row0Ref    = useRef<HTMLDivElement>(null);
  const row1Ref    = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false); // tab hidden
  const [offscreen, setOffscreen] = useState(true);

  // ── Detect mobile tile height ──────────────────────────────────────────────
  const [tileH, setTileH] = useState(TILE_H_DESKTOP);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setTileH(e.matches ? TILE_H_MOBILE : TILE_H_DESKTOP);
    };
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // ── IntersectionObserver: pause when off-screen ────────────────────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0.01 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Pause when tab hidden ──────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // ── Apply animation-play-state to track elements ───────────────────────────
  useEffect(() => {
    const shouldPause = paused || offscreen;
    [row0Ref.current, row1Ref.current].forEach((rowEl) => {
      if (!rowEl) return;
      const track = rowEl.querySelector<HTMLElement>(`.${styles.track}`);
      if (track) track.style.animationPlayState = shouldPause ? 'paused' : '';
      // Also pause tile float animations
      const tiles = rowEl.querySelectorAll<HTMLElement>(`.${styles.tile}`);
      tiles.forEach((tile) => { tile.style.animationPlayState = shouldPause ? 'paused' : ''; });
    });
  }, [paused, offscreen]);

  // ── Row hover: pause row animations ───────────────────────────────────────
  const handleRowMouseEnter = useCallback((rowEl: HTMLDivElement | null) => {
    if (!rowEl) return;
    const track = rowEl.querySelector<HTMLElement>(`.${styles.track}`);
    if (track) track.style.animationPlayState = 'paused';
    const tiles = rowEl.querySelectorAll<HTMLElement>(`.${styles.tile}`);
    tiles.forEach((tile) => { tile.style.animationPlayState = 'paused'; });
  }, []);

  const handleRowMouseLeave = useCallback((rowEl: HTMLDivElement | null) => {
    if (!rowEl) return;
    if (paused || offscreen) return; // keep paused
    const track = rowEl.querySelector<HTMLElement>(`.${styles.track}`);
    if (track) track.style.animationPlayState = '';
    const tiles = rowEl.querySelectorAll<HTMLElement>(`.${styles.tile}`);
    tiles.forEach((tile) => { tile.style.animationPlayState = ''; });
  }, [paused, offscreen]);

  // ── Keyboard handler on tiles ──────────────────────────────────────────────
  const handleTileKey = useCallback(
    (e: React.KeyboardEvent, filteredIndex: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpenLightbox(filteredIndex);
      }
    },
    [onOpenLightbox],
  );

  // ── Build rows ─────────────────────────────────────────────────────────────
  const row0Tiles = buildRowTiles(items, 0, tileH);
  const row1Tiles = buildRowTiles(items, 1, tileH);

  // Hide if not enough items
  if (items.length < MIN_ITEMS_TO_SHOW) return null;

  const renderTile = (
    tile: ReturnType<typeof buildRowTiles>[0],
    key: string,
  ) => {
    const { item, filteredIndex, duplicate, tileWidth, floatDelay } = tile;
    const isVideo = item.type === 'video';
    const portrait = isPortrait(item);

    const tileStyle: React.CSSProperties = {
      width: tileWidth,
      flexShrink: 0,
      animationDelay: `${floatDelay}s`,
    };

    if (duplicate) {
      return (
        <div
          key={key}
          className={styles.tile}
          style={tileStyle}
          aria-hidden="true"
          tabIndex={-1}
        >
          {renderTileContent(item, isVideo, portrait, tileH)}
        </div>
      );
    }

    return (
      <div
        key={key}
        className={styles.tile}
        style={tileStyle}
        role="button"
        tabIndex={0}
        aria-label={`Open ${item.caption} in lightbox`}
        onClick={() => onOpenLightbox(filteredIndex)}
        onKeyDown={(e) => handleTileKey(e, filteredIndex)}
      >
        {renderTileContent(item, isVideo, portrait, tileH)}
      </div>
    );
  };

  return (
    <div
      ref={sectionRef}
      className={styles.driftSection}
      aria-label="Drifting gallery preview"
    >
      {/* ── Row 0: right-to-left ── */}
      <div
        ref={row0Ref}
        className={`${styles.row} ${styles.rowRtl}`}
        onMouseEnter={() => handleRowMouseEnter(row0Ref.current)}
        onMouseLeave={() => handleRowMouseLeave(row0Ref.current)}
        onFocus={() => handleRowMouseEnter(row0Ref.current)}
        onBlur={() => handleRowMouseLeave(row0Ref.current)}
        aria-label="Gallery row 1"
      >
        <div
          className={styles.track}
          style={{ height: tileH }}
        >
          {row0Tiles.map((tile, i) =>
            renderTile(tile, `r0-${tile.item.id}-${i}`),
          )}
        </div>
      </div>

      {/* ── Row 1: left-to-right ── */}
      <div
        ref={row1Ref}
        className={`${styles.row} ${styles.rowLtr}`}
        onMouseEnter={() => handleRowMouseEnter(row1Ref.current)}
        onMouseLeave={() => handleRowMouseLeave(row1Ref.current)}
        onFocus={() => handleRowMouseEnter(row1Ref.current)}
        onBlur={() => handleRowMouseLeave(row1Ref.current)}
        aria-label="Gallery row 2"
      >
        <div
          className={styles.track}
          style={{ height: tileH }}
        >
          {row1Tiles.map((tile, i) =>
            renderTile(tile, `r1-${tile.item.id}-${i}`),
          )}
        </div>
      </div>
    </div>
  );
};

// ── Tile content (shared) ─────────────────────────────────────────────────────

function renderTileContent(
  item: GalleryItem,
  isVideo: boolean,
  portrait: boolean,
  tileH: number,
) {
  const focusVar = { '--focus': item.focus ?? '50% 50%' } as React.CSSProperties;

  if (isVideo) {
    const vid = item as GalleryVideoItem;
    return (
      <div className={styles.tileInner} style={{ height: tileH, ...focusVar }}>
        {vid.poster ? (
          <img
            src={vid.poster}
            alt=""
            className={styles.tileImg}
            loading="lazy"
            decoding="async"
            width={vid.width}
            height={vid.height}
          />
        ) : (
          <div className={styles.tileNoPoster} style={{ height: tileH }}>
            <Play size={28} color="rgba(255,255,255,0.5)" aria-hidden="true" />
          </div>
        )}
        <span className={styles.playBadge} aria-hidden="true">
          <Play size={12} />
        </span>
      </div>
    );
  }

  if (portrait) {
    return (
      <div className={styles.tilePortrait} style={{ height: tileH, ...focusVar }}>
        {/* Blurred background — real image, not flat colour */}
        <img
          src={item.src}
          alt=""
          className={styles.tileBgBlur}
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
        <img
          src={item.type === 'image' && item.srcset ? undefined : item.src}
          srcSet={item.type === 'image' ? item.srcset : undefined}
          sizes="480px"
          alt=""
          className={styles.tileImgContain}
          loading="lazy"
          decoding="async"
          width={item.width}
          height={item.height}
        />
      </div>
    );
  }

  // Landscape
  return (
    <div className={styles.tileInner} style={{ height: tileH, ...focusVar }}>
      <img
        src={item.type === 'image' && item.srcset ? undefined : item.src}
        srcSet={item.type === 'image' ? item.srcset : undefined}
        sizes="480px"
        alt=""
        className={styles.tileImg}
        loading="lazy"
        decoding="async"
        width={item.width}
        height={item.height}
      />
    </div>
  );
}

export default DriftingGallery;
