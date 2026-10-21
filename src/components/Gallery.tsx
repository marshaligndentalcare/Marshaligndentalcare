/**
 * Gallery.tsx — Orchestrates the full gallery experience.
 * - Category filter chips (URL ?cat= state)
 * - Coverflow stage for active category
 * - Drifting gallery (two auto-drifting rows)
 * - Full-screen lightbox
 *
 * Heading and section patterns unchanged from original.
 * Uses only existing design tokens.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Gallery.module.css';
import CategoryChips from './gallery/CategoryChips';
import CoverflowStage from './gallery/CoverflowStage';
import DriftingGallery from './gallery/DriftingGallery';
import GalleryLightbox from './gallery/GalleryLightbox';
import type { GalleryItem, GalleryManifest } from '../data/galleryTypes';
import manifestData from '../data/gallery.generated.json';

const manifest = manifestData as GalleryManifest;

// ─────────────────────────────────────────────────────────────────────────────

const Gallery: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Active category from ?cat= URL param ─────────────────────────────────
  const activeCat = searchParams.get('cat') ?? '';

  const setActiveCat = useCallback((slug: string) => {
    setSearchParams(slug ? { cat: slug } : {}, { replace: true });
    // Reset stage to first item on category change
    setStageIndex(0);
  }, [setSearchParams]);

  // ── Filter items ─────────────────────────────────────────────────────────
  const filteredItems: GalleryItem[] = activeCat
    ? manifest.items.filter((i) => i.category === activeCat)
    : manifest.items;

  // ── Coverflow stage index ─────────────────────────────────────────────────
  const [stageIndex, setStageIndex] = useState(0);

  // Clamp stage index when filtered list changes
  useEffect(() => {
    setStageIndex((i) => Math.min(i, Math.max(0, filteredItems.length - 1)));
  }, [filteredItems.length]);

  // ── Lightbox ──────────────────────────────────────────────────────────────
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox  = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const navigateLb    = useCallback((i: number) => setLightboxIndex(i), []);

  // ── Scroll-in animation observer ──────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add(styles.inView); },
      { threshold: 0.06 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Category label for current filter ────────────────────────────────────
  const activeCatLabel = activeCat
    ? manifest.categories.find((c) => c.slug === activeCat)?.label
    : 'All';

  return (
    <section
      id="gallery"
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="gallery-heading"
    >
      <div className={styles.container}>
        {/* ── Section header (unchanged from original) ── */}
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

        {/* ── Category filter chips ── */}
        <CategoryChips
          categories={manifest.categories}
          activeSlug={activeCat}
          totalCount={manifest.items.length}
          onChange={setActiveCat}
        />

        {/* ── Coverflow stage ── */}
        <CoverflowStage
          items={filteredItems}
          activeIndex={stageIndex}
          onIndexChange={setStageIndex}
          onOpenLightbox={openLightbox}
          categoryLabel={activeCatLabel}
          categories={manifest.categories}
        />
      </div>

      {/* ── Drifting gallery (full-bleed below container) ── */}
      <DriftingGallery
        items={filteredItems}
        onOpenLightbox={openLightbox}
      />

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          items={filteredItems}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLb}
        />
      )}
    </section>
  );
};

export default Gallery;
