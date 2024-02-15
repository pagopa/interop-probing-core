import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import { makeApiProblem } from "../model/domain/errors.js";
import { ExpressContext, ZodiosContext } from "pagopa-interop-probing-commons";
import { config } from "../utilities/config.js";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../services/eserviceService.js";
import { api } from "../model/generated/api.js";
import { updateEServiceErrorMapper } from "../utilities/errorMappers.js";
import { createApiClient as createOperationsApiClient } from "../../../probing-eservice-operations/src/model/generated/api.js";

const operationsApiClient = createOperationsApiClient(config.operationsBaseUrl);
const operationsService: OperationsService =
  operationsServiceBuilder(operationsApiClient);

const eServiceRouter = (
  ctx: ZodiosContext
): ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext> => {
  const eServiceRouter = ctx.router(api.api);

  eServiceRouter
    .post(
      "/eservices/:eserviceId/versions/:versionId/updateState",
      async (req, res) => {
        try {
          await operationsService.updateEserviceState(
            req.params.eserviceId,
            req.params.versionId,
            req.body
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      }
    )
    .post(
      "/eservices/:eserviceId/versions/:versionId/probing/updateState",
      async (req, res) => {
        try {
          await operationsService.updateEserviceProbingState(
            req.params.eserviceId,
            req.params.versionId,
            req.body
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      }
    )
    .post(
      "/eservices/:eserviceId/versions/:versionId/updateFrequency",
      async (req, res) => {
        try {
          await operationsService.updateEserviceFrequency(
            req.params.eserviceId,
            req.params.versionId,
            req.body
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      }
    );

  eServiceRouter
    .get("/eservices", async (req, res) => {
      try {
        const { eserviceName, producerName, state, versionNumber } = req.query;
        const eservices = await operationsService.getEservices(
          {
            ...(eserviceName && { eserviceName }),
            ...(producerName && { producerName }),
            ...(state && { state }),
            ...(versionNumber && { versionNumber: Number(versionNumber) }),
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
          })
          .end();
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/mainData/:eserviceRecordId", async (req, res) => {
      try {
        const eServiceMainData = await operationsService.getEserviceMainData(
          req.params.eserviceRecordId
        );

        return res.status(200).json(eServiceMainData).end();
      } catch (error) {
        const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/probingData/:eserviceRecordId", async (req, res) => {
      try {
        const eServiceProbingData =
          await operationsService.getEserviceProbingData(
            req.params.eserviceRecordId
          );

        return res.status(200).json(eServiceProbingData).end();
      } catch (error) {
        const errorRes = makeApiProblem(error, updateEServiceErrorMapper);
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/producers", async (req, res) => {
      try {
        const producers = await operationsService.getEservicesProducers(
          {
            producerName: req.query.producerName,
          },
          req.query.limit,
          req.query.offset
        );

        return res.status(200).json(producers).end();
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500);
        return res.status(errorRes.status).json(errorRes).end();
      }
    });

  return eServiceRouter;
};

export default eServiceRouter;
