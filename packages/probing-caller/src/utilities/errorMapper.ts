import { AxiosError } from "axios";
import { callerConstants } from "../utilities/constants.js";
import { match } from "ts-pattern";

export function getKoReason(error: unknown): string {
  return match((error as AxiosError).code)
    .with("ECONNREFUSED", () => callerConstants.CONNECTION_REFUSED_KO_REASON)
    .with("ETIMEDOUT", () => callerConstants.CONNECTION_TIMEOUT_KO_REASON)
    .otherwise(() => {
      const status = (error as AxiosError).response?.status;
      return status ? `${status}` : callerConstants.UNKNOWN_KO_REASON;
    });
}
