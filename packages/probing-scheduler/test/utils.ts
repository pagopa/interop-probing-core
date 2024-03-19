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
