import { AxiosError, AxiosRequestHeaders, AxiosResponse } from "axios";

export function mockApiClientError(
  status: number,
  statusText: string,
  errorCode?: string
): AxiosError {
  const mockAxiosError = new Error(statusText) as AxiosError;
  mockAxiosError.code = errorCode || "EUNKNOWN";
  mockAxiosError.response = {
    status: status,
    statusText: statusText,
    headers: {},
    config: {
      headers: {} as AxiosRequestHeaders,
    },
    data: {},
  };
  return mockAxiosError;
}

export function mockApiClientResponse<T>(
  data: T,
  status: number = 200,
  statusText: string = "OK"
): AxiosResponse<T> {
  return {
    data: data,
    status: status,
    statusText: statusText,
    headers: {} as AxiosRequestHeaders,
    config: {
      headers: {} as AxiosRequestHeaders,
    },
  };
}

export const mockJWT =
  `eyJ0eXAiOiJhdCtqd3QiLCJ1c2UiOiJzaWciLCJhbGciOiJSU0FTU0FfUEtDUzFfVjFfNV9TSEFfMjU2Iiwia2lkIjoiNWFjNGQxZTktZmIwMi00YjIzLWExZjItZWFiMWFmZDExOWJiIn0=
.eyJhdWQiOlsiYXVkMSIsInBhdGgyIl0sInN1YiI6InByb2JpbmctY2FsbGVyLXN1YmplY3QiLCJuYmYiOjE3MDkyMDIyMjAsImlzcyI6InByb2JpbmctY2FsbGVyLWlzc3VlciIsImV4cCI6MTcwOTIwMjIyMSwiaWF0IjoxNzA5MjAyMjIwLCJqdGkiOiIxNjRiNzYyZC0zZGJlLTQ3YjAtYjRhZS0zNjI5ZjQ4ZjFhYmUifQ=
.WDZ90kegXDn4uUzto2c9IplnKYQC6I7CkYCauT82Dk1rv7GeNq2HYwgi0GbeOVyDBdVCLJduMcmC7Pnf9H4IYb+PFBqleRjosOX0AvxfWnf7jcwMhrg9QP9+BBBBBJBFKTtm+dol9jdETd70iaQtoamEzYC4SEoXae+eOZtA28b6aWOZGJBnSg4nqhrBC6wJhKv5JgQFTNxdVaMH7x4y7zExOaDqlTWvVs1fXN2vSNDIFhUfR0k3I0gP+D0M/kKKXD6zrsrukqc4z7XxOq/kOQgzp1rnciU2hClO6ZBBU+VROVj8o1suDSLdxPYmc0UTCvGdJe6JyHMS/hsvwb/JwQ==` as const;
