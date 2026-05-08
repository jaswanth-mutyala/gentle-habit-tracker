import { canAddHabit } from '../../utils/premium';

describe('freemium logic', () => {
  describe('canAddHabit', () => {
    it('allows free user to add up to 3 habits', () => {
      expect(canAddHabit(0, false)).toBe(true);
      expect(canAddHabit(1, false)).toBe(true);
      expect(canAddHabit(2, false)).toBe(true);
    });

    it('blocks free user from adding 4th habit', () => {
      expect(canAddHabit(3, false)).toBe(false);
    });

    it('allows premium user to add unlimited habits', () => {
      expect(canAddHabit(0, true)).toBe(true);
      expect(canAddHabit(3, true)).toBe(true);
      expect(canAddHabit(10, true)).toBe(true);
      expect(canAddHabit(100, true)).toBe(true);
    });
  });
});
