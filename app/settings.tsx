import React, { useRef } from 'react';
import { Alert, View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useBackup } from '../hooks/useBackup';
import { useNotifications } from '../hooks/useNotifications';
import { useQonversion } from '../contexts/QonversionContext';
import { getSetting, setSetting } from '../database/settings';
import { colors } from '../constants/colors';
import { animation } from '../constants/spacing';
import FeatherIcon from '../components/ui/FeatherIcon';

export default function SettingsScreen() {
  const { db, isReady } = useDatabase();
  const { inkColor, paperColor, theme, setTheme } = useTheme();
  const { exportCSV, createEncryptedBackup, isExporting } = useBackup(db);
  const { requestPermissions } = useNotifications();
  const { restorePurchases } = useQonversion();
  const [haptics, setHaptics] = React.useState(true);
  const [sound, setSound] = React.useState(true);
  const [notifications, setNotifications] = React.useState(false);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (!db || !isReady) return;

    getSetting(db, 'haptics_enabled', (_err, value) => setHaptics(value !== 'false'));
    getSetting(db, 'sound_enabled', (_err, value) => setSound(value !== 'false'));
    getSetting(db, 'notifications_asked', (_err, value) => setNotifications(value === 'true'));
  }, [db, isReady]);

  const persistSetting = (key: string, value: boolean) => {
    if (db) {
      setSetting(db, key, value ? 'true' : 'false', () => {});
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const permission = await requestPermissions();
      const granted = permission.granted || permission.status === 'granted';
      setNotifications(granted);
      persistSetting('notifications_asked', granted);
      if (!granted) {
        Alert.alert('Notifications are off', 'Enable notifications in system settings to receive habit reminders.');
      }
      return;
    }

    setNotifications(false);
    persistSetting('notifications_asked', false);
  };

  const handleExport = async () => {
    try {
      await exportCSV();
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleBackup = async () => {
    try {
      await createEncryptedBackup();
    } catch (error) {
      Alert.alert('Backup failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleRestore = async () => {
    try {
      const active = await restorePurchases();
      if (active && db) {
        setSetting(db, 'premium_unlocked', 'true', () => {});
      }
      Alert.alert(active ? 'Premium restored' : 'No premium purchase found');
    } catch (error) {
      Alert.alert(
        'Restore unavailable',
        error instanceof Error ? error.message : 'Configure Qonversion and try again.'
      );
    }
  };

  const cycleTheme = () => {
    const nextTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(nextTheme);
  };

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
        <Text style={[styles.title, { color: inkColor }]}>Settings</Text>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: inkColor }]}>Preferences</Text>

          <View style={[styles.row, { borderBottomColor: colors.rule }]}>
            <Text style={[styles.label, { color: inkColor }]}>Haptics</Text>
            <Switch
              value={haptics}
              onValueChange={(value) => {
                setHaptics(value);
                persistSetting('haptics_enabled', value);
              }}
              trackColor={{ false: colors.rule, true: colors.sage }}
              thumbColor={colors.paper}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: colors.rule }]}>
            <Text style={[styles.label, { color: inkColor }]}>Sound</Text>
            <Switch
              value={sound}
              onValueChange={(value) => {
                setSound(value);
                persistSetting('sound_enabled', value);
              }}
              trackColor={{ false: colors.rule, true: colors.sage }}
              thumbColor={colors.paper}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: colors.rule, borderBottomWidth: 0 }]}>
            <Text style={[styles.label, { color: inkColor }]}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.rule, true: colors.sage }}
              thumbColor={colors.paper}
            />
          </View>

          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.rule, borderBottomWidth: 0 }]}
            onPress={cycleTheme}
            activeOpacity={0.98}
          >
            <Text style={[styles.label, { color: inkColor }]}>Theme</Text>
            <Text style={styles.value}>{theme}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: inkColor }]}>Data</Text>

          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.rule }]}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.98}
          >
            <Text style={[styles.label, { color: inkColor }]}>Export CSV</Text>
            <FeatherIcon name="chevron-right" size={16} color={colors.inkLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.rule, borderBottomWidth: 0 }]}
            onPress={handleBackup}
            disabled={isExporting}
            activeOpacity={0.98}
          >
            <Text style={[styles.label, { color: inkColor }]}>Backup to Cloud</Text>
            <FeatherIcon name="chevron-right" size={16} color={colors.inkLight} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: inkColor }]}>Premium</Text>
          <TouchableOpacity
            style={[styles.row, { borderBottomWidth: 0 }]}
            onPress={handleRestore}
            activeOpacity={0.98}
          >
            <Text style={[styles.label, { color: inkColor }]}>Restore Purchases</Text>
            <FeatherIcon name="chevron-right" size={16} color={colors.inkLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: inkColor }]}>About</Text>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.label, { color: inkColor }]}>Version 1.0.1</Text>
          </View>
        </View>
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3, // Tighter tracking for premium feel
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    marginBottom: 12,
    color: colors.inkLight,
    letterSpacing: 0.5, // Wider tracking for uppercase
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14, // More generous spacing
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.inkLight,
    textTransform: 'capitalize',
  },
});
