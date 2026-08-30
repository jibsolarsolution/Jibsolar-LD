import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export type DateRangeType = 'today' | '7days' | 'custom';

/**
 * Validates that a string is strictly in YYYY-MM-DD format and corresponds
 * to a real, existing calendar day (e.g. rejects 2026-02-30, 2026-13-01, 2026-00-10).
 */
export function isValidCalendarDate(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = val.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * Helper to get the current date string (YYYY-MM-DD) in Asia/Kolkata
 */
function getZonedDateString(date: Date, timeZone: string): string {
  return formatInTimeZone(date, timeZone, 'yyyy-MM-dd');
}

/**
 * Converts wall-clock dates in the specified time zone into UTC Date bounds.
 */
export const getDateRangeBounds = (
  range: DateRangeType = 'today',
  customStartDate?: string,
  customEndDate?: string,
  timeZone: string = 'Asia/Kolkata',
  referenceNow: Date = new Date()
): { start: Date; end: Date } => {
  const todayStr = getZonedDateString(referenceNow, timeZone);

  if (range === 'today') {
    const start = fromZonedTime(`${todayStr} 00:00:00.000`, timeZone);
    const end = fromZonedTime(`${todayStr} 23:59:59.999`, timeZone);
    return { start, end };
  }

  if (range === '7days') {
    const refZoned = fromZonedTime(`${todayStr} 00:00:00.000`, timeZone);
    const sevenDaysAgo = new Date(refZoned.getTime() - 6 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoStr = getZonedDateString(sevenDaysAgo, timeZone);

    const start = fromZonedTime(`${sevenDaysAgoStr} 00:00:00.000`, timeZone);
    const end = fromZonedTime(`${todayStr} 23:59:59.999`, timeZone);
    return { start, end };
  }

  if (range === 'custom') {
    if (customStartDate && customEndDate && isValidCalendarDate(customStartDate) && isValidCalendarDate(customEndDate)) {
      const start = fromZonedTime(`${customStartDate} 00:00:00.000`, timeZone);
      const end = fromZonedTime(`${customEndDate} 23:59:59.999`, timeZone);
      return { start, end };
    }
  }

  // Fallback to today
  const start = fromZonedTime(`${todayStr} 00:00:00.000`, timeZone);
  const end = fromZonedTime(`${todayStr} 23:59:59.999`, timeZone);
  return { start, end };
};
