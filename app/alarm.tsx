import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { animation } from '../constants/spacing';
import FeatherIcon from '../components/ui/FeatherIcon';
import { useDatabase } from '../contexts/DatabaseContext';
import { getHabitById, type Habit } from '../database/habits';
import { recordCompletion } from '../database/completions';
import { getTodayKey } from '../utils/date';

export default function AlarmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ habitId?: string; habitName?: string; time?: string }>();
  const { db } = useDatabase();
  const [habit, setHabit] = useState<Habit | null>(null);
  const habitName = habit?.name || params.habitName || 'Habit';
  const time = habit?.reminder_time || params.time || '';

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.slow,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: animation.slow,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Vibration.vibrate([0, 800, 400], true);

    return () => Vibration.cancel();
  }, []);

  useEffect(() => {
    const habitId = Number(params.habitId);
    if (!db || !Number.isFinite(habitId)) return;

    getHabitById(db, habitId, (_err, result) => {
      if (result) {
        setHabit(result);
      }
    });
  }, [db, params.habitId]);

  const dismiss = () => {
    Vibration.cancel();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleStart = () => {
    Vibration.cancel();
    if (habit?.is_timed) {
      router.replace({
        pathname: '/timer',
        params: {
          habitId: String(habit.id),
          habitName: habit.name,
          duration: String(habit.duration_seconds || 600),
        },
      });
      return;
    }

    if (db && habit) {
      recordCompletion(db, habit.id, getTodayKey(), 'done', () => {});
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dismiss();
  };

  const handleSkip = () => {
    if (db && habit) {
      recordCompletion(db, habit.id, getTodayKey(), 'skipped', () => {});
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dismiss();
  };

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
    >
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.habitName}>{habitName}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.sage }]}
          onPress={handleStart}
          activeOpacity={0.98}
        >
          <Text style={styles.primaryButtonText}>{habit?.is_timed ? 'Start now' : 'Check off'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkip}
          activeOpacity={0.98}
        >
          <Text style={styles.secondaryButtonText}>Skip today</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.paperDark,
  },
  time: {
    fontSize: 44,
    fontFamily: 'Inter_600SemiBold',
    color: colors.paper,
    marginBottom: 16,
    letterSpacing: -1, // Tighter tracking for large numbers
  },
  habitName: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: colors.paper,
    marginBottom: 48,
    letterSpacing: -0.3,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 8, // crisp 8px
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: colors.paper,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 8, // crisp 8px
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.paper,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: colors.paper,
    letterSpacing: 0.1,
  },
});
