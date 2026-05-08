module.exports = {
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.[tj]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  collectCoverageFrom: ['utils/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}'],
  moduleNameMapper: {
    '^@expo/vector-icons(/.*)?$': '@expo/vector-icons',
  },
};
