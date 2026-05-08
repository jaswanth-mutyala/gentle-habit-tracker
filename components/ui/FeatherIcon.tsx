import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../../constants/colors';

interface FeatherIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function FeatherIcon({ name, size = 20, color = colors.ink, style }: FeatherIconProps) {
  return <Feather name={name as any} size={size} color={color} style={style} />;
}

export default FeatherIcon;
