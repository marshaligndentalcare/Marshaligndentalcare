/**
 * MosaicGallery.tsx — Justified-rows mosaic gallery.
 *
 * Each row has the SAME height; each tile's width follows the photo's real
 * aspect ratio, so every row exactly fills the container width.
 * A trailing filler prevents the last (partial) row from stretching.
 *
 * Layout CSS trick:
 *   li { flex: calc(var(--ar) * 100) 1 calc(var(--ar) * var(--row-h)); }
 *
 * Progressive reveal: show ROW_INITIAL rows, "View more" adds ROW_BATCH rows.
 * Lazy-load images beyond the fold; scroll-reveal (fade + rise) on enter.
 * Video tiles: play badge + duration, never autoplay.
 * Reduced-motion: no animation, all images load eagerly.
 */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { Play } from 'lucide-react';
import type { GalleryItem } from '../../data/galleryTypes';
import { clampAR, formatDuration } from '../../data/galleryTypes';
import styles from './MosaicGallery.module.css';

// ── Configuration ─────────────────────────────────────────────────────────────

const ROW_INITIAL = 4;   // rows shown on first load
const ROW_BATCH   = 3;   // rows added per "View more" click
// Row height is controlled via CSS --row-h custom property at each breakpoint.
// JS only uses the desktop value for the items-per-page estimate.
const ROW_H_DESKTOP  = 240;

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  items: GalleryItem[];
  onOpenLightbox: (index: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const MosaicGallery: React.FC<Props> = ({ items, onOpenLightbox }) => {
  const [visibleRows, setVisibleRows] = useState(ROW_INITIAL);
  const containerRef  = useRef<HTMLUListElement>(null);
  const revealRefs    = useRef<Map<string, HTMLLIElement>>(new Map());

  const prefersReduced = useMemo(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  []);

  // ── Scroll-reveal observer ────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) {
      // Mark all as visible immediately
      revealRefs.current.forEach((el) => el.classList.add(styles.tileVisible));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.tileVisible);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    revealRefs.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items, visibleRows, prefersReduced]);

  // Re-observe when new tiles appear after "View more"
  const observeRef = useCallback((id: string, el: HTMLLIElement | null) => {
    if (!el) { revealRefs.current.delete(id); return; }
    revealRefs.current.set(id, el);
    if (!prefersReduced && !el.classList.contains(styles.tileVisible)) {
      // Will be picked up by the observer once it's set up (or on re-render)
    } else if (prefersReduced) {
      el.classList.add(styles.tileVisible);
    }
  }, [prefersReduced]);

  // ── Compute rows for pagination ───────────────────────────────────────────
  // We can't know actual rows without measuring, so we approximate:
  // show up to visibleRows * ~3 items (average items/row) until "View more"
  // The CSS clips naturally — we just control how many <li> are rendered.
  const ITEMS_PER_PAGE = visibleRows * 3; // rough estimate; CSS reflowing handles the rest
  const visibleItems = items.slice(0, ITEMS_PER_PAGE);
  const hasMore = items.length > visibleItems.length;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span aria-hidden="true" className={styles.emptyIcon}>📷</span>
        <p className={styles.emptyText}>No items in this category yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Justified rows list */}
      <ul
        ref={containerRef}
        className={styles.grid}
        id="gallery-mosaic"
        aria-label="Gallery photos"
        style={{ '--row-h': `${ROW_H_DESKTOP}px` } as React.CSSProperties}
      >
        {visibleItems.map((item, idx) => {
          const ar = clampAR(item.width, item.height);
          const isVideo = item.type === 'video';
          const isBelowFold = idx > 6;
          // Stagger delay cycles 0–6
          const delayStep = idx % 7;

          return (
            <li
              key={item.id}
              ref={(el) => observeRef(item.id, el)}
              className={`${styles.tile} ${!isBelowFold || prefersReduced ? styles.tileVisible : ''}`}
              style={{
                '--ar':    ar,
                '--delay': `${isBelowFold ? delayStep * 0.05 : 0}s`,
              } as React.CSSProperties}
            >
              <button
                type="button"
                className={styles.tileBtn}
                onClick={() => onOpenLightbox(idx)}
                aria-label={`View ${item.caption}${isVideo ? ' (video)' : ''}`}
                tabIndex={0}
              >
                {/* Image / poster */}
                {item.type === 'image' ? (
                  <img
                    src={item.src}
                    srcSet={item.srcset}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    alt={item.alt}
                    className={styles.tileImg}
                    loading={isBelowFold ? 'lazy' : 'eager'}
                    decoding={isBelowFold ? 'async' : 'auto'}
                    width={item.width}
                    height={item.height}
                    style={{ objectPosition: item.focus ?? '50% 30%' }}
                  />
                ) : (
                  /* Video tile — never autoplay */
                  <div className={styles.videoThumb}>
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.alt}
                        className={styles.tileImg}
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: item.focus ?? '50% 30%' }}
                      />
                    ) : (
                      <div className={styles.videoBg} aria-hidden="true">
                        <Play size={32} color="rgba(255,255,255,0.45)" />
                      </div>
                    )}
                    {/* Play badge */}
                    <span className={styles.playBadge} aria-hidden="true">
                      <Play size={10} />
                      {item.duration ? formatDuration(item.duration) : 'Video'}
                    </span>
                  </div>
                )}

                {/* Caption overlay */}
                <div className={styles.captionOverlay} aria-hidden="true">
                  <span className={styles.captionText}>{item.caption}</span>
                </div>
              </button>
            </li>
          );
        })}

        {/* Trailing filler — prevents last row from stretching */}
        <li className={styles.filler} aria-hidden="true" />
      </ul>

      {/* View more / count */}
      {hasMore && (
        <div className={styles.moreRow}>
          <span className={styles.moreCount}>
            Showing {visibleItems.length} of {items.length}
          </span>
          <button
            type="button"
            className={styles.moreBtn}
            onClick={() => setVisibleRows((r) => r + ROW_BATCH)}
            aria-label={`Show more photos (${items.length - visibleItems.length} remaining)`}
          >
            View more
          </button>
        </div>
      )}
    </div>
  );
};

export default MosaicGallery;
