import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Habit } from '../database/habits';
import { colors } from '../constants/colors';
import { animation } from '../constants/spacing';

interface HabitCardProps {
  habit: Habit;
  status: 'neutral' | 'done' | 'skipped';
  onPress: () => void;
  onLongPress?: () => void;
}

export function HabitCard({ habit, status, onPress, onLongPress }: HabitCardProps) {
  const isDone = status === 'done';
  const isSkipped = status === 'skipped';
  const opacity = isDone ? 0.5 : isSkipped ? 0.35 : 1;

  // Animated scale for press feedback (emil-design: buttons must feel responsive)
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: animation.pressScale,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1} // We handle opacity via transform
      style={[styles.card, { opacity, transform: [{ scale }] }]}
    >
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: habit.color }]} />
        <Feather name={habit.icon as any} size={20} color={colors.ink} style={styles.icon} />
        <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>

        {habit.is_timed && !isDone && (
          <Text style={styles.startText}>Start</Text>
        )}

        {isDone && <Feather name="check" size={20} color={colors.inkLight} />}

        {isSkipped && <Text style={styles.restPill}>Rest</Text>}
      </View>

      {habit.reminder_time && (
        <Text style={styles.time}>{habit.reminder_time}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // High-end contrast: white card on bone background
    borderRadius: 16, // gpt-taste/brandkit: clean large radius or fully sharp. 16px is solid.
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.rule, // Faint structural line
    // gpt-taste: Minimal to zero shadows
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 0, 
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8, // Smaller, more precise dot
    borderRadius: 4,
    marginRight: 12,
  },
  icon: {
    marginRight: 12,
    opacity: 0.7, // Subdue the icon slightly
  },
  name: {
    flex: 1,
    fontSize: 17, // Larger, more editorial
    color: colors.ink,
    fontFamily: 'Inter_500Medium', // slightly bolder for card titles
    letterSpacing: -0.4, // Editorial tight tracking
  },
  startText: {
    fontSize: 13,
    color: colors.sage,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase', // More deliberate secondary action
  },
  time: {
    fontSize: 13,
    color: colors.inkLight,
    marginTop: 8,
    marginLeft: 32, // align with text instead of edge
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0,
  },
  restPill: {
    fontSize: 11,
    color: colors.inkLight,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
