import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import { makeApiProblem } from "../model/domain/errors.js";
import {
  ExpressContext,
  ZodiosContext,
  logger,
} from "pagopa-interop-probing-commons";
import { config } from "../utilities/config.js";
import { modelServiceBuilder } from "../services/db/dbService.js";
import { api } from "pagopa-interop-probing-eservice-operations-client";
import { errorMapper } from "../utilities/errorMapper.js";
import { ModelRepository } from "../repositories/modelRepository.js";
import { tenantServiceBuilder } from "../services/tenantService.js";
import { tenantQueryBuilder } from "../services/db/tenantQuery.js";

const modelService = modelServiceBuilder(await ModelRepository.init(config));
const tenantQuery = tenantQueryBuilder(modelService);
const tenantService = tenantServiceBuilder(tenantQuery);

const tenantRouter = (
  ctx: ZodiosContext,
): ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext> => {
  const tenantRouter = ctx.router(api.api);

  tenantRouter
    .post("/tenants/:tenantId/saveTenant", async (req, res) => {
      try {
        await tenantService.saveTenant(req.params, req.body);
        return res.status(204).end();
      } catch (error) {
        const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .delete("/tenants/:tenantId/deleteTenant", async (req, res) => {
      try {
        await tenantService.deleteTenant(req.params.tenantId);

        return res.status(204).end();
      } catch (error) {
        const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
        return res.status(errorRes.status).json(errorRes).end();
      }
    });

  return tenantRouter;
};

export default tenantRouter;
