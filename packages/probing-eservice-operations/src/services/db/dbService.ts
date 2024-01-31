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
import { P, match } from "ts-pattern";
import { In, ILike } from "typeorm";
import { z } from "zod";
import {
  ModelRepository,
  TypeORMQueryKeys,
  ModelFilter,
} from "../../repositories/modelRepository.js";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceProbingDataByRecordIdNotFound,
} from "../../model/domain/errors.js";
import {
  EserviceSchema,
  eServiceDefaultValues,
} from "../../repositories/entity/eservice.entity.js";

export type EServiceQueryFilters = {
  eserviceName: string | undefined;
  producerName: string | undefined;
  versionNumber: number | undefined;
  state: EserviceMonitorState[] | undefined;
};

export type EServiceProducersQueryFilters = {
  producerName: string | undefined;
};

type EServiceDataFields = TypeORMQueryKeys<EserviceSchema>;

const makeFilter = (
  fieldName: EServiceDataFields,
  value: number | number[] | string | string[] | undefined
): ModelFilter<EserviceSchema> | undefined =>
  match(value)
    .with(P.nullish, () => undefined)
    .with(P.string, () => ({
      [`${fieldName}`]: ILike(`%${value}%`),
    }))
    .with(P.array(P.string), (a) =>
      a.length === 0
        ? undefined
        : {
            [`${fieldName}`]: In(a.map((v) => ILike(`%${v}%`))),
          }
    )
    .otherwise(() => {
      logger.error(
        `Unable to build filter for field ${fieldName} and value ${value}`
      );
      return undefined;
    });

const getEServicesFilters = (
  filters: EServiceQueryFilters
): { where: object } => {
  const { eserviceName, producerName, versionNumber, state } = filters;

  const queryFilters = [];
  const andOperatorFilters = {
    ...makeFilter("eserviceName", eserviceName),
    ...makeFilter("producerName", producerName),
    ...makeFilter("versionNumber", versionNumber),
  };

  if (state?.includes(eserviceMonitorState.offline)) {
    console.log("state ---->", state);
    const queryByStateFilters = {
      ...andOperatorFilters,
      state: eserviceInteropState.inactive,
    };

    const queryByResponseStatusFilters = {
      ...andOperatorFilters,
      responseStatus: responseStatus.ko,
    };

    queryFilters.push(...[queryByStateFilters, queryByResponseStatusFilters]);
  } else if (state?.includes(eserviceMonitorState.online)) {
    const queryByStateFilters = {
      ...andOperatorFilters,
      state: eserviceInteropState.active,
    };

    const queryByResponseStatusFilters = {
      ...andOperatorFilters,
      responseStatus: responseStatus.ok,
    };

    queryFilters.push(...[queryByStateFilters, queryByResponseStatusFilters]);
  }
  return { where: queryFilters };
};

const getEServicesProducersFilters = (
  filters: EServiceProducersQueryFilters
): { where: object } => {
  const { producerName } = filters;

  const queryFilters = {
    ...makeFilter("producerName", producerName),
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
              `nextval('"${process.env.SCHEMA_NAME}"."eservice_sequence"'::regclass)`,
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
      const data = await eserviceView.find({
        ...getEServicesFilters(filters),
        skip: offset,
        take: limit,
      } satisfies ModelFilter<EserviceSchema>);

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
        totalElements: await eserviceView.count(getEServicesFilters(filters)),
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
      const data = await eserviceView.find({
        select: {
          eserviceRecordId: true,
          technology: true,
          basePath: true,
          audience: true,
        },
        skip: offset,
        take: limit,
      } satisfies ModelFilter<EserviceSchema>);

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
        totalElements: await eservices.count(),
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
