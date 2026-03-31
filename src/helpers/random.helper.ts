/**
 * Utility helpers for generating random test data.
 */
export const random = {
  integer(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  string(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  },

  email(domain: string = 'test.com'): string {
    return `${this.string(6)}_${Date.now()}@${domain}`;
  },

  uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  },

  pickFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  },
};
