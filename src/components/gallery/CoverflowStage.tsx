/**
 * CoverflowStage.tsx
 * Coverflow carousel for gallery items.
 * - Active card large & centred; ±1 neighbour scaled/rotated/dimmed; ±2 farther
 * - Only active±3 cards rendered (windowing)
 * - Portrait images shown fully (contain) over blurred bg; landscape: cover+focus
 * - Video: active card may muted-autoplay if in viewport & not reduced-motion/save-data
 * - Swipe/drag, ArrowLeft/Right, prev/next buttons, progress bar, counter
 * - Click active card → opens lightbox; click side card → brings forward
 */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { GalleryItem, GalleryCategory } from '../../data/galleryTypes';
import { formatDuration, isPortrait } from '../../data/galleryTypes';
import styles from './CoverflowStage.module.css';

// Card position offsets (translateX %) relative to the stage centre
const OFFSETS: Record<number, number> = {
  0: 0,
  1: 55,
  2: 100,
  '-1': -55,
  '-2': -100,
};
// Scale per position slot
const SCALES: Record<number, number> = {
  0: 1,
  1: 0.82,
  2: 0.68,
  '-1': 0.82,
  '-2': 0.68,
};
// Y-rotation per position slot (degrees)
const ROTATIONS: Record<number, number> = {
  0: 0,
  1: 14,
  2: 18,
  '-1': -14,
  '-2': -18,
};

const WINDOW = 3; // render active ± WINDOW cards

interface Props {
  items: GalleryItem[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
  onOpenLightbox: (i: number) => void;
  /** The current chip filter label (used for aria label only) */
  categoryLabel?: string;
  /** Full category list — used to resolve each item's own category name */
  categories?: GalleryCategory[];
}

const CoverflowStage: React.FC<Props> = ({
  items, activeIndex, onIndexChange, onOpenLightbox, categoryLabel, categories = [],
}) => {
  const stageRef    = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const dragStart   = useRef<number | null>(null);
  const dragging    = useRef(false);
  const [inView, setInView] = useState(false);

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = typeof navigator !== 'undefined'
    && (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;

  // ── IntersectionObserver for video autoplay ─────────────────────────────────
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Video autoplay control ──────────────────────────────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const active = items[activeIndex];
    if (active?.type === 'video' && inView && !prefersReduced && !saveData) {
      vid.play().catch(() => { /* autoplay blocked, fine */ });
    } else {
      if (vid) { vid.pause(); vid.currentTime = 0; }
    }
  }, [activeIndex, inView, prefersReduced, saveData, items]);

  // ── Keyboard ────────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); onIndexChange(Math.max(0, activeIndex - 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); onIndexChange(Math.min(items.length - 1, activeIndex + 1)); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenLightbox(activeIndex); }
  }, [activeIndex, items.length, onIndexChange, onOpenLightbox]);

  // ── Touch / mouse drag ───────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    dragging.current  = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    if (Math.abs(e.clientX - dragStart.current) > 8) dragging.current = true;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;
    if (!dragging.current) return;
    dragging.current = false;
    if (delta < -40) onIndexChange(Math.min(items.length - 1, activeIndex + 1));
    if (delta > 40)  onIndexChange(Math.max(0, activeIndex - 1));
  };

  const handleCardClick = (pos: number) => {
    if (dragging.current) return;
    if (pos === 0) onOpenLightbox(activeIndex);
    else           onIndexChange(activeIndex + pos);
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden="true">📷</span>
        <p className={styles.emptyText}>No items in this category yet.</p>
      </div>
    );
  }

  const activeItem = items[activeIndex];

  // ── Render cards ─────────────────────────────────────────────────────────────
  const renderCard = (pos: number) => {
    const i = activeIndex + pos;
    if (i < 0 || i >= items.length) return null;
    if (Math.abs(pos) > WINDOW) return null;

    const item      = items[i];
    const isActive  = pos === 0;
    const isHidden  = Math.abs(pos) > 2;
    const isSide    = Math.abs(pos) === 1;
    const isFar     = Math.abs(pos) === 2;
    const portrait  = isPortrait(item);

    // Soft edge fade when only one neighbour exists (first or last item)
    const isEdgeCard = isSide && (
      (pos === 1 && i === items.length - 1) ||
      (pos === -1 && i === 0)
    );

    const offsetPct = OFFSETS[pos] ?? (pos > 0 ? 140 : -140);
    const scale     = SCALES[pos]  ?? 0.5;
    const rotate    = ROTATIONS[pos] ?? (pos > 0 ? 22 : -22);
    const overlayOp = isActive ? 0 : isSide ? 0.35 : 0.55;

    const transform = `
      translateX(${offsetPct}%)
      scale(${scale})
      rotateY(${rotate}deg)
    `;

    const cardClass = [
      styles.card,
      isActive   ? styles.cardActive : '',
      isSide     ? styles.cardSide   : '',
      isFar      ? styles.cardFar    : '',
      isHidden   ? styles.cardHidden : '',
      isEdgeCard ? styles.cardEdge   : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        key={item.id}
        className={cardClass}
        style={{ transform, '--focus': item.focus ?? '50% 50%' } as React.CSSProperties}
        onClick={() => handleCardClick(pos)}
        role={isActive ? 'button' : 'button'}
        tabIndex={isActive ? 0 : -1}
        aria-label={
          isActive
            ? `View full size: ${item.caption}`
            : `Go to ${item.caption}`
        }
      >
        {/* Overlay dimming */}
        <div className={styles.cardOverlay} style={{ opacity: overlayOp }} aria-hidden="true" />

        {/* Media content */}
        <div className={styles.cardMedia}>
          {item.type === 'image' ? (
            portrait ? (
              /* Portrait: show fully with blurred bg */
              <div className={styles.mediaPortrait}>
                <img
                  src={item.src}
                  alt=""
                  className={styles.mediaBgBlur}
                  aria-hidden="true"
                  loading={Math.abs(pos) <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <img
                  src={item.src}
                  srcSet={item.srcset}
                  sizes={item.sizes}
                  alt={isActive ? item.alt : ''}
                  className={styles.mediaImgContain}
                  loading={Math.abs(pos) <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  width={item.width}
                  height={item.height}
                />
              </div>
            ) : (
              /* Landscape: cover with focus */
              <img
                src={item.src}
                srcSet={item.srcset}
                sizes={item.sizes}
                alt={isActive ? item.alt : ''}
                className={styles.mediaImg}
                loading={Math.abs(pos) <= 1 ? 'eager' : 'lazy'}
                decoding="async"
                width={item.width}
                height={item.height}
              />
            )
          ) : (
            /* Video card */
            <>
              {isActive ? (
                <video
                  ref={videoRef}
                  className={styles.videoEl}
                  src={item.src}
                  poster={item.poster ?? undefined}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={item.alt}
                />
              ) : (
                item.poster ? (
                  <img
                    src={item.poster}
                    alt={isActive ? item.alt : ''}
                    className={styles.videoPoster}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'var(--brand-900)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Play size={40} color="rgba(255,255,255,0.5)" aria-hidden="true" />
                  </div>
                )
              )}
              {isActive && (
                <span className={styles.videoBadge} aria-hidden="true">
                  <Play size={11} />
                  {item.duration ? formatDuration(item.duration) : 'Video'}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const positions = [-2, -1, 0, 1, 2];
  const progressPct = items.length > 1
    ? (activeIndex / (items.length - 1)) * 100
    : 100;

  return (
    <div id="gallery-stage" aria-label={`Gallery stage — ${categoryLabel ?? 'All'}`}>
      {/* Stage */}
      <div
        ref={stageRef}
        className={styles.stageOuter}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        role="presentation"
      >
        <div className={styles.stageTrack} aria-live="polite" aria-atomic="true">
          {positions.map((pos) => renderCard(pos))}
        </div>
      </div>

      {/* Caption — use item's own category name, not the chip filter label */}
      <div className={styles.caption} aria-live="polite">
        <p className={styles.captionText}>{activeItem.caption}</p>
        {activeItem.category && (
          <span className={styles.captionTag}>
            {categories.find((c) => c.slug === activeItem.category)?.label ?? activeItem.category}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={styles.navBtn}
          onClick={() => onIndexChange(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          aria-label="Previous image"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <span className={styles.counter} aria-live="polite" aria-atomic="true">
          {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>

        <button
          className={styles.navBtn}
          onClick={() => onIndexChange(Math.min(items.length - 1, activeIndex + 1))}
          disabled={activeIndex === items.length - 1}
          aria-label="Next image"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Progress bar */}
      <div className={styles.progress} role="progressbar" aria-valuenow={activeIndex + 1} aria-valuemin={1} aria-valuemax={items.length} aria-label="Gallery position">
        <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
};

export default CoverflowStage;
