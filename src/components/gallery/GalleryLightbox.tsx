/**
 * GalleryLightbox.tsx — Full-screen overlay lightbox with details panel.
 *
 * Layout (D fix):
 *  - Photo + details card are ONE centered group, max-width ~1100px, gap 32px.
 *  - Card vertically centered beside photo on desktop, below on mobile.
 *  - Prev/Next arrows are fixed at the viewport edges (z-index above card).
 *  - Frosted-blur backdrop (no black/blue). Counter "06 / 12" + close button.
 *  - Card text uses --color-text / --color-text-muted (WCAG AA compliant).
 *  - Portrait photos keep own aspect ratio (no forced 16:9, no blur on main media).
 *
 * Keyboard:
 *  - Esc closes, Left/Right navigate.
 *  - Focus trapped inside. Focus returns to clicked tile on close.
 *
 * Inauguration chip: rendered from item.chip field if present (same style, only text differs).
 *
 * Media rules:
 *  - Always object-fit: contain (full frame visible).
 *  - Portrait images: height = min(70vh, 720px); width = auto.
 *  - Videos: same max-height, native controls, no forced aspect ratio.
 *  - No blurred copy on the main media — the full-page backdrop IS the blur.
 *
 * Controls:
 *  - Prev / next fixed at viewport edges, never clipped.
 *  - Counter (01 / 12), close button in top bar.
 *  - Swipe (pointer events, threshold 50px).
 *  - Preloads neighbours.
 *  - No download button.
 */
import React, {
  useCallback, useEffect, useRef,
} from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem, GalleryManifest } from '../../data/galleryTypes';
import { isPortrait, formatDuration } from '../../data/galleryTypes';
import { getRibbonDescription, inaugurationData } from '../../data/inauguration';
import styles from './GalleryLightbox.module.css';

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

// Load the manifest to resolve category labels (used in details panel)
import manifestData from '../../data/gallery.generated.json';
const manifest = manifestData as GalleryManifest;

interface Props {
  items: GalleryItem[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}

const GalleryLightbox: React.FC<Props> = ({ items, activeIndex, onClose, onNavigate }) => {
  const backdropRef  = useRef<HTMLDivElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const triggerRef   = useRef<HTMLElement | null>(null);
  const dragStart    = useRef<number | null>(null);
  const dragging     = useRef(false);

  const item = items[activeIndex];

  // Save trigger on mount
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
  }, []);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Focus trap + keyboard
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = backdropRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); onNavigate(Math.max(0, activeIndex - 1)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); onNavigate(Math.min(items.length - 1, activeIndex + 1)); }
      if (e.key !== 'Tab') return;

      const dialog = backdropRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [activeIndex, items.length, onClose, onNavigate]);

  // Video: load + play on navigate
  useEffect(() => {
    const vid = videoRef.current;
    if (vid && item?.type === 'video') {
      vid.load();
      vid.play().catch(() => { /* blocked */ });
    }
    return () => {
      if (vid) { vid.pause(); vid.currentTime = 0; }
    };
  }, [activeIndex, item?.type]);

  // Preload neighbours
  useEffect(() => {
    for (const offset of [-1, 1]) {
      const n = items[activeIndex + offset];
      if (!n) continue;
      if (n.type === 'image' || n.type === 'photo') {
        const img = new Image();
        img.src = n.src;
      }
    }
  }, [activeIndex, items]);

  // Swipe / drag
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    dragging.current  = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    if (Math.abs(e.clientX - dragStart.current) > 10) dragging.current = true;
  };
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;
    if (!dragging.current) return;
    dragging.current = false;
    if (delta < -50) onNavigate(Math.min(items.length - 1, activeIndex + 1));
    if (delta > 50)  onNavigate(Math.max(0, activeIndex - 1));
  }, [activeIndex, items.length, onNavigate]);

  if (!item) return null;

  const isPhotoOrImg = item.type === 'image' || item.type === 'photo';
  const portrait = isPhotoOrImg && isPortrait(item);

  // Chip label: use item.chip if set, otherwise fall back to category label
  const chipLabel = ('chip' in item && item.chip)
    ? item.chip
    : manifest.categories.find((c) => c.slug === item.category)?.label ?? item.category;

  const itemDesc = item.id === 'inauguration-ribbon-cutting'
    ? getRibbonDescription(inaugurationData)
    : item.description;

  return (
    <div
      ref={backdropRef}
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Lightbox: ${item.caption}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.counter} aria-live="polite" aria-atomic="true">
          {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Fixed Prev button — viewport left edge */}
      <button
        type="button"
        className={`${styles.navBtn} ${styles.navBtnPrev}`}
        onClick={(e) => { e.stopPropagation(); onNavigate(Math.max(0, activeIndex - 1)); }}
        disabled={activeIndex === 0}
        aria-label="Previous"
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </button>

      {/* Centered content group: media + details card */}
      <div className={styles.contentGroup}>
        {/* Media */}
        <div className={`${styles.media} ${portrait ? styles.mediaPortrait : ''}`}>
          {item.type === 'video' ? (
            <video
              key={item.id}
              ref={videoRef}
              className={styles.video}
              src={item.src}
              poster={item.poster ?? undefined}
              controls
              playsInline
              preload="metadata"
              aria-label={item.alt}
            />
          ) : (
            <img
              key={item.id}
              src={item.src}
              srcSet={item.srcset}
              sizes="(max-width: 960px) 100vw, 65vw"
              alt={item.alt}
              className={styles.img}
              draggable={false}
            />
          )}
        </div>

        {/* Details panel — white card */}
        <aside className={styles.details} aria-label="Item details">
          {item.type === 'video' && item.step !== undefined && item.step !== null && (
            <p className={styles.detailsStepLabel}>
              Step {String(item.step).padStart(2, '0')}
            </p>
          )}

          <p className={styles.detailsCaption}>{item.caption}</p>

          {chipLabel && (
            <span className={styles.detailsCategory}>{chipLabel}</span>
          )}

          {itemDesc && (
            <p className={styles.detailsDesc}>{itemDesc}</p>
          )}

          {item.type === 'video' && item.duration && (
            <p className={styles.detailsDuration}>
              Duration: {formatDuration(item.duration)}
            </p>
          )}
        </aside>
      </div>

      {/* Fixed Next button — viewport right edge */}
      <button
        type="button"
        className={`${styles.navBtn} ${styles.navBtnNext}`}
        onClick={(e) => { e.stopPropagation(); onNavigate(Math.min(items.length - 1, activeIndex + 1)); }}
        disabled={activeIndex === items.length - 1}
        aria-label="Next"
      >
        <ChevronRight size={24} aria-hidden="true" />
      </button>
    </div>
  );
};

export default GalleryLightbox;
