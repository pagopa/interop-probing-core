import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import { makeApiProblem } from "../model/domain/errors.js";
import { ExpressContext, ZodiosContext } from "pagopa-interop-probing-commons";
import { StatisticsService } from "../services/statisticsService.js";
import { api } from "../model/generated/api.js";
import { statisticsErrorMapper } from "../utilities/errorMappers.js";

const statisticsRouter = (
  ctx: ZodiosContext
): ((
  statisticsService: StatisticsService
) => ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext>) => {
  return (statisticsService: StatisticsService) => {
    const router = ctx.router(api.api);

    router
      .get("/telemetryData/eservices/:eserviceRecordId", async (req, res) => {
        try {
          const telemetryData = await statisticsService.statisticsEservices(
            req.params,
            req.query
          );

          return res.status(200).json(telemetryData).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, statisticsErrorMapper);
          return res.status(errorRes.status).json(errorRes).end();
        }
      })
      .get(
        "/telemetryData/eservices/filtered/:eserviceRecordId",
        async (req, res) => {
          try {
            const telemetryData =
              await statisticsService.filteredStatisticsEservices(
                req.params,
                req.query
              );

            return res.status(200).json(telemetryData).end();
          } catch (error) {
            const errorRes = makeApiProblem(error, statisticsErrorMapper);
            return res.status(errorRes.status).json(errorRes).end();
          }
        }
      );

    return router;
  };
};

export default statisticsRouter;
