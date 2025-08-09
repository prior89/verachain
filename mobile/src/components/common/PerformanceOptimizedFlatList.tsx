import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem } from 'react-native';

interface PerformanceOptimizedFlatListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  estimatedItemSize?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  initialNumToRender?: number;
}

function PerformanceOptimizedFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.1,
  refreshing,
  onRefresh,
  estimatedItemSize = 50,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  initialNumToRender = 10,
  ...props
}: PerformanceOptimizedFlatListProps<T>) {
  // Memoize the render item to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback(
    (item: { item: T; index: number }) => renderItem(item),
    [renderItem]
  );

  // Optimize getItemLayout for better performance
  const getItemLayout = useMemo(
    () =>
      estimatedItemSize
        ? (data: T[] | null | undefined, index: number) => ({
            length: estimatedItemSize,
            offset: estimatedItemSize * index,
            index,
          })
        : undefined,
    [estimatedItemSize]
  );

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshing={refreshing}
      onRefresh={onRefresh}
      getItemLayout={getItemLayout}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      initialNumToRender={initialNumToRender}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={100}
      {...props}
    />
  );
}

export default memo(PerformanceOptimizedFlatList);