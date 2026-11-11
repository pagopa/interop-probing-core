import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import { makeApiProblem } from "../model/domain/errors.js";
import {
  ExpressContext,
  ZodiosContext,
  logger,
  zodiosValidationErrorToApiProblem,
} from "pagopa-interop-probing-commons";
import { StatisticsService } from "../services/statisticsService.js";
import { errorMapper } from "../utilities/errorMapper.js";
import { probingStatisticsApi } from "pagopa-interop-probing-api-clients";

const statisticsRouter = (
  ctx: ZodiosContext,
  statisticsService: StatisticsService,
): ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext> => {
  const router = ctx.router(probingStatisticsApi.TelemetryApi.api, {
    validationErrorHandler: zodiosValidationErrorToApiProblem,
  });

  router
    .get("/telemetryData/eservices/:eserviceRecordId", async (req, res) => {
      try {
        const telemetryData = await statisticsService.getEserviceStatistics(
          req.params,
          req.query,
        );

        return res.status(200).json(telemetryData).end();
      } catch (error) {
        const errorRes = makeApiProblem(
          error,
          errorMapper,
          logger(req.ctx),
          req.ctx.correlationId,
        );
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get(
      "/telemetryData/eservices/filtered/:eserviceRecordId",
      async (req, res) => {
        try {
          const telemetryData =
            await statisticsService.getFilteredEserviceStatistics(
              req.params,
              req.query,
            );

          return res.status(200).json(telemetryData).end();
        } catch (error) {
          const errorRes = makeApiProblem(
            error,
            errorMapper,
            logger(req.ctx),
            req.ctx.correlationId,
          );
          return res.status(errorRes.status).json(errorRes).end();
        }
      },
    );

  return router;
};

export default statisticsRouter;
