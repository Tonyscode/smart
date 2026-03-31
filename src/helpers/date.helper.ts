/**
 * Date utilities ported from the Cypress `utils.ts` helper.
 */

/** Returns true if the string can be parsed as a valid date */
export function checkValidDate(dateString: string): boolean {
  const d = new Date(dateString);
  return Object.prototype.toString.call(d) === '[object Date]' && !isNaN(d.getTime());
}

/**
 * Returns a date shifted by `days` from today, formatted as "dd-mmm-yyyy"
 * (the format expected by the Smart app date pickers).
 * Example: shiftToday(0) → "27-Mar-2026"
 */
export function shiftToday(days: number): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curr = new Date();
  const target = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + days);
  const day = target.getDate().toString().padStart(2, '0');
  return `${day}-${monthNames[target.getMonth()]}-${target.getFullYear()}`;
}

/** Activity date format used in the ca-info__date assertion: "Monday 01 Jan 2026 at 12:00" */
export const ACTIVITY_DATE_PATTERN =
  /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) .{11} at \d\d:\d\d$/;
