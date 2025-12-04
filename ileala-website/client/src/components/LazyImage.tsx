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
          <span className="text-sm mb-2">Failed to load image</span>
          <span className="text-xs text-gray-500 break-all text-center max-w-full">
            {src.substring(0, 50)}...
          </span>
        </div>
      )}
    </div>
  );
}
