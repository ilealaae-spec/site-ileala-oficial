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

// Cache banner URLs in localStorage to prevent flash of default content
const getBannerCache = (pageSlug: string) => {
  try {
    const cached = localStorage.getItem(`banner_${pageSlug}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Cache valid for 1 hour
      if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
        return parsed.imageUrl;
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return null;
};

const setBannerCache = (pageSlug: string, imageUrl: string) => {
  try {
    localStorage.setItem(`banner_${pageSlug}`, JSON.stringify({
      imageUrl,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore localStorage errors
  }
};

// Preload an image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve anyway to not block
    img.src = src;
  });
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
  // Start with cached URL or default
  const cachedUrl = getBannerCache(pageSlug);
  const [imageUrl, setImageUrl] = useState(cachedUrl || defaultImage);
  const [imageLoaded, setImageLoaded] = useState(!!cachedUrl);
  const [altText, setAltText] = useState(defaultAlt);

  // Fetch banner from database
  const { data: dbBanner } = (trpc as any).pageBanners.get.useQuery(
    { pageSlug },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  );

  // When banner data arrives, update and cache
  useEffect(() => {
    if (dbBanner?.imageUrl) {
      const newUrl = dbBanner.imageUrl.includes('/uploads/')
        ? `${dbBanner.imageUrl}?v=${dbBanner.updatedAt || Date.now()}`
        : dbBanner.imageUrl;

      // Preload the new image before showing it
      preloadImage(newUrl).then(() => {
        setImageUrl(newUrl);
        setImageLoaded(true);
        setBannerCache(pageSlug, newUrl);
      });

      if (dbBanner.altText) {
        setAltText(dbBanner.altText);
      }
    }
  }, [dbBanner, pageSlug]);

  // Preload default image on mount if no cache
  useEffect(() => {
    if (!cachedUrl) {
      preloadImage(defaultImage).then(() => {
        if (!dbBanner?.imageUrl) {
          setImageLoaded(true);
        }
      });
    }
  }, [cachedUrl, defaultImage, dbBanner]);

  return (
    <section className={`relative ${height} w-full overflow-hidden`}>
      {/* Background color while loading */}
      <div
        className={`absolute inset-0 bg-[#255238] transition-opacity duration-300 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Banner Image */}
      <img
        src={imageUrl}
        alt={altText}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="eager"
        fetchPriority="high"
        onLoad={() => setImageLoaded(true)}
      />

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
