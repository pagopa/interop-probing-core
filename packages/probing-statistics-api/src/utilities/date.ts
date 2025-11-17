import { match } from "ts-pattern";

export enum TimeFormat {
  YY_MM_DD_HH_MM_SS = "yyyy-MM-dd HH:mm:ss.SSSSSSSSS",
  YY_MM_DD_HH_MM = "yyyy-MM-dd HH:mm",
  ISO_8601 = "ISO_8601",
  ISO_8601_LOCAL = "ISO_8601_LOCAL",
}

export enum DateUnit {
  MILLIS = "MILLIS",
  SECONDS = "SECONDS",
  MINUTES = "MINUTES",
  HOURS = "HOURS",
  DAYS = "DAYS",
  WEEKS = "WEEKS",
  MONTHS = "MONTHS",
  YEARS = "YEARS",
}

export function changeDateFormat(
  dateInput: string | Date,
  format: TimeFormat,
): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  const { year, month, day, hours, minutes, seconds, milliseconds } =
    getDateComponents(date);

  return match(format)
    .with(
      TimeFormat.YY_MM_DD_HH_MM,
      () => `${year}-${month}-${day} ${hours}:${minutes}`,
    )
    .with(
      TimeFormat.YY_MM_DD_HH_MM_SS,
      () =>
        `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
    )
    .with(TimeFormat.ISO_8601, () => date.toISOString())
    .with(TimeFormat.ISO_8601_LOCAL, () => {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return local.toISOString().replace("Z", "");
    })
    .exhaustive();
}

function getDateComponents(dateInput: string | Date): {
  year: string;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string;
} {
  const date: Date =
    dateInput instanceof Date ? dateInput : new Date(dateInput);

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

export function timeUnitToMS(value: number, unit: DateUnit.HOURS): number {
  return match(unit)
    .with(DateUnit.HOURS, () => value * 60 * 60 * 1000)
    .exhaustive();
}

export function truncatedTo(
  dateString: string,
  unit: DateUnit.HOURS | DateUnit.DAYS,
): Date {
  const dateToTruncate = new Date(dateString);

  return match(unit)
    .with(DateUnit.HOURS, () => new Date(dateToTruncate.setUTCMinutes(0, 0, 0)))
    .with(DateUnit.DAYS, () => new Date(dateToTruncate.setUTCHours(0, 0, 0)))
    .exhaustive();
}

export function timeBetween(
  startDate: string,
  endDate: string,
  unit: DateUnit.DAYS | DateUnit.WEEKS,
): number {
  const start: Date = new Date(startDate);
  const end: Date = new Date(endDate);

  return match(unit)
    .with(DateUnit.DAYS, () =>
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    )
    .with(DateUnit.WEEKS, () =>
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)),
    )
    .exhaustive();
}

export const normalizeDateRange = (startDate?: string, endDate?: string) => {
  const defaultRangeHours = 24;
  const currentDate = new Date();
  const defaultStartDate = new Date(
    currentDate.getTime() - defaultRangeHours * 3600 * 1000,
  );
  return {
    startIso: startDate ?? defaultStartDate.toISOString(),
    endIso: endDate ?? currentDate.toISOString(),
  };
};
