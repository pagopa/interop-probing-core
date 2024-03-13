import { AxiosError, AxiosRequestHeaders } from "axios";
import { Problem } from "pagopa-interop-probing-models";

export function mockOperationsApiClientError(error: Problem): AxiosError {
  const mockProblemAxiosError = new AxiosError(error.title);
  mockProblemAxiosError.response = {
    status: error.status,
    statusText: error.title,
    headers: {},
    config: {
      headers: {} as AxiosRequestHeaders,
    },
    data: error,
  };
  return mockProblemAxiosError;
}

export function nowDateUTC(
  hour: number,
  minute: number,
  seconds: number = 0
): string {
  const utcDate: Date = new Date();

  utcDate.setUTCHours(hour);
  utcDate.setUTCMinutes(minute);
  utcDate.setUTCSeconds(seconds);

  return utcDate.toISOString().slice(11, 19);
}
