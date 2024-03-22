import { match } from "ts-pattern";

export enum TimeFormat {
  YY_MM_DD_HH_MM_SS = "yyyy-MM-dd HH:mm:ss.SSSSSSSSS",
  YY_MM_DD_HH_MM = "yyyy-MM-dd HH:mm",
}

export function changeDateFormat(
  dateString: string,
  format: TimeFormat
): string {
  const { year, month, day, hours, minutes, seconds, milliseconds } =
    getDateComponents(dateString);

  return match(format)
    .with(
      TimeFormat.YY_MM_DD_HH_MM,
      () => `${year}-${month}-${day} ${hours}:${minutes}`
    )
    .with(
      TimeFormat.YY_MM_DD_HH_MM_SS,
      () =>
        `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
    )
    .exhaustive();
}

function getDateComponents(dateString: string): {
  year: string;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string;
} {
  const date: Date = new Date(dateString);
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds())
    .padStart(3, "0")
    .padEnd(9, "0");

  return { year, month, day, hours, minutes, seconds, milliseconds };
}

export enum DateUnit {
  MILLIS,
  SECONDS,
  MINUTES,
  HOURS,
  DAYS,
  WEEKS,
  MONTHS,
  YEARS,
}

export function timeUnitToMS(value: number, unit: DateUnit): number {
  switch (unit) {
    case DateUnit.HOURS:
      return value * 60 * 60 * 1000;
    default:
      throw new Error("Unsupported date unit");
  }
}

export function truncatedTo(dateString: string, unit: DateUnit): Date {
  const dateToTruncate = new Date(dateString);

  switch (unit) {
    case DateUnit.HOURS:
      return new Date(dateToTruncate.setUTCMinutes(0, 0, 0));
    case DateUnit.DAYS:
      return new Date(dateToTruncate.setUTCHours(0, 0, 0));
    default:
      throw new Error("Unsupported Date Unit");
  }
}

export function timeBetween(
  startDate: string,
  endDate: string,
  unit: DateUnit
): number {
  const start: Date = new Date(startDate);
  const end: Date = new Date(endDate);

  switch (unit) {
    case DateUnit.MILLIS:
      return end.getTime() - start.getTime();
    case DateUnit.SECONDS:
      return (end.getTime() - start.getTime()) / 1000;
    case DateUnit.MINUTES:
      return (end.getTime() - start.getTime()) / (1000 * 60);
    case DateUnit.HOURS:
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    case DateUnit.DAYS:
      return Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
    case DateUnit.WEEKS:
      return Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
    case DateUnit.MONTHS:
      return (
        (end.getFullYear() - start.getFullYear()) * 12 +
        end.getMonth() -
        start.getMonth()
      );
    case DateUnit.YEARS:
      return end.getFullYear() - start.getFullYear();
    default:
      throw new Error("Unsupported Date Unit");
  }
}
