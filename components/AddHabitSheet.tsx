import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated, Easing, Switch } from 'react-native';
import { colors } from '../constants/colors';
import { animation } from '../constants/spacing';
import { habitIcons } from '../constants/icons';
import type { Habit } from '../database/habits';
import FeatherIcon from './ui/FeatherIcon';

interface AddHabitSheetProps {
  visible: boolean;
  initialHabit?: Habit | null;
  onClose: () => void;
  onSave: (habit: any) => void;
}

const colorOptions = [colors.sage, colors.clay, colors.slate, colors.sand, colors.mist];
const durationOptions = [5 * 60, 10 * 60, 15 * 60, 30 * 60];

export function AddHabitSheet({ visible, initialHabit, onClose, onSave }: AddHabitSheetProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors.sage);
  const [selectedIcon, setSelectedIcon] = useState('check');
  const [isTimed, setIsTimed] = useState(false);
  const [duration, setDuration] = useState(durationOptions[1]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');

  // Slide-in animation for sheet
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setName(initialHabit?.name || '');
      setSelectedColor(initialHabit?.color || colors.sage);
      setSelectedIcon(initialHabit?.icon || 'check');
      setIsTimed(Boolean(initialHabit?.is_timed));
      setDuration(initialHabit?.duration_seconds || durationOptions[1]);
      setReminderEnabled(Boolean(initialHabit?.reminder_enabled));
      setReminderTime(initialHabit?.reminder_time || '08:00');

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animation.slower,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: animation.slower,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      overlayOpacity.setValue(0);
    }
  }, [initialHabit, visible]);

  if (!visible) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
      is_timed: isTimed ? 1 : 0,
      duration_seconds: isTimed ? duration : 0,
      reminder_enabled: reminderEnabled ? 1 : 0,
      reminder_time: reminderEnabled ? reminderTime : null,
      sort_order: 0,
      is_archived: 0,
    });
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.overlayBg, { opacity: overlayOpacity }]} />
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.handle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TextInput
            style={styles.input}
            placeholder="What habit?"
            placeholderTextColor={colors.inkLight}
            value={name}
            onChangeText={setName}
            maxLength={50}
            autoFocus
          />

          <View style={styles.section}>
            <View style={styles.reminderHeader}>
              <Text style={styles.sectionTitle}>Reminder</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: colors.rule, true: colors.sage }}
                thumbColor={colors.paper}
              />
            </View>
            {reminderEnabled && (
              <View style={styles.timeRow}>
                <FeatherIcon name="clock" size={18} color={colors.inkLight} />
                <TextInput
                  value={reminderTime}
                  onChangeText={setReminderTime}
                  placeholder="08:00"
                  placeholderTextColor={colors.inkFaded}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  style={styles.timeInput}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type</Text>
            <View style={styles.segmented}>
              <TouchableOpacity
                style={[styles.segment, !isTimed && styles.segmentActive]}
                onPress={() => setIsTimed(false)}
                activeOpacity={0.98}
              >
                <Text style={[styles.segmentText, !isTimed && styles.segmentTextActive]}>Check off</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, isTimed && styles.segmentActive]}
                onPress={() => setIsTimed(true)}
                activeOpacity={0.98}
              >
                <Text style={[styles.segmentText, isTimed && styles.segmentTextActive]}>Timer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isTimed && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <View style={styles.durationRow}>
                {durationOptions.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.pill, duration === d && styles.pillActive]}
                    onPress={() => setDuration(d)}
                    activeOpacity={0.98}
                  >
                    <Text style={[styles.pillText, duration === d && styles.pillTextActive]}>{d / 60}min</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color</Text>
            <View style={styles.colorRow}>
              {colorOptions.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedColor(c)}
                  activeOpacity={0.8}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Icon</Text>
            <View style={styles.iconGrid}>
              {habitIcons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconCell,
                    selectedIcon === icon && styles.iconCellSelected,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                  activeOpacity={0.8}
                >
                  <FeatherIcon name={icon} size={20} color={colors.ink} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!name.trim()}
            activeOpacity={0.98}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  overlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,26,26,0.4)', // Slightly darker but desaturated (#1A1A1A)
  },
  sheet: {
    backgroundColor: '#FFFFFF', // High-end white cards
    borderTopLeftRadius: 24, // Sharper, premium curve
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%', // Taller sheet to breathe
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.rule,
    alignSelf: 'center',
    marginBottom: 32, // More space
  },
  scrollContent: {
    paddingBottom: 40,
  },
  input: {
    fontSize: 24, // Larger, editorial
    fontFamily: 'Inter_500Medium',
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.ruleLight,
    paddingVertical: 16,
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 32, // Increase spacing between blocks
  },
  sectionTitle: {
    fontSize: 11, // Smaller, sharper
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    color: colors.inkLight,
    marginBottom: 16,
    letterSpacing: 1.2,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: {
    minHeight: 52, // Larger touch target
    borderRadius: 12,
    backgroundColor: '#F9F8F6', // matching the paper background lightly 
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: colors.ink,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#F9F8F6',
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8, 
    backgroundColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.inkLight,
    letterSpacing: 0.2,
  },
  segmentTextActive: {
    color: colors.ink,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 20, // Wider touch target
    paddingVertical: 12,
    borderRadius: 24, // Use true pills for durations
    backgroundColor: '#F9F8F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.rule,
  },
  pillText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.inkLight,
  },
  pillTextActive: {
    color: colors.ink,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 16,
  },
  colorDot: {
    width: 44, // Larger tap targets
    height: 44,
    borderRadius: 22,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.ink, // True contrast ring
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconCell: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24, // Circular map
    backgroundColor: '#F9F8F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconCellSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.rule,
  },
  saveButton: {
    height: 60, // Massive editorial button
    borderRadius: 30, // Pill shaped button for primary action
    backgroundColor: colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.3,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
