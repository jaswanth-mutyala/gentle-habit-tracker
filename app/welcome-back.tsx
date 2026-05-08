import React from 'react';
import { useRouter } from 'expo-router';
import { WelcomeBackModal } from '../components/WelcomeBackModal';

export default function WelcomeBackScreen() {
  const router = useRouter();

  return (
    <WelcomeBackModal
      visible
      onStart={() => router.replace('/')}
      onHistory={() => router.replace('/history')}
    />
  );
}
