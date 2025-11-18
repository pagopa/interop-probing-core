import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import { makeApiProblem } from "../model/domain/errors.js";
import {
  ExpressContext,
  ZodiosContext,
  logger,
} from "pagopa-interop-probing-commons";
import { api } from "pagopa-interop-probing-eservice-operations-client";
import { errorMapper } from "../utilities/errorMapper.js";
import { TenantService } from "../services/tenantService.js";

const tenantRouter = (
  ctx: ZodiosContext,
  tenantService: TenantService,
): ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext> => {
  const tenantRouter = ctx.router(api.api);

  tenantRouter
    .post("/tenants/:tenantId/saveTenant", async (req, res) => {
      try {
        await tenantService.saveTenant(req.params, req.body);
        return res.status(204).end();
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
    .delete("/tenants/:tenantId/deleteTenant", async (req, res) => {
      try {
        await tenantService.deleteTenant(req.params.tenantId);

        return res.status(204).end();
      } catch (error) {
        const errorRes = makeApiProblem(
          error,
          errorMapper,
          logger(req.ctx),
          req.ctx.correlationId,
        );
        return res.status(errorRes.status).json(errorRes).end();
      }
    });

  return tenantRouter;
};

export default tenantRouter;
