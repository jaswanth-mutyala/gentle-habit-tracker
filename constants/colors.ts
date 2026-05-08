// Vibrant poppy palette inspired by energetic, fun design
// Using bright, saturated colors to make the UI pop

export const colors = {
  // Clean bright background to let vibrant colors pop
  paper: '#FFFFFF',
  paperDark: '#1E1E24', // A slightly softer dark mode background

  // Deep charcoal (almost black) for sharp typographic contrast
  ink: '#141414',
  inkLight: '#8A8A8A',
  inkFaded: '#D0D0D0',

  // Core accent color - vibrant electric green
  sage: '#1DD75F',
  sageLight: '#E5FBEB',

  // Bright, poppy warm coral/pink
  clay: '#FF5E7E',
  clayLight: '#FFEAF0',

  // Electric blue
  slate: '#446DF6',
  slateLight: '#E8EDFE',

  // Sunny, energetic yellow
  sand: '#FFC800',
  sandLight: '#FFF8E5',

  // Vibrant teal/cyan
  mist: '#00D1C1',
  mistLight: '#E5FAFA',

  // Structural borders - very subtle to not clash with bright colors
  rule: 'rgba(0,0,0,0.06)',
  ruleLight: 'rgba(0,0,0,0.03)',

  // For subtle highlights
  highlight: '#F5F5F5',

  // Semantic colors - vibrant
  success: '#1DD75F',
  successLight: '#E5FBEB',
  warning: '#FFC800',
  warningLight: '#FFF8E5',
  error: '#FF3B30',
  errorLight: '#FFEBEA',
};

export type ColorKey = keyof typeof colors;
