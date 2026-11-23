import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function setMeta(selector: string, attribute: string, value: string, property = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, property);
    document.head.appendChild(element);
  }
  element.content = value;
}

export function Seo({ title, description }: { title: string; description: string }) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = `${title} — Loopcraft`;
    const origin = window.location.origin;
    const url = `${origin}${location.pathname}`;
    const image = `${origin}/og-card.svg`;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', description);
    setMeta('meta[property="og:title"]', 'property', fullTitle, 'property');
    setMeta('meta[property="og:description"]', 'property', description, 'property');
    setMeta('meta[property="og:url"]', 'property', url, 'property');
    setMeta('meta[property="og:image"]', 'property', image, 'property');
    setMeta('meta[name="twitter:title"]', 'name', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', description);
    setMeta('meta[name="twitter:image"]', 'name', image);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, location.pathname]);

  return null;
}
