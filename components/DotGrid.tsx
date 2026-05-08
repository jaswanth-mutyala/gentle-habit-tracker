import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface DotGridProps {
  habitId: number;
  color: string;
  dates: string[];
  completions: Record<string, 'done' | 'skipped' | 'neutral'>;
}

export function DotGrid({ color, dates, completions }: DotGridProps) {
  return (
    <View style={styles.container}>
      {dates.map((date) => {
        const status = completions[date] || 'neutral';
        const isDone = status === 'done';
        const isSkipped = status === 'skipped';

        return (
          <View
            key={date}
            style={[
              styles.dot,
              {
                borderWidth: isDone || isSkipped ? 0 : 1,
                borderColor: colors.rule,
                backgroundColor: isDone ? color : isSkipped ? colors.rule : 'transparent',
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
