import { useEffect } from 'react';

export default function usePageMeta({ title, description, image, url, type = 'website' }) {
  useEffect(() => {
    // Title
    if (title) document.title = `${title} | CuteLookComfy`;

    const setMeta = (selector, content) => {
      if (!content) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const attr = selector.includes('property=') ? 'property' : 'name';
        el.setAttribute(attr, selector.match(/["']([^"']+)["']/)?.[1] || '');
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('meta[name="description"]', description);
      setMeta('meta[property="og:description"]', description);
      setMeta('meta[name="twitter:description"]', description);
    }
    if (title) {
      setMeta('meta[property="og:title"]', `${title} | CuteLookComfy`);
      setMeta('meta[name="twitter:title"]', `${title} | CuteLookComfy`);
    }
    if (image) {
      setMeta('meta[property="og:image"]', image);
      setMeta('meta[name="twitter:image"]', image);
    }
    if (url) setMeta('meta[property="og:url"]', url);
    if (type) setMeta('meta[property="og:type"]', type);

    // Reset title on unmount
    return () => {
      document.title = 'CuteLookComfy — Premium Fashion Store';
    };
  }, [title, description, image, url, type]);
}
