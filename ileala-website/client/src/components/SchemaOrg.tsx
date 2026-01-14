import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function SchemaOrg() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": settings.siteName,
      "alternateName": "Ile Ala",
      "url": "https://ileala.ae",
      "logo": "https://ileala.ae/images/logo_ile_ala.webp",
      "description": "Luxury handcrafted table linens and home decor. Artisan-made in Dubai with 12 exclusive collections featuring botanical, traditional, and contemporary designs.",
      "foundingDate": "2020",
      "foundingLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "AE",
          "addressRegion": "Dubai"
        }
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "telephone": settings.phone.replace(/\s/g, ''),
        "email": settings.email,
        "availableLanguage": ["English", "Portuguese"]
      },
      "sameAs": [
        settings.instagram,
        settings.facebook
      ],
      "brand": {
        "@type": "Brand",
        "name": settings.siteName,
        "logo": "https://ileala.ae/images/logo_ile_ala.webp"
      }
    };

    // WebSite Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ILE ALA",
      "url": "https://ileala.ae",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://ileala.ae/shop?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    // Remove existing schema scripts
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"][data-schema]');
    existingSchemas.forEach(script => script.remove());

    // Add Organization Schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.setAttribute('data-schema', 'organization');
    orgScript.text = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    // Add Website Schema
    const webScript = document.createElement('script');
    webScript.type = 'application/ld+json';
    webScript.setAttribute('data-schema', 'website');
    webScript.text = JSON.stringify(websiteSchema);
    document.head.appendChild(webScript);

    return () => {
      const schemas = document.querySelectorAll('script[data-schema]');
      schemas.forEach(script => script.remove());
    };
  }, [settings]);

  return null;
}
