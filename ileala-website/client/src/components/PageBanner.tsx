import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

interface PageBannerProps {
  pageSlug: string;
  defaultImage: string;
  defaultAlt: string;
  title?: string;
  subtitle?: string;
  height?: string;
  showOverlay?: boolean;
}

// Cache banner URLs in localStorage
const getBannerCache = (pageSlug: string) => {
  try {
    const cached = localStorage.getItem(`banner_${pageSlug}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
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
  title,
  subtitle,
  height = 'h-[50vh] min-h-[400px]',
  showOverlay = true
}: PageBannerProps) {
  const cachedUrl = getBannerCache(pageSlug);
  const [imageUrl, setImageUrl] = useState(cachedUrl || defaultImage);
  const [altText, setAltText] = useState(defaultAlt);

  const { data: dbBanner } = (trpc as any).pageBanners.get.useQuery(
    { pageSlug },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );

  useEffect(() => {
    if (dbBanner?.imageUrl) {
      const newUrl = dbBanner.imageUrl.includes('/uploads/')
        ? `${dbBanner.imageUrl}?v=${dbBanner.updatedAt || Date.now()}`
        : dbBanner.imageUrl;

      if (newUrl !== imageUrl) {
        setImageUrl(newUrl);
      }
      setBannerCache(pageSlug, newUrl);

      if (dbBanner.altText) {
        setAltText(dbBanner.altText);
      }
    }
  }, [dbBanner, pageSlug]);

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
      {title && (
        <div className="relative container h-full flex items-center justify-center">
          <div className="text-center text-white max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl font-light">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
