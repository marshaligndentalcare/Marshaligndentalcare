/**
 * GalleryLightbox.tsx
 * Full-screen overlay lightbox for gallery items.
 * - brand-900 background + backdrop blur
 * - Images: object-fit contain
 * - Videos: native controls, autoplay on open (user-gesture safe via call site)
 * - Prev/next buttons, swipe, ArrowLeft/Right, Esc
 * - Focus trap, body scroll lock, focus restored on close
 * - Preloads neighbours
 * - No download button
 */
import React, {
  useCallback, useEffect, useRef,
} from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem } from '../../data/galleryTypes';
import { isPortrait } from '../../data/galleryTypes';
import styles from './GalleryLightbox.module.css';

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

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

  // Focus trap
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

      const dialog  = backdropRef.current;
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

  // Video autoplay on navigate
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

  const portrait = item.type === 'image' && isPortrait(item);

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

      {/* Media */}
      <div className={styles.media}>
        {item.type === 'image' ? (
          <img
            key={item.id}
            src={item.src}
            srcSet={item.srcset}
            sizes="100vw"
            alt={item.alt}
            className={styles.img}
            style={portrait ? { height: '85vh', width: 'auto' } : {}}
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
            style={{ maxHeight: '80vh' }}
          />
        )}
      </div>

      {/* Prev / next buttons */}
      <button
        type="button"
        className={`${styles.navBtn} ${styles.navPrev}`}
        onClick={(e) => { e.stopPropagation(); onNavigate(Math.max(0, activeIndex - 1)); }}
        disabled={activeIndex === 0}
        aria-label="Previous"
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`${styles.navBtn} ${styles.navNext}`}
        onClick={(e) => { e.stopPropagation(); onNavigate(Math.min(items.length - 1, activeIndex + 1)); }}
        disabled={activeIndex === items.length - 1}
        aria-label="Next"
      >
        <ChevronRight size={24} aria-hidden="true" />
      </button>

      {/* Bottom caption */}
      <div className={styles.bottomBar}>
        <p className={styles.caption}>{item.caption}</p>
      </div>
    </div>
  );
};

export default GalleryLightbox;
