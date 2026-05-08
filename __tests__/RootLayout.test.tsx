import React from 'react';
import { render } from '@testing-library/react-native';
import RootLayout from '../app/_layout';

jest.mock('@expo-google-fonts/inter', () => ({
  Inter_400Regular: {},
  Inter_500Medium: {},
  Inter_600SemiBold: {},
  useFonts: () => [true],
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: View,
  };
});

jest.mock('expo-notifications', () => ({
  AndroidNotificationPriority: { MAX: 'max' },
  AndroidImportance: { MAX: 'max' },
  AndroidNotificationVisibility: { PUBLIC: 'public' },
  setNotificationHandler: jest.fn(),
  setNotificationCategoryAsync: jest.fn(() => Promise.resolve()),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('../contexts/DatabaseContext', () => {
  const React = require('react');

  return {
    DatabaseProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useDatabase: () => ({ db: null, isReady: true }),
  };
});

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Stack: () => React.createElement(Text, null, 'App navigation'),
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => false),
    }),
  };
});

describe('RootLayout', () => {
  it('renders without crashing', () => {
    expect(() => render(<RootLayout />)).not.toThrow();
  });

  it('renders the root navigation shell', () => {
    const { getByText } = render(<RootLayout />);
    expect(getByText('App navigation')).toBeTruthy();
  });
});
