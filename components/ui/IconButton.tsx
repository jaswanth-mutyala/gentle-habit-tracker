import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../../constants/colors';
import FeatherIcon from './FeatherIcon';

interface IconButtonProps extends TouchableOpacityProps {
  name: string;
  color?: string;
}

export function IconButton({ name, color = colors.ink, style, ...props }: IconButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.98} style={[styles.button, style]} {...props}>
      <FeatherIcon name={name} size={22} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
