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
  getEservice,
  addEservice,
  addEserviceProbingRequest,
  addEserviceProbingResponse,
  addTenant,
} from "./utils.js";
import {
  EserviceQuery,
  eserviceQueryBuilder,
} from "../src/services/db/eserviceQuery.js";
import {
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
  tenantNotFound,
} from "../src/model/domain/errors.js";
import { v4 as uuidv4 } from "uuid";
import {
  EserviceSchema,
  eServiceDefaultValues,
} from "../src/repositories/entity/eservice.entity.js";
import { EserviceProbingRequestSchema } from "../src/repositories/entity/eservice_probing_request.entity.js";
import { EserviceProbingResponseSchema } from "../src/repositories/entity/eservice_probing_response.entity.js";
import { z } from "zod";
import { nowDateUTC } from "../src/utilities/date.js";
import { resolve } from "path";
import {
  ApiGetProducersQuery,
  ApiSearchEservicesQuery,
} from "pagopa-interop-probing-eservice-operations-client";
import { genericLogger } from "pagopa-interop-probing-commons";

describe("database test", async () => {
  let eservices: EserviceEntities;
  let eserviceProbingRequest: EserviceProbingRequestEntities;
  let eserviceProbingResponse: EserviceProbingResponseEntities;

  let modelRepository: ModelRepository;
  let modelService: ModelService;
  let eserviceQuery: EserviceQuery;
  let eserviceService: EserviceService;

  interface DataOptions {
    disableCreationProbingRequest?: boolean;
    disableCreationProbingResponse?: boolean;
  }

  const createEservice = async ({
    options: dataOptions = {},
    eserviceData: partialEserviceData = {},
    probingRequestData: partialProbingRequestData = {},
    probingResponseData: partialProbingResponseData = {},
  }: {
    options?: DataOptions;
    eserviceData?: Partial<EserviceSchema>;
    probingRequestData?: Partial<EserviceProbingRequestSchema>;
    probingResponseData?: Partial<EserviceProbingResponseSchema>;
  } = {}): Promise<{
    eserviceRecordId: number;
    eserviceId: string;
    versionId: string;
  }> => {
    const eserviceRecordId = await addEservice(
      {
        eserviceName: "eService 001",
        producerName: "eService producer 001",
        versionNumber: 1,
        state: eserviceInteropState.inactive,
        basePath: ["path-1"],
        technology: technology.rest,
        audience: ["audience"],
        eserviceId: uuidv4(),
        versionId: uuidv4(),
        ...eServiceDefaultValues,
        ...partialEserviceData,
      } satisfies EserviceSchema,
      modelRepository.eservices,
    );

    if (!dataOptions.disableCreationProbingRequest) {
      await addEserviceProbingRequest(
        {
          eserviceRecordId,
          lastRequest: "2024-01-25T00:51:05.733Z",
          ...partialProbingRequestData,
        } satisfies EserviceProbingRequestSchema,
        modelRepository.eserviceProbingRequest,
      );
    }

    if (!dataOptions.disableCreationProbingResponse) {
      await addEserviceProbingResponse(
        {
          eserviceRecordId,
          responseStatus: responseStatus.ok,
          responseReceived: "2024-01-25T00:51:05.736Z",
          ...partialProbingResponseData,
        } satisfies EserviceProbingResponseSchema,
        modelRepository.eserviceProbingResponse,
      );
    }

    const { versionId, eserviceId } = await getEservice(
      eserviceRecordId,
      modelRepository.eserviceView,
    );

    return {
      eserviceRecordId,
      eserviceId,
      versionId,
    };
  };

  beforeAll(async () => {
    const postgreSqlContainer = await new PostgreSqlContainer("postgres:14")
      .withUsername(config.dbUsername)
      .withPassword(config.dbPassword)
      .withDatabase(config.dbName)
      .withExposedPorts(5432)
      .withCopyFilesToContainer([
        {
          source: resolve(__dirname, "init-db.sql"),
          target: "/docker-entrypoint-initdb.d/01-init.sql",
        },
      ])
      .start();

    config.dbPort = postgreSqlContainer.getMappedPort(5432);

    modelRepository = await ModelRepository.init(config);
    eservices = modelRepository.eservices;
    eserviceProbingRequest = modelRepository.eserviceProbingRequest;
    eserviceProbingResponse = modelRepository.eserviceProbingResponse;

    modelService = modelServiceBuilder(modelRepository);
    eserviceQuery = eserviceQueryBuilder(modelService);
    eserviceService = eServiceServiceBuilder(eserviceQuery);
  });

  afterEach(async () => {
    await eserviceProbingRequest.delete({});
    await eserviceProbingResponse.delete({});
    await eservices.delete({});
  });

  describe("Eservice service", () => {
    describe("searchEservices", () => {
      it("service returns searchEservices response object with content empty", async () => {
        const filters: ApiSearchEservicesQuery = {
          eserviceName: "eService 001",
          producerName: "eService producer 001",
          versionNumber: 1,
          state: [eserviceMonitorState.offline],
          limit: 2,
          offset: 0,
        };

        const result = await eserviceService.searchEservices(
          filters,
          genericLogger,
        );

        expect(result.content).toStrictEqual([]);
        expect(result.totalElements).toBe(0);
      });

      it("given a list of all state values as parameter, service returns searchEservices response object with content not empty", async () => {
        const eserviceData = {
          eserviceName: "eService 001",
          producerName: "eService producer 001",
        };
        await createEservice({ eserviceData });

        const filters: ApiSearchEservicesQuery = {
          ...eserviceData,
          versionNumber: 1,
          state: [
            eserviceMonitorState["n_d"],
            eserviceMonitorState.offline,
            eserviceMonitorState.online,
          ],
          limit: 2,
          offset: 0,
        };

        const result = await eserviceService.searchEservices(
          filters,
          genericLogger,
        );
        expect(result.totalElements).not.toBe(0);
        expect(result.offset).toBe(0);
        expect(result.limit).toBe(2);
        expect(result.content[0].state).toBe(eserviceInteropState.inactive);
      });

      it("given status n_d as parameter, service returns searchEservices response object with content empty", async () => {
        const eserviceData = {
          eserviceName: "eService 001",
          producerName: "eService producer 001",
        };
        await createEservice({ eserviceData });

        const filters: ApiSearchEservicesQuery = {
          ...eserviceData,
          versionNumber: 2,
          state: [eserviceMonitorState["n_d"]],
          limit: 2,
          offset: 0,
        };

        const result = await eserviceService.searchEservices(
          filters,
          genericLogger,
        );

        expect(result.content).toStrictEqual([]);
        expect(result.totalElements).toBe(0);
      });

      it("given status offline as parameter, service returns searchEservices response object with content not empty", async () => {
        const eserviceData = {
          eserviceName: "eService 001",
          producerName: "eService producer 001",
        };
        await createEservice({ eserviceData });

        const filters: ApiSearchEservicesQuery = {
          ...eserviceData,
          versionNumber: 1,
          state: [eserviceMonitorState.offline],
          limit: 2,
          offset: 0,
        };

        const result = await eserviceService.searchEservices(
          filters,
          genericLogger,
        );

        expect(result.totalElements).toBe(1);
        expect(result.offset).toBe(0);
        expect(result.limit).toBe(2);
        expect(result.content[0].state).toBe(eserviceInteropState.inactive);
      });
    });

    describe("getEserviceMainData", () => {
      it("e-service main data has been retrieved and MainDataEserviceResponse is created", async () => {
        const eservice = await createEservice();
        const result = await eserviceService.getEserviceMainData(
          eservice.eserviceRecordId,
          genericLogger,
        );
        expect(result).toBeTruthy();
      });

      it("e-service should not be found and an `eServiceProbingDataByRecordIdNotFound` should be thrown", async () => {
        await expect(
          async () =>
            await eserviceService.getEserviceMainData(99, genericLogger),
        ).rejects.toThrowError(eServiceMainDataByRecordIdNotFound(99));
      });
    });

    describe("getEserviceProbingData", () => {
      it("e-service probing data has been retrieved and MainDataEserviceResponse is created", async () => {
        const eservice = await createEservice();
        const result = await eserviceService.getEserviceProbingData(
          eservice.eserviceRecordId,
          genericLogger,
        );
        expect(result).toBeTruthy();
      });

      it("e-service should not be found and an `eServiceProbingDataByRecordIdNotFound` should be thrown", async () => {
        await expect(
          async () =>
            await eserviceService.getEserviceProbingData(99, genericLogger),
        ).rejects.toThrowError(eServiceProbingDataByRecordIdNotFound(99));
      });
    });

    describe("getEservicesReadyForPolling", () => {
      it("service returns getEservicesReadyForPolling response object with content not empty", async () => {
        const eserviceData = {
          eserviceName: "eService 001",
          producerName: "eService producer 001",
          probingEnabled: true,
        };
        await createEservice({ eserviceData });
        await createEservice({
          eserviceData: { ...eserviceData, state: eserviceInteropState.active },
        });
        const result = await eserviceService.getEservicesReadyForPolling(
          {
            offset: 0,
            limit: 2,
          },
          genericLogger,
        );

        expect(result.content.length).toBe(1);
        expect(result.totalElements).toBe(1);
      });
    });

    describe("getEservicesProducers", () => {
      it("given a valid producer name with no matching records, then returns an empty list", async () => {
        const filters: ApiGetProducersQuery = {
          producerName: "no matching records eService producer",
          limit: 1,
          offset: 0,
        };
        await createEservice();
        const producers = await eserviceService.getEservicesProducers(
          filters,
          genericLogger,
        );

        expect(producers.content.length).toBe(0);
      });

      it("given specific valid producer name, then returns a non-empty list", async () => {
        const filters: ApiGetProducersQuery = {
          producerName: "eService producer 001",
          limit: 10,
          offset: 0,
        };
        await createEservice();
        const result = await eserviceService.getEservicesProducers(
          filters,
          genericLogger,
        );

        expect(result.content.length).not.toBe(0);
        expect(result.content).toContain(filters.producerName);
      });

      it("given partial producerName as parameter, service returns list of 1 producers", async () => {
        const eServiceProducer1: ApiGetProducersQuery = {
          producerName: "eService producer",
          limit: 2,
          offset: 0,
        };
        await createEservice();
        await createEservice();
        const producers = await eserviceService.getEservicesProducers(
          eServiceProducer1,
          genericLogger,
        );

        expect(producers.content.length).toBe(1);
      });
    });

    describe("updateEserviceState", () => {
      it("e-service state correctly updated with new state", async () => {
        const { eserviceId, versionId } = await createEservice({
          eserviceData: { state: eserviceInteropState.active },
        });
        await eserviceService.updateEserviceState(
          eserviceId,
          versionId,
          {
            eServiceState: eserviceInteropState.inactive,
          },
          genericLogger,
        );

        const result = await eservices.findOneBy({
          eserviceId,
          versionId,
        });

        expect(result?.state).toBe(eserviceInteropState.inactive);
      });

      it("e-service should not be found and an `eServiceNotFound` should be thrown", async () => {
        const eserviceId = uuidv4();
        const versionId = uuidv4();
        await expect(
          async () =>
            await eserviceService.updateEserviceState(
              eserviceId,
              versionId,
              {
                eServiceState: eserviceInteropState.active,
              },
              genericLogger,
            ),
        ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
      });
    });

    describe("updateEserviceProbingState", () => {
      it("e-service probing gets enabled", async () => {
        const { eserviceId, versionId } = await createEservice({
          eserviceData: { probingEnabled: false },
        });

        await eserviceService.updateEserviceProbingState(
          eserviceId,
          versionId,
          {
            probingEnabled: true,
          },
          genericLogger,
        );

        const result = await eservices.findOneBy({
          eserviceId,
          versionId,
        });

        expect(result?.probingEnabled).toBe(true);
      });

      it("e-service should not be found and an `eServiceNotFound` should be thrown", async () => {
        const eserviceId = uuidv4();
        const versionId = uuidv4();

        await expect(
          async () =>
            await eserviceService.updateEserviceProbingState(
              eserviceId,
              versionId,
              {
                probingEnabled: true,
              },
              genericLogger,
            ),
        ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
      });
    });

    describe("updateEserviceFrequency", () => {
      it("e-service frequency correctly updated with new state", async () => {
        const { eserviceId, versionId } = await createEservice();

        const payload = {
          frequency: 10,
          startTime: nowDateUTC(8, 0),
          endTime: nowDateUTC(8, 0),
        };

        await eserviceService.updateEserviceFrequency(
          eserviceId,
          versionId,
          {
            frequency: payload.frequency,
            startTime: payload.startTime,
            endTime: payload.endTime,
          },
          genericLogger,
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId,
          versionId,
        });

        expect(updatedEservice?.pollingFrequency).toBe(payload.frequency);
        expect(updatedEservice?.pollingStartTime).toBeTruthy();
        expect(updatedEservice?.pollingEndTime).toBeTruthy();
      });

      it("e-service should not be found and an `eServiceNotFound` should be thrown", async () => {
        const eserviceId = uuidv4();
        const versionId = uuidv4();

        const payload = {
          frequency: 10,
          startTime: nowDateUTC(8, 0),
          endTime: nowDateUTC(8, 0),
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
              },
              genericLogger,
            ),
        ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
      });
    });

    describe("saveEservice", () => {
      it("e-service to save when no eservice was found", async () => {
        // TODO: must be a payload of tenant, to be fixed with addTenant implementation
        const tenantPayload = {
          eserviceName: "eService 001",
          eserviceId: uuidv4(),
          versionId: uuidv4(),
          producerName: "eService producer 001",
          versionNumber: 1,
          state: eserviceInteropState.inactive,
          basePath: ["path-1"],
          technology: technology.rest,
          audience: ["audience"],
          ...eServiceDefaultValues,
        };

        await addTenant(tenantPayload, modelRepository.eservices);

        const payload = {
          name: "eService 004",
          producerId: tenantPayload.eserviceId,
          eserviceId: uuidv4(),
          versionId: tenantPayload.versionId, // TODO: must be autogenerated after fixing addTenant
          state: eserviceInteropState.inactive,
          basePath: ["path-004"],
          technology: technology.rest,
          versionNumber: 1,
          audience: ["audience"],
        };

        await eserviceService.saveEservice(
          payload.eserviceId,
          payload.versionId,
          payload,
          genericLogger,
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId: payload.eserviceId,
          versionId: payload.versionId,
        });

        expect(updatedEservice?.eserviceId).toBe(payload.eserviceId);
        expect(updatedEservice?.eserviceName).toBe(payload.name);
        expect(updatedEservice?.basePath).toStrictEqual(payload.basePath);
        expect(updatedEservice?.technology).toBe(payload.technology);
        expect(updatedEservice?.versionNumber).toBe(payload.versionNumber);
        expect(updatedEservice?.audience).toStrictEqual(payload.audience);
      });

      it("e-service correctly updated", async () => {
        // TODO: add a tenant/producer with await addTenant

        const { eserviceId, versionId } = await createEservice();

        const payload = {
          name: "eService 004",
          producerId: eserviceId, // TODO: to fix
          state: eserviceInteropState.inactive,
          basePath: ["path-004"],
          technology: technology.rest,
          versionNumber: 5,
          audience: ["audience updated"],
        };

        await eserviceService.saveEservice(
          eserviceId,
          versionId,
          payload,
          genericLogger,
        );

        const updatedEservice = await eservices.findOneBy({
          eserviceId,
          versionId,
        });

        expect(updatedEservice?.versionNumber).toBe(payload.versionNumber);
        expect(updatedEservice?.audience).toStrictEqual(payload.audience);
      });

      it("e-service should not be saved and `tenantNotFound` should be thrown", async () => {
        const payload = {
          name: "eService 004",
          eserviceId: uuidv4(),
          versionId: uuidv4(),
          producerId: uuidv4(),
          state: eserviceInteropState.inactive,
          basePath: ["path-004"],
          technology: technology.rest,
          versionNumber: 5,
          audience: ["audience updated"],
        };

        await expect(
          async () =>
            await eserviceService.saveEservice(
              payload.eserviceId,
              payload.versionId,
              payload,
              genericLogger,
            ),
        ).rejects.toThrowError(tenantNotFound(payload.producerId));
      });
    });

    /* describe("deleteEservice", () => {
      it("should delete an eservice successfully", async () => {
        const { eserviceId } = await createEservice();

        await eserviceService.deleteEservice({ eserviceId }, genericLogger);

        const result = await eservices.findOneBy({
          eserviceId,
        });
        expect(result).toBe(null);
      });
    });
    */

    describe("updateEserviceLastRequest", () => {
      it("e-service last request has correctly updated", async () => {
        const { eserviceRecordId } = await createEservice();

        const payload = {
          lastRequest: new Date().toISOString(),
        };

        await eserviceService.updateEserviceLastRequest(
          eserviceRecordId,
          payload,
          genericLogger,
        );

        const updatedEservice = await eserviceProbingRequest.findOneBy({
          eserviceRecordId,
        });

        const schema = z.object({
          lastRequest: z.date().transform((date) => date.toISOString()),
        });

        const result = schema.parse(updatedEservice);

        expect(result?.lastRequest).toBe(payload.lastRequest);
      });

      it("e-service probing request has been created", async () => {
        const { eserviceRecordId } = await createEservice({
          options: { disableCreationProbingRequest: true },
        });

        const payload = {
          lastRequest: new Date().toISOString(),
        };

        await eserviceService.updateEserviceLastRequest(
          eserviceRecordId,
          payload,
          genericLogger,
        );

        const updatedEservice = await eserviceProbingRequest.findOneBy({
          eserviceRecordId,
        });

        const schema = z.object({
          lastRequest: z.date().transform((date) => date.toISOString()),
        });

        const result = schema.parse(updatedEservice);

        expect(result?.lastRequest).toBe(payload.lastRequest);
      });
    });

    describe("updateResponseReceived", () => {
      it("e-service reponse received has correctly updated", async () => {
        const { eserviceRecordId } = await createEservice();

        const payload = {
          status: responseStatus.ok,
          responseReceived: new Date().toISOString(),
        };

        await eserviceService.updateResponseReceived(
          eserviceRecordId,
          payload,
          genericLogger,
        );

        const updatedEservice = await eserviceProbingResponse.findOneBy({
          eserviceRecordId,
        });

        const schema = z.object({
          responseReceived: z.date().transform((date) => date.toISOString()),
          responseStatus: EserviceStatus,
        });

        const result = schema.parse(updatedEservice);

        expect(result?.responseStatus).toBe(payload.status);
        expect(result?.responseReceived).toBe(payload.responseReceived);
      });

      it("e-service probing response object has been created", async () => {
        const { eserviceRecordId } = await createEservice({
          options: { disableCreationProbingResponse: true },
        });

        const payload = {
          status: responseStatus.ok,
          responseReceived: new Date().toISOString(),
        };

        await eserviceService.updateResponseReceived(
          eserviceRecordId,
          payload,
          genericLogger,
        );

        const updatedEservice = await eserviceProbingResponse.findOneBy({
          eserviceRecordId,
        });

        const schema = z.object({
          responseReceived: z.date().transform((date) => date.toISOString()),
          responseStatus: EserviceStatus,
        });

        const result = schema.parse(updatedEservice);

        expect(result?.responseStatus).toBe(payload.status);
        expect(result?.responseReceived).toBe(payload.responseReceived);
      });

      it("given a list of all state values as parameter, service returns searchEservices without probing data", async () => {
        const eserviceData = {
          eserviceName: "eService 001",
          producerName: "eService producer 001",
        };
        await createEservice({
          options: {
            disableCreationProbingResponse: true,
            disableCreationProbingRequest: true,
          },
        });

        const filters: ApiSearchEservicesQuery = {
          ...eserviceData,
          versionNumber: 1,
          state: [
            eserviceMonitorState["n_d"],
            eserviceMonitorState.offline,
            eserviceMonitorState.online,
          ],
          limit: 2,
          offset: 0,
        };

        const result = await eserviceService.searchEservices(
          filters,
          genericLogger,
        );
        expect(result.totalElements).not.toBe(0);
        expect(result.offset).toBe(0);
        expect(result.limit).toBe(2);
        expect(result.content[0].state).toBe(eserviceInteropState.inactive);
      });
    });
  });
});
