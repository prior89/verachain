import React, { useState, useCallback } from 'react';
import {
  RefreshControl,
  FlatList,
  FlatListProps,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface PullToRefreshListProps<T> extends Omit<FlatListProps<T>, 'refreshControl'> {
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  loadingMore?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  emptyMessage?: string;
  errorMessage?: string;
  hasError?: boolean;
  retry?: () => void;
}

function PullToRefreshList<T>({
  onRefresh,
  refreshing = false,
  loadingMore = false,
  onEndReached,
  onEndReachedThreshold = 0.1,
  emptyMessage = 'No items found',
  errorMessage = 'Something went wrong',
  hasError = false,
  retry,
  data,
  ...props
}: PullToRefreshListProps<T>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing || refreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing, refreshing]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [-100, -50, 0],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (hasError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          {retry && (
            <TouchableOpacity onPress={retry} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (refreshing || isRefreshing) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={data}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
            progressBackgroundColor="#FFFFFF"
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PullToRefreshList;