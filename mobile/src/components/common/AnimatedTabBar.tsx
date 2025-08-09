import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface TabItem {
  key: string;
  title: string;
  icon?: React.ReactNode;
}

interface AnimatedTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
  indicatorColor?: string;
}

const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  backgroundColor = '#FFFFFF',
  activeColor = '#007AFF',
  inactiveColor = '#8E8E93',
  indicatorColor = '#007AFF',
}) => {
  const tabWidth = screenWidth / tabs.length;
  const translateX = useSharedValue(0);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
    translateX.value = withSpring(activeIndex * tabWidth, {
      damping: 20,
      stiffness: 100,
    });
  }, [activeTab, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleTabPress = (tabKey: string) => {
    runOnJS(onTabPress)(tabKey);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.indicator,
          { width: tabWidth, backgroundColor: indicatorColor },
          indicatorStyle,
        ]}
      />
      {tabs.map((tab, index) => {
        const isActive = tab.key === activeTab;
        
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, { width: tabWidth }]}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            {tab.icon && (
              <View style={styles.iconContainer}>
                {tab.icon}
              </View>
            )}
            <Text
              style={[
                styles.tabTitle,
                {
                  color: isActive ? activeColor : inactiveColor,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    marginBottom: 4,
  },
  tabTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    borderRadius: 1.5,
  },
});

export default AnimatedTabBar;