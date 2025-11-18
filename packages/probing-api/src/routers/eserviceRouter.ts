import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import {
  ExpressContext,
  ZodiosContext,
  zodiosValidationErrorToApiProblem,
} from "pagopa-interop-probing-commons";
import { resolveApiProblem } from "../model/domain/errors.js";
import { OperationsService } from "../services/operationsService.js";
import { api } from "../model/generated/api.js";

const eServiceRouter = (
  ctx: ZodiosContext,
  operationsService: OperationsService,
): ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext> => {
  const router = ctx.router(api.api, {
    validationErrorHandler: zodiosValidationErrorToApiProblem,
  });

  router.post(
    "/eservices/:eserviceId/versions/:versionId/updateState",
    async (req, res) => {
      try {
        await operationsService.updateEserviceState(
          req.params.eserviceId,
          req.params.versionId,
          req.body,
          req.ctx,
        );
        return res.status(204).end();
      } catch (error) {
        const errorRes = resolveApiProblem(error, req.ctx);
        return res.status(errorRes.status).json(errorRes).end();
      }
    },
  );

  router.post(
    "/eservices/:eserviceId/versions/:versionId/probing/updateState",
    async (req, res) => {
      try {
        await operationsService.updateEserviceProbingState(
          req.params.eserviceId,
          req.params.versionId,
          req.body,
          req.ctx,
        );
        return res.status(204).end();
      } catch (error) {
        const errorRes = resolveApiProblem(error, req.ctx);
        return res.status(errorRes.status).json(errorRes).end();
      }
    },
  );

  router.post(
    "/eservices/:eserviceId/versions/:versionId/updateFrequency",
    async (req, res) => {
      try {
        await operationsService.updateEserviceFrequency(
          req.params.eserviceId,
          req.params.versionId,
          req.body,
          req.ctx,
        );
        return res.status(204).end();
      } catch (error) {
        const errorRes = resolveApiProblem(error, req.ctx);
        return res.status(errorRes.status).json(errorRes).end();
      }
    },
  );

  router.get("/eservices", async (req, res) => {
    try {
      const eservices = await operationsService.getEservices(
        req.query,
        req.ctx,
      );
      return res.status(200).json(eservices).end();
    } catch (error) {
      const errorRes = resolveApiProblem(error, req.ctx);
      return res.status(errorRes.status).json(errorRes).end();
    }
  });

  router.get("/eservices/mainData/:eserviceRecordId", async (req, res) => {
    try {
      const eServiceMainData = await operationsService.getEserviceMainData(
        req.params.eserviceRecordId,
        req.ctx,
      );
      return res.status(200).json(eServiceMainData).end();
    } catch (error) {
      const errorRes = resolveApiProblem(error, req.ctx);
      return res.status(errorRes.status).json(errorRes).end();
    }
  });

  router.get("/eservices/probingData/:eserviceRecordId", async (req, res) => {
    try {
      const eServiceProbingData =
        await operationsService.getEserviceProbingData(
          req.params.eserviceRecordId,
          req.ctx,
        );

      return res.status(200).json(eServiceProbingData).end();
    } catch (error) {
      const errorRes = resolveApiProblem(error, req.ctx);
      return res.status(errorRes.status).json(errorRes).end();
    }
  });

  router.get("/producers", async (req, res) => {
    try {
      const producers = await operationsService.getEservicesProducers(
        req.query,
        req.ctx,
      );
      return res.status(200).json(producers).end();
    } catch (error) {
      const errorRes = resolveApiProblem(error, req.ctx);
      return res.status(errorRes.status).json(errorRes).end();
    }
  });

  return router;
};

export default eServiceRouter;
