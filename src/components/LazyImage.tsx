import React, { useState, useEffect, useRef } from 'react';
import {
  ImageThemePlaceholder,
  getImageThemePlaceholder,
  normalizeImageUrl,
  getThumbnailUrl,
  isImageLoadedInMemory,
  markImageLoadedInMemory,
} from '../lib/imageOptimization';
import { KoiIllustration } from './KoiIllustration';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  themePlaceholder?: ImageThemePlaceholder | string;
  isDark?: boolean;
  priority?: boolean;
  thumb?: boolean;
  wrapperClassName?: string;
  fallbackIcon?: React.ReactNode;
  showFallbackOnMissing?: boolean;
}

/**
 * LazyImage Component
 *
 * Optimizes image loading with:
 * 1. Ultra-light WebP thumbnail serving (90%+ bandwidth savings).
 * 2. In-memory cache tracking for 0ms instant display without layout flashes or spinners.
 * 3. Native `complete` property verification on mount to capture browser-cached images instantly.
 * 4. Priority fetch hinting (`fetchPriority="high"` & `loading="eager"` for in-viewport items).
 * 5. URL normalization (routes Loveat plate images through /api/plate-image/:id with valid image/jpeg headers).
 * 6. Brand-aware placeholder background color (coral or cream) while downloading.
 * 7. Graceful error and missing-resource handling with branded fallback illustration.
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  themePlaceholder = 'cream',
  isDark = false,
  priority = false,
  thumb = true,
  className = 'w-full h-full object-cover',
  wrapperClassName = 'w-full h-full',
  fallbackIcon,
  showFallbackOnMissing = true,
  onLoad,
  onError,
  ...imgProps
}) => {
  const resolveTargetUrl = (source?: string | null): string => {
    const normalized = normalizeImageUrl(source);
    return thumb ? getThumbnailUrl(normalized) : normalized;
  };

  const initialUrl = resolveTargetUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string>(initialUrl);
  const [isLoaded, setIsLoaded] = useState<boolean>(() => isImageLoadedInMemory(initialUrl));
  const [hasError, setHasError] = useState(false);
  const [hasTriedProxy, setHasTriedProxy] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Sync state if src or thumb setting changes
  useEffect(() => {
    const target = resolveTargetUrl(src);
    setCurrentSrc(target);
    setHasError(false);
    setHasTriedProxy(false);

    if (isImageLoadedInMemory(target)) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src, thumb]);

  // Synchronous check if image is already cached by browser
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      markImageLoadedInMemory(currentSrc);
      setIsLoaded(true);
    }
  }, [currentSrc]);

  const placeholderConfig = getImageThemePlaceholder(themePlaceholder, isDark);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    markImageLoadedInMemory(currentSrc);
    setIsLoaded(true);
    setHasError(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If thumbnail failed, try falling back to full-size URL
    if (thumb && currentSrc.includes('thumb=1')) {
      const fullUrl = normalizeImageUrl(src);
      setCurrentSrc(fullUrl);
      return;
    }

    // If standard load failed and it's a remote URL not yet proxied, attempt /api/image-proxy once
    if (
      !hasTriedProxy &&
      currentSrc &&
      currentSrc.startsWith('http') &&
      !currentSrc.includes('/api/')
    ) {
      setHasTriedProxy(true);
      setCurrentSrc(`/api/image-proxy?url=${encodeURIComponent(currentSrc)}`);
      return;
    }

    setHasError(true);
    setIsLoaded(true);
    if (onError) {
      onError(e);
    }
  };

  // Missing or failed image fallback view
  if (!currentSrc || hasError) {
    if (!showFallbackOnMissing) return null;
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center ${placeholderConfig.bgClass} ${wrapperClassName}`}
        style={{ backgroundColor: placeholderConfig.bgColor }}
        title={alt || 'Imagen no disponible'}
      >
        {fallbackIcon ? (
          fallbackIcon
        ) : (
          <div className="flex flex-col items-center justify-center p-2 opacity-50 text-center">
            {themePlaceholder === 'coral' ? (
              <KoiIllustration className="w-8 h-8 opacity-40" color="#DC5D5D" secondaryColor="#943535" />
            ) : (
              <KoiIllustration className="w-8 h-8 opacity-30" color="#B0AF9F" secondaryColor="#3C3C3B" />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={{ backgroundColor: placeholderConfig.bgColor }}
    >
      {/* Background theme placeholder & subtle shimmer while loading */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 z-0 flex items-center justify-center ${placeholderConfig.pulseClass}`}
          aria-hidden="true"
        >
          {themePlaceholder === 'coral' ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#DC5D5D]/30 border-t-[#DC5D5D] animate-spin" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[#B0AF9F]/30 border-t-[#3C3C3B]/60 animate-spin" />
          )}
        </div>
      )}

      {/* Main Image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        {...({ fetchPriority: priority ? 'high' : 'low' } as any)}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-opacity duration-200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...imgProps}
      />
    </div>
  );
};

