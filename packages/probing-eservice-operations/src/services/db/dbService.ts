/* eslint-disable no-constant-condition */
/* eslint-disable functional/no-let */
import { logger } from "pagopa-interop-probing-commons";
import {
  genericError,
  EService,
  EServiceContent,
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
  PollingResource,
  EServiceQueryFilters,
  EServiceProducersQueryFilters,
} from "pagopa-interop-probing-models";
import { Brackets } from "typeorm";
import { z } from "zod";
import {
  ModelRepository,
  EserviceViewEntities,
} from "../../repositories/modelRepository.js";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceProbingDataByRecordIdNotFound,
} from "../../model/domain/errors.js";
import { eServiceDefaultValues } from "../../repositories/entity/eservice.entity.js";
import { SelectQueryBuilder } from "typeorm";
import { EserviceView } from "../../repositories/entity/view/eservice.entity.js";
import { config } from "../../utilities/config.js";
import { WhereExpressionBuilder } from "typeorm/browser";
import {
  ListResultEservices,
  ListResultProducers,
} from "../../model/dbModels.js";

const probingDisabledPredicate = (queryBuilder: WhereExpressionBuilder) => {
  const extractMinute = `CAST(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_request)) / 60 AS INTEGER) > polling_frequency`;

  queryBuilder.orWhere(`probing_enabled = false`);
  queryBuilder.orWhere(`last_request IS NULL`);
  queryBuilder.orWhere(
    `((${extractMinute}) AND (response_received < last_request))`,
    { minOfTolleranceMultiplier: config.minOfTolleranceMultiplier }
  );
  queryBuilder.orWhere(`response_received IS NULL`);
};

const probingEnabledPredicate = (
  queryBuilder: WhereExpressionBuilder,
  {
    isStateOffline,
    isStateOnline,
  }: { isStateOffline: boolean | undefined; isStateOnline: boolean | undefined }
) => {
  const predicates: string[] = [];

  if (isStateOffline) {
    predicates.push(`(state = :state OR status = :responseStatus)`);
  }

  if (isStateOnline) {
    predicates.push(`(state = :state AND status = :responseStatus)`);
  }

  if (isStateOffline || isStateOnline) {
    queryBuilder.andWhere(`(${predicates.join(" OR ")})`, {
      ...(isStateOffline && {
        state: eserviceInteropState.inactive,
        responseStatus: responseStatus.ko,
      }),
      ...(isStateOnline && {
        state: eserviceInteropState.active,
        responseStatus: responseStatus.ok,
      }),
    });
  }

  const extractMinute = `CAST(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_request)) / 60 AS INTEGER) < (polling_frequency * :minOfTolleranceMultiplier)`;

  queryBuilder.andWhere(`probing_enabled = true`);
  queryBuilder.andWhere(`last_request IS NOT NULL`);
  queryBuilder.andWhere(`response_received IS NOT NULL`);
  queryBuilder.andWhere(
    `((${extractMinute}) OR (response_received > last_request))`,
    { minOfTolleranceMultiplier: config.minOfTolleranceMultiplier }
  );
};

const addPredicateEservices = (
  queryBuilder: SelectQueryBuilder<EserviceViewEntities>,
  filters: EServiceQueryFilters
): void => {
  const { eserviceName, producerName, versionNumber, state } = filters;

  if (eserviceName) {
    queryBuilder.andWhere(`UPPER(eservice_name) LIKE UPPER(:eserviceName)`, {
      eserviceName: `%${eserviceName}%`,
    });
  }

  if (producerName) {
    queryBuilder.andWhere(`UPPER(producer_name) = UPPER(:producerName)`, {
      producerName: producerName,
    });
  }

  if (versionNumber) {
    queryBuilder.andWhere(`version_number = :versionNumber`, { versionNumber });
  }

  const isStateOffline = state?.includes(eserviceMonitorState.offline);
  const isStateOnline = state?.includes(eserviceMonitorState.online);
  const isStateND = state?.includes(eserviceMonitorState["n/d"]);
  const allStates = isStateOffline && isStateOnline && isStateND;

  if (!state || allStates) {
    queryBuilder.orderBy({ eservice_name: "ASC" });
  } else if (isStateND) {
    queryBuilder.andWhere(
      new Brackets((subQb: WhereExpressionBuilder) => {
        subQb.orWhere(
          new Brackets((subQb2) => {
            probingEnabledPredicate(subQb2, {
              isStateOffline,
              isStateOnline,
            });
          })
        );
        subQb.orWhere(
          new Brackets((subQb2) => {
            probingDisabledPredicate(subQb2);
          })
        );
      })
    );

    queryBuilder.orderBy({ id: "ASC" });
  } else {
    queryBuilder.distinct(true);
    queryBuilder.andWhere(
      new Brackets((subQb: WhereExpressionBuilder) => {
        probingEnabledPredicate(subQb, {
          isStateOffline,
          isStateOnline,
        });
      })
    );
    queryBuilder.orderBy({ id: "ASC" });
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

    async searchEservices(
      filters: EServiceQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResultEservices<EServiceContent>> {
      const [data, count] = await eserviceView
        .createQueryBuilder()
        .where((qb: SelectQueryBuilder<EserviceViewEntities>) =>
          addPredicateEservices(qb, filters)
        )
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
    ): Promise<ListResultEservices<PollingResource>> {
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
        .from(EserviceView, "eserviceView") // Explicitly defining the 'from' clause is required to address select and the issue described here https://github.com/typeorm/typeorm/issues/1937.
        .orderBy("eserviceView.eserviceRecordId", "ASC")
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      const result = z.array(PollingResource).safeParse(data.map((d) => d));
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
    ): Promise<ListResultProducers<string>> {
      const data = await eservices
        .createQueryBuilder("eservice")
        .where("UPPER(eservice.producerName) LIKE UPPER(:producerName)", {
          producerName: `%${filters.producerName}%`,
        })
        .orderBy("eservice.producerName", "ASC")
        .select(["eservice.producerName"])
        .skip(offset)
        .take(limit)
        .getMany();

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
