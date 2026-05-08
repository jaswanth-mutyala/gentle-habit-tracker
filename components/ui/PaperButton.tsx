import React from 'react';
import { Text, TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../../constants/colors';

interface PaperButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary';
}

export function PaperButton({ label, variant = 'primary', style, ...props }: PaperButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      activeOpacity={0.98}
      style={[styles.button, isPrimary ? styles.primary : styles.secondary, style]}
      {...props}
    >
      <Text style={[styles.label, { color: isPrimary ? colors.paper : colors.ink }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors.ink,
  },
  secondary: {
    backgroundColor: colors.highlight,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
