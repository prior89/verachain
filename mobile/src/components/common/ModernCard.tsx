import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
  Pressable,
  PressableProps,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

interface ModernCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  blurEffect?: boolean;
  shadowIntensity?: 'low' | 'medium' | 'high';
  borderRadius?: number;
  backgroundColor?: string;
}

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  blurEffect = false,
  shadowIntensity = 'medium',
  borderRadius = 16,
  backgroundColor = '#FFFFFF',
  ...pressableProps
}) => {
  const cardStyle = [
    styles.card,
    {
      borderRadius,
      backgroundColor: blurEffect ? 'rgba(255, 255, 255, 0.1)' : backgroundColor,
      ...getShadowStyle(shadowIntensity),
    },
    style,
  ];

  const CardContent = () => (
    <View style={cardStyle}>
      {children}
    </View>
  );

  if (blurEffect && Platform.OS === 'ios') {
    return (
      <Pressable {...pressableProps}>
        <BlurView
          style={[cardStyle, { backgroundColor: 'transparent' }]}
          blurType="light"
          blurAmount={10}
        >
          {children}
        </BlurView>
      </Pressable>
    );
  }

  if (pressableProps.onPress) {
    return (
      <Pressable {...pressableProps} style={({ pressed }) => [
        cardStyle,
        pressed && styles.pressed,
      ]}>
        {children}
      </Pressable>
    );
  }

  return <CardContent />;
};

const getShadowStyle = (intensity: 'low' | 'medium' | 'high'): ViewStyle => {
  const shadows = {
    low: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    medium: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    high: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
      }),
    },
  };

  return shadows[intensity] || shadows.medium;
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

export default ModernCard;