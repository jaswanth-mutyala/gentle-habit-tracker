// Spacing system - generous whitespace for premium feel
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Subtle, ultra-diffuse shadows (opacity < 0.05)
// Following minimalist-ui: shadows must be practically non-existent
export const shadows = {
  // No shadow - flat design preferred
  none: 'none',
  // Ultra-subtle for cards (opacity 0.04 or less)
  card: '0 1px 4px rgba(47,52,55,0.04)',
  // Slightly more visible for floating elements
  floating: '0 4px 12px rgba(47,52,55,0.06)',
  // For modals/overlays
  modal: '0 8px 24px rgba(47,52,55,0.08)',
};

// Animation constants based on emil-design-eng principles
export const animation = {
  // Duration (ms) - UI animations should stay under 300ms
  fast: 100,    // Button press feedback
  normal: 160,  // Standard UI interactions
  slow: 200,    // Dropdowns, small popovers
  slower: 300,   // Modals, drawers

  // Custom easing curves (stronger than default)
  // ease-out: starts fast, feels responsive
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  // ease-in-out: natural acceleration/deceleration
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  // iOS-like drawer curve
  easeDrawer: 'cubic-bezier(0.32, 0.72, 0, 1)',

  // Transform values
  pressScale: 0.98,      // Button press feedback
  activeScale: 0.97,    // More deliberate press
  entranceScale: 0.95,   // Entrance animation start
};

// Stagger delays for list animations (30-80ms between items)
export const stagger = {
  tight: 30,   // Dense lists
  normal: 50,  // Standard lists
  loose: 80,   // Spacious lists
};
