import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { colors } from '../constants/colors';
import FeatherIcon from './ui/FeatherIcon';
import { animation } from '../constants/spacing';

interface WelcomeBackModalProps {
  visible: boolean;
  onStart: () => void;
  onHistory: () => void;
}

export function WelcomeBackModal({ visible, onStart, onHistory }: WelcomeBackModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: animation.slower,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: animation.slower,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <FeatherIcon name="wind" size={32} color={colors.sage} />
          </View>

          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.message}>
            Every day is a fresh start. Your habits are waiting.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onStart} activeOpacity={0.98}>
            <Text style={styles.primaryButtonText}>Start today</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onHistory} activeOpacity={0.98}>
            <Text style={styles.secondaryButtonText}>View history</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(47,52,55,0.3)', // Off-black with low opacity
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modal: {
    backgroundColor: colors.paper,
    borderRadius: 12, // minimalist-ui: crisp 8-12px
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 12, // Not full rounded - more crisp
    backgroundColor: colors.sageLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: colors.ink,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.inkLight,
    textAlign: 'center',
    lineHeight: 22, // Generous line-height for legibility
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.ink,
    height: 56,
    borderRadius: 8, // minimalist-ui: crisp 4-6px for buttons
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: colors.paper,
    letterSpacing: 0.2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.inkLight,
    letterSpacing: 0.1,
  },
});
