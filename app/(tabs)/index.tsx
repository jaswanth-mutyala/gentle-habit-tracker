import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useHabits } from '../../hooks/useHabits';
import { useCompletions } from '../../hooks/useCompletions';
import { usePremium } from '../../hooks/usePremium';
import { useNotifications } from '../../hooks/useNotifications';
import { useQonversion } from '../../contexts/QonversionContext';
import { HabitList } from '../../components/HabitList';
import { AddHabitSheet } from '../../components/AddHabitSheet';
import { PaywallSheet } from '../../components/PaywallSheet';
import { EmptyState } from '../../components/EmptyState';
import { formatDisplayDate, getTodayKey } from '../../utils/date';
import { colors } from '../../constants/colors';
import { animation } from '../../constants/spacing';
import { getSetting, setSetting } from '../../database/settings';
import type { Habit } from '../../database/habits';
import FeatherIcon from '../../components/ui/FeatherIcon';

export default function TodayScreen() {
  const router = useRouter();
  const { db, isReady } = useDatabase();
  const { paperColor, inkColor, inkLightColor } = useTheme();
  const { habits, loading, addHabit, updateHabit, archiveHabit, reload: reloadHabits } = useHabits(db);
  const today = getTodayKey();
  const { completions, recordCompletion } = useCompletions(db, today);
  const { checkCanAdd, unlockPremium } = usePremium(db, habits);
  const { scheduleHabitReminder, cancelHabitReminder } = useNotifications();
  const { purchaseProduct } = useQonversion();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Entrance animation (emil-design: elements fade in gently)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useFocusEffect(
    useCallback(() => {
      reloadHabits();
    }, [reloadHabits])
  );

  useEffect(() => {
    if (isReady && !loading) {
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
    }
  }, [isReady, loading]);

  const completionsMap = completions.reduce(
    (acc, c) => ({ ...acc, [c.habit_id]: c.status }),
    {} as Record<number, 'done' | 'skipped' | 'neutral'>
  );

  const notificationSettingKey = (habitId: number) => `habit_notification_${habitId}`;

  const syncReminder = useCallback(
    (habitId: number, habit: Pick<Habit, 'reminder_enabled' | 'reminder_time' | 'name'>) => {
      if (!db) return;

      getSetting(db, notificationSettingKey(habitId), async (_err, existingId) => {
        if (existingId) {
          await cancelHabitReminder(existingId);
        }

        if (!habit.reminder_enabled || !habit.reminder_time) {
          setSetting(db, notificationSettingKey(habitId), '', () => {});
          return;
        }

        const notificationId = await scheduleHabitReminder(habitId, habit.reminder_time, habit.name);
        setSetting(db, notificationSettingKey(habitId), notificationId, () => {});
      });
    },
    [cancelHabitReminder, db, scheduleHabitReminder]
  );

  const cancelReminderForHabit = useCallback(
    (habitId: number) => {
      if (!db) return;
      getSetting(db, notificationSettingKey(habitId), async (_err, existingId) => {
        if (existingId) {
          await cancelHabitReminder(existingId);
        }
        setSetting(db, notificationSettingKey(habitId), '', () => {});
      });
    },
    [cancelHabitReminder, db]
  );

  const handleToggle = (habit: Habit) => {
    const currentStatus = completionsMap[habit.id] || 'neutral';
    if (currentStatus === 'done') return; // Already done

    if (habit.is_timed) {
      router.push({
        pathname: '/timer',
        params: {
          habitId: String(habit.id),
          habitName: habit.name,
          duration: String(habit.duration_seconds || 600),
        },
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordCompletion(habit.id, 'done');
  };

  const handleAddHabit = () => {
    if (!checkCanAdd()) {
      setShowPaywall(true);
      return;
    }
    setEditingHabit(null);
    setShowAddSheet(true);
  };

  const handleSaveHabit = (habitDraft: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(habitDraft.reminder_time || '08:00')) {
      Alert.alert('Check reminder time', 'Use 24-hour time like 08:00 or 21:30.');
      return;
    }

    if (editingHabit) {
      const nextHabit: Habit = {
        ...editingHabit,
        ...habitDraft,
      };

      updateHabit(nextHabit, (err) => {
        if (err) {
          Alert.alert('Could not save habit', err.message);
          return;
        }
        syncReminder(nextHabit.id, nextHabit);
        setEditingHabit(null);
        setShowAddSheet(false);
      });
      return;
    }

    addHabit(habitDraft, (err, id) => {
      if (err || !id) {
        Alert.alert('Could not add habit', err?.message || 'Please try again.');
        return;
      }
      syncReminder(id, habitDraft);
      setShowAddSheet(false);
    });
  };

  const handleLongPress = (habit: Habit) => {
    Alert.alert(habit.name, undefined, [
      {
        text: 'Skip today',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          recordCompletion(habit.id, 'skipped');
        },
      },
      {
        text: 'Edit',
        onPress: () => {
          setEditingHabit(habit);
          setShowAddSheet(true);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          archiveHabit(habit.id, (err) => {
            if (err) {
              Alert.alert('Could not delete habit', err.message);
              return;
            }
            cancelReminderForHabit(habit.id);
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePurchase = async (productId: string) => {
    try {
      const active = await purchaseProduct(productId);
      if (active) {
        unlockPremium();
        setShowPaywall(false);
      }
    } catch (error) {
      Alert.alert(
        'Purchases are not ready',
        error instanceof Error ? error.message : 'Configure Qonversion and try again.'
      );
    }
  };

  // FAB press animation
  const fabScale = useRef(new Animated.Value(1)).current;

  const handleFabPressIn = () => {
    Animated.timing(fabScale, {
      toValue: animation.pressScale,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.timing(fabScale, {
      toValue: 1,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  if (!isReady || loading) {
    return (
      <View style={[styles.container, { backgroundColor: paperColor }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.date, { color: inkColor }]}>
              {formatDisplayDate(new Date())}
            </Text>
          </View>
        </View>
        {/* Skeleton loading state (design-taste: beautiful loading states) */}
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonCard, { borderColor: colors.rule }]}>
              <View style={styles.skeletonRow}>
                <View style={[styles.skeletonDot, { backgroundColor: colors.rule }]} />
                <View style={[styles.skeletonText, { backgroundColor: colors.rule }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

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
        <View>
          <Text style={[styles.date, { color: inkColor }]}>
            {formatDisplayDate(new Date())}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
          activeOpacity={0.98}
        >
          <FeatherIcon name="settings" size={24} color={inkColor} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <HabitList
          habits={habits}
          completions={completionsMap}
          onToggle={handleToggle}
          onLongPress={handleLongPress}
        />
      </Animated.View>

      {habits.length === 0 && (
        <EmptyState onAdd={handleAddHabit} />
      )}

      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: inkColor }]}
          onPress={handleAddHabit}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          activeOpacity={1}
        >
          <FeatherIcon name="plus" size={24} color={colors.paper} />
        </TouchableOpacity>
      </Animated.View>

      <AddHabitSheet
        visible={showAddSheet}
        initialHabit={editingHabit}
        onClose={() => {
          setShowAddSheet(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
      />

      <PaywallSheet
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onPurchase={handlePurchase}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingTop: 80, // Massive section spacing
    paddingBottom: 24,
  },
  date: {
    fontSize: 32, // Editorial, large
    fontFamily: 'Inter_500Medium',
    letterSpacing: -1.2, 
  },
  settingsButton: {
    padding: 8,
    marginBottom: -4, // alignment optical adjustment
  },
  content: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30, // Make it a perfect circle again, or sharp 16. Circle is usually safer for pure FAB.
    justifyContent: 'center',
    alignItems: 'center',
    // Stronger contrast, no shadow (flat UI)
    shadowColor: 'transparent',
    elevation: 0,
  },
  // Skeleton loading
  skeletonContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 20,
    marginBottom: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  skeletonText: {
    width: '60%',
    height: 16,
    borderRadius: 4,
  },
});
