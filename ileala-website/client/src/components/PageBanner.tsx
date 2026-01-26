import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageBannerProps {
  pageSlug: string;
  defaultImage: string;
  defaultAlt: string;
  title?: string;
  subtitle?: string;
  height?: string;
  showOverlay?: boolean;
}

// Cache banner URLs in localStorage (5 minutes)
const getBannerCache = (pageSlug: string) => {
  try {
    const cached = localStorage.getItem(`banner_${pageSlug}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return parsed.imageUrl;
      }
    }
  } catch (e) {}
  return null;
};

const setBannerCache = (pageSlug: string, imageUrl: string) => {
  try {
    localStorage.setItem(`banner_${pageSlug}`, JSON.stringify({
      imageUrl,
      timestamp: Date.now()
    }));
  } catch (e) {}
};

export default function PageBanner({
  pageSlug,
  defaultImage,
  defaultAlt,
  title: propTitle,
  subtitle: propSubtitle,
  height = 'h-[50vh] min-h-[400px]',
  showOverlay = true
}: PageBannerProps) {
  const { language } = useLanguage();
  const cachedUrl = getBannerCache(pageSlug);

  // Start with cached URL or default - show immediately, no loading state
  const [imageUrl, setImageUrl] = useState(cachedUrl || defaultImage);
  const [altText, setAltText] = useState(defaultAlt);
  const [dbTitle, setDbTitle] = useState<string | null>(null);
  const [dbSubtitle, setDbSubtitle] = useState<string | null>(null);

  const { data: dbBanner } = (trpc as any).pageBanners.get.useQuery(
    { pageSlug },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );

  // Update image when database banner loads
  useEffect(() => {
    if (dbBanner?.imageUrl) {
      const newUrl = dbBanner.imageUrl.includes('/uploads/')
        ? `${dbBanner.imageUrl}?v=${dbBanner.updatedAt || Date.now()}`
        : dbBanner.imageUrl;

      if (newUrl !== imageUrl) {
        setImageUrl(newUrl);
        setBannerCache(pageSlug, newUrl);
      }

      if (dbBanner.altText) {
        setAltText(dbBanner.altText);
      }
    }

    // Set title and subtitle based on language
    if (dbBanner) {
      const title = language === 'pt'
        ? (dbBanner.titlePT || dbBanner.titleEN)
        : (dbBanner.titleEN || dbBanner.titlePT);
      const subtitle = language === 'pt'
        ? (dbBanner.subtitlePT || dbBanner.subtitleEN)
        : (dbBanner.subtitleEN || dbBanner.subtitlePT);

      setDbTitle(title || null);
      setDbSubtitle(subtitle || null);
    }
  }, [dbBanner, pageSlug, language, imageUrl]);

  // Use database values if available, otherwise fall back to props
  const displayTitle = dbTitle || propTitle;
  const displaySubtitle = dbSubtitle || propSubtitle;

  return (
    <section
      className={`relative ${height} w-full overflow-hidden`}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      {showOverlay && <div className="absolute inset-0 bg-black/30" />}

      {/* Content */}
      {displayTitle && (
        <div className="relative container h-full flex items-center justify-center">
          <div className="text-center text-white max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="text-lg md:text-xl font-light">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
