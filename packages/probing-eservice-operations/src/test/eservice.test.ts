/* eslint-disable functional/no-let */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ModelRepository,
  EserviceProbingResponseEntities,
  EserviceViewEntities,
} from "../repositories/modelRepository.js";
import {
  EService,
  EServiceMainData,
  EServiceProbingData,
  eserviceInteropState,
  eserviceMonitorState,
  responseStatus,
  technology,
} from "pagopa-interop-probing-models";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { config } from "../utilities/config.js";
import {
  EserviceService,
  eServiceServiceBuilder,
} from "../services/eserviceService.js";
import { addOneEService, getMockEService } from "./utils.js";
import {
  EserviceQuery,
  eserviceQueryBuilder,
} from "../services/db/eserviceQuery.js";
import {
  EServiceProducersQueryFilters,
  EServiceQueryFilters,
  ModelService,
  modelServiceBuilder,
} from "../services/db/dbService.js";
import {
  EServiceEntities,
  EserviceProbingRequestEntities,
} from "../repositories/modelRepository.js";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceNotFound,
  eServiceProbingDataByRecordIdNotFound,
} from "../model/domain/errors.js";
import { v4 as uuidv4 } from "uuid";

const mockEService = getMockEService();

describe("database test", async () => {
  let eservices: EServiceEntities;
  let eserviceProbingRequest: EserviceProbingRequestEntities;
  let eserviceProbingResponse: EserviceProbingResponseEntities;
  let eserviceView: EserviceViewEntities;

  let modelService: ModelService;
  let eserviceQuery: EserviceQuery;
  let eserviceService: EserviceService;

  beforeAll(async () => {
    const postgreSqlContainer = await new PostgreSqlContainer("postgres:14")
      .withUsername(config.dbUsername)
      .withPassword(config.dbPassword)
      .withDatabase(config.dbName)
      .withCopyFilesToContainer([
        {
          source: "../services/db/migration/V1_DDL.sql",
          target: "/docker-entrypoint-initdb.d/01-init.sql",
        },
      ])
      .withExposedPorts(5432)
      .start();

    config.dbPort = postgreSqlContainer.getMappedPort(5432);

    const modelRepository = ModelRepository.init(config);
    eservices = modelRepository.eservices;
    eserviceProbingRequest = modelRepository.eserviceProbingRequest;
    eserviceProbingResponse = modelRepository.eserviceProbingResponse;
    eserviceView = modelRepository.eserviceView;

    modelService = modelServiceBuilder(ModelRepository.init(config));
    eserviceQuery = eserviceQueryBuilder(modelService);
    eserviceService = eServiceServiceBuilder(eserviceQuery);
  });

  afterEach(async () => {
    await eservices.delete({});
    await eserviceProbingRequest.delete({});
    await eserviceProbingResponse.delete({});
    await eserviceView.delete({});
  });

  describe("Eservice service", () => {
    describe("updateEserviceState", () => {
      it("should update eService state correctly with new state", async () => {
        await eserviceService.updateEserviceState(
          mockEService.eserviceId,
          mockEService.versionId,
          {
            eServiceState: eserviceInteropState.inactive,
          }
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId: mockEService.eserviceId,
          versionId: mockEService.versionId,
        });

        expect(updatedEservice?.state).toBe(eserviceInteropState.inactive);
      });

      it("should throw eServiceNotFound if the eService doesn't exist", async () => {
        const eserviceId = uuidv4();
        const versionId = uuidv4();
        expect(
          await eserviceService.updateEserviceState(eserviceId, versionId, {
            eServiceState: eserviceInteropState.active,
          })
        ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
      });
    });

    describe("updateEserviceProbingState", () => {
      it("should activates the probing polling process for an eService", async () => {
        await eserviceService.updateEserviceProbingState(
          mockEService.eserviceId,
          mockEService.versionId,
          {
            probingEnabled: true,
          }
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId: mockEService.eserviceId,
          versionId: mockEService.versionId,
        });

        expect(updatedEservice?.probingEnabled).toBe(true);
      });

      it("should throw eServiceNotFound if the eService doesn't exist", async () => {
        const eserviceId = uuidv4();
        const versionId = uuidv4();
        expect(
          await eserviceService.updateEserviceProbingState(
            eserviceId,
            versionId,
            {
              probingEnabled: true,
            }
          )
        ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
      });
    });

    describe("updateEserviceFrequency", () => {
      it("should updates the frequency and the time interval of an eService's polling process", async () => {
        const payload = {
          frequency: 1,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        };

        await eserviceService.updateEserviceFrequency(
          mockEService.eserviceId,
          mockEService.versionId,
          {
            frequency: payload.frequency,
            startTime: payload.startTime,
            endTime: payload.endTime,
          }
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId: mockEService.eserviceId,
          versionId: mockEService.versionId,
        });

        expect(updatedEservice?.pollingFrequency).toBe(payload.frequency);
        expect(updatedEservice?.pollingStartTime).toBe(payload.startTime);
        expect(updatedEservice?.pollingEndTime).toBe(payload.endTime);
      });

      it("should throw eServiceNotFound if the eService doesn't exist", async () => {
        const eserviceId = uuidv4();
        const versionId = uuidv4();

        expect(
          await eserviceService.updateEserviceFrequency(eserviceId, versionId, {
            frequency: 1,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
          })
        ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
      });
    });

    describe("saveEservice", () => {
      it("should create or update the EService Version, with corresponding details", async () => {
        const payload = {
          name: "eService 002",
          producerName: "eService producer 002",
          state: eserviceInteropState.inactive,
          basePath: ["path-003"],
          technology: technology.rest,
          versionNumber: 3,
          audience: ["audience"],
        };

        await eserviceService.saveEservice(
          mockEService.eserviceId,
          mockEService.versionId,
          payload
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId: mockEService.eserviceId,
          versionId: mockEService.versionId,
        });

        expect(updatedEservice?.eserviceName).toBe(payload.name);
        expect(updatedEservice?.producerName).toBe(payload.producerName);
        expect(updatedEservice?.basePath).toBe(payload.basePath);
        expect(updatedEservice?.technology).toBe(payload.technology);
        expect(updatedEservice?.versionNumber).toBe(payload.versionNumber);
        expect(updatedEservice?.audience).toBe(payload.audience);
      });
    });

    describe("updateEserviceLastRequest", () => {
      it("should update last request of the eService", async () => {
        const payload = {
          lastRequest: new Date().toISOString(),
        };

        await eserviceService.updateEserviceLastRequest(
          mockEService.eserviceRecordId,
          payload
        );

        const updatedEservice = await eserviceProbingRequest.findOneBy({
          eserviceRecordId: mockEService.eserviceRecordId,
        });

        expect(updatedEservice?.lastRequest).toBe(payload.lastRequest);
      });
    });

    describe("updateResponseReceived", () => {
      it("should response received of the eService", async () => {
        const payload = {
          status: responseStatus.ok,
          responseReceived: new Date().toISOString(),
        };

        await eserviceService.updateResponseReceived(
          mockEService.eserviceRecordId,
          payload
        );

        const updatedEservice = await eserviceProbingResponse.findOneBy({
          eserviceRecordId: mockEService.eserviceRecordId,
        });

        expect(updatedEservice?.responseStatus).toBe(payload.status);
        expect(updatedEservice?.responseReceived).toBe(
          payload.responseReceived
        );
      });
    });

    describe("getEservices", () => {
      it("should get eServices based on the given parameters", async () => {
        const eService1: EServiceQueryFilters = {
          eserviceName: "eService 001",
          producerName: "eService producer 001",
          versionNumber: 0,
          state: [eserviceMonitorState.online],
        };
        await addOneEService(
          {
            ...getMockEService(),
            eserviceName: "eService 001",
            producerName: "eService producer 001",
            versionNumber: 0,
            state: eserviceInteropState.active,
          } satisfies EService,
          eserviceView
        );

        const eService2: EServiceQueryFilters = {
          eserviceName: "eService 002",
          producerName: "eService producer 002",
          versionNumber: 0,
          state: [eserviceMonitorState.offline],
        };

        await addOneEService(
          {
            ...getMockEService(),
            eserviceName: "eService 002",
            producerName: "eService producer 002",
            versionNumber: 0,
            state: eserviceInteropState.active,
          } satisfies EService,
          eserviceView
        );

        const result1 = await eserviceService.getEservices(eService1, 0, 50);

        expect(result1.totalElements).toBe(1);
        expect(result1.offset).toBe(0);
        expect(result1.limit).toBe(50);
        expect(result1.content).toEqual([eService1]);

        const result2 = await eserviceService.getEservices(eService2, 0, 50);

        expect(result2.totalElements).toBe(1);
        expect(result2.offset).toBe(0);
        expect(result2.limit).toBe(50);
        expect(result2.content).toEqual([eService2]);
      });
    });

    describe("getEserviceMainData", () => {
      it("should get eServices main data", async () => {
        const result1 = await eserviceService.getEserviceMainData(
          mockEService.eserviceRecordId
        );
        expect(result1).toBeTruthy();
        expect(result1).toBe(EServiceMainData.parse(result1));
      });

      it("should throw eServiceMainDataByRecordIdNotFound if the eService doesn't exist", async () => {
        expect(
          await eserviceService.getEserviceMainData(99)
        ).rejects.toThrowError(eServiceMainDataByRecordIdNotFound(99));
      });
    });

    describe("getEserviceProbingData", () => {
      it("should get eServices probing data", async () => {
        const result1 = await eserviceService.getEserviceProbingData(
          mockEService.eserviceRecordId
        );
        expect(result1).toBeTruthy();
        expect(result1).toBe(EServiceProbingData.parse(result1));
      });

      it("should throw eServiceProbingDataByRecordIdNotFound if the eService doesn't exist", async () => {
        expect(
          await eserviceService.getEserviceMainData(99)
        ).rejects.toThrowError(eServiceProbingDataByRecordIdNotFound(99));
      });
    });

    describe("getEservicesReadyForPolling", () => {
      it("should get eServices ready for polling", async () => {
        const eServicesReadyForPolling =
          await eserviceService.getEservicesReadyForPolling(0, 1);

        expect(eServicesReadyForPolling.totalElements).toBe(2);
      });
    });

    describe("getEservicesProducers", () => {
      it("should get eServices producers", async () => {
        const eServiceProducer1: EServiceProducersQueryFilters = {
          producerName: "eService producer 001",
        };

        const producers = await eserviceService.getEservicesProducers(
          eServiceProducer1,
          0,
          1
        );

        expect(producers.content.length).toBe(1);
        expect(producers.content[0]).toEqual(["eService producer 001"]);
      });
    });
  });
});
