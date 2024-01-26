import { EService, responseStatus, technology } from "pagopa-interop-probing-models";
import { v4 as uuidv4 } from "uuid";
import { EserviceViewEntities } from "../src/repositories/modelRepository.js";

export const getMockEService = (): EService => ({
  eserviceRecordId: 0,
  eserviceName: "eService 001",
  producerName: "eService producer 001",
  state: "ACTIVE",
  responseReceived: "2024-01-25T00:51:05.736Z",
  pollingStartTime: "2024-01-25T00:51:05.736Z",
  pollingEndTime: "2024-01-25T00:51:05.736Z",
  lastRequest: "2024-01-25T00:51:05.736Z",
  responseStatus: responseStatus.ok,
  versionNumber: 0,
  basePath: ["test-1"],
  technology: technology.rest,
  pollingFrequency: 0,
  probingEnabled: true,
  audience: ["string"],
  eserviceId: uuidv4(), 
  versionId: uuidv4()
});

export const addOneEService = async (
  eServiceData: EService,
  eservices: EserviceViewEntities
): Promise<void> => {
  const newEService = await eservices.create();
  Object.assign(newEService, {
    eServiceData
  });
  await eservices.save(newEService);
};