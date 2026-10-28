/**
 * src/data/galleryTypes.ts
 * Shared TypeScript types for the gallery manifest and components.
 */

export interface GalleryCategory {
  slug: string;
  label: string;
  count: number;
}

export interface GalleryImageItem {
  id: string;
  type: 'image';
  category: string;
  caption: string;
  alt: string;
  /** One factual sentence describing the visible content (no superlatives, no brand claims) */
  description?: string;
  src: string;
  srcset?: string;
  sizes?: string;
  width: number;
  height: number;
  focus?: string;  // CSS object-position, e.g. "50% 18%"
  featured?: boolean;
}

export interface GalleryVideoItem {
  id: string;
  type: 'video';
  category: string;
  caption: string;
  alt: string;
  /** One factual sentence describing the visible content */
  description?: string;
  src: string;
  poster?: string | null;
  duration?: number | null;
  width: number;
  height: number;
  focus?: string;
  featured?: boolean;
  /** Step number for sterilisation player (1-indexed) */
  step?: number;
}

export type GalleryItem = GalleryImageItem | GalleryVideoItem;

export interface StepItem {
  id: string;
  step: number;
  caption: string;
  description?: string;
  src: string;
  poster?: string | null;
  duration?: number | null;
  width: number;
  height: number;
}

export interface StepManifest {
  steps: StepItem[];
}

export interface GalleryManifest {
  categories: GalleryCategory[];
  items: GalleryItem[];
}

/** Format seconds as m:ss */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

/** True if item is portrait (taller than wide) */
export function isPortrait(item: GalleryItem): boolean {
  return item.height > item.width;
}

/** Clamp aspect ratio to [min, max] range */
export function clampAR(w: number, h: number, min = 0.6, max = 2.0): number {
  if (!w || !h) return 1;
  return Math.min(max, Math.max(min, w / h));
}
