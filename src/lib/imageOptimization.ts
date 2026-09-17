import React from 'react';

/**
 * Supported brand theme placeholder modes:
 * - 'coral': Authentic Suteki Coral (#DC5D5D) soft blush
 * - 'cream': Authentic Suteki Washi Cream (#F6EFE4)
 * - 'dark': Charcoal Sumi (#242423) for night-mode surfaces
 * - 'auto': Dynamically selects 'dark' or 'cream' based on active theme
 */
export type ImageThemePlaceholder = 'coral' | 'cream' | 'dark' | 'auto';

export interface ImagePlaceholderConfig {
  /** Hex color for direct style assignment */
  bgColor: string;
  /** Tailwind classes for background and icon color */
  bgClass: string;
  /** Shimmer gradient classes */
  shimmerClass: string;
  /** Animated pulse classes */
  pulseClass: string;
  /** Accent color for indicators or fallback graphics */
  accentColor: string;
}

/**
 * Utility function to obtain theme-aligned placeholder colors and styles (coral, cream, or dark).
 * Ensures consistency across the Suteki visual identity while images are loading.
 */
export function getImageThemePlaceholder(
  theme: ImageThemePlaceholder | string = 'cream',
  isDark = false
): ImagePlaceholderConfig {
  const resolved = theme === 'auto' ? (isDark ? 'dark' : 'cream') : theme;

  switch (resolved) {
    case 'coral':
      return {
        bgColor: '#FDF2F2',
        bgClass: 'bg-[#DC5D5D]/10 text-[#DC5D5D]',
        shimmerClass: 'bg-gradient-to-r from-[#DC5D5D]/10 via-[#DC5D5D]/20 to-[#DC5D5D]/10',
        pulseClass: 'animate-pulse bg-[#DC5D5D]/15',
        accentColor: '#DC5D5D',
      };
    case 'dark':
      return {
        bgColor: '#242423',
        bgClass: 'bg-[#242423] text-[#F6EFE4]/40',
        shimmerClass: 'bg-gradient-to-r from-[#242423] via-[#333331] to-[#242423]',
        pulseClass: 'animate-pulse bg-[#2D2D2C]',
        accentColor: '#B0AF9F',
      };
    case 'cream':
    default:
      return {
        bgColor: '#F6EFE4',
        bgClass: 'bg-[#F6EFE4] text-[#B0AF9F]',
        shimmerClass: 'bg-gradient-to-r from-[#F6EFE4] via-[#EFE5D6] to-[#F6EFE4]',
        pulseClass: 'animate-pulse bg-[#EFE5D6]',
        accentColor: '#B0AF9F',
      };
  }
}

export interface OptimizedImagePropsOptions {
  themePlaceholder?: ImageThemePlaceholder;
  isDark?: boolean;
  priority?: boolean;
  alt?: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

/**
 * Utility function that generates standardized HTML <img> props:
 * - loading="lazy" (or "eager" for priority hero images)
 * - decoding="async"
 * - referrerPolicy="no-referrer"
 * - background color placeholder matching Suteki theme (coral or cream)
 */
export function getOptimizedImageProps(options?: OptimizedImagePropsOptions) {
  const {
    themePlaceholder = 'cream',
    isDark = false,
    priority = false,
    alt = '',
    className = '',
    referrerPolicy = 'no-referrer',
  } = options || {};

  const placeholder = getImageThemePlaceholder(themePlaceholder, isDark);

  return {
    loading: (priority ? 'eager' : 'lazy') as 'lazy' | 'eager',
    decoding: 'async' as 'async' | 'sync' | 'auto',
    referrerPolicy,
    alt,
    className,
    style: {
      backgroundColor: placeholder.bgColor,
    },
  };
}

/**
 * Normalizes an image URL to ensure compatibility across all mobile & desktop browsers.
 * If the image is from loveat.la (which serves binary octet-stream without image content-type),
 * it seamlessly routes through the local high-speed `/api/plate-image/:id` endpoint
 * with correct `image/jpeg` headers and instant local disk caching.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Match loveat plate URLs
  if (trimmed.includes('images.loveat.la/media/2510/images/plates/')) {
    const parts = trimmed.split('plates/');
    if (parts[1]) {
      const plateId = parts[1].split('?')[0].replace(/[^a-zA-Z0-9_-]/g, '');
      if (plateId) {
        return `/api/plate-image/${plateId}`;
      }
    }
  }

  return trimmed;
}

/**
 * Returns a high-speed, lightweight thumbnail URL (WebP @240px, ~9KB).
 * Reduces network payload by over 90% compared to original dish photos.
 */
export function getThumbnailUrl(url?: string | null): string {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return '';
  if (normalized.startsWith('/api/plate-image/')) {
    return normalized.includes('?') ? `${normalized}&thumb=1` : `${normalized}?thumb=1`;
  }
  return normalized;
}

/** Global in-memory cache of already loaded images to prevent layout flash or duplicate spinners */
export const inMemoryLoadedImageCache = new Set<string>();

export function isImageLoadedInMemory(url?: string | null): boolean {
  if (!url) return false;
  return inMemoryLoadedImageCache.has(url);
}

export function markImageLoadedInMemory(url?: string | null): void {
  if (url) inMemoryLoadedImageCache.add(url);
}

/**
 * Preloads a batch of image URLs into browser cache silently in the background
 */
export function preloadImages(urls: (string | undefined | null)[]): void {
  if (typeof window === 'undefined') return;
  urls.forEach((url) => {
    if (!url) return;
    const norm = normalizeImageUrl(url);
    const thumb = getThumbnailUrl(norm);
    if (!inMemoryLoadedImageCache.has(thumb)) {
      const img = new Image();
      img.src = thumb;
      img.onload = () => {
        inMemoryLoadedImageCache.add(thumb);
      };
    }
  });
}

