import { ZodiosEndpointDefinitions, ZodiosInstance } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import { resolveOperationsApiClientProblem } from "../model/domain/errors.js";
import { ExpressContext, ZodiosContext } from "pagopa-interop-probing-commons";
import { Api } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../services/operationsService.js";
import { api } from "../model/generated/api.js";

const eServiceRouter = (
  ctx: ZodiosContext
): ((
  operationsApiClient: ZodiosInstance<Api>
) => ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext>) => {
  return (operationsApiClient: ZodiosInstance<Api>) => {
    const operationsService: OperationsService =
      operationsServiceBuilder(operationsApiClient);
    const router = ctx.router(api.api);

    router
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
            const errorRes = resolveOperationsApiClientProblem(error);
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
            const errorRes = resolveOperationsApiClientProblem(error);
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
            const errorRes = resolveOperationsApiClientProblem(error);
            return res.status(errorRes.status).json(errorRes).end();
          }
        }
      );

    router
      .get("/eservices", async (req, res) => {
        try {
          const eservices = await operationsService.getEservices(req.query);

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
          const errorRes = resolveOperationsApiClientProblem(error);
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
          const errorRes = resolveOperationsApiClientProblem(error);
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
          const errorRes = resolveOperationsApiClientProblem(error);
          return res.status(errorRes.status).json(errorRes).end();
        }
      })
      .get("/producers", async (req, res) => {
        try {
          const producers = await operationsService.getEservicesProducers(
            req.query
          );

          return res.status(200).json(producers).end();
        } catch (error) {
          const errorRes = resolveOperationsApiClientProblem(error);
          return res.status(errorRes.status).json(errorRes).end();
        }
      });

    return router;
  };
};

export default eServiceRouter;
