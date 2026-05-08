import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { colors } from '../constants/colors';
import { animation } from '../constants/spacing';
import { getTodayKey } from '../utils/date';
import { recordCompletion } from '../database/completions';
import { TimerCircle } from '../components/TimerCircle';

export default function TimerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    habitId?: string;
    habitName?: string;
    duration?: string;
  }>();
  const { db } = useDatabase();
  const { inkColor, paperColor } = useTheme();
  useKeepAwake();

  const habitName = params.habitName ?? 'Habit';
  const parsedDuration = Number(params.duration || 600);
  const totalSeconds = Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 600;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.slow,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: animation.slow,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (isPaused || remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, remaining]);

  const completeHabit = useCallback(
    (durationLogged: number) => {
      if (isDone) return;
      setIsDone(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Vibration.vibrate([0, 180, 80, 180]);

      const habitId = Number(params.habitId);
      if (db && Number.isFinite(habitId)) {
        recordCompletion(db, habitId, getTodayKey(), 'done', durationLogged, () => {});
      }

      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      }, 2000);
    },
    [db, isDone, params.habitId, router]
  );

  useEffect(() => {
    if (remaining === 0) {
      completeHabit(totalSeconds);
    }
  }, [completeHabit, remaining, totalSeconds]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress = 1 - remaining / totalSeconds;

  const handlePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleDone = useCallback(() => {
    const logged = Math.max(0, totalSeconds - remaining);
    setRemaining(0);
    completeHabit(logged);
  }, [completeHabit, remaining, totalSeconds]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: paperColor, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={[styles.habitName, { color: inkColor }]}>{habitName}</Text>

      <View style={styles.circleContainer}>
        <TimerCircle progress={progress} time={isDone ? 'Done' : timeString} />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { borderColor: inkColor }]}
          onPress={handlePause}
          activeOpacity={0.98}
        >
          <Text style={[styles.buttonText, { color: inkColor }]}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderColor: colors.sage }]}
          onPress={handleDone}
          activeOpacity={0.98}
        >
          <Text style={[styles.buttonText, { color: colors.sage }]}>Done early</Text>
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
  },
  habitName: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 40,
    letterSpacing: -0.3,
  },
  circleContainer: {
    marginBottom: 40,
  },
  buttons: {
    flexDirection: 'row',
    gap: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.1,
  },
});
