import { describe, expect, it } from "vitest";
import {
  eserviceInteropState,
  eserviceMonitorState,
  responseStatus,
  technology,
} from "pagopa-interop-probing-models";
import {
  getEservice,
  mockEservice,
  addEservice,
  addEserviceProbingRequest,
  addEserviceProbingResponse,
  addTenant,
  db,
  eserviceService,
} from "../utils.js";
import {
  eservicesInProbing,
  eserviceProbingRequestsInProbing,
  eserviceProbingResponsesInProbing,
} from "../../src/db/drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import {
  eServiceByRecordIdNotFound,
  eServiceByVersionIdNotFound,
  eServiceNotFound,
  tenantNotFound,
} from "../../src/model/domain/errors.js";
import { v4 as uuidv4 } from "uuid";
import { nowDateUTC } from "../../src/utilities/date.js";
import {
  ApiGetProducersQuery,
  ApiSearchEservicesQuery,
} from "pagopa-interop-probing-eservice-operations-client";
import { genericLogger } from "pagopa-interop-probing-commons";

describe("eService service", async () => {
  describe("searchEservices", () => {
    it("should return an empty result when filtering by non-existent e-service name and producer", async () => {
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

    it("should return all e-services when no state filter is provided", async () => {
      const eService = mockEservice();
      await addEservice(eService);

      const filters: ApiSearchEservicesQuery = {
        eserviceName: eService.eserviceName,
        producerName: eService.producerName,
        versionNumber: 1,
        limit: 2,
        offset: 0,
      };

      const result = await eserviceService.searchEservices(
        filters,
        genericLogger,
      );
      expect(result.totalElements).toBeGreaterThan(0);
    });

    it("should return all e-services when filtering by all state values (N_D, OFFLINE, ONLINE)", async () => {
      const eService = mockEservice({ state: eserviceInteropState.inactive });
      const eserviceRecordId = await addEservice(eService);

      await addEserviceProbingRequest({
        eservicesRecordId: eserviceRecordId,
        lastRequest: new Date().toISOString(),
      });
      await addEserviceProbingResponse({
        eservicesRecordId: eserviceRecordId,
        responseReceived: new Date().toISOString(),
        status: responseStatus.ok,
      });

      const filters: ApiSearchEservicesQuery = {
        eserviceName: eService.eserviceName,
        producerName: eService.producerName,
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

      expect(result.totalElements).toBeGreaterThan(0);
      expect(result.content[0]).toMatchObject({
        eserviceName: eService.eserviceName,
        producerName: eService.producerName,
      });
    });

    it("should return e-services matching N_D filtering (probing disabled case)", async () => {
      const eService = mockEservice({
        state: eserviceInteropState.active,
        probingEnabled: false,
      });

      await addEservice(eService);

      const filters: ApiSearchEservicesQuery = {
        eserviceName: eService.eserviceName,
        producerName: eService.producerName,
        versionNumber: 1,
        state: [eserviceMonitorState["n_d"]],
        limit: 2,
        offset: 0,
      };

      const result = await eserviceService.searchEservices(
        filters,
        genericLogger,
      );

      expect(result.totalElements).toBeGreaterThan(0);
      expect(result.content[0]).toMatchObject({
        eserviceName: eService.eserviceName,
        producerName: eService.producerName,
      });
    });

    it("should return e-services when state is INACTIVE and filtering by OFFLINE", async () => {
      const eService = mockEservice();
      const eserviceRecordId = await addEservice(eService);
      await addEserviceProbingRequest({
        eservicesRecordId: eserviceRecordId,
        lastRequest: new Date().toISOString(),
      });
      await addEserviceProbingResponse({
        eservicesRecordId: eserviceRecordId,
        responseReceived: new Date().toISOString(),
        status: responseStatus.ok,
      });

      const filters: ApiSearchEservicesQuery = {
        eserviceName: eService.eserviceName,
        producerName: eService.producerName,
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

    it("should return e-services matching N_D filtering when responseReceived is null", async () => {
      const eService = mockEservice({
        state: eserviceInteropState.active,
        probingEnabled: true,
      });

      const recordId = await addEservice(eService);

      await addEserviceProbingRequest({
        eservicesRecordId: recordId,
        lastRequest: new Date().toISOString(),
      });

      const filters: ApiSearchEservicesQuery = {
        eserviceName: eService.eserviceName,
        state: [eserviceMonitorState["n_d"]],
        limit: 5,
        offset: 0,
      };

      const result = await eserviceService.searchEservices(
        filters,
        genericLogger,
      );
      expect(result.totalElements).toBeGreaterThan(0);
    });
  });

  describe("getEserviceMainData", () => {
    it("should successfully retrieve e-service main data and return a valid MainDataEserviceResponse", async () => {
      const eService = mockEservice();
      const eserviceRecordId = await addEservice(eService);
      const result = await eserviceService.getEserviceMainData(
        eserviceRecordId,
        genericLogger,
      );
      expect(result).toBeTruthy();
      expect(result).toHaveProperty("eserviceName", eService.eserviceName);
      expect(result).toHaveProperty("pollingFrequency");
    });

    it("should throw an `eServiceByRecordIdNotFound` error when the e-service is not found", async () => {
      await expect(
        eserviceService.getEserviceMainData(99, genericLogger),
      ).rejects.toThrowError(eServiceByRecordIdNotFound(99));
    });
  });

  describe("getEserviceProbingData", () => {
    it("should successfully retrieve e-service probing data and return a valid ProbingDataEserviceResponse", async () => {
      const eService = mockEservice();
      const eserviceRecordId = await addEservice(eService);
      await addEserviceProbingRequest({
        eservicesRecordId: eserviceRecordId,
        lastRequest: new Date().toISOString(),
      });
      await addEserviceProbingResponse({
        eservicesRecordId: eserviceRecordId,
        responseReceived: new Date().toISOString(),
        status: responseStatus.ok,
      });

      const result = await eserviceService.getEserviceProbingData(
        eserviceRecordId,
        genericLogger,
      );
      expect(result).toBeTruthy();
      expect(result).toHaveProperty("probingEnabled", eService.probingEnabled);
      expect(result).toHaveProperty(
        "pollingFrequency",
        eService.pollingFrequency,
      );
      expect(result).toHaveProperty("responseReceived");
      expect(result).toHaveProperty("lastRequest");
      expect(result).toHaveProperty("responseStatus", responseStatus.ok);
    });

    it("should throw an `eServiceByRecordIdNotFound` error when the e-service is not found", async () => {
      await expect(
        eserviceService.getEserviceProbingData(99, genericLogger),
      ).rejects.toThrowError(eServiceByRecordIdNotFound(99));
    });
  });

  describe("getEservicesReadyForPolling", () => {
    it("should return a non-empty list of e-services ready for polling", async () => {
      const eService1 = mockEservice({ probingEnabled: true });
      const eService2 = mockEservice({
        probingEnabled: true,
        state: eserviceInteropState.active,
      });

      await addEservice(eService1);
      await addEservice(eService2);

      const result = await eserviceService.getEservicesReadyForPolling(
        { offset: 0, limit: 2 },
        genericLogger,
      );

      expect(result.content.length).toBe(1);
      expect(result.totalElements).toBe(1);
    });
  });

  describe("getEservicesProducers", () => {
    it("should return an empty list when a valid producer name has no matching records", async () => {
      const eService = mockEservice();
      await addEservice(eService);

      const filters: ApiGetProducersQuery = {
        producerName: "no matching records eService producer",
        limit: 1,
        offset: 0,
      };

      const producers = await eserviceService.getEservicesProducers(filters);
      expect(producers.content.length).toBe(0);
    });

    it("should return all producers when no producer name is provided", async () => {
      const eService1 = mockEservice({ producerName: "Producer 1" });
      const eService2 = mockEservice({ producerName: "Producer 2" });

      await addEservice(eService1);
      await addEservice(eService2);

      const filters: ApiGetProducersQuery = { limit: 10, offset: 0 };
      const result = await eserviceService.getEservicesProducers(filters);

      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content).toContain("Producer 1");
      expect(result.content).toContain("Producer 2");
    });

    it("should return a non-empty list when given a specific valid producer name", async () => {
      const eService = mockEservice({ producerName: "eService producer 001" });
      await addEservice(eService);

      const filters: ApiGetProducersQuery = {
        producerName: eService.producerName,
        limit: 10,
        offset: 0,
      };

      const result = await eserviceService.getEservicesProducers(filters);
      expect(result.content.length).not.toBe(0);
      expect(result.content).toContain(eService.producerName);
    });

    it("should return a list of matching producers when given a partial producer name", async () => {
      const eService1 = mockEservice({ producerName: "eService producer 001" });
      const eService2 = mockEservice({ producerName: "Another producer" });

      await addEservice(eService1);
      await addEservice(eService2);

      const filters: ApiGetProducersQuery = {
        producerName: "eService producer",
        limit: 2,
        offset: 0,
      };

      const producers = await eserviceService.getEservicesProducers(filters);
      expect(producers.content.length).toBe(1);
    });
  });

  describe("updateEserviceState", () => {
    it("should update the e-service state correctly", async () => {
      const eService = mockEservice({ state: eserviceInteropState.active });
      const eServiceRecordId = await addEservice(eService);
      const { eserviceId, versionId } = await getEservice(eServiceRecordId);

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

    it("should throw `eServiceByVersionIdNotFound` when the e-service does not exist", async () => {
      const eserviceId = uuidv4();
      const versionId = uuidv4();

      await expect(
        eserviceService.updateEserviceState(eserviceId, versionId, {
          eServiceState: eserviceInteropState.active,
        }),
      ).rejects.toThrowError(
        eServiceByVersionIdNotFound(eserviceId, versionId),
      );
    });
  });

  describe("updateEserviceProbingState", () => {
    it("should enable probing for the specified e-service", async () => {
      const eService = mockEservice({ probingEnabled: false });
      const eServiceRecordId = await addEservice(eService);
      const { eserviceId, versionId } = await getEservice(eServiceRecordId);

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

    it("e-service should not be found and an `eServiceByVersionIdNotFound` should be thrown", async () => {
      const eserviceId = uuidv4();
      const versionId = uuidv4();

      await expect(
        eserviceService.updateEserviceProbingState(eserviceId, versionId, {
          probingEnabled: true,
        }),
      ).rejects.toThrowError(
        eServiceByVersionIdNotFound(eserviceId, versionId),
      );
    });
  });

  describe("updateEserviceFrequency", () => {
    it("should update e-service frequency with new state", async () => {
      const eService = mockEservice();
      const eServiceRecordId = await addEservice(eService);
      const { eserviceId, versionId } = await getEservice(eServiceRecordId);

      const payload = {
        frequency: 10,
        startTime: nowDateUTC(8, 0),
        endTime: nowDateUTC(8, 0),
      };

      await eserviceService.updateEserviceFrequency(
        eserviceId,
        versionId,
        payload,
      );

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

    it("should throw `eServiceByVersionIdNotFound` when e-service not found", async () => {
      const eserviceId = uuidv4();
      const versionId = uuidv4();

      const payload = {
        frequency: 10,
        startTime: nowDateUTC(8, 0),
        endTime: nowDateUTC(8, 0),
      };

      await expect(
        eserviceService.updateEserviceFrequency(eserviceId, versionId, payload),
      ).rejects.toThrowError(
        eServiceByVersionIdNotFound(eserviceId, versionId),
      );
    });
  });

  describe("saveEservice", () => {
    it("should create new e-service when none found", async () => {
      const tenantPayload = { tenantId: uuidv4(), tenantName: "tenant 001" };
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

      const [eservice] = await db
        .select()
        .from(eservicesInProbing)
        .where(
          and(
            eq(eservicesInProbing.eserviceId, payload.eserviceId),
            eq(eservicesInProbing.versionId, payload.versionId),
          ),
        )
        .limit(1);

      expect(eservice?.eserviceId).toBe(payload.eserviceId);
      expect(eservice?.eserviceName).toBe(payload.name);
      expect(eservice?.basePath).toStrictEqual(payload.basePath);
      expect(eservice?.eserviceTechnology).toBe(payload.technology);
      expect(eservice?.versionNumber).toBe(payload.versionNumber);
      expect(eservice?.audience).toStrictEqual(payload.audience);
    });

    it("should update e-service correctly", async () => {
      const tenantPayload = { tenantId: uuidv4(), tenantName: "tenant 001" };
      const tenant = await addTenant(tenantPayload);

      const eService = mockEservice();
      const eServiceRecordId = await addEservice(eService);
      const { eserviceId, versionId } = await getEservice(eServiceRecordId);

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

      const [updated] = await db
        .select()
        .from(eservicesInProbing)
        .where(
          and(
            eq(eservicesInProbing.eserviceId, eserviceId),
            eq(eservicesInProbing.versionId, versionId),
          ),
        )
        .limit(1);

      expect(updated?.versionNumber).toBe(payload.versionNumber);
      expect(updated?.audience).toStrictEqual(payload.audience);
    });

    it("should throw `tenantNotFound` when the tenant does not exist", async () => {
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
      const eService = mockEservice();
      const eServiceRecordId = await addEservice(eService);
      const { eserviceId } = await getEservice(eServiceRecordId);

      await eserviceService.deleteEservice(eserviceId);

      const [result] = await db
        .select()
        .from(eservicesInProbing)
        .where(eq(eservicesInProbing.eserviceId, eserviceId))
        .limit(1);
      expect(result).toBeUndefined();
    });

    it("should delete an eservice with probing request only", async () => {
      const eService = mockEservice();
      const eserviceRecordId = await addEservice(eService);
      const { eserviceId } = await getEservice(eserviceRecordId);

      await addEserviceProbingRequest({
        eservicesRecordId: eserviceRecordId,
        lastRequest: new Date().toISOString(),
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
      const eService = mockEservice();
      const eserviceRecordId = await addEservice(eService);
      const { eserviceId } = await getEservice(eserviceRecordId);

      await addEserviceProbingRequest({
        eservicesRecordId: eserviceRecordId,
        lastRequest: new Date().toISOString(),
      });

      await addEserviceProbingResponse({
        eservicesRecordId: eserviceRecordId,
        responseReceived: new Date().toISOString(),
        status: "ok",
      });

      await eserviceService.deleteEservice(eserviceId);

      const [result] = await db
        .select()
        .from(eservicesInProbing)
        .where(eq(eservicesInProbing.eserviceId, eserviceId))
        .limit(1);

      expect(result).toBeUndefined();
    });

    it("should throw eServiceNotFound when attempting to delete a non-existent eService", async () => {
      const nonExistentId = uuidv4();

      await expect(
        eserviceService.deleteEservice(nonExistentId),
      ).rejects.toThrowError(eServiceNotFound(nonExistentId));
    });

    it("should throw an error if the eserviceId param is invalid", async () => {
      const invalidEserviceParams = {
        eserviceId: "invalid-id",
      };

      await expect(
        eserviceService.deleteEservice(invalidEserviceParams.eserviceId),
      ).rejects.toThrowError();
    });
  });

  describe("updateEserviceLastRequest", () => {
    it("should correctly update existing probing request", async () => {
      const eService = mockEservice();
      const eserviceRecordId = await addEservice(eService);

      await addEserviceProbingRequest({
        eservicesRecordId: eserviceRecordId,
        lastRequest: new Date().toISOString(),
      });

      const payload = { lastRequest: new Date().toISOString() };

      await eserviceService.updateEserviceLastRequest(
        eserviceRecordId,
        payload,
      );

      const [updatedProbingRequest] = await db
        .select()
        .from(eserviceProbingRequestsInProbing)
        .where(
          eq(
            eserviceProbingRequestsInProbing.eservicesRecordId,
            eserviceRecordId,
          ),
        )
        .limit(1);

      expect(new Date(updatedProbingRequest?.lastRequest).toISOString()).toBe(
        payload.lastRequest,
      );
    });

    it("should create a new probing request if none exists", async () => {
      const eService = mockEservice();
      const eserviceRecordId = await addEservice(eService);

      const payload = { lastRequest: new Date().toISOString() };

      await eserviceService.updateEserviceLastRequest(
        eserviceRecordId,
        payload,
      );

      const [createdProbingRequest] = await db
        .select()
        .from(eserviceProbingRequestsInProbing)
        .where(
          eq(
            eserviceProbingRequestsInProbing.eservicesRecordId,
            eserviceRecordId,
          ),
        )
        .limit(1);

      expect(createdProbingRequest).toBeDefined();
      expect(new Date(createdProbingRequest?.lastRequest).toISOString()).toBe(
        payload.lastRequest,
      );
    });
  });

  describe("updateResponseReceived", () => {
    it("should correctly update existing probing response", async () => {
      const eService = mockEservice();
      const eserviceRecordId = await addEservice(eService);

      await addEserviceProbingResponse({
        eservicesRecordId: eserviceRecordId,
        responseReceived: new Date().toISOString(),
        status: responseStatus.ko,
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

    it("should create probing response if none exists", async () => {
      const eService = mockEservice();
      const eserviceRecordId = await addEservice(eService);

      const payload = {
        status: responseStatus.ok,
        responseReceived: new Date().toISOString(),
      };

      await eserviceService.updateResponseReceived(eserviceRecordId, payload);

      const [createdProbingResponse] = await db
        .select()
        .from(eserviceProbingResponsesInProbing)
        .where(
          eq(
            eserviceProbingResponsesInProbing.eservicesRecordId,
            eserviceRecordId,
          ),
        )
        .limit(1);

      expect(createdProbingResponse).toBeDefined();
      expect(createdProbingResponse.status).toBe(payload.status);
      expect(
        new Date(createdProbingResponse.responseReceived).toISOString(),
      ).toBe(payload.responseReceived);
    });

    it("should return eService in searchEservices even without probing data", async () => {
      const eService = mockEservice();
      await addEservice(eService);

      const filters: ApiSearchEservicesQuery = {
        eserviceName: eService.eserviceName,
        producerName: eService.producerName,
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
