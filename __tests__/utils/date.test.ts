import { formatDisplayDate, formatDateKey, isToday, getTodayKey } from '../../utils/date';

describe('date utils', () => {
  describe('formatDisplayDate', () => {
    it('formats date as "Weekday, Month Day"', () => {
      const date = new Date('2026-05-05');
      expect(formatDisplayDate(date)).toBe('Tuesday, May 5');
    });
  });

  describe('formatDateKey', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2026-05-05');
      expect(formatDateKey(date)).toBe('2026-05-05');
    });

    it('pads single-digit months and days', () => {
      const date = new Date('2026-01-09');
      expect(formatDateKey(date)).toBe('2026-01-09');
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('getTodayKey', () => {
    it('returns today in YYYY-MM-DD format', () => {
      const expected = formatDateKey(new Date());
      expect(getTodayKey()).toBe(expected);
    });
  });
});
