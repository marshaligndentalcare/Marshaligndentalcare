import { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const BASE_URL = 'https://marshaligndental.com';

/**
 * Sets document <title>, meta description, canonical, and OG tags for each page.
 * On unmount, tags are NOT removed — the next page call overwrites them.
 */
export function useSEO({ title, description, canonical, ogTitle, ogDescription, ogImage }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    setMeta('description', description);

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
  }, [title, description, canonical, ogTitle, ogDescription, ogImage]);
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
