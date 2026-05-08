import React, { useRef, useEffect } from 'react';
import { FlatList, Animated, Easing, View, StyleSheet } from 'react-native';
import { HabitCard } from './HabitCard';
import { Habit } from '../database/habits';
import { animation, stagger } from '../constants/spacing';

interface HabitListProps {
  habits: Habit[];
  completions: Record<number, 'done' | 'skipped' | 'neutral'>;
  onToggle: (habit: Habit) => void;
  onLongPress: (habit: Habit) => void;
}

export function HabitList({ habits, completions, onToggle, onLongPress }: HabitListProps) {
  const doneHabits = habits.filter((h) => completions[h.id] === 'done');
  const skippedHabits = habits.filter((h) => completions[h.id] === 'skipped');
  const activeHabits = habits.filter(
    (h) => !['done', 'skipped'].includes(completions[h.id])
  );

  const sortedHabits = [...activeHabits, ...doneHabits, ...skippedHabits];

  // Create animated values for each item
  const animatedValues = useRef(
    sortedHabits.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(8),
    }))
  ).current;

  // Stagger animation on mount (emil-design: stagger delay 30-80ms between items)
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

    // Cleanup
    return () => {
      animatedValues.forEach((values) => {
        values.opacity.setValue(0);
        values.translateY.setValue(8);
      });
    };
  }, [sortedHabits.length]);

  return (
    <FlatList
      data={sortedHabits}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => {
        const values = animatedValues[index] || animatedValues[0];
        return (
          <Animated.View
            style={[
              styles.item,
              {
                opacity: values?.opacity || 1,
                transform: [{ translateY: values?.translateY || 0 }],
              },
            ]}
          >
            <HabitCard
              habit={item}
              status={completions[item.id] || 'neutral'}
              onPress={() => onToggle(item)}
              onLongPress={() => onLongPress(item)}
            />
          </Animated.View>
        );
      }}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120, // generous bottom spacing for the FAB
  },
  item: {
    // Each item wraps HabitCard
  },
});
