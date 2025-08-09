import { useState, useEffect } from 'react';
import { Image } from 'react-native';

interface ImageCacheOptions {
  priority?: 'low' | 'normal' | 'high';
  placeholder?: string;
}

/**
 * Hook for optimized image loading with caching
 * Uses React Native's built-in image cache
 */
export function useOptimizedImage(
  uri: string,
  options: ImageCacheOptions = {}
) {
  const [imageState, setImageState] = useState({
    isLoading: true,
    hasError: false,
    isLoaded: false,
  });

  useEffect(() => {
    if (!uri) {
      setImageState({
        isLoading: false,
        hasError: true,
        isLoaded: false,
      });
      return;
    }

    setImageState(prev => ({ ...prev, isLoading: true, hasError: false }));

    // Preload image to cache it
    Image.prefetch(uri)
      .then(() => {
        setImageState({
          isLoading: false,
          hasError: false,
          isLoaded: true,
        });
      })
      .catch(() => {
        setImageState({
          isLoading: false,
          hasError: true,
          isLoaded: false,
        });
      });
  }, [uri]);

  const imageProps = {
    source: { uri },
    onLoadStart: () => setImageState(prev => ({ ...prev, isLoading: true })),
    onLoadEnd: () => setImageState(prev => ({ ...prev, isLoading: false })),
    onLoad: () => setImageState(prev => ({ ...prev, isLoaded: true })),
    onError: () =>
      setImageState({
        isLoading: false,
        hasError: true,
        isLoaded: false,
      }),
  };

  return {
    imageProps,
    ...imageState,
  };
}

export default useOptimizedImage;