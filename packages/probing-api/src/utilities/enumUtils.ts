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
import { match } from "ts-pattern";

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
  const isStateND = checkNDCondition(
    probingEnabled,
    responseReceived,
    lastRequest,
    pollingFrequency,
  );
  const isStateOffline = checkOfflineCondition(responseStatus);

  return match(state)
    .with(eserviceInteropState.active, () =>
      match({ isStateND, isStateOffline })
        .with({ isStateND: true }, () => eserviceMonitorState["n_d"])
        .with({ isStateOffline: true }, () => eserviceMonitorState.offline)
        .otherwise(() => eserviceMonitorState.online),
    )
    .with(eserviceInteropState.inactive, () => eserviceMonitorState.offline)
    .exhaustive();
}

export function isActive(viewState: EserviceInteropState): boolean {
  return viewState === eserviceInteropState.active;
}

export function checkNDCondition(
  probingEnabled: boolean,
  responseReceived: string | null | undefined,
  lastRequest: string | null | undefined,
  pollingFrequency: number,
): boolean {
  return (
    !lastRequest ||
    !responseReceived ||
    !probingEnabled ||
    isBeenToLongRequest(
      lastRequest,
      pollingFrequency,
      config.minOfTolleranceMultiplier,
    ) ||
    isResponseReceivedBeforeLastRequest(responseReceived, lastRequest)
  );
}

export function checkOfflineCondition(
  status: EserviceStatus | null | undefined,
): boolean {
  return status === responseStatus.ko;
}

export function isResponseReceivedBeforeLastRequest(
  responseReceived: string,
  lastRequest: string,
): boolean {
  return new Date(responseReceived).getTime() < new Date(lastRequest).getTime();
}

export function isBeenToLongRequest(
  lastRequest: string,
  pollingFrequency: number,
  toleranceMultiplierInMinutes: number,
): boolean {
  const timeDifferenceMinutes: number =
    (new Date().getTime() - new Date(lastRequest).getTime()) / (1000 * 60);
  const toleranceThreshold: number =
    pollingFrequency * toleranceMultiplierInMinutes;

  return timeDifferenceMinutes > toleranceThreshold;
}
