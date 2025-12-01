import { invalidFilterDate } from "../model/domain/errors.js";

export function validateFilteredDateRange(
  startDate: string,
  endDate: string,
): void {
  const now = new Date();

  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffMs = end.getTime() - start.getTime();
  const maxRangeMs = 366 * 24 * 60 * 60 * 1000;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw invalidFilterDate(
      `Invalid date format: startDate='${startDate}', endDate='${endDate}'`,
    );
  }

  if (start > end) {
    throw invalidFilterDate("Start date cannot be after end date");
  }

  if (diffMs > maxRangeMs) {
    throw invalidFilterDate("Date range cannot exceed 12 months");
  }

  if (end > now) {
    throw invalidFilterDate("End date cannot be in the future");
  }
}
