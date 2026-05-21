import { nowDateUTC } from "pagopa-interop-probing-commons";

export const eServiceDefaultValues = {
  pollingStartTime: nowDateUTC(0, 0, 0),
  pollingEndTime: nowDateUTC(23, 59, 0),
  pollingFrequency: 5,
  probingEnabled: true,
  lockVersion: 1,
} as const;
