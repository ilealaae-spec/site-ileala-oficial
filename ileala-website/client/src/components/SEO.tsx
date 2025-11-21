import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  canonical,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    // Store references to elements we create
    const createdElements: (HTMLElement | null)[] = [];

    // Set document title
    document.title = `${title} | ILE ALA`;

    // Remove existing meta tags safely
    const existingMetas = document.querySelectorAll('meta[data-seo]');
    existingMetas.forEach(meta => {
      try {
        if (meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      } catch (error) {
        // Element may have already been removed, ignore
        console.warn('[SEO] Could not remove existing meta:', error);
      }
    });

    // Create meta tags
    const metaTags = [
      { name: 'description', content: description },
      ...(keywords ? [{ name: 'keywords', content: keywords }] : []),
      ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
      
      // Open Graph
      { property: 'og:title', content: `${title} | ILE ALA` },
      { property: 'og:description', content: description },
      { property: 'og:image', content: `${window.location.origin}${ogImage}` },
      { property: 'og:type', content: ogType },
      { property: 'og:url', content: canonical || window.location.href },
      { property: 'og:site_name', content: 'ILE ALA' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${title} | ILE ALA` },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: `${window.location.origin}${ogImage}` },
    ];

    // Append meta tags to head
    metaTags.forEach(({ name, property, content }) => {
      const meta = document.createElement('meta');
      meta.setAttribute('data-seo', 'true');
      if (name) meta.setAttribute('name', name);
      if (property) meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
      createdElements.push(meta);
    });

    // Set canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    let createdCanonical = false;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.setAttribute('data-seo', 'true');
      document.head.appendChild(canonicalLink);
      createdCanonical = true;
      createdElements.push(canonicalLink);
    }
    canonicalLink.href = canonical || window.location.href;

    return () => {
      // Cleanup on unmount - safely remove only elements we created
      createdElements.forEach(element => {
        try {
          if (element && element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } catch (error) {
          // Element may have already been removed, ignore
          console.warn('[SEO] Could not remove element during cleanup:', error);
        }
      });
    };
  }, [title, description, keywords, ogImage, ogType, canonical, noindex]);

  return null;
}
