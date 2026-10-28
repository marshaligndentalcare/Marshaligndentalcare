/**
 * GalleryLightbox.tsx — Full-screen overlay lightbox with details panel.
 *
 * Media rules:
 *  - Always object-fit: contain (full frame visible)
 *  - Portrait images: height = min(70vh, 720px); width = auto
 *  - Videos: same max-height, native controls, no scale() > 1
 *  - Blurred copy of image as backdrop for portrait / letterbox scenarios
 *
 * Details panel (beside/below media):
 *  - Caption (title), category label, description (one factual sentence), duration for videos
 *
 * Controls:
 *  - Prev / next buttons, swipe (pointer events), ArrowLeft/Right, Esc
 *  - Counter (01 / 12)
 *  - Focus trap, body scroll lock, focus restored on close
 *  - Preloads neighbours
 *
 * No download button.
 */
import React, {
  useCallback, useEffect, useRef,
} from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem, GalleryManifest } from '../../data/galleryTypes';
import { isPortrait, formatDuration } from '../../data/galleryTypes';
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
      if (n.type === 'image') {
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

  const portrait    = item.type === 'image' && isPortrait(item);
  const catLabel    = manifest.categories.find((c) => c.slug === item.category)?.label ?? item.category;

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

      {/* Main content: [prev] media [details] [next] — buttons in flow, never overlapping */}
      <div className={styles.content}>
        {/* Prev button */}
        <button
          type="button"
          className={styles.navBtn}
          onClick={(e) => { e.stopPropagation(); onNavigate(Math.max(0, activeIndex - 1)); }}
          disabled={activeIndex === 0}
          aria-label="Previous"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>

        {/* Media */}
        <div className={`${styles.media} ${portrait ? styles.mediaPortrait : ''}`}>

          {item.type === 'image' ? (
            <img
              key={item.id}
              src={item.src}
              srcSet={item.srcset}
              sizes="100vw"
              alt={item.alt}
              className={styles.img}
              draggable={false}
            />
          ) : (
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

          {catLabel && (
            <span className={styles.detailsCategory}>{catLabel}</span>
          )}

          {item.description && (
            <p className={styles.detailsDesc}>{item.description}</p>
          )}

          {item.type === 'video' && item.duration && (
            <p className={styles.detailsDuration}>
              Duration: {formatDuration(item.duration)}
            </p>
          )}
        </aside>

        {/* Next button */}
        <button
          type="button"
          className={styles.navBtn}
          onClick={(e) => { e.stopPropagation(); onNavigate(Math.min(items.length - 1, activeIndex + 1)); }}
          disabled={activeIndex === items.length - 1}
          aria-label="Next"
        >
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default GalleryLightbox;
