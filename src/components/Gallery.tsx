/**
 * Gallery.tsx — Orchestrates the gallery experience.
 *
 * CONFIG:
 *   HOME_STYLE         = "drifting"  → home page: drifting rows teaser (unchanged)
 *   GALLERY_PAGE_STYLE = "mosaic"    → /gallery: justified-rows mosaic collage
 *
 * mode="home"  — used ONLY on HomePage:
 *   • Section header (heading + one-liner)
 *   • DriftingGallery (2 auto-drifting rows, up to 12 featured items per row)
 *   • "View full gallery" button → /gallery
 *   • Click any tile → opens lightbox (filtered to the same items shown)
 *   • NO chips, NO mosaic, NO captions in strip
 *
 * mode="page"  — used ONLY on GalleryPage (/gallery):
 *   • Eyebrow + heading
 *   • CategoryChips (URL ?cat= state) — includes "Inauguration" chip
 *   • MosaicGallery (justified-rows collage, progressive "View more")
 *   • GalleryLightbox with details panel (caption, category, description, duration)
 *   • Sterilisation Process section (StepPlayer) below the mosaic
 *   • NO drifting rows, NO coverflow
 *
 * PRIVACY GATE (inauguration photos):
 *   Items with category "inauguration" (allowPeople: true) are shown only when
 *   import.meta.env.DEV === true  OR  consentConfirmed === true in inauguration.ts.
 *   When hidden, they are absent from every list, the manifest count is adjusted, and
 *   the "Inauguration" chip is hidden from CategoryChips.
 *
 * Uses only existing design tokens. Does NOT change anything outside the gallery section.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './Gallery.module.css';
import CategoryChips from './gallery/CategoryChips';
import DriftingGallery from './gallery/DriftingGallery';
import GalleryLightbox from './gallery/GalleryLightbox';
import MosaicGallery from './gallery/MosaicGallery';
import StepPlayer from './gallery/StepPlayer';
import type { GalleryItem, GalleryVideoItem, GalleryManifest, GalleryCategory, StepManifest } from '../data/galleryTypes';
import manifestData from '../data/gallery.generated.json';
import stepData from '../data/sterilisation.generated.json';
import { inaugurationData, inaugurationsVisible } from '../data/inauguration';

const manifest  = manifestData as GalleryManifest;
const stepMani  = stepData    as StepManifest;

// ── Config (document intent; actual routing is via mode prop) ──────────────

const HOME_STYLE         = 'drifting' as const;
const GALLERY_PAGE_STYLE = 'mosaic'   as const;
void HOME_STYLE; void GALLERY_PAGE_STYLE;

const MAX_HOME_PER_ROW = 12;

// ── Privacy gate helper ───────────────────────────────────────────────────

function isInaugurationItem(item: GalleryItem): boolean {
  return item.category === 'inauguration';
}

function isImageOrPhoto(item: GalleryItem): boolean {
  return item.type === 'image' || item.type === 'photo';
}

// ── Types ──────────────────────────────────────────────────────────────────

interface GalleryProps {
  /** 'home' → drifting rows only (no chips, no mosaic)
   *  'page' → chips + mosaic + sterilisation player (no drifting rows) */
  mode: 'home' | 'page';
}

// ── Root component ─────────────────────────────────────────────────────────

const Gallery: React.FC<GalleryProps> = ({ mode }) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (mode === 'page') {
      // Gallery page: section is the hero — add inView immediately (no scroll-reveal delay)
      el.classList.add(styles.inView);
      return;
    }

    // Home mode: scroll-reveal via IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.inView);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px' }
    );
    const raf = requestAnimationFrame(() => {
      if (sectionRef.current) observer.observe(sectionRef.current);
    });
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [mode]);

  if (mode === 'home') return <HomeGallerySection sectionRef={sectionRef} />;
  return <GalleryPageSection sectionRef={sectionRef} />;
};

// ── Home Gallery Section (drifting rows only) ─────────────────────────────

interface HomeSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

const HomeGallerySection: React.FC<HomeSectionProps> = ({ sectionRef }) => {
  const showInauguration = inaugurationsVisible(inaugurationData);

  // Build home items: featured items, inauguration photos placed early (not at end),
  // spaced apart (not adjacent to each other).
  const homeItems: GalleryItem[] = useMemo(() => {
    // All featured image items (excluding inauguration if gated and hidden items)
    const nonInaugFeatured = manifest.items
      .filter((i) => !i.hidden && i.featured && isImageOrPhoto(i) && !isInaugurationItem(i));

    const inaugFeatured = showInauguration
      ? manifest.items.filter((i) => !i.hidden && i.featured && isImageOrPhoto(i) && isInaugurationItem(i))
      : [];

    // We want ribbon photo early (position 1) and group photo spaced apart (position 4-5)
    // Insert them into the featured list, not adjacent.
    const result: GalleryItem[] = [...nonInaugFeatured.slice(0, MAX_HOME_PER_ROW * 2)];

    if (inaugFeatured.length >= 1) {
      // Insert ribbon at index 1 (second position for visibility)
      result.splice(1, 0, inaugFeatured[0]);
    }
    if (inaugFeatured.length >= 2) {
      // Insert group at index 4 (spaced apart from ribbon)
      const insertAt = Math.min(4, result.length);
      result.splice(insertAt, 0, inaugFeatured[1]);
    }

    return result.slice(0, MAX_HOME_PER_ROW * 2);
  }, [showInauguration]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const openLightbox  = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const navigateLb    = useCallback((i: number) => setLightboxIndex(i), []);

  return (
    <section
      id="gallery"
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="gallery-heading"
    >
      {/* Section header */}
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.tag} data-animate>
            <span className={styles.tagDot} aria-hidden="true" />
            Our Gallery
          </div>
          <h2 id="gallery-heading" className={styles.heading} data-animate>
            A glimpse inside<br />Marshalign Dental Care.
          </h2>
        </header>
      </div>

      {/* Drifting rows — full width */}
      <DriftingGallery
        items={homeItems}
        onOpenLightbox={openLightbox}
      />

      <div className={styles.ctaRow}>
        <Link
          to="/gallery"
          className={styles.ctaBtn}
          aria-label="View the full clinic gallery"
        >
          View full gallery
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          items={homeItems}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLb}
        />
      )}
    </section>
  );
};

// ── Gallery Page Section (mosaic + chips + sterilisation player) ──────────

interface PageSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

const GalleryPageSection: React.FC<PageSectionProps> = ({ sectionRef }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCat = searchParams.get('cat') ?? '';

  const setActiveCat = useCallback((slug: string) => {
    setSearchParams(slug ? { cat: slug } : {}, { replace: true });
  }, [setSearchParams]);

  const showInauguration = inaugurationsVisible(inaugurationData);

  // Filter manifest items — apply privacy gate for inauguration and hide hidden items
  const visibleItems: GalleryItem[] = useMemo(() => {
    return manifest.items.filter((i) => {
      if (i.hidden) return false;
      if (isInaugurationItem(i) && !showInauguration) return false;
      return isImageOrPhoto(i) || i.type === 'video';
    });
  }, [showInauguration]);

  // Build visible categories — only include inauguration if photos are visible
  const visibleCategories: GalleryCategory[] = useMemo(() => {
    return manifest.categories
      .filter((cat) => {
        if (cat.slug === 'inauguration' && !showInauguration) return false;
        return true;
      })
      .map((cat) => {
        // Recount items after privacy gate
        const count = visibleItems.filter((i) => i.category === cat.slug).length;
        return { ...cat, count };
      })
      .filter((cat) => cat.count > 0);
  }, [visibleItems, showInauguration]);

  // Total count across all visible items
  const totalCount = visibleItems.length;

  // Filter by active category
  const filteredItems: GalleryItem[] = useMemo(() => {
    if (!activeCat) return visibleItems;
    return visibleItems.filter((i) => i.category === activeCat);
  }, [visibleItems, activeCat]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(() => {
    const lb = searchParams.get('lb');
    if (lb !== null && !isNaN(Number(lb))) return Number(lb);
    return null;
  });
  const openLightbox  = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const navigateLb    = useCallback((i: number) => setLightboxIndex(i), []);

  // ── Step lightbox: convert StepItems → GalleryVideoItems ─────────────────
  const stepItems: GalleryVideoItem[] = stepMani.steps.map((s) => ({
    id:          s.id,
    type:        'video' as const,
    category:    'sterilisation',
    caption:     s.caption,
    alt:         s.caption,
    description: s.description ?? undefined,
    src:         s.src,
    poster:      s.poster ?? null,
    duration:    s.duration ?? null,
    width:       s.width,
    height:      s.height,
    step:        s.step,
    featured:    false,
  }));

  const [stepLbIndex, setStepLbIndex] = useState<number | null>(null);
  const openStepLb  = useCallback((i: number) => setStepLbIndex(i), []);
  const closeStepLb = useCallback(() => setStepLbIndex(null), []);
  const navigateStepLb = useCallback((i: number) => setStepLbIndex(i), []);

  // Add scroll-margin-top so chips aren't hidden by sticky header
  const chipsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <section
        id="gallery"
        className={styles.section}
        ref={sectionRef}
        aria-labelledby="gallery-heading"
        style={{ scrollMarginTop: '88px' }}
      >
        <div className={styles.container}>
          {/* Section header */}
          <header className={styles.header}>
            <div className={styles.tag} data-animate>
              <span className={styles.tagDot} aria-hidden="true" />
              Clinic Gallery
            </div>
            <h2 id="gallery-heading" className={styles.heading} data-animate>
              Every frame,<br />brought into focus.
            </h2>
            <p className={styles.description} data-animate>
              A glimpse inside Marshalign Dental Care operatories &amp; specialist suites.
            </p>
          </header>

          {/* Category chips */}
          <div ref={chipsRef} style={{ scrollMarginTop: '88px' }}>
            <CategoryChips
              categories={visibleCategories}
              activeSlug={activeCat}
              totalCount={totalCount}
              onChange={setActiveCat}
            />
          </div>
        </div>

        {/* Mosaic — full width with internal container */}
        <div className={styles.mosaicWrapper}>
          <MosaicGallery
            items={filteredItems}
            onOpenLightbox={openLightbox}
          />
        </div>

        {lightboxIndex !== null && (
          <GalleryLightbox
            items={filteredItems}
            activeIndex={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={navigateLb}
          />
        )}
      </section>

      {/* Sterilisation Process section (below mosaic, outside gallery section) */}
      {stepMani.steps.length > 0 && (
        <StepPlayer
          steps={stepMani.steps}
          onOpenLightbox={openStepLb}
        />
      )}

      {/* Lightbox for sterilisation step videos */}
      {stepLbIndex !== null && stepItems.length > 0 && (
        <GalleryLightbox
          items={stepItems}
          activeIndex={stepLbIndex}
          onClose={closeStepLb}
          onNavigate={navigateStepLb}
        />
      )}
    </>
  );
};

export default Gallery;
