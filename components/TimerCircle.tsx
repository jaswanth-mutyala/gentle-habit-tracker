import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface TimerCircleProps {
  progress: number;
  time: string;
  color?: string;
}

export function TimerCircle({ progress, time, color = colors.sage }: TimerCircleProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.shell}>
      <View style={[styles.track, { borderColor: colors.rule }]} />
      <View
        style={[
          styles.progress,
          {
            borderColor: color,
            transform: [{ rotate: `${clampedProgress * 360}deg` }],
            opacity: 0.35 + clampedProgress * 0.65,
          },
        ]}
      />
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 260,
    height: 260,
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
  },
  progress: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  time: {
    fontSize: 44,
    fontFamily: 'Inter_600SemiBold',
    color: colors.ink,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
});
