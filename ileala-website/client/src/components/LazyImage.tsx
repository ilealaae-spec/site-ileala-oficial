import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  threshold?: number;
  webpSrc?: string; // Optional WebP version for better compression
  fallbackSrc?: string; // Fallback if WebP is not supported
}

/**
 * Lazy loading image component with WebP support
 * Only loads images when they're about to enter the viewport
 * Automatically uses WebP if supported, falls back to original format
 */
export default function LazyImage({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==',
  threshold = 0.1,
  webpSrc,
  fallbackSrc,
  ...props
}: LazyImageProps) {
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check WebP support
  useEffect(() => {
    const checkWebPSupport = () => {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        setWebpSupported(webp.height === 2);
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    };
    checkWebPSupport();
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    // Try fallback if WebP fails
    if (webpSrc && webpSupported && !fallbackSrc) {
      setHasError(true);
      setIsLoaded(false);
    } else if (fallbackSrc && !hasError) {
      // Switch to fallback
      setHasError(false);
      setIsLoaded(false);
    } else {
      setHasError(true);
      setIsLoaded(false);
    }
  };

  // Determine which image source to use
  const imageSrc = (() => {
    if (hasError && fallbackSrc) {
      return fallbackSrc;
    }
    if (webpSrc && webpSupported === true) {
      return webpSrc;
    }
    return src;
  })();

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className={cn('absolute inset-0 w-full h-full object-cover blur-sm', className)}
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {isInView && (
        <picture>
          {/* WebP source if supported and provided */}
          {webpSrc && webpSupported === true && !hasError && (
            <source srcSet={webpSrc} type="image/webp" />
          )}
          {/* Fallback image */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

