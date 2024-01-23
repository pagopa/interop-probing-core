/* eslint-disable no-constant-condition */
/* eslint-disable functional/no-let */
import {
  logger,
  ReadModelRepository,
  TypeORMQueryKeys,
  ReadModelFilter,
} from "pagopa-interop-probing-commons";
import {
  genericError,
  ListResult,
  EService,
  EserviceMonitorState,
  EServiceMainData,
  EServiceProbingData,
} from "pagopa-interop-probing-models";
import { P, match } from "ts-pattern";
import { In, ILike } from "typeorm";
import { z } from "zod";

export type EServiceQueryFilters = {
  eserviceName: string | undefined;
  producerName: string | undefined;
  versionNumber: number | undefined;
  state: EserviceMonitorState[] | undefined;
};

export type EServiceProducersQueryFilters = {
  producerName: string | undefined;
};

type EServiceDataFields = TypeORMQueryKeys<EService>;

const makeFilter = (
  fieldName: EServiceDataFields,
  value: number | number[] | string | string[] | undefined
): ReadModelFilter<EService> | undefined =>
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
  const { eserviceName, producerName, versionNumber } = filters;

  const queryFilters = {
    ...makeFilter("eserviceName", eserviceName),
    ...makeFilter("producerName", producerName),
    ...makeFilter("versionNumber", versionNumber),
  };

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
export function readModelServiceBuilder(
  readModelRepository: ReadModelRepository
) {
  const eservices = readModelRepository.eservices;
  return {
    async getEservices(
      filters: EServiceQueryFilters,
      limit: number,
      offset: number
    ): Promise<ListResult<EService>> {
      const data = await eservices.find({
        ...getEServicesFilters(filters),
        skip: offset,
        take: limit,
      } satisfies ReadModelFilter<EService>);

      const result = z.array(EService).safeParse(data.map((d) => d));
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
        totalElements: await eservices.count(getEServicesFilters(filters)),
      };
    },

    async getEserviceMainDataByRecordId(
      eserviceRecordId: number
    ): Promise<EServiceMainData | undefined> {
      const data = await eservices.findOne({ where: { eserviceRecordId } });
      if (!data) {
        return undefined;
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

    async getEserviceProbingDataByRecordId(
      eserviceRecordId: number
    ): Promise<EServiceProbingData | undefined> {
      const data = await eservices.findOne({ where: { eserviceRecordId } });
      if (!data) {
        return undefined;
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
    ): Promise<ListResult<EService>> {
      const data = await eservices.find({
        skip: offset,
        take: limit,
      } satisfies ReadModelFilter<EService>);

      const result = z.array(EService).safeParse(data.map((d) => d));
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
        skip: offset,
        take: limit,
      } satisfies ReadModelFilter<EService>);

      const checkSchema = z
        .array(EService)
        .safeParse(data.map((d) => d.producerName));

      const parse = z.array(EService).safeParse(data.map((d) => d));
      const producers = data.map((d) => d.producerName);
      const result = parse.success
        ? z.array(z.string()).safeParse(producers)
        : { success: false, data: [] };

      if (!result.success) {
        logger.error(
          `Unable to parse eservices producers items: result ${JSON.stringify(
            checkSchema
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

export type ReadModelService = ReturnType<typeof readModelServiceBuilder>;
