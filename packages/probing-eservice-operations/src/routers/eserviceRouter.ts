import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import {
  eServiceMainDataByRecordIdNotFound,
  eServiceProbingDataByRecordIdNotFound,
  makeApiProblem,
} from "../model/domain/errors.js";
import {
  ExpressContext,
  ZodiosContext,
  ReadModelRepository,
} from "pagopa-interop-probing-commons";
import { config } from "../utilities/config.js";
import { readModelServiceBuilder } from "../services/readmodel/readModelService.js";
import { eServiceServiceBuilder } from "../services/eServiceService.js";
import { eserviceQueryBuilder } from "../services/readmodel/eserviceQuery.js";
import { api } from "../model/generated/api.js";
import {
  ListResult,
  EService,
  EServiceMainData,
  EServiceProbingData,
} from "pagopa-interop-probing-models";

const readModelService = readModelServiceBuilder(
  ReadModelRepository.init(config)
);
const eserviceQuery = eserviceQueryBuilder(readModelService);
const eServiceService = eServiceServiceBuilder(eserviceQuery);

const eServiceRouter = (
  ctx: ZodiosContext
): ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext> => {
  const eServiceRouter = ctx.router(api.api);
  eServiceRouter
    .get("/eservices", async (req, res) => {
      try {
        const eservices = await eServiceService.getEservices(
          {
            eserviceName: req.query.eserviceName,
            producerName: req.query.producerName,
            versionNumber: req.query.versionNumber,
            state: req.query.state,
          },
          req.query.limit,
          req.query.offset
        );

        return res
          .status(200)
          .json({
            content: eservices.content,
            offset: eservices.offset,
            limit: eservices.limit,
            totalElements: eservices.totalElements,
          } satisfies ListResult<EService>)
          .end();
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/mainData/:eserviceRecordId", async (req, res) => {
      try {
        const eServiceMainData =
          await readModelService.getEserviceMainDataByRecordId(
            req.params.eserviceRecordId
          );

        if (eServiceMainData) {
          return res
            .status(200)
            .json(eServiceMainData satisfies EServiceMainData)
            .end();
        } else {
          return res
            .status(404)
            .json(
              makeApiProblem(
                eServiceMainDataByRecordIdNotFound(req.params.eserviceRecordId),
                () => 404
              )
            )
            .end();
        }
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/probingData/:eserviceRecordId", async (req, res) => {
      try {
        const eServiceProbingData =
          await readModelService.getEserviceProbingDataByRecordId(
            req.params.eserviceRecordId
          );

        if (eServiceProbingData) {
          return res
            .status(200)
            .json(eServiceProbingData satisfies EServiceProbingData)
            .end();
        } else {
          return res
            .status(404)
            .json(
              makeApiProblem(
                eServiceProbingDataByRecordIdNotFound(
                  req.params.eserviceRecordId
                ),
                () => 404
              )
            )
            .end();
        }
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/polling", async (req, res) => {
      try {
        const eservices = await eServiceService.getEservicesReadyForPolling(
          req.query.limit,
          req.query.offset
        );

        return res
          .status(200)
          .json({
            content: eservices.content,
          })
          .end();
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/producers", async (req, res) => {
      try {
        const eservices = await eServiceService.getEservicesProducers(
          {
            producerName: req.query.producerName,
          },
          req.query.limit,
          req.query.offset
        );

        return res
          .status(200)
          .json({
            content: eservices.content,
          })
          .end();
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    });

  return eServiceRouter;
};

export default eServiceRouter;
