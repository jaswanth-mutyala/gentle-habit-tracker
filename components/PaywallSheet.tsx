import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { colors } from '../constants/colors';
import { animation } from '../constants/spacing';
import FeatherIcon from './ui/FeatherIcon';

interface PaywallSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onPurchase: (productId: string) => void;
}

export function PaywallSheet({ visible, onDismiss, onPurchase }: PaywallSheetProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
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
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      overlayOpacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
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

          <FeatherIcon name="wind" size={48} color={colors.sage} style={styles.icon} />

          <Text style={styles.title}>You're building great habits.</Text>
          <Text style={styles.subtitle}>Unlock unlimited habits and keep growing.</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onPurchase('gentle_premium_lifetime')}
            activeOpacity={0.98}
          >
            <Text style={styles.primaryButtonText}>$7.99 one-time →</Text>
            <Text style={styles.primaryButtonSubtext}>Pay once, own forever</Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => onPurchase('gentle_premium_monthly')}
              activeOpacity={0.98}
            >
              <Text style={styles.secondaryButtonText}>$2.99/mo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => onPurchase('gentle_premium_annual')}
              activeOpacity={0.98}
            >
              <Text style={styles.secondaryButtonText}>$19.99/yr</Text>
              <Text style={styles.saveBadge}>Save 44%</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onDismiss} activeOpacity={0.98}>
            <Text style={styles.dismissText}>Maybe later</Text>
          </TouchableOpacity>

          <Text style={styles.trustText}>
            No subscription trap. No auto-renew. Cancel anytime.
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,26,26,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF', // High end white card for paywall
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.rule,
    alignSelf: 'center',
    marginBottom: 32,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24, // Much larger for narrative paywalls
    fontFamily: 'Inter_500Medium',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: colors.ink,
    borderRadius: 30, // massive pill for primary call to action
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  primaryButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#A0A0A0', // Lighter for dark background contrast
    marginTop: 4,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24, // wider spacing
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F9F8F6', // light off-color
    borderRadius: 16, // softer inner cards
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.ink,
    letterSpacing: 0.1,
  },
  saveBadge: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: colors.sage,
    marginTop: 4,
  },
  dismissText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.inkLight,
    textAlign: 'center',
    paddingVertical: 8,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  trustText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.inkFaded,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
