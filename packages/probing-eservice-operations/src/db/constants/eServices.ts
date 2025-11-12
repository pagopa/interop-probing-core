import { nowDateUTC } from "../../utilities/date.js";

export const eServiceDefaultValues = {
  pollingStartTime: nowDateUTC(0, 0, 0),
  pollingEndTime: nowDateUTC(23, 59, 0),
  pollingFrequency: 5,
  probingEnabled: true,
  lockVersion: 1,
} as const;
