/**
 * StepPlayer.tsx — Sterilisation process: portrait card row.
 *
 * Layout:
 *  - Desktop / tablet: ONE horizontal row of portrait (9:16) cards
 *    with a thin connector line + numbered dots above.
 *    Cards are justified to the container width; card width follows
 *    the actual video aspect ratio (9:16 portrait).
 *  - Mobile: horizontal scroll-snap, ~78% viewport width per card.
 *
 * Behaviour:
 *  - Poster frame shown at rest.
 *  - Hover / focus → card plays clip muted + loop (only one at a time,
 *    only when in viewport, not under prefers-reduced-motion).
 *  - Click → opens lightbox via onOpenLightbox(index).
 *  - Prev / next in lightbox moves through steps in order.
 */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import type { StepItem } from '../../data/galleryTypes';
import styles from './StepPlayer.module.css';

interface Props {
  steps: StepItem[];
  onOpenLightbox?: (index: number) => void;
}

const StepPlayer: React.FC<Props> = ({ steps, onOpenLightbox }) => {
  const sectionRef   = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── IntersectionObserver: only allow autoplay when section is visible ────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (!e.isIntersecting) {
          setPlayingIdx(null);
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleCardEnter = useCallback((idx: number) => {
    if (prefersReduced || !inView) return;
    setPlayingIdx(idx);
  }, [prefersReduced, inView]);

  const handleCardLeave = useCallback(() => {
    setPlayingIdx(null);
  }, []);

  if (!steps.length) return null;

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="sterilisation-heading"
      id="sterilisation-process"
    >
      {/* ── Section header ── */}
      <div className={styles.sectionHeader}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          Sterilisation Protocol
        </div>
        <h2 id="sterilisation-heading" className={styles.heading}>
          Our Sterilisation Process
        </h2>
        <p className={styles.subtitle}>
          How instruments are prepared between patients
        </p>
      </div>

      {/* ── Connector nav above cards ── */}
      <div className={styles.container}>
        <div className={styles.connectorRow} aria-hidden="true">
          <div className={styles.connectorLine} />
          {steps.map((step) => (
            <div key={step.id} className={styles.connectorDot}>
              <span className={styles.connectorNum}>
                {String(step.step).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        {/* ── Portrait card row ── */}
        <div className={styles.cardRow} role="list" aria-label="Sterilisation steps">
          {steps.map((step, idx) => (
            <StepCard
              key={step.id}
              step={step}
              index={idx}
              isPlaying={playingIdx === idx}
              onEnter={handleCardEnter}
              onLeave={handleCardLeave}
              onOpen={onOpenLightbox}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Individual card ───────────────────────────────────────────────────────────

interface CardProps {
  step: StepItem;
  index: number;
  isPlaying: boolean;
  onEnter: (idx: number) => void;
  onLeave: () => void;
  onOpen?: (idx: number) => void;
}

const StepCard: React.FC<CardProps> = ({
  step, index, isPlaying, onEnter, onLeave, onOpen,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isScrollRef = useRef(false);
  const touchHandledRef = useRef(false);

  // Play / pause based on isPlaying
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isPlaying) {
      vid.currentTime = 0;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { /* blocked by browser policy */ });
      }
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [isPlaying]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchHandledRef.current = true;
    isScrollRef.current = false;
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    if (dx > 8 || dy > 8) {
      isScrollRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isScrollRef.current) {
      touchStartPos.current = null;
      return;
    }
    touchStartPos.current = null;

    e.preventDefault();
    if (!isPlaying) {
      onEnter(index);
    } else {
      onOpen?.(index);
    }
  };

  const handleClick = () => {
    // If handled by touch tap, ignore synthetic click
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }
    if (!isPlaying) {
      onEnter(index);
    } else {
      onOpen?.(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isPlaying) {
        onEnter(index);
      } else {
        onOpen?.(index);
      }
    }
  };

  return (
    <div className={styles.cardWrapper} role="listitem">
      <div
        role="button"
        tabIndex={0}
        className={styles.card}
        onMouseEnter={() => onEnter(index)}
        onMouseLeave={onLeave}
        onFocus={() => onEnter(index)}
        onBlur={onLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Step ${String(step.step).padStart(2, '0')}: ${step.caption} — click to view fullscreen`}
      >
        {/* Portrait video / poster frame */}
        <div className={styles.cardMedia}>
          {step.poster && (
            <img
              src={step.poster}
              alt=""
              className={`${styles.cardPoster} ${isPlaying ? styles.cardPosterFaded : ''}`}
              loading="lazy"
              decoding="async"
            />
          )}

          {/* Muted preview video */}
          <video
            ref={videoRef}
            className={`${styles.cardVideo} ${isPlaying ? styles.cardVideoVisible : ''}`}
            src={step.src}
            poster={step.poster ?? undefined}
            muted
            playsInline
            loop
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
          />

          {/* Play icon overlay at rest */}
          <div className={`${styles.cardOverlay} ${isPlaying ? styles.cardOverlayHidden : ''}`}>
            <div className={styles.playDisc}>
              <svg
                className={styles.playIcon}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <polygon points="9,7 19,12 9,17" />
              </svg>
            </div>
          </div>

          {/* Enlarge / Lightbox button */}
          <button
            type="button"
            className={styles.expandButton}
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(index);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onOpen?.(index);
            }}
            aria-label={`View step ${step.step} in full size`}
            title="View full size"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>

          {/* Live previewing pill indicator when active */}
          {isPlaying && (
            <div className={styles.previewBadge} aria-hidden="true">
              <span className={styles.liveDot} />
              <span>Previewing · Tap to enlarge</span>
            </div>
          )}
        </div>
      </div>

      {/* Card footer — step label, title, description */}
      <div className={styles.cardFooter}>
        <span className={styles.cardStepLabel}>
          Step {String(step.step).padStart(2, '0')}
        </span>
        <p className={styles.cardTitle}>{step.caption}</p>
        {step.description && (
          <p className={styles.cardDesc}>{step.description}</p>
        )}
      </div>
    </div>
  );
};

export default StepPlayer;

