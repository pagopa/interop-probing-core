/* eslint-disable no-constant-condition */
/* eslint-disable functional/no-let */
import { logger } from "pagopa-interop-probing-commons";
import {
  genericError,
  ListResult,
  EService,
  EServiceContent,
  EserviceMonitorState,
  EServiceMainData,
  EServiceProbingData,
  ChangeEserviceProbingStateRequest,
  ChangeEserviceStateRequest,
  ChangeProbingFrequencyRequest,
  EserviceSaveRequest,
  EserviceProbingUpdateLastRequest,
  ChangeResponseReceived,
  eserviceMonitorState,
  eserviceInteropState,
  responseStatus,
  EServiceContentReadyForPolling,
} from "pagopa-interop-probing-models";
import { Like } from "typeorm";
import { z } from "zod";
import {
  ModelRepository,
  ModelFilter,
  EserviceViewEntities,
} from "../../repositories/modelRepository.js";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceProbingDataByRecordIdNotFound,
} from "../../model/domain/errors.js";
import {
  EserviceSchema,
  eServiceDefaultValues,
} from "../../repositories/entity/eservice.entity.js";
import { SelectQueryBuilder } from "typeorm";
import { EserviceView } from "../../repositories/entity/view/eservice.entity.js";
import { config } from "../../utilities/config.js";

export type EServiceQueryFilters = {
  eserviceName: string | undefined;
  producerName: string | undefined;
  versionNumber: number | undefined;
  state: EserviceMonitorState[] | undefined;
};

export type EServiceProducersQueryFilters = {
  producerName: string | undefined;
};

const addPredicateEservices = (
  queryBuilder: SelectQueryBuilder<EserviceViewEntities>,
  filters: EServiceQueryFilters
): void => {
  const { eserviceName, producerName, versionNumber, state } = filters;

  if (eserviceName) {
    queryBuilder.andWhere(`eservice_name LIKE :eserviceName`, {
      eserviceName: `%${eserviceName}%`, // TODO: check if toUpperCase() needed
    });
  }

  if (producerName) {
    queryBuilder.andWhere(`producer_name = :producerName`, {
      producerName: producerName, // TODO: check if toUpperCase() needed
    });
  }

  if (versionNumber) {
    queryBuilder.andWhere(`version_number = :versionNumber`, { versionNumber });
  }

  if (state) {
    const isOffline = state.includes(eserviceMonitorState.offline);
    const isOnline = state.includes(eserviceMonitorState.online);
    const isNDState = state.includes(eserviceMonitorState["n/d"]);
    const predicates: string[] = [];

    if (isOffline) {
      predicates.push(`state = :state OR status = :responseStatus`);
    }

    if (isOnline) {
      predicates.push(`state = :state AND status = :responseStatus`);
    }

    if (isOffline || isOnline) {
      queryBuilder.andWhere(`(${predicates.join(" OR ")})`, {
        ...(isOffline && {
          state: eserviceInteropState.inactive,
          responseStatus: responseStatus.ko,
        }),
        ...(isOnline && {
          state: eserviceInteropState.active,
          responseStatus: responseStatus.ok,
        }),
      });
    }

    if (isNDState) {
      const extractMinuteLessPollingFrequencyPeTollerance = `CAST(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_request)) / 60 AS INTEGER) < (polling_frequency * :minOfTolleranceMultiplier)`;

      queryBuilder.distinct(true);
      queryBuilder.andWhere("probing_enabled = :probingEnabled", {
        probingEnabled: true,
      });
      queryBuilder.andWhere(`last_request IS NOT NULL`);
      queryBuilder.andWhere(`response_received IS NOT NULL`);
      queryBuilder.andWhere(
        `((${extractMinuteLessPollingFrequencyPeTollerance}) OR (response_received > last_request))`,
        { minOfTolleranceMultiplier: config.minOfTolleranceMultiplier }
      );
    }
  }
};

const addPredicateEservicesReadyForPolling = (
  queryBuilder: SelectQueryBuilder<EserviceViewEntities>,
  entityAlias: string
): void => {
  const makeInterval = `(DATE_TRUNC('minute', ${entityAlias}.last_request) + MAKE_INTERVAL(mins => ${entityAlias}.polling_frequency))`;
  const compareTimestampInterval = `CURRENT_TIME BETWEEN ${entityAlias}.polling_start_time AND ${entityAlias}.polling_end_time`;

  queryBuilder
    .andWhere(`${entityAlias}.state = :state`, {
      state: eserviceInteropState.active,
    })
    .andWhere(`${entityAlias}.probing_enabled = :probingEnabled`, {
      probingEnabled: true,
    })
    .andWhere(
      `((${entityAlias}.last_request IS NULL AND ${entityAlias}.response_received IS NULL) OR ((${makeInterval} <= CURRENT_TIMESTAMP) AND (${entityAlias}.last_request <= ${entityAlias}.response_received)))`
    )
    .andWhere(compareTimestampInterval);
};

const getEServicesProducersFilters = (
  filters: EServiceProducersQueryFilters
): { where: object } => {
  const { producerName } = filters;

  const queryFilters = {
    ...(producerName && { producerName: Like(`%${producerName}%`) }), // TODO:  check if toUpperCase() needed
  };

  return { where: queryFilters };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function modelServiceBuilder(modelRepository: ModelRepository) {
  const eservices = modelRepository.eservices;
  const eserviceProbingRequest = modelRepository.eserviceProbingRequest;
  const eserviceProbingResponse = modelRepository.eserviceProbingResponse;
  const eserviceView = modelRepository.eserviceView;

  return {
    async updateEserviceState(
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeEserviceStateRequest
    ): Promise<void> {
      await eservices.update(
        { eserviceId, versionId },
        { state: eServiceUpdated.state }
      );
    },

    async updateEserviceProbingState(
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeEserviceProbingStateRequest
    ): Promise<void> {
      await eservices.update(
        { eserviceId, versionId },
        { probingEnabled: eServiceUpdated.probingEnabled }
      );
    },

    async updateEserviceFrequency(
      eserviceId: string,
      versionId: string,
      eServiceUpdated: ChangeProbingFrequencyRequest
    ): Promise<void> {
      await eservices.update(
        { eserviceId, versionId },
        { pollingFrequency: eServiceUpdated.pollingFrequency }
      );
    },

    async saveEservice(
      eserviceId: string,
      versionId: string,
      eServiceUpdated: EserviceSaveRequest
    ): Promise<void> {
      const updateEservice: EserviceSaveRequest = {
        eserviceName: eServiceUpdated.eserviceName,
        producerName: eServiceUpdated.producerName,
        basePath: eServiceUpdated.basePath,
        technology: eServiceUpdated.technology,
        versionNumber: eServiceUpdated.versionNumber,
        audience: eServiceUpdated.audience,
        state: eServiceUpdated.state,
      };
      const existingEservice = await eservices
        .createQueryBuilder()
        .where("eservice_id = :eserviceId AND version_id = :versionId", {
          eserviceId,
          versionId,
        })
        .getOne();

      if (existingEservice) {
        await eservices
          .createQueryBuilder()
          .update()
          .set(updateEservice)
          .where("eservice_id = :eserviceId AND version_id = :versionId", {
            eserviceId,
            versionId,
          })
          .execute();
      } else {
        await eservices
          .createQueryBuilder()
          .insert()
          .values({
            eserviceRecordId: () =>
              `nextval('"${config.schemaName}"."eservice_sequence"'::regclass)`,
            eserviceId,
            versionId,
            ...eServiceDefaultValues,
            ...updateEservice,
          })
          .execute();
      }
    },

    async updateEserviceLastRequest(
      eserviceRecordId: number,
      eServiceUpdated: EserviceProbingUpdateLastRequest
    ): Promise<void> {
      await eserviceProbingRequest.upsert(
        { eserviceRecordId, lastRequest: eServiceUpdated.lastRequest },
        {
          skipUpdateIfNoValuesChanged: true,
          conflictPaths: ["eserviceRecordId"],
        }
      );
    },

    async updateResponseReceived(
      eserviceRecordId: number,
      eServiceUpdated: ChangeResponseReceived
    ): Promise<void> {
      await eserviceProbingResponse.upsert(
        {
          eserviceRecordId,
          responseReceived: eServiceUpdated.responseReceived,
          responseStatus: eServiceUpdated.responseStatus,
        },
        {
          skipUpdateIfNoValuesChanged: true,
          conflictPaths: ["eserviceRecordId"],
        }
      );
    },

    async getEServiceByIdAndVersion(
      eserviceId: string,
      versionId: string
    ): Promise<EService | undefined> {
      const data = await eservices.findOne({
        where: { eserviceId, versionId },
      });
      if (!data) {
        return undefined;
      } else {
        const result = EService.safeParse(data);
        if (!result.success) {
          logger.error(
            `Unable to parse eservice item: result ${JSON.stringify(
              result
            )} - data ${JSON.stringify(data)} `
          );
          throw genericError("Unable to parse eservice item");
        }
        return result.data;
      }
    },

    async getEservices(
      filters: EServiceQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<EServiceContent>> {
      const [data, count] = await eserviceView
        .createQueryBuilder()
        .where((qb: SelectQueryBuilder<EserviceViewEntities>) =>
          addPredicateEservices(qb, filters)
        )
        .orderBy({ id: "ASC" })
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      const result = z.array(EServiceContent).safeParse(data.map((d) => d));
      if (!result.success) {
        logger.error(
          `Unable to parse eservices items: result ${JSON.stringify(
            result
          )} - data ${JSON.stringify(data)} `
        );

        throw genericError("Unable to parse eservices items");
      }

      return {
        content: result.data,
        offset,
        limit,
        totalElements: count,
      };
    },

    async getEserviceMainData(
      eserviceRecordId: number
    ): Promise<EServiceMainData> {
      const data = await eservices.findOne({ where: { eserviceRecordId } });
      if (!data) {
        throw eServiceMainDataByRecordIdNotFound(eserviceRecordId);
      } else {
        const result = EServiceMainData.safeParse(data);
        if (!result.success) {
          logger.error(
            `Unable to parse eservice mainData item: result ${JSON.stringify(
              result
            )} - data ${JSON.stringify(data)} `
          );
          throw genericError("Unable to parse eservice mainData item");
        }
        return result.data;
      }
    },

    async getEserviceProbingData(
      eserviceRecordId: number
    ): Promise<EServiceProbingData> {
      const data = await eserviceView.findOne({
        where: { eserviceRecordId },
        order: { eserviceRecordId: "ASC" },
      });
      if (!data) {
        throw eServiceProbingDataByRecordIdNotFound(eserviceRecordId);
      } else {
        const result = EServiceProbingData.safeParse(data);
        if (!result.success) {
          logger.error(
            `Unable to parse eservice probingData item: result ${JSON.stringify(
              result
            )} - data ${JSON.stringify(data)} `
          );

          throw genericError("Unable to parse eservice probingData item");
        }
        return result.data;
      }
    },

    async getEservicesReadyForPolling(
      limit: number,
      offset: number
    ): Promise<ListResult<EServiceContentReadyForPolling>> {
      const [data, count] = await eserviceView
        .createQueryBuilder()
        .distinct(true)
        .where((qb: SelectQueryBuilder<EserviceViewEntities>) =>
          addPredicateEservicesReadyForPolling(qb, "eserviceView")
        )
        .select([
          "eserviceView.eserviceRecordId",
          "eserviceView.technology",
          "eserviceView.basePath",
          "eserviceView.audience",
        ])
        .from(EserviceView, "eserviceView") // Explicitly defining the 'from' clause is required to address the issue described here https://github.com/typeorm/typeorm/issues/1937.
        .orderBy("eserviceView.eserviceRecordId", "ASC")
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      const result = z
        .array(EServiceContentReadyForPolling)
        .safeParse(data.map((d) => d));
      if (!result.success) {
        logger.error(
          `Unable to parse eservices ready for polling items: result ${JSON.stringify(
            result
          )} - data ${JSON.stringify(data)} `
        );

        throw genericError("Unable to parse eservices ready for polling items");
      }

      return {
        content: result.data,
        totalElements: count,
      };
    },

    async getEservicesProducers(
      filters: EServiceProducersQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<string>> {
      const data = await eservices.find({
        ...getEServicesProducersFilters(filters),
        order: { producerName: "ASC" },
        select: { producerName: true },
        skip: offset,
        take: limit,
      } satisfies ModelFilter<EserviceSchema>);

      const result = z
        .array(z.string())
        .safeParse(data.map((d) => d.producerName));
      if (!result.success) {
        logger.error(
          `Unable to parse eservices producers items: result ${JSON.stringify(
            result
          )} - data ${JSON.stringify(data)} `
        );

        throw genericError("Unable to parse eservices producers items");
      }

      return {
        content: result.data,
      };
    },
  };
}

export type ModelService = ReturnType<typeof modelServiceBuilder>;
