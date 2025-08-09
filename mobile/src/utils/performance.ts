import { InteractionManager, Platform } from 'react-native';

/**
 * Performance utilities for React Native
 */

/**
 * Run expensive operations after interactions have completed
 */
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(() => {
    callback();
  });
};

/**
 * Delayed execution for heavy operations
 */
export const delayedExecution = (
  callback: () => void,
  delay: number = 0
): NodeJS.Timeout => {
  return setTimeout(callback, delay);
};

/**
 * Batch multiple state updates
 */
export const batchUpdates = (callback: () => void): void => {
  // React 18 automatic batching handles this, but we can still optimize
  requestAnimationFrame(() => {
    callback();
  });
};

/**
 * Memory-efficient array chunking for large datasets
 */
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Platform-specific optimization checks
 */
export const isLowEndDevice = (): boolean => {
  // This is a simplified check - in production, you might want to use a library
  // or more sophisticated detection
  return Platform.OS === 'android' && Platform.Version < 23;
};

/**
 * Image optimization helpers
 */
export const getOptimizedImageSize = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * Memory management utilities
 */
export const requestIdleCallback = (callback: () => void): void => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(callback);
  } else {
    // Fallback for environments that don't support requestIdleCallback
    setTimeout(callback, 1);
  }
};

export default {
  runAfterInteractions,
  delayedExecution,
  batchUpdates,
  chunkArray,
  isLowEndDevice,
  getOptimizedImageSize,
  requestIdleCallback,
};