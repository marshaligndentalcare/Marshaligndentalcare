import { useEffect } from 'react';
import { SITE_URL } from '../config';

export interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  /** Set true for pages that should not be indexed (e.g. 404, admin, error pages) */
  noindex?: boolean;
}

const BASE_URL = SITE_URL;

/**
 * Sets document <title>, meta description, canonical, and OG tags for each page.
 * On unmount, tags are NOT removed — the next page call overwrites them.
 */
export function useSEO({ title, description, canonical, ogTitle, ogDescription, ogImage, noindex }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    setMeta('description', description);

    // Robots (noindex for special pages like 404)
    if (noindex) {
      setMeta('robots', 'noindex, follow');
    } else {
      // Restore default in case navigating back from a noindex page
      setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Canonical
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`;

    // Open Graph
    setMetaProperty('og:title', ogTitle || title);
    setMetaProperty('og:description', ogDescription || description);
    setMetaProperty('og:url', canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`);
    if (ogImage) {
      setMetaProperty('og:image', ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`);
    }

    // Twitter
    setMeta('twitter:title', ogTitle || title);
    setMeta('twitter:description', ogDescription || description);
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, noindex]);
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}

export { BASE_URL };
