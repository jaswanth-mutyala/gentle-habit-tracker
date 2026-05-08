export const habitIcons = [
  'droplet',
  'book',
  'activity',
  'wind',
  'briefcase',
  'music',
  'heart',
  'star',
  'zap',
  'coffee',
  'pen-tool',
  'smile',
  'anchor',
  'sun',
  'moon',
  'clock',
  'calendar',
  'check',
] as const;

export type HabitIcon = (typeof habitIcons)[number];
