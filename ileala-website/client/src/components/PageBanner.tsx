import { useEffect, useState, useRef } from 'react';
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

// Preload an image and return a promise
const preloadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
};

// Cache for preloaded images (in-memory for faster access)
const preloadedImages = new Set<string>();

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

  // Track loading state
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [altText, setAltText] = useState(defaultAlt);
  const [dbTitle, setDbTitle] = useState<string | null>(null);
  const [dbSubtitle, setDbSubtitle] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const targetImageRef = useRef<string>(cachedUrl || defaultImage);

  const { data: dbBanner } = (trpc as any).pageBanners.get.useQuery(
    { pageSlug },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );

  // Preload and display image
  useEffect(() => {
    mountedRef.current = true;

    const loadImage = async (src: string) => {
      // If already preloaded, show immediately
      if (preloadedImages.has(src)) {
        if (mountedRef.current) {
          setCurrentImage(src);
          setIsLoading(false);
        }
        return;
      }

      try {
        await preloadImage(src);
        preloadedImages.add(src);
        if (mountedRef.current) {
          setCurrentImage(src);
          setIsLoading(false);
        }
      } catch (error) {
        // On error, try default image
        if (src !== defaultImage && mountedRef.current) {
          try {
            await preloadImage(defaultImage);
            preloadedImages.add(defaultImage);
            if (mountedRef.current) {
              setCurrentImage(defaultImage);
              setIsLoading(false);
            }
          } catch {
            // Last resort - just show what we have
            if (mountedRef.current) {
              setCurrentImage(defaultImage);
              setIsLoading(false);
            }
          }
        } else if (mountedRef.current) {
          setCurrentImage(defaultImage);
          setIsLoading(false);
        }
      }
    };

    // Start loading the initial/cached image immediately
    loadImage(targetImageRef.current);

    return () => {
      mountedRef.current = false;
    };
  }, [defaultImage]);

  // Handle database banner updates
  useEffect(() => {
    if (dbBanner?.imageUrl) {
      const newUrl = dbBanner.imageUrl.includes('/uploads/')
        ? `${dbBanner.imageUrl}?v=${dbBanner.updatedAt || Date.now()}`
        : dbBanner.imageUrl;

      // Only reload if URL changed
      if (newUrl !== targetImageRef.current) {
        targetImageRef.current = newUrl;
        setBannerCache(pageSlug, newUrl);

        // If already showing an image, preload new one in background
        if (currentImage && !preloadedImages.has(newUrl)) {
          preloadImage(newUrl).then(() => {
            preloadedImages.add(newUrl);
            if (mountedRef.current) {
              setCurrentImage(newUrl);
            }
          }).catch(() => {
            // Keep showing current image on error
          });
        } else if (preloadedImages.has(newUrl)) {
          setCurrentImage(newUrl);
        } else if (!currentImage) {
          // No current image, load new one
          setIsLoading(true);
          preloadImage(newUrl).then(() => {
            preloadedImages.add(newUrl);
            if (mountedRef.current) {
              setCurrentImage(newUrl);
              setIsLoading(false);
            }
          }).catch(() => {
            if (mountedRef.current) {
              setCurrentImage(defaultImage);
              setIsLoading(false);
            }
          });
        }
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
  }, [dbBanner, pageSlug, language, currentImage, defaultImage]);

  // Use database values if available, otherwise fall back to props
  const displayTitle = dbTitle || propTitle;
  const displaySubtitle = dbSubtitle || propSubtitle;

  return (
    <section
      className={`relative ${height} w-full overflow-hidden`}
      style={{ backgroundColor: '#f5f5f5' }}
    >
      {/* Loading skeleton - consistent gray background with subtle animation */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}

      {/* Background image with fade-in transition */}
      {currentImage && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      {/* Overlay */}
      {showOverlay && !isLoading && <div className="absolute inset-0 bg-black/30" />}

      {/* Content */}
      {displayTitle && !isLoading && (
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
