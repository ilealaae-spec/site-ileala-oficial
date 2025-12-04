import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  threshold?: number;
  webpSrc?: string;
  fallbackSrc?: string;
}

/**
 * Simplified image component - renders directly without lazy loading
 * Temporary version to debug image loading issues
 */
// Helper to check if URL is from Sanity
const isSanityUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.includes('cdn.sanity.io') || url.includes('sanity.io');
};

export default function LazyImage({
  src,
  alt,
  className,
  webpSrc,
  fallbackSrc,
  ...props
}: LazyImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isSanity = isSanityUrl(src);

  // Don't even try to load Sanity URLs
  if (isSanity) {
    return (
      <div className={cn('relative overflow-hidden bg-gray-100', className)} style={{ minHeight: '100%', minWidth: '100%' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 z-20">
          <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium mb-1">Image from Sanity</span>
          <span className="text-xs text-gray-500 text-center px-2">
            Please upload a new image in admin panel
          </span>
        </div>
      </div>
    );
  }

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    console.error('[LazyImage] Failed to load image:', {
      src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      error: img.error
    });
    setHasError(true);
  };

  return (
    <div className={cn('relative overflow-hidden bg-gray-100', className)} style={{ minHeight: '100%', minWidth: '100%' }}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover',
          isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0',
          className
        )}
        style={{
          transition: isLoaded ? 'opacity 0.2s ease-in' : 'none',
          willChange: isLoaded ? 'auto' : 'opacity',
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 z-20">
          <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium mb-1">Failed to load image</span>
          <span className="text-xs text-gray-500 break-all text-center max-w-full px-2">
            {src && src.length > 0 ? src.substring(0, 50) + '...' : 'No image URL provided'}
          </span>
        </div>
      )}
    </div>
  );
}
