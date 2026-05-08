import React from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { colors } from '../../constants/colors';

interface PaperCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export function PaperCard({ children, style, onPress, ...props }: PaperCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = 0.98;
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      activeOpacity={1}
      {...props}
    >
      <Animated.View
        style={[styles.card, style, animatedStyle]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: 8, // minimalist-ui: crisp 8px
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 16,
    marginBottom: 12,
    // emil-design: ultra-subtle shadow (opacity < 0.05)
    shadowColor: colors.ink,
    shadowOffset: { width:0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 0, // Flatter look for Android
  },
});
