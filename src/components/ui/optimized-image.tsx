/**
 * Optimized Image Component with Lazy Loading and Performance Features
 * Provides comprehensive image optimization for Fleet Management System
 */

import React, { useState, useCallback, memo } from 'react';
import { useIntersectionObserver } from '@/hooks/use-performance-optimization';
import { cn } from '@/lib/utils';
import { ImageOff, Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  critical?: boolean;
  fallback?: React.ReactNode;
}

interface ImageState {
  loading: boolean;
  error: boolean;
  loaded: boolean;
}

const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 90,
  sizes,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  critical = false,
  fallback
}) => {
  const [imageState, setImageState] = useState<ImageState>({
    loading: true,
    error: false,
    loaded: false
  });

  const [intersectionRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  });

  const shouldLoad = !lazy || isVisible || priority || critical;

  const handleLoad = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      loading: false,
      loaded: true
    }));
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      loading: false,
      error: true
    }));
    onError?.();
  }, [onError]);

  // Generate srcset for responsive images
  const generateSrcSet = useCallback((baseSrc: string, baseWidth?: number) => {
    if (!baseWidth) return undefined;

    const breakpoints = [0.5, 1, 1.5, 2];
    return breakpoints
      .map(multiplier => {
        const scaledWidth = Math.round(baseWidth * multiplier);
        return `${baseSrc}?w=${scaledWidth}&q=${quality} ${scaledWidth}w`;
      })
      .join(', ');
  }, [quality]);

  // Optimize src URL with query parameters
  const getOptimizedSrc = useCallback((baseSrc: string) => {
    if (baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
      return baseSrc;
    }

    const url = new URL(baseSrc, window.location.origin);
    url.searchParams.set('q', quality.toString());
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());

    return url.toString();
  }, [quality, width, height]);

  // Loading placeholder
  const LoadingPlaceholder = () => (
    <div
      className={cn(
        "flex items-center justify-center bg-slate-100 dark:bg-slate-800",
        className
      )}
      style={{ width, height }}
    >
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  );

  // Error fallback
  const ErrorFallback = () => (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400",
        className
      )}
      style={{ width, height }}
    >
      {fallback || (
        <>
          <ImageOff className="w-8 h-8 mb-2" />
          <span className="text-sm">Image unavailable</span>
        </>
      )}
    </div>
  );

  // Blur placeholder
  const BlurPlaceholder = () => (
    <div
      className={cn(
        "absolute inset-0 bg-cover bg-center transition-opacity duration-300",
        imageState.loaded ? 'opacity-0' : 'opacity-100',
        className
      )}
      style={{
        backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
        filter: 'blur(20px)',
        transform: 'scale(1.1)'
      }}
    />
  );

  if (imageState.error) {
    return <ErrorFallback />;
  }

  if (!shouldLoad) {
    return (
      <div
        ref={intersectionRef}
        className={cn(
          "flex items-center justify-center bg-slate-100 dark:bg-slate-800",
          className
        )}
        style={{ width, height }}
      >
        {placeholder === 'blur' && blurDataURL && <BlurPlaceholder />}
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (imageState.loading && !imageState.loaded) {
    return <LoadingPlaceholder />;
  }

  return (
    <div
      ref={intersectionRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {placeholder === 'blur' && blurDataURL && <BlurPlaceholder />}

      <img
        src={getOptimizedSrc(src)}
        srcSet={generateSrcSet(src, width)}
        sizes={sizes || (width ? `${width}px` : '100vw')}
        alt={alt}
        width={width}
        height={height}
        loading={priority || critical ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          imageState.loaded ? 'opacity-100' : 'opacity-0',
          "object-cover w-full h-full"
        )}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />

      {/* Show loading overlay until image is loaded */}
      {imageState.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/80">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Avatar component with optimized image loading
 */
interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: React.ReactNode;
}

export const OptimizedAvatar = memo<OptimizedAvatarProps>(({
  src,
  alt,
  size = 'md',
  className,
  fallback
}) => {
  const sizeMap = {
    sm: { width: 32, height: 32, class: 'w-8 h-8' },
    md: { width: 40, height: 40, class: 'w-10 h-10' },
    lg: { width: 56, height: 56, class: 'w-14 h-14' },
    xl: { width: 80, height: 80, class: 'w-20 h-20' }
  };

  const { width, height, class: sizeClass } = sizeMap[size];

  const defaultFallback = (
    <div className="flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
      {alt.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className={cn("rounded-full overflow-hidden", sizeClass, className)}>
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="rounded-full"
          quality={85}
          critical={size === 'sm'} // Small avatars are often above-the-fold
          fallback={fallback || defaultFallback}
        />
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
});

OptimizedAvatar.displayName = 'OptimizedAvatar';

/**
 * Background image component with optimization
 */
interface OptimizedBackgroundImageProps {
  src: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
  priority?: boolean;
}

export const OptimizedBackgroundImage = memo<OptimizedBackgroundImageProps>(({
  src,
  alt = 'Background image',
  className,
  children,
  overlay = false,
  overlayOpacity = 0.5,
  priority = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [intersectionRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  const shouldLoad = isVisible || priority;

  return (
    <div
      ref={intersectionRef}
      className={cn("relative overflow-hidden", className)}
    >
      {shouldLoad && (
        <OptimizedImage
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          priority={priority}
          onLoad={() => setImageLoaded(true)}
        />
      )}

      {overlay && imageLoaded && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
});

OptimizedBackgroundImage.displayName = 'OptimizedBackgroundImage';

export default OptimizedImage;