// Warm monochrome palette inspired by premium minimalist design
// avoid pure black (#000000) - use charcoal/off-black instead
// avoid neon colors and heavy gradients

export const colors = {
  // Warm bone/off-white background (more editorial and cinematic)
  paper: '#F9F8F6',
  paperDark: '#121212',

  // Deep charcoal (almost black) for sharp typographic contrast
  ink: '#1A1A1A',
  inkLight: '#8A8A8A',
  inkFaded: '#D0D0D0',

  // Core accent color - subdued, desaturated for a premium feel
  sage: '#4A6B45',
  sageLight: '#E8EFE7',

  // Muted clay/warm brown
  clay: '#B08D5D',
  clayLight: '#FBF2E8',

  // Muted slate blue
  slate: '#5C6C7E',
  slateLight: '#E5EDF4',

  // Muted sand/warm neutral
  sand: '#BAB098',
  sandLight: '#F3EFE9',

  // Muted mist/blue-gray
  mist: '#7D8E8E',
  mistLight: '#DEF1FD',

  // Structural borders - nearly invisible for flat bento grids
  rule: 'rgba(0,0,0,0.04)',
  ruleLight: 'rgba(0,0,0,0.02)',

  // For subtle highlights
  highlight: '#F0ECE4',

  // Semantic colors - desaturated
  success: '#346538',
  successLight: '#EDF3EC',
  warning: '#8A5D00',
  warningLight: '#FBF4E4',
  error: '#932725',
  errorLight: '#FDEBEC',
};

export type ColorKey = keyof typeof colors;
