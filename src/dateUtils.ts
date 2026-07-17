const NEPAL_TIME_ZONE = 'Asia/Kathmandu';

export function nepalDateString(date: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: NEPAL_TIME_ZONE }).format(new Date(date));
}

export function isSameNepalDay(isoDate: string, reference: Date = new Date()): boolean {
  return nepalDateString(isoDate) === nepalDateString(reference);
}
