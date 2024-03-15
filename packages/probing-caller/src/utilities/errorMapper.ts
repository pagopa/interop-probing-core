import { AxiosError } from "axios";
import { callerConstants } from "../utilities/constants.js";

export function getKoReason(error: unknown): string {
  switch ((error as AxiosError).code) {
    case "ECONNREFUSED":
      return callerConstants.CONNECTION_REFUSED_KO_REASON;
    case "ETIMEDOUT":
      return callerConstants.CONNECTION_TIMEOUT_KO_REASON;
    default:
      return callerConstants.UNKNOWN_KO_REASON;
  }
}
