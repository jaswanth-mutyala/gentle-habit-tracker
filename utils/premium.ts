export function canAddHabit(habitCount: number, isPremium: boolean): boolean {
  if (isPremium) {
    return true;
  }
  return habitCount < 3;
}
