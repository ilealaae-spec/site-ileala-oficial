import { useEffect } from 'react';

export default function SchemaOrg() {
  useEffect(() => {
    // Store references to scripts we create
    let orgScript: HTMLScriptElement | null = null;
    let webScript: HTMLScriptElement | null = null;

    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ILE ALA",
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
        "email": "info@ileala.ae",
        "availableLanguage": ["English", "Portuguese"]
      },
      "sameAs": [
        "https://www.instagram.com/ileala.ae",
        "https://www.facebook.com/share/17f63HzTAk/?mibextid=wwXIfr"
      ],
      "brand": {
        "@type": "Brand",
        "name": "ILE ALA",
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

    // Remove existing schema scripts safely
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"][data-schema]');
    existingSchemas.forEach(script => {
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (error) {
        // Element may have already been removed, ignore
        console.warn('[SchemaOrg] Could not remove existing schema:', error);
      }
    });

    // Add Organization Schema
    orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.setAttribute('data-schema', 'organization');
    orgScript.text = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    // Add Website Schema
    webScript = document.createElement('script');
    webScript.type = 'application/ld+json';
    webScript.setAttribute('data-schema', 'website');
    webScript.text = JSON.stringify(websiteSchema);
    document.head.appendChild(webScript);

    return () => {
      // Cleanup: remove only the scripts we created
      try {
        if (orgScript && orgScript.parentNode === document.head) {
          document.head.removeChild(orgScript);
        } else if (orgScript && orgScript.parentNode) {
          orgScript.parentNode.removeChild(orgScript);
        }
      } catch (error) {
        // Element may have already been removed, ignore
        console.warn('[SchemaOrg] Could not remove orgScript:', error);
      }
      
      try {
        if (webScript && webScript.parentNode === document.head) {
          document.head.removeChild(webScript);
        } else if (webScript && webScript.parentNode) {
          webScript.parentNode.removeChild(webScript);
        }
      } catch (error) {
        // Element may have already been removed, ignore
        console.warn('[SchemaOrg] Could not remove webScript:', error);
      }
    };
  }, []);

  return null;
}
