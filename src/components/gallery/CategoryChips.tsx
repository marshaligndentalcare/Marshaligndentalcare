import React, { useRef } from 'react';
import type { GalleryCategory } from '../../data/galleryTypes';
import styles from './CategoryChips.module.css';

interface Props {
  categories: GalleryCategory[];
  activeSlug: string;        // '' = All
  totalCount: number;
  onChange: (slug: string) => void;
}

const CategoryChips: React.FC<Props> = ({ categories, activeSlug, totalCount, onChange }) => {
  const barRef = useRef<HTMLDivElement>(null);

  const handleKey = (e: React.KeyboardEvent, slug: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(slug);
    }
    // Arrow key navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const chips = Array.from(barRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
      const idx = chips.indexOf(e.currentTarget as HTMLElement);
      const next = e.key === 'ArrowRight' ? (idx + 1) % chips.length : (idx - 1 + chips.length) % chips.length;
      chips[next]?.focus();
    }
  };

  return (
    <div
      ref={barRef}
      className={styles.bar}
      role="tablist"
      aria-label="Filter gallery by category"
    >
      {/* "All" chip */}
      <button
        role="tab"
        aria-selected={activeSlug === ''}
        aria-controls="gallery-stage"
        className={`${styles.chip} ${activeSlug === '' ? styles.chipActive : ''}`}
        onClick={() => onChange('')}
        onKeyDown={(e) => handleKey(e, '')}
      >
        All
        <span className={styles.count}>{totalCount}</span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.slug}
          role="tab"
          aria-selected={activeSlug === cat.slug}
          aria-controls="gallery-stage"
          className={`${styles.chip} ${activeSlug === cat.slug ? styles.chipActive : ''}`}
          onClick={() => onChange(cat.slug)}
          onKeyDown={(e) => handleKey(e, cat.slug)}
        >
          {cat.label}
          <span className={styles.count}>{cat.count}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryChips;
