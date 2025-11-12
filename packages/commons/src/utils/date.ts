export function nowDateUTC(
  hour: number,
  minute: number,
  seconds: number = 0,
): string {
  const utcDate: Date = new Date();

  utcDate.setUTCHours(hour);
  utcDate.setUTCMinutes(minute);
  utcDate.setUTCSeconds(seconds);

  return utcDate.toISOString().slice(11, 19);
}
