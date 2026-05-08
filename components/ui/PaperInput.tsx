import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../constants/colors';

export function PaperInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.inkFaded}
      style={[styles.input, props.style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.ink,
  },
});
