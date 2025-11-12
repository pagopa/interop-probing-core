import { and, eq, sql, like, asc, SQL } from "drizzle-orm";
import {
  eservicesInProbing,
  tenantsInProbing,
  eserviceProbingRequestsInProbing,
  eserviceProbingResponsesInProbing,
  eserviceViewInProbing,
} from "../db/index.js";
import {
  ApiGetEservicesReadyForPollingQuery,
  ApiGetProducersQuery,
  ApiSearchEservicesQuery,
} from "pagopa-interop-probing-eservice-operations-client";
import { tenantNotFound } from "../model/domain/errors.js";
import {
  ChangeEserviceStateRequest,
  ChangeEserviceProbingStateRequest,
  EserviceSaveRequest,
  TenantSaveRequest,
  eserviceInteropState,
  eserviceMonitorState,
  responseStatus,
} from "pagopa-interop-probing-models";
import { config } from "../utilities/config.js";
import type {
  DrizzleReturnType,
  EserviceProbingRequestSQL,
  EserviceProbingResponseSQL,
  EServiceSQL,
  EserviceViewSQL,
  TenantSQL,
} from "../db/index.js";
import { eServiceDefaultValues } from "../db/constants/eServices.js";

export function dbServiceBuilder(db: DrizzleReturnType) {
  return {
    async updateEserviceState(
      eserviceId: string,
      versionId: string,
      payload: ChangeEserviceStateRequest,
    ): Promise<void> {
      await db
        .update(eservicesInProbing)
        .set({ state: payload.state })
        .where(
          and(
            eq(eservicesInProbing.eserviceId, eserviceId),
            eq(eservicesInProbing.versionId, versionId),
          ),
        );
    },

    async updateEserviceProbingState(
      eserviceId: string,
      versionId: string,
      payload: ChangeEserviceProbingStateRequest,
    ): Promise<void> {
      await db
        .update(eservicesInProbing)
        .set({ probingEnabled: payload.probingEnabled })
        .where(
          and(
            eq(eservicesInProbing.eserviceId, eserviceId),
            eq(eservicesInProbing.versionId, versionId),
          ),
        );
    },

    async updateEserviceFrequency(
      eserviceId: string,
      versionId: string,
      payload: Pick<
        EServiceSQL,
        "pollingFrequency" | "pollingStartTime" | "pollingEndTime"
      >,
    ): Promise<void> {
      await db
        .update(eservicesInProbing)
        .set({ pollingFrequency: payload.pollingFrequency }) // TODO: why only pollingFrequency?
        .where(
          and(
            eq(eservicesInProbing.eserviceId, eserviceId),
            eq(eservicesInProbing.versionId, versionId),
          ),
        );
    },

    async saveEservice(
      eserviceId: string,
      versionId: string,
      eServiceUpdated: EserviceSaveRequest,
    ): Promise<void> {
      const [tenant] = await db
        .select()
        .from(tenantsInProbing)
        .where(eq(tenantsInProbing.tenantId, eServiceUpdated.producerId))
        .limit(1);

      if (!tenant) {
        throw tenantNotFound(eServiceUpdated.producerId);
      }

      const eserviceData = {
        eserviceId,
        versionId,
        eserviceName: eServiceUpdated.eserviceName,
        producerName: tenant.tenantName || "N/D",
        basePath: eServiceUpdated.basePath,
        eserviceTechnology: eServiceUpdated.technology,
        versionNumber: eServiceUpdated.versionNumber,
        audience: eServiceUpdated.audience,
        state: eServiceUpdated.state,
        lockVersion: eServiceDefaultValues.lockVersion,
        probingEnabled: eServiceDefaultValues.probingEnabled,
        pollingStartTime: eServiceDefaultValues.pollingStartTime,
        pollingEndTime: eServiceDefaultValues.pollingEndTime,
        pollingFrequency: eServiceDefaultValues.pollingFrequency,
      };

      await db
        .insert(eservicesInProbing)
        .values(eserviceData)
        .onConflictDoUpdate({
          target: [eservicesInProbing.eserviceId, eservicesInProbing.versionId],
          set: {
            eserviceName: eserviceData.eserviceName,
            producerName: eserviceData.producerName,
            basePath: eserviceData.basePath,
            eserviceTechnology: eserviceData.eserviceTechnology,
            versionNumber: eserviceData.versionNumber,
            audience: eserviceData.audience,
            state: eserviceData.state,
          },
        });
    },

    async deleteEservice(eserviceId: string): Promise<void> {
      await db
        .delete(eservicesInProbing)
        .where(eq(eservicesInProbing.eserviceId, eserviceId));
    },

    async saveTenant(tenantData: TenantSaveRequest): Promise<void> {
      await db
        .insert(tenantsInProbing)
        .values({
          tenantId: tenantData.tenant_id,
          tenantName: tenantData.tenant_name,
        })
        .onConflictDoUpdate({
          target: tenantsInProbing.tenantId,
          set: { tenantName: tenantData.tenant_name },
        });
    },

    async deleteTenant(tenantId: string): Promise<void> {
      await db
        .delete(tenantsInProbing)
        .where(eq(tenantsInProbing.tenantId, tenantId));
    },

    async getTenantById(tenantId: string): Promise<TenantSQL | undefined> {
      const [tenant] = await db
        .select()
        .from(tenantsInProbing)
        .where(eq(tenantsInProbing.tenantId, tenantId))
        .limit(1);

      return tenant;
    },

    async updateEserviceLastRequest(
      eserviceRecordId: number,
      eServiceUpdated: Pick<EserviceProbingRequestSQL, "lastRequest">,
    ): Promise<void> {
      await db
        .insert(eserviceProbingRequestsInProbing)
        .values({
          eservicesRecordId: eserviceRecordId,
          lastRequest: eServiceUpdated.lastRequest,
        })
        .onConflictDoUpdate({
          target: eserviceProbingRequestsInProbing.eservicesRecordId,
          set: { lastRequest: eServiceUpdated.lastRequest },
        });
    },

    async updateResponseReceived(
      eserviceRecordId: number,
      eServiceUpdated: Pick<
        EserviceProbingResponseSQL,
        "responseReceived" | "status"
      >,
    ): Promise<void> {
      await db
        .insert(eserviceProbingResponsesInProbing)
        .values({
          eservicesRecordId: eserviceRecordId,
          responseReceived: eServiceUpdated.responseReceived,
          status: eServiceUpdated.status,
        })
        .onConflictDoUpdate({
          target: eserviceProbingResponsesInProbing.eservicesRecordId,
          set: {
            responseReceived: eServiceUpdated.responseReceived,
            status: eServiceUpdated.status,
          },
        });
    },

    async getEserviceByIdAndVersion(
      eserviceId: string,
      versionId: string,
    ): Promise<EServiceSQL | undefined> {
      const [data] = await db
        .select()
        .from(eservicesInProbing)
        .where(
          and(
            eq(eservicesInProbing.eserviceId, eserviceId),
            eq(eservicesInProbing.versionId, versionId),
          ),
        )
        .limit(1);

      return data;
    },

    async getEservicesById(eserviceId: string): Promise<EServiceSQL[]> {
      const eservices = await db
        .select()
        .from(eservicesInProbing)
        .where(and(eq(eservicesInProbing.eserviceId, eserviceId)));

      return eservices;
    },

    async getEserviceByRecordId(
      eserviceRecordId: number,
    ): Promise<EServiceSQL | undefined> {
      const [eservice] = await db
        .select()
        .from(eservicesInProbing)
        .where(eq(eservicesInProbing.id, BigInt(eserviceRecordId)))
        .limit(1);

      return eservice;
    },

    async searchEservices(filters: ApiSearchEservicesQuery): Promise<{
      content: EserviceViewSQL[];
      offset: number;
      limit: number;
      totalElements: number;
    }> {
      const { offset, limit } = filters;

      const predicate = addPredicateEservices(filters);

      const baseQuery = db
        .select()
        .from(eserviceViewInProbing)
        .where(predicate.where);

      const content = await baseQuery
        .orderBy(predicate.orderBy)
        .limit(limit)
        .offset(offset);

      const countRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(eserviceViewInProbing)
        .where(predicate.where);

      return {
        content,
        offset,
        limit,
        totalElements: Number(countRes[0]?.count ?? 0),
      };
    },

    async getEserviceMainData(
      eserviceRecordId: number,
    ): Promise<
      | Pick<
          EserviceViewSQL,
          | "eserviceName"
          | "producerName"
          | "versionNumber"
          | "eserviceId"
          | "versionId"
          | "pollingFrequency"
        >
      | undefined
    > {
      const [data] = await db
        .select({
          eserviceName: eservicesInProbing.eserviceName,
          producerName: eservicesInProbing.producerName,
          versionNumber: eservicesInProbing.versionNumber,
          eserviceId: eservicesInProbing.eserviceId,
          versionId: eservicesInProbing.versionId,
          pollingFrequency: eservicesInProbing.pollingFrequency,
        })
        .from(eservicesInProbing)
        .where(eq(eservicesInProbing.id, BigInt(eserviceRecordId)))
        .limit(1);

      return data;
    },

    async getEserviceProbingData(
      eserviceRecordId: number,
    ): Promise<
      | Pick<
          EserviceViewSQL,
          | "probingEnabled"
          | "state"
          | "responseReceived"
          | "lastRequest"
          | "status"
          | "pollingFrequency"
        >
      | undefined
    > {
      const [data] = await db
        .select({
          probingEnabled: eserviceViewInProbing.probingEnabled,
          state: eserviceViewInProbing.state,
          responseReceived: eserviceViewInProbing.responseReceived,
          lastRequest: eserviceViewInProbing.lastRequest,
          status: eserviceViewInProbing.status,
          pollingFrequency: eserviceViewInProbing.pollingFrequency,
        })
        .from(eserviceViewInProbing)
        .where(eq(eserviceViewInProbing.id, eserviceRecordId))
        .orderBy(asc(eserviceViewInProbing.id))
        .limit(1);

      return data;
    },

    async getEservicesReadyForPolling(
      filters: ApiGetEservicesReadyForPollingQuery,
    ): Promise<{
      content: Pick<
        EserviceViewSQL,
        "id" | "eserviceTechnology" | "basePath" | "audience"
      >[];
      totalElements: number;
    }> {
      const { offset, limit } = filters;

      const baseQuery = db
        .select({
          id: eserviceViewInProbing.id,
          eserviceTechnology: eserviceViewInProbing.eserviceTechnology,
          basePath: eserviceViewInProbing.basePath,
          audience: eserviceViewInProbing.audience,
        })
        .from(eserviceViewInProbing);

      const readyPredicate = addPredicateEservicesReadyForPolling();

      const content = await baseQuery
        .where(readyPredicate)
        .orderBy(asc(eserviceViewInProbing.id))
        .limit(limit)
        .offset(offset);

      const countRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(eserviceViewInProbing)
        .where(readyPredicate);

      return {
        content,
        totalElements: Number(countRes[0]?.count ?? 0),
      };
    },

    async getEservicesProducers(
      filters: ApiGetProducersQuery,
    ): Promise<{ content: Pick<EServiceSQL, "producerName">[] }> {
      const { producerName, offset, limit } = filters;

      const whereClause = producerName
        ? like(
            sql`UPPER(${eservicesInProbing.producerName})`,
            sql`UPPER('%' || ${producerName} || '%')`,
          )
        : undefined;

      const content = await db
        .selectDistinct({ producerName: eservicesInProbing.producerName })
        .from(eservicesInProbing)
        .where(whereClause)
        .orderBy(asc(eservicesInProbing.producerName))
        .limit(limit)
        .offset(offset);

      return { content };
    },
  };
}

export type DBService = ReturnType<typeof dbServiceBuilder>;

export function probingDisabledPredicate(): SQL {
  return sql`
    (
      probing_enabled = false
      OR last_request IS NULL
      OR (
        TRUNC(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_request)) / 60) > polling_frequency
        AND response_received < last_request
      )
      OR response_received IS NULL
    )
  `;
}

export function probingEnabledPredicate({
  isStateOffline,
  isStateOnline,
}: {
  isStateOffline?: boolean;
  isStateOnline?: boolean;
}): SQL {
  const stateClauses: SQL[] = [];

  if (isStateOffline) {
    stateClauses.push(
      sql`(state = ${eserviceInteropState.inactive} OR status = ${responseStatus.ko})`,
    );
  }

  if (isStateOnline) {
    stateClauses.push(
      sql`(state = ${eserviceInteropState.active} AND status = ${responseStatus.ok})`,
    );
  }

  const stateSql =
    stateClauses.length > 0 ? sql.join(stateClauses, sql` OR `) : sql`TRUE`;

  return sql`
    (
      ${stateSql}
      AND probing_enabled = true
      AND last_request IS NOT NULL
      AND response_received IS NOT NULL
      AND (
        TRUNC(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_request)) / 60)
        < (polling_frequency * ${config.minOfTolleranceMultiplier})
        OR response_received > last_request
      )
    )
  `;
}

export function addPredicateEservices(filters: ApiSearchEservicesQuery): {
  where: SQL;
  orderBy: SQL;
  distinct: boolean;
} {
  const { eserviceName, producerName, versionNumber, state } = filters;

  const clauses: SQL[] = [];

  if (eserviceName) {
    clauses.push(
      sql`UPPER(${eserviceViewInProbing.eserviceName}) LIKE UPPER('%' || ${eserviceName} || '%')`,
    );
  }

  if (producerName) {
    clauses.push(
      sql`UPPER(${eserviceViewInProbing.producerName}) = UPPER(${producerName})`,
    );
  }

  if (versionNumber) {
    clauses.push(
      sql`${eserviceViewInProbing.versionNumber} = ${versionNumber}`,
    );
  }

  const isStateOffline = state?.includes(eserviceMonitorState.offline);
  const isStateOnline = state?.includes(eserviceMonitorState.online);
  const isStateND = state?.includes(eserviceMonitorState["n_d"]);
  const allStates = isStateOffline && isStateOnline && isStateND;

  if (!state || allStates) {
    return {
      where: sql.join(clauses.length ? clauses : [sql`TRUE`], sql` AND `),
      orderBy: asc(eserviceViewInProbing.eserviceName),
      distinct: false,
    };
  }

  if (isStateND) {
    const predicate = sql`
      (
        (
          ${probingEnabledPredicate({ isStateOffline, isStateOnline })}
        )
        OR (
          ${probingDisabledPredicate()}
        )
      )
    `;

    return {
      where: sql.join([...clauses, predicate], sql` AND `),
      orderBy: asc(eserviceViewInProbing.id),
      distinct: false,
    };
  }

  const predicate = probingEnabledPredicate({ isStateOffline, isStateOnline });

  return {
    where: sql.join([...clauses, predicate], sql` AND `),
    orderBy: asc(eserviceViewInProbing.id),
    distinct: true,
  };
}

export function addPredicateEservicesReadyForPolling(): SQL {
  const lastRequestPlusPollingFrequency = sql`
    (
      DATE_TRUNC('minute', ${eserviceViewInProbing.lastRequest}) +
      MAKE_INTERVAL(mins := ${eserviceViewInProbing.pollingFrequency})
    )
  `;

  const compareTimestampInterval = sql`
    CURRENT_TIME BETWEEN ${eserviceViewInProbing.pollingStartTime}
    AND ${eserviceViewInProbing.pollingEndTime}
  `;

  const isRequestAndResponseNull = sql`
    (${eserviceViewInProbing.lastRequest} IS NULL
     AND ${eserviceViewInProbing.responseReceived} IS NULL)
  `;

  const isIntervalElapsedAndResponseUpdated = sql`
    (
      ${lastRequestPlusPollingFrequency} <= CURRENT_TIMESTAMP
      AND ${eserviceViewInProbing.lastRequest} <= ${eserviceViewInProbing.responseReceived}
    )
  `;

  const isIntervalElapsedWithThreshold = sql`
    (
      DATE_TRUNC('minute', ${eserviceViewInProbing.lastRequest}) +
      MAKE_INTERVAL(mins := ${eserviceViewInProbing.pollingFrequency} * ${config.pollingFrequencyThreshold})
    ) <= CURRENT_TIMESTAMP
  `;

  return sql`
    ${eserviceViewInProbing.state} = ${eserviceInteropState.active}
    AND ${eserviceViewInProbing.probingEnabled} = true
    AND (
      ${isRequestAndResponseNull}
      OR ${isIntervalElapsedAndResponseUpdated}
      OR ${isIntervalElapsedWithThreshold}
    )
    AND ${compareTimestampInterval}
  `;
}
