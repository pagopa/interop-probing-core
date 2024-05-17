import {
  EserviceInteropState,
  eserviceInteropState,
  eserviceMonitorState,
  responseStatus,
  EserviceStatus,
  EserviceMonitorState,
  EServiceContent,
  EServiceProbingData,
} from "pagopa-interop-probing-models";
import { config } from "./config.js";

const isBefore = (responseReceived: string, lastRequest: string): boolean =>
  new Date(responseReceived).getTime() < new Date(lastRequest).getTime();

const minutesDifferenceFromCurrentDate = (lastRequest: string): number =>
  (new Date().getTime() - new Date(lastRequest).getTime()) / (1000 * 60);

export function fromECToMonitorState(
  data: EServiceContent,
): EserviceMonitorState {
  return handleState(data);
}

export function fromEPDToMonitorState(
  data: EServiceProbingData,
): EserviceMonitorState {
  return handleState(data);
}

function handleState({
  state,
  probingEnabled,
  lastRequest,
  responseReceived,
  pollingFrequency,
  responseStatus,
}: {
  state: EserviceInteropState;
  probingEnabled: boolean;
  pollingFrequency: number;
  lastRequest?: string | null;
  responseReceived?: string | null;
  responseStatus?: EserviceStatus | null;
}): EserviceMonitorState {
  switch (state) {
    case eserviceInteropState.active:
      return checkND(
        probingEnabled,
        responseReceived,
        lastRequest,
        pollingFrequency,
      )
        ? eserviceMonitorState["n_d"]
        : checkOFFLINE(responseStatus)
          ? eserviceMonitorState.offline
          : eserviceMonitorState.online;
    case eserviceInteropState.inactive:
      return checkND(
        probingEnabled,
        responseReceived,
        lastRequest,
        pollingFrequency,
      )
        ? eserviceMonitorState["n_d"]
        : eserviceMonitorState.offline;
    default:
      throw new Error(`Invalid state ${state}`);
  }
}

export function isActive(viewState: EserviceInteropState): boolean {
  return viewState === eserviceInteropState.active;
}

export function checkND(
  probingEnabled: boolean,
  responseReceived: string | null | undefined,
  lastRequest: string | null | undefined,
  pollingFrequency: number,
): boolean {
  return (
    !probingEnabled ||
    !lastRequest ||
    (isBeenToLongRequest(
      lastRequest,
      pollingFrequency,
      config.minOfTolleranceMultiplier,
    ) &&
      isResponseReceivedBeforeLastRequest(responseReceived, lastRequest)) ||
    !responseReceived
  );
}

export function checkOFFLINE(
  status: EserviceStatus | null | undefined,
): boolean {
  return status === responseStatus.ko;
}

export function isResponseReceivedBeforeLastRequest(
  responseReceived: string | null | undefined,
  lastRequest: string | null | undefined,
): boolean {
  if (!responseReceived || !lastRequest) {
    return false;
  }

  return isBefore(responseReceived, lastRequest);
}

export function isBeenToLongRequest(
  lastRequest: string,
  pollingFrequency: number,
  toleranceMultiplierInMinutes: number,
): boolean {
  if (!pollingFrequency) {
    return false;
  }

  const timeDifferenceMinutes = minutesDifferenceFromCurrentDate(lastRequest);
  const toleranceThreshold = pollingFrequency * toleranceMultiplierInMinutes;

  return timeDifferenceMinutes > toleranceThreshold;
}
