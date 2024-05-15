import { AxiosError, AxiosRequestHeaders } from "axios";

export function mockApiClientError(
  status: number,
  statusText: string,
  errorCode?: string,
): AxiosError {
  const mockAxiosError = new AxiosError(statusText);
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
