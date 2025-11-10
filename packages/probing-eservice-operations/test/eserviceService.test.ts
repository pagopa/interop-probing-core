import { describe, expect, it } from "vitest";
import {
  eserviceInteropState,
  eserviceMonitorState,
  responseStatus,
  technology,
} from "pagopa-interop-probing-models";
import {
  getEservice,
  addEservice,
  addEserviceProbingRequest,
  addEserviceProbingResponse,
  addTenant,
  db,
  eserviceService,
} from "./utils.js";
import {
  eservicesInProbing,
  eserviceProbingRequestsInProbing,
  eserviceProbingResponsesInProbing,
} from "../src/db/drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceNotFound,
  eServiceProbingDataByRecordIdNotFound,
  tenantNotFound,
} from "../src/model/domain/errors.js";
import { v4 as uuidv4 } from "uuid";
import { nowDateUTC } from "../src/utilities/date.js";
import {
  ApiGetProducersQuery,
  ApiSearchEservicesQuery,
} from "pagopa-interop-probing-eservice-operations-client";
import { genericLogger } from "pagopa-interop-probing-commons";
import { eServiceDefaultValues } from "../src/db/constants/eServices.js";

describe("eService service", async () => {
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
    eserviceData?: Partial<Record<string, unknown>>;
    probingRequestData?: Partial<Record<string, unknown>>;
    probingResponseData?: Partial<Record<string, unknown>>;
  } = {}): Promise<{
    eserviceRecordId: number;
    eserviceId: string;
    versionId: string;
  }> => {
    const eserviceRecordId = await addEservice({
      eserviceName: "eService 001",
      producerName: "eService producer 001",
      versionNumber: 1,
      state: eserviceInteropState.inactive,
      basePath: ["path-1"],
      eserviceTechnology: technology.rest,
      audience: ["audience"],
      eserviceId: uuidv4(),
      versionId: uuidv4(),
      ...eServiceDefaultValues,
      ...partialEserviceData,
    });

    if (!dataOptions.disableCreationProbingRequest) {
      await addEserviceProbingRequest({
        eservicesRecordId: eserviceRecordId,
        lastRequest: "2024-01-25T00:51:05.733Z",
        ...partialProbingRequestData,
      });
    }

    if (!dataOptions.disableCreationProbingResponse) {
      await addEserviceProbingResponse({
        eservicesRecordId: eserviceRecordId,
        responseReceived: "2024-01-25T00:51:05.736Z",
        status: responseStatus.ok,
        ...partialProbingResponseData,
      });
    }

    const eserviceRow = await getEservice(eserviceRecordId);
    const versionId = eserviceRow.versionId!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const eserviceId = eserviceRow.eserviceId!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

    return {
      eserviceRecordId,
      eserviceId,
      versionId,
    };
  };

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
        eserviceService.getEserviceMainData(99, genericLogger),
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
        eserviceService.getEserviceProbingData(99, genericLogger),
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
      const producers = await eserviceService.getEservicesProducers(filters);

      expect(producers.content.length).toBe(0);
    });

    it("given specific valid producer name, then returns a non-empty list", async () => {
      const filters: ApiGetProducersQuery = {
        producerName: "eService producer 001",
        limit: 10,
        offset: 0,
      };
      await createEservice();
      const result = await eserviceService.getEservicesProducers(filters);

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
      const producers =
        await eserviceService.getEservicesProducers(eServiceProducer1);

      expect(producers.content.length).toBe(1);
    });
  });

  describe("updateEserviceState", () => {
    it("e-service state correctly updated with new state", async () => {
      const { eserviceId, versionId } = await createEservice({
        eserviceData: { state: eserviceInteropState.active },
      });
      await eserviceService.updateEserviceState(eserviceId, versionId, {
        eServiceState: eserviceInteropState.inactive,
      });

      const [result] = await db
        .select()
        .from(eservicesInProbing)
        .where(
          and(
            eq(eservicesInProbing.eserviceId, eserviceId),
            eq(eservicesInProbing.versionId, versionId),
          ),
        )
        .limit(1);

      expect(result?.state).toBe(eserviceInteropState.inactive);
    });

    it("e-service should not be found and an `eServiceNotFound` should be thrown", async () => {
      const eserviceId = uuidv4();
      const versionId = uuidv4();
      await expect(
        eserviceService.updateEserviceState(eserviceId, versionId, {
          eServiceState: eserviceInteropState.active,
        }),
      ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
    });
  });

  describe("updateEserviceProbingState", () => {
    it("e-service probing gets enabled", async () => {
      const { eserviceId, versionId } = await createEservice({
        eserviceData: { probingEnabled: false },
      });

      await eserviceService.updateEserviceProbingState(eserviceId, versionId, {
        probingEnabled: true,
      });

      const [result] = await db
        .select()
        .from(eservicesInProbing)
        .where(
          and(
            eq(eservicesInProbing.eserviceId, eserviceId),
            eq(eservicesInProbing.versionId, versionId),
          ),
        )
        .limit(1);

      expect(result?.probingEnabled).toBe(true);
    });

    it("e-service should not be found and an `eServiceNotFound` should be thrown", async () => {
      const eserviceId = uuidv4();
      const versionId = uuidv4();

      await expect(
        eserviceService.updateEserviceProbingState(eserviceId, versionId, {
          probingEnabled: true,
        }),
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

      await eserviceService.updateEserviceFrequency(eserviceId, versionId, {
        frequency: payload.frequency,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });

      const [updatedEservice] = await db
        .select()
        .from(eservicesInProbing)
        .where(
          and(
            eq(eservicesInProbing.eserviceId, eserviceId),
            eq(eservicesInProbing.versionId, versionId),
          ),
        )
        .limit(1);

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
        eserviceService.updateEserviceFrequency(eserviceId, versionId, {
          frequency: payload.frequency,
          startTime: payload.startTime,
          endTime: payload.endTime,
        }),
      ).rejects.toThrowError(eServiceNotFound(eserviceId, versionId));
    });
  });

  describe("saveEservice", () => {
    it("e-service to save when no eservice was found", async () => {
      const tenantPayload = {
        tenantId: uuidv4(),
        tenantName: "tenant 001",
      };

      await addTenant(tenantPayload);

      const payload = {
        name: "eService 004",
        producerId: tenantPayload.tenantId,
        eserviceId: uuidv4(),
        versionId: uuidv4(),
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
      );

      const [updatedEservice] = await db
        .select()
        .from(eservicesInProbing)
        .where(
          and(
            eq(eservicesInProbing.eserviceId, payload.eserviceId),
            eq(eservicesInProbing.versionId, payload.versionId),
          ),
        )
        .limit(1);

      expect(updatedEservice?.eserviceId).toBe(payload.eserviceId);
      expect(updatedEservice?.eserviceName).toBe(payload.name);
      expect(updatedEservice?.basePath).toStrictEqual(payload.basePath);
      expect(updatedEservice?.eserviceTechnology).toBe(payload.technology);
      expect(updatedEservice?.versionNumber).toBe(payload.versionNumber);
      expect(updatedEservice?.audience).toStrictEqual(payload.audience);
    });

    it("e-service correctly updated", async () => {
      const tenantPayload = {
        tenantId: uuidv4(),
        tenantName: "tenant 001",
      };
      const tenant = await addTenant(tenantPayload);

      const { eserviceId, versionId } = await createEservice();

      const payload = {
        name: "eService 004",
        producerId: tenant.tenantId,
        state: eserviceInteropState.inactive,
        basePath: ["path-004"],
        technology: technology.rest,
        versionNumber: 5,
        audience: ["audience updated"],
      };

      await eserviceService.saveEservice(eserviceId, versionId, payload);

      const [updatedEservice] = await db
        .select()
        .from(eservicesInProbing)
        .where(
          and(
            eq(eservicesInProbing.eserviceId, eserviceId),
            eq(eservicesInProbing.versionId, versionId),
          ),
        )
        .limit(1);

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
        eserviceService.saveEservice(
          payload.eserviceId,
          payload.versionId,
          payload,
        ),
      ).rejects.toThrowError(tenantNotFound(payload.producerId));
    });
  });

  describe("deleteEservice", () => {
    it("should delete an eservice successfully", async () => {
      const { eserviceId } = await createEservice({
        options: {
          disableCreationProbingRequest: true,
          disableCreationProbingResponse: true,
        },
      });

      await eserviceService.deleteEservice(eserviceId);

      const [result] = await db
        .select()
        .from(eservicesInProbing)
        .where(eq(eservicesInProbing.eserviceId, eserviceId))
        .limit(1);

      expect(result).toBeUndefined();
    });

    it("should delete an eservice with probing data request successfully", async () => {
      const { eserviceId } = await createEservice({
        options: {
          disableCreationProbingRequest: true,
        },
      });

      await eserviceService.deleteEservice(eserviceId);

      const [result] = await db
        .select()
        .from(eservicesInProbing)
        .where(eq(eservicesInProbing.eserviceId, eserviceId))
        .limit(1);

      expect(result).toBeUndefined();
    });

    it("should delete an eservice with probing data request and response successfully", async () => {
      const { eserviceId } = await createEservice();

      await eserviceService.deleteEservice(eserviceId);

      const [result] = await db
        .select()
        .from(eservicesInProbing)
        .where(eq(eservicesInProbing.eserviceId, eserviceId))
        .limit(1);

      expect(result).toBeUndefined();
    });

    it("should not throw an error when attempting to delete a non-existent eservice", async () => {
      const nonExistentId = uuidv4();

      await expect(
        eserviceService.deleteEservice(nonExistentId),
      ).resolves.toBeUndefined();
    });

    it("should throw an error if the eserviceId param is invalid", async () => {
      const invalidEserviceParams = {
        eserviceId: "e",
      };

      await expect(
        eserviceService.deleteEservice(invalidEserviceParams.eserviceId),
      ).rejects.toThrowError();
    });
  });

  describe("updateEserviceLastRequest", () => {
    it("e-service last request has correctly updated", async () => {
      const { eserviceRecordId } = await createEservice();

      const payload = {
        lastRequest: new Date().toISOString(),
      };

      await eserviceService.updateEserviceLastRequest(
        eserviceRecordId,
        payload,
      );

      const [updatedEservice] = await db
        .select()
        .from(eserviceProbingRequestsInProbing)
        .where(
          eq(
            eserviceProbingRequestsInProbing.eservicesRecordId,
            eserviceRecordId,
          ),
        )
        .limit(1);

      expect(new Date(updatedEservice?.lastRequest).toISOString()).toBe(
        payload.lastRequest,
      );
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
      );

      const [updatedEservice] = await db
        .select()
        .from(eserviceProbingRequestsInProbing)
        .where(
          eq(
            eserviceProbingRequestsInProbing.eservicesRecordId,
            eserviceRecordId,
          ),
        )
        .limit(1);

      expect(new Date(updatedEservice?.lastRequest).toISOString()).toBe(
        payload.lastRequest,
      );
    });
  });

  describe("updateResponseReceived", () => {
    it("e-service reponse received has correctly updated", async () => {
      const { eserviceRecordId } = await createEservice();

      const payload = {
        status: responseStatus.ok,
        responseReceived: new Date().toISOString(),
      };

      await eserviceService.updateResponseReceived(eserviceRecordId, payload);

      const [updatedEservice] = await db
        .select()
        .from(eserviceProbingResponsesInProbing)
        .where(
          eq(
            eserviceProbingResponsesInProbing.eservicesRecordId,
            eserviceRecordId,
          ),
        )
        .limit(1);

      expect(updatedEservice?.status).toBe(payload.status);
      expect(new Date(updatedEservice.responseReceived).toISOString()).toBe(
        payload.responseReceived,
      );
    });

    it("e-service probing response object has been created", async () => {
      const { eserviceRecordId } = await createEservice({
        options: { disableCreationProbingResponse: true },
      });

      const payload = {
        status: responseStatus.ok,
        responseReceived: new Date().toISOString(),
      };

      await eserviceService.updateResponseReceived(eserviceRecordId, payload);

      const [updatedEservice] = await db
        .select()
        .from(eserviceProbingResponsesInProbing)
        .where(
          eq(
            eserviceProbingResponsesInProbing.eservicesRecordId,
            eserviceRecordId,
          ),
        )
        .limit(1);

      expect(updatedEservice?.status).toBe(payload.status);
      expect(new Date(updatedEservice.responseReceived).toISOString()).toBe(
        payload.responseReceived,
      );
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
      expect(result.totalElements).toBe(1);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(2);
      expect(result.content[0].state).toBe(eserviceInteropState.inactive);
    });
  });
});
