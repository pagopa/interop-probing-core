/* eslint-disable functional/no-let */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ModelRepository,
  EserviceProbingResponseEntities,
} from "../src/repositories/modelRepository.js";
import {
  EserviceStatus,
  eserviceInteropState,
  eserviceMonitorState,
  responseStatus,
  technology,
} from "pagopa-interop-probing-models";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { config } from "../src/utilities/config.js";
import {
  EserviceService,
  eServiceServiceBuilder,
} from "../src/services/eserviceService.js";
import {
  addEservice,
  addEserviceProbingRequest,
  addEserviceProbingResponse,
} from "./utils.js";
import {
  EserviceQuery,
  eserviceQueryBuilder,
} from "../src/services/db/eserviceQuery.js";
import {
  EServiceProducersQueryFilters,
  EServiceQueryFilters,
  ModelService,
  modelServiceBuilder,
} from "../src/services/db/dbService.js";
import {
  EserviceEntities,
  EserviceProbingRequestEntities,
} from "../src/repositories/modelRepository.js";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceNotFound,
  eServiceProbingDataByRecordIdNotFound,
} from "../src/model/domain/errors.js";
import { v4 as uuidv4 } from "uuid";
import { EserviceSchema } from "../src/repositories/entity/eservice.entity.js";
import moment from "moment-timezone";
import { EserviceProbingRequestSchema } from "../src/repositories/entity/eservice_probing_request.entity.js";
import { EserviceProbingResponseSchema } from "../src/repositories/entity/eservice_probing_response.entity.js";
import { z } from "zod";

describe("database test", async () => {
  let eservices: EserviceEntities;
  let eserviceProbingRequest: EserviceProbingRequestEntities;
  let eserviceProbingResponse: EserviceProbingResponseEntities;

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

    const modelRepository = await ModelRepository.init(config);
    eservices = modelRepository.eservices;
    eserviceProbingRequest = modelRepository.eserviceProbingRequest;
    eserviceProbingResponse = modelRepository.eserviceProbingResponse;

    modelService = modelServiceBuilder(modelRepository);
    eserviceQuery = eserviceQueryBuilder(modelService);
    eserviceService = eServiceServiceBuilder(eserviceQuery);
  });

  afterEach(async () => {
    // TODO: Adjust the creation data set and cleanup logic as needed for single test
    // Clean up eService setup for each individual eservice test
    // This is important to avoid blocking any single test with leftover data
    // await eservices.delete({});
    // await eserviceProbingRequest.delete({});
    // await eserviceProbingResponse.delete({});
  });

  describe("Eservice service", () => {
    describe("eService setup", () => {
      it("should create 2 eservices", async () => {
        const eservice1 = await addEservice(
          {
            eserviceName: "eService 001",
            producerName: "eService producer 001",
            versionNumber: 0,
            state: eserviceInteropState.active,
            pollingStartTime: moment()
              .tz("UTC")
              .set({ hour: 8, minute: 0 })
              .format("HH:mm:ss"),
            pollingEndTime: moment()
              .tz("UTC")
              .set({ hour: 20, minute: 0 })
              .format("HH:mm:ss"),
            basePath: ["test-1"],
            technology: technology.rest,
            pollingFrequency: 5,
            probingEnabled: false,
            audience: ["string"],
            eserviceId: "10ba038e-48da-487b-96e8-8d3b99b6d18a",
            versionId: "98a66bf7-78b3-4b1d-9b34-df327578907c",
            lockVersion: 1,
          } satisfies EserviceSchema,
          eservices
        );

        const eservice2 = await addEservice(
          {
            eserviceName: "eService 002",
            producerName: "eService producer 002",
            versionNumber: 0,
            state: eserviceInteropState.inactive,
            pollingStartTime: moment()
              .tz("UTC")
              .set({ hour: 8, minute: 0 })
              .format("HH:mm:ss"),
            pollingEndTime: moment()
              .tz("UTC")
              .set({ hour: 20, minute: 0 })
              .format("HH:mm:ss"),
            basePath: ["test-1"],
            technology: technology.rest,
            pollingFrequency: 7,
            probingEnabled: false,
            audience: ["string"],
            eserviceId: "c0c4bead-4459-412e-9155-bc5f1e9170ca",
            versionId: "9228ade2-b7fe-46ea-9b1d-95ee9548b39b",
            lockVersion: 1,
          } satisfies EserviceSchema,
          eservices
        );
        expect(eservice1.id).toBe("1");
        expect(eservice2.id).toBe("2");
      });

      it("should create 2 eservices probing request", async () => {
        const eservice1ProbingRequest = await addEserviceProbingRequest(
          {
            eserviceRecordId: 1,
            lastRequest: "2024-01-25T00:51:05.733Z",
          } satisfies EserviceProbingRequestSchema,
          eserviceProbingRequest
        );

        const eservice2ProbingRequest = await addEserviceProbingRequest(
          {
            eserviceRecordId: 2,
            lastRequest: "2024-01-26T00:51:05.733Z",
          } satisfies EserviceProbingRequestSchema,
          eserviceProbingRequest
        );

        expect(eservice1ProbingRequest.length).toBe(1);
        expect(eservice2ProbingRequest.length).toBe(1);
      });

      it("should create 2 eservices probing response", async () => {
        const eservice1ProbingResponse = await addEserviceProbingResponse(
          {
            eserviceRecordId: 1,
            responseStatus: responseStatus.ok,
            responseReceived: "2024-01-25T00:51:05.736Z",
          } satisfies EserviceProbingResponseSchema,
          eserviceProbingResponse
        );

        const eservice2ProbingResponse = await addEserviceProbingResponse(
          {
            eserviceRecordId: 2,
            responseStatus: responseStatus.ko,
            responseReceived: "2024-01-26T00:51:05.736Z",
          } satisfies EserviceProbingResponseSchema,
          eserviceProbingResponse
        );

        expect(eservice1ProbingResponse.length).toBe(1);
        expect(eservice2ProbingResponse.length).toBe(1);
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

        const eService2: EServiceQueryFilters = {
          eserviceName: "eService 002",
          producerName: "eService producer 002",
          versionNumber: 0,
          state: [eserviceMonitorState.offline],
        };

        const result1 = await eserviceService.getEservices(eService1, 50, 0);

        expect(result1.totalElements).toBe(1);
        expect(result1.offset).toBe(0);
        expect(result1.limit).toBe(50);
        expect(result1.content[0].eserviceName).toBe(eService1.eserviceName);
        expect(result1.content[0].producerName).toBe(eService1.producerName);
        expect(result1.content[0].versionNumber).toBe(eService1.versionNumber);
        expect(result1.content[0].state).toBe(eserviceInteropState.active);

        const result2 = await eserviceService.getEservices(eService2, 50, 0);

        expect(result2.totalElements).toBe(1);
        expect(result2.offset).toBe(0);
        expect(result2.limit).toBe(50);
        expect(result2.content[0].eserviceName).toBe(eService2.eserviceName);
        expect(result2.content[0].producerName).toBe(eService2.producerName);
        expect(result2.content[0].versionNumber).toBe(eService2.versionNumber);
        expect(result2.content[0].state).toBe(eserviceInteropState.inactive);
      });
    });

    describe("getEserviceMainData", () => {
      it("should get eServices main data", async () => {
        const result1 = await eserviceService.getEserviceMainData(1);
        expect(result1).toBeTruthy();
      });

      it("should throw eServiceMainDataByRecordIdNotFound if the eService doesn't exist", async () => {
        await expect(
          async () => await eserviceService.getEserviceMainData(99)
        ).rejects.toThrowError(eServiceMainDataByRecordIdNotFound(99));
      });
    });

    describe("getEserviceProbingData", () => {
      it("should get eServices probing data", async () => {
        const result1 = await eserviceService.getEserviceProbingData(1);
        expect(result1).toBeTruthy();
      });

      it("should throw eServiceProbingDataByRecordIdNotFound if the eService doesn't exist", async () => {
        await expect(
          async () => await eserviceService.getEserviceProbingData(99)
        ).rejects.toThrowError(eServiceProbingDataByRecordIdNotFound(99));
      });
    });

    describe("getEservicesReadyForPolling", () => {
      it("should get eServices ready for polling", async () => {
        const eServicesReadyForPolling =
          await eserviceService.getEservicesReadyForPolling(0, 2);

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
          1,
          0
        );

        expect(producers.content.length).toBe(1);
        expect(producers.content).toEqual(["eService producer 001"]);
      });
    });

    describe("updateEserviceState", () => {
      it("should update eService state correctly with new state", async () => {
        await eserviceService.updateEserviceState(
          "10ba038e-48da-487b-96e8-8d3b99b6d18a",
          "98a66bf7-78b3-4b1d-9b34-df327578907c",
          {
            eServiceState: eserviceInteropState.inactive,
          }
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId: "10ba038e-48da-487b-96e8-8d3b99b6d18a",
          versionId: "98a66bf7-78b3-4b1d-9b34-df327578907c",
        });

        expect(updatedEservice?.state).toBe(eserviceInteropState.inactive);
      });

      it("should throw eServiceNotFound if the eService doesn't exist", async () => {
        const eserviceId = uuidv4();
        const versionId = uuidv4();
        await expect(
          async () =>
            await eserviceService.updateEserviceState(eserviceId, versionId, {
              eServiceState: eserviceInteropState.active,
            })
        ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
      });
    });

    describe("updateEserviceProbingState", () => {
      it("should activates the probing polling process for an eService", async () => {
        await eserviceService.updateEserviceProbingState(
          "10ba038e-48da-487b-96e8-8d3b99b6d18a",
          "98a66bf7-78b3-4b1d-9b34-df327578907c",
          {
            probingEnabled: true,
          }
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId: "10ba038e-48da-487b-96e8-8d3b99b6d18a",
          versionId: "98a66bf7-78b3-4b1d-9b34-df327578907c",
        });

        expect(updatedEservice?.probingEnabled).toBe(true);
      });

      it("should throw eServiceNotFound if the eService doesn't exist", async () => {
        const eserviceId = uuidv4();
        const versionId = uuidv4();
        await expect(
          async () =>
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
          frequency: 10,
          startTime: moment()
            .tz("UTC")
            .set({ hour: 8, minute: 0 })
            .format("HH:mm:ss"),
          endTime: moment()
            .tz("UTC")
            .set({ hour: 8, minute: 0 })
            .format("HH:mm:ss"),
        };

        await eserviceService.updateEserviceFrequency(
          "10ba038e-48da-487b-96e8-8d3b99b6d18a",
          "98a66bf7-78b3-4b1d-9b34-df327578907c",
          {
            frequency: payload.frequency,
            startTime: payload.startTime,
            endTime: payload.endTime,
          }
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId: "10ba038e-48da-487b-96e8-8d3b99b6d18a",
          versionId: "98a66bf7-78b3-4b1d-9b34-df327578907c",
        });

        expect(updatedEservice?.pollingFrequency).toBe(payload.frequency);
        expect(updatedEservice?.pollingStartTime).toBeTruthy();
        expect(updatedEservice?.pollingEndTime).toBeTruthy();
      });

      it("should throw eServiceNotFound if the eService doesn't exist", async () => {
        const eserviceId = uuidv4();
        const versionId = uuidv4();

        const payload = {
          frequency: 10,
          startTime: moment()
            .tz("UTC")
            .set({ hour: 8, minute: 0 })
            .format("HH:mm:ss"),
          endTime: moment()
            .tz("UTC")
            .set({ hour: 8, minute: 0 })
            .format("HH:mm:ss"),
        };

        await expect(
          async () =>
            await eserviceService.updateEserviceFrequency(
              eserviceId,
              versionId,
              {
                frequency: payload.frequency,
                startTime: payload.startTime,
                endTime: payload.endTime,
              }
            )
        ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
      });
    });

    describe("saveEservice", () => {
      it("should create or update the EService Version, with corresponding details", async () => {
        const payload = {
          name: "eService 003",
          producerName: "eService producer 003",
          state: eserviceInteropState.inactive,
          basePath: ["path-003"],
          technology: technology.rest,
          versionNumber: 3,
          audience: ["audience"],
        };

        await eserviceService.saveEservice(
          "10ba038e-48da-487b-96e8-8d3b99b6d18a",
          "98a66bf7-78b3-4b1d-9b34-df327578907c",
          payload
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId: "10ba038e-48da-487b-96e8-8d3b99b6d18a",
          versionId: "98a66bf7-78b3-4b1d-9b34-df327578907c",
        });

        expect(updatedEservice?.eserviceName).toBe(payload.name);
        expect(updatedEservice?.producerName).toBe(payload.producerName);
        expect(updatedEservice?.basePath).toStrictEqual(payload.basePath);
        expect(updatedEservice?.technology).toBe(payload.technology);
        expect(updatedEservice?.versionNumber).toBe(payload.versionNumber);
        expect(updatedEservice?.audience).toStrictEqual(payload.audience);
      });
    });

    describe("updateEserviceLastRequest", () => {
      it("should update last request of the eService", async () => {
        const payload = {
          lastRequest: new Date().toISOString(),
        };

        await eserviceService.updateEserviceLastRequest(2, payload);

        const updatedEservice = await eserviceProbingRequest.findOneBy({
          eserviceRecordId: 2,
        });

        const schema = z.object({
          lastRequest: z.date().transform((date) => date.toISOString()),
        });

        const result = schema.parse(updatedEservice);

        expect(result?.lastRequest).toBe(payload.lastRequest);
      });
    });

    describe("updateResponseReceived", () => {
      it("should update response received of the eService", async () => {
        const payload = {
          status: responseStatus.ok,
          responseReceived: new Date().toISOString(),
        };

        await eserviceService.updateResponseReceived(2, payload);

        const updatedEservice = await eserviceProbingResponse.findOneBy({
          eserviceRecordId: 2,
        });

        const schema = z.object({
          responseReceived: z.date().transform((date) => date.toISOString()),
          responseStatus: EserviceStatus,
        });

        const result = schema.parse(updatedEservice);

        expect(result?.responseStatus).toBe(payload.status);
        expect(result?.responseReceived).toBe(payload.responseReceived);
      });
    });
  });
});
