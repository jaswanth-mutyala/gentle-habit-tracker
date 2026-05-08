import React from 'react';
import { Switch, SwitchProps } from 'react-native';
import { colors } from '../../constants/colors';

export function PaperToggle(props: SwitchProps) {
  return (
    <Switch
      trackColor={{ false: colors.rule, true: colors.sage }}
      thumbColor={colors.paper}
      {...props}
    />
  );
}
