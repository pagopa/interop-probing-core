import {
  EserviceInteropState,
  eserviceInteropState,
  eserviceMonitorState,
  responseStatus,
  EserviceStatus,
} from "pagopa-interop-probing-models";
import { config } from "./config.js";

const isBefore = (responseReceived: string, lastRequest: string) => {
  return new Date(responseReceived).getTime() < new Date(lastRequest).getTime();
};

const minutesDifferenceFromCurrentDate = (lastRequest: string) => {
  return (new Date().getTime() - new Date(lastRequest).getTime()) / (1000 * 60);
};

export function fromPdndToMonitorState({
  responseStatus,
  state,
  probingEnabled,
  responseReceived,
  lastRequest,
  pollingFrequency,
}: {
  responseStatus: EserviceStatus;
  state: EserviceInteropState;
  probingEnabled: boolean;
  responseReceived: string;
  lastRequest: string;
  pollingFrequency: number;
}) {
  switch (state) {
    case eserviceInteropState.active:
      return checkND(
        probingEnabled,
        responseReceived,
        lastRequest,
        pollingFrequency
      )
        ? eserviceMonitorState["n/d"]
        : checkOFFLINE(responseStatus)
        ? eserviceMonitorState.offline
        : eserviceMonitorState.online;
    case eserviceInteropState.inactive:
      return checkND(
        probingEnabled,
        responseReceived,
        lastRequest,
        pollingFrequency
      )
        ? eserviceMonitorState["n/d"]
        : eserviceMonitorState.offline;
    default:
      throw new Error(`Invalid state ${state}`);
  }
}

export function isActive(viewState: EserviceInteropState) {
  return viewState === eserviceInteropState.active;
}

export function checkND(
  probingEnabled: boolean,
  responseReceived: string | undefined,
  lastRequest: string | undefined,
  pollingFrequency: number
) {
  return (
    !probingEnabled ||
    !lastRequest ||
    (isBeenToLongRequest(
      lastRequest,
      pollingFrequency,
      config.minOfTolleranceMultiplier
    ) &&
      isResponseReceivedBeforeLastRequest(responseReceived, lastRequest)) ||
    !responseReceived
  );
}

export function checkOFFLINE(status: EserviceStatus) {
  return status === responseStatus.ko;
}

export function isResponseReceivedBeforeLastRequest(
  responseReceived: string | undefined,
  lastRequest: string
) {
  const defaultDate = !responseReceived
    ? new Date(8640000000000000).toDateString()
    : responseReceived;

  return isBefore(defaultDate, lastRequest);
}

export function isBeenToLongRequest(
  lastRequest: string,
  pollingFrequency: number,
  toleranceMultiplierInMinutes: number
) {
  if (!pollingFrequency) return false;

  const timeDifferenceMinutes = minutesDifferenceFromCurrentDate(lastRequest);
  const toleranceThreshold = pollingFrequency * toleranceMultiplierInMinutes;

  return timeDifferenceMinutes > toleranceThreshold;
}
