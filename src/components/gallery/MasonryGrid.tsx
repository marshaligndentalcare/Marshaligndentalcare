/**
 * MasonryGrid.tsx
 * "All photos & videos" grid below the coverflow stage.
 * - 3 col desktop / 2 col tablet & mobile
 * - 12 items initial, +12 on "Load more"
 * - Lazy img, decoding=async, width+height to prevent CLS
 * - content-visibility: auto on tiles
 * - Portrait images shown with contain+blur-bg
 * - Video tiles: poster + play badge + duration
 * - Click → lightbox
 */
import React, { useState } from 'react';
import { Play } from 'lucide-react';
import type { GalleryItem } from '../../data/galleryTypes';
import { formatDuration, isPortrait } from '../../data/galleryTypes';
import styles from './MasonryGrid.module.css';

const PAGE = 12;

interface Props {
  items: GalleryItem[];
  onOpenLightbox: (index: number) => void;
  gridId?: string;
}

const MasonryGrid: React.FC<Props> = ({ items, onOpenLightbox, gridId = 'gallery-grid' }) => {
  const [visible, setVisible] = useState(PAGE);

  const shown = items.slice(0, visible);

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenLightbox(idx);
    }
  };

  return (
    <div className={styles.section} id={gridId}>
      <div className={styles.gridHeader}>
        <span className={styles.gridTitle}>All photos &amp; videos</span>
        <span className={styles.gridCount}>Showing {shown.length} of {items.length}</span>
      </div>

      <div className={styles.grid} role="list" aria-label="Gallery grid">
        {shown.map((item, i) => {
          const portrait = isPortrait(item);
          const isVideo  = item.type === 'video';

          return (
            <div
              key={item.id}
              role="listitem"
            >
              <div
                className={styles.tile}
                tabIndex={0}
                role="button"
                aria-label={`Open ${item.caption} in lightbox`}
                style={{ '--focus': item.focus ?? '50% 50%' } as React.CSSProperties}
                onClick={() => onOpenLightbox(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              >
                {isVideo ? (
                  // Video tile: show poster
                  <>
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.alt}
                        className={styles.tileImg}
                        loading="lazy"
                        decoding="async"
                        width={item.width}
                        height={item.height}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--brand-900)' }} />
                    )}
                    <div className={styles.videoOverlay} aria-hidden="true">
                      <div className={styles.playIcon}>
                        <Play size={18} />
                      </div>
                    </div>
                    {item.duration && (
                      <span className={styles.tileDuration} aria-hidden="true">
                        {formatDuration(item.duration)}
                      </span>
                    )}
                  </>
                ) : portrait ? (
                  // Portrait image: contain over blurred bg
                  <div className={styles.tilePortrait}>
                    <img
                      src={item.src}
                      alt=""
                      className={styles.tileBgBlur}
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      src={item.src}
                      srcSet={item.srcset}
                      sizes="(max-width: 600px) 50vw, (max-width: 900px) 50vw, 33vw"
                      alt={item.alt}
                      className={styles.tileImgContain}
                      loading="lazy"
                      decoding="async"
                      width={item.width}
                      height={item.height}
                    />
                  </div>
                ) : (
                  // Landscape image: cover
                  <img
                    src={item.src}
                    srcSet={item.srcset}
                    sizes="(max-width: 600px) 50vw, (max-width: 900px) 50vw, 33vw"
                    alt={item.alt}
                    className={styles.tileImg}
                    loading="lazy"
                    decoding="async"
                    width={item.width}
                    height={item.height}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visible < items.length && (
        <div className={styles.loadMore}>
          <button
            className={styles.loadMoreBtn}
            onClick={() => setVisible((v) => Math.min(v + PAGE, items.length))}
            aria-label={`Load more gallery items (currently showing ${shown.length} of ${items.length})`}
          >
            Load more
          </button>
          <span className={styles.loadMoreLabel} aria-live="polite">
            Showing {shown.length} of {items.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
