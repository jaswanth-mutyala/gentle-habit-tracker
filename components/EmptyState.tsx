import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import FeatherIcon from './ui/FeatherIcon';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.iconCircle}>
        <FeatherIcon name="sun" size={28} color={colors.sage} />
      </View>
      <Text style={styles.emptyText}>Start with one habit</Text>
      <Text style={styles.emptySubtext}>Choose something small and kind to future you.</Text>
      <TouchableOpacity style={styles.button} onPress={onAdd} activeOpacity={0.98}>
        <FeatherIcon name="plus" size={18} color={colors.paper} />
        <Text style={styles.buttonText}>Add your first habit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    position: 'absolute',
    left: 24, // Matches list padding
    right: 24,
    top: 200, // Push it down further for editorial flow
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF', // High-contrast flat white box
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  iconCircle: {
    width: 64, // Larger
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sageLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20, // More prominent
    fontFamily: 'Inter_500Medium',
    color: colors.ink,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtext: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.inkLight,
    textAlign: 'center',
    lineHeight: 24, // Better legibility
    marginBottom: 32,
  },
  button: {
    minHeight: 52, // Larger touch target
    borderRadius: 26, // fully rounded pill
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF', // True white text inside dark button
  },
});
