import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useHabits } from '../../hooks/useHabits';
import { colors } from '../../constants/colors';
import { animation, stagger } from '../../constants/spacing';
import { DotGrid } from '../../components/DotGrid';
import { getLastDateKeys, getMonthStartKey, getTodayKey } from '../../utils/date';
import { getCompletionsForHabitRange, type Completion } from '../../database/completions';

export default function HistoryScreen() {
  const { db } = useDatabase();
  const { paperColor, inkColor, inkLightColor } = useTheme();
  const { habits } = useHabits(db);
  const dates = useMemo(() => getLastDateKeys(30), []);
  const [historyByHabit, setHistoryByHabit] = useState<
    Record<number, Record<string, 'done' | 'skipped' | 'neutral'>>
  >({});
  const [monthCounts, setMonthCounts] = useState<Record<number, number>>({});

  const loadHistory = useCallback(() => {
    if (!db || habits.length === 0) {
      setHistoryByHabit({});
      setMonthCounts({});
      return;
    }

    const startDate = dates[0];
    const endDate = getTodayKey();
    const monthStart = getMonthStartKey();

    Promise.all(
      habits.map(
        (habit) =>
          new Promise<{ habitId: number; rows: Completion[] }>((resolve) => {
            getCompletionsForHabitRange(db, habit.id, startDate, endDate, (_err, rows = []) => {
              resolve({ habitId: habit.id, rows });
            });
          })
      )
    ).then((results) => {
      const nextHistory: Record<number, Record<string, 'done' | 'skipped' | 'neutral'>> = {};
      const nextCounts: Record<number, number> = {};

      results.forEach(({ habitId, rows }) => {
        nextHistory[habitId] = {};
        nextCounts[habitId] = 0;

        rows.forEach((row) => {
          nextHistory[habitId][row.date] = row.status;
          if (row.status === 'done' && row.date >= monthStart) {
            nextCounts[habitId] += 1;
          }
        });
      });

      setHistoryByHabit(nextHistory);
      setMonthCounts(nextCounts);
    });
  }, [dates, db, habits]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

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

  // Stagger animation for habit rows
  const animatedValues = useRef(
    habits.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(8),
    }))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((values, index) =>
      Animated.parallel([
        Animated.timing(values.opacity, {
          toValue: 1,
          duration: animation.normal,
          delay: index * stagger.normal,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(values.translateY, {
          toValue: 0,
          duration: animation.normal,
          delay: index * stagger.normal,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(stagger.normal, animations).start();

    return () => {
      animatedValues.forEach((values) => {
        values.opacity.setValue(0);
        values.translateY.setValue(8);
      });
    };
  }, [habits.length]);

  return (
    <View style={[styles.container, { backgroundColor: paperColor }]}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.title, { color: inkColor }]}>History</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {habits.map((habit, index) => {
          const values = animatedValues[index] || animatedValues[0];
          return (
            <Animated.View
              key={habit.id}
              style={[
                styles.habitRow,
                {
                  opacity: values?.opacity || 1,
                  transform: [{ translateY: values?.translateY || 0 }],
                },
              ]}
            >
              <Text style={[styles.habitName, { color: inkColor }]}>
                {habit.name}
              </Text>
              <DotGrid
                habitId={habit.id}
                color={habit.color}
                dates={dates}
                completions={historyByHabit[habit.id] || {}}
              />
              <Text style={[styles.monthCount, { color: inkLightColor }]}>
                {monthCounts[habit.id] || 0} this month
              </Text>
            </Animated.View>
          );
        })}

        {habits.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: inkLightColor }]}>
              No habits yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.inkFaded }]}>
              Complete habits to see your history here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20, // More generous whitespace
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3, // Tighter tracking
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  habitRow: {
    marginBottom: 24, // Generous spacing between items
  },
  habitName: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  monthCount: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    letterSpacing: 0.1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});
