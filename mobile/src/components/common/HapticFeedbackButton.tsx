import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  HapticFeedbackTypes,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface HapticFeedbackButtonProps extends TouchableOpacityProps {
  hapticType?: HapticFeedbackTypes;
  enableHaptic?: boolean;
}

const HapticFeedbackButton: React.FC<HapticFeedbackButtonProps> = ({
  onPress,
  hapticType = 'impactMedium',
  enableHaptic = true,
  children,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (enableHaptic) {
      try {
        ReactNativeHapticFeedback.trigger(hapticType, {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        });
      } catch (error) {
        console.log('Haptic feedback not available:', error);
      }
    }
    
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
};

export default HapticFeedbackButton;