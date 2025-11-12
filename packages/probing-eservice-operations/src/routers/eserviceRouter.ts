import { ZodiosEndpointDefinitions } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import { makeApiProblem } from "../model/domain/errors.js";
import {
  ExpressContext,
  ZodiosContext,
  logger,
} from "pagopa-interop-probing-commons";
import { EserviceService } from "../services/eserviceService.js";
import { api } from "pagopa-interop-probing-eservice-operations-client";
import { errorMapper } from "../utilities/errorMapper.js";

const eServiceRouter = (
  ctx: ZodiosContext,
  eServiceService: EserviceService,
): ZodiosRouter<ZodiosEndpointDefinitions, ExpressContext> => {
  const eServiceRouter = ctx.router(api.api);

  eServiceRouter
    .post(
      "/eservices/:eserviceId/versions/:versionId/updateState",
      async (req, res) => {
        try {
          await eServiceService.updateEserviceState(
            req.params.eserviceId,
            req.params.versionId,
            req.body,
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
          return res.status(errorRes.status).json(errorRes).end();
        }
      },
    )
    .post(
      "/eservices/:eserviceId/versions/:versionId/probing/updateState",
      async (req, res) => {
        try {
          await eServiceService.updateEserviceProbingState(
            req.params.eserviceId,
            req.params.versionId,
            req.body,
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
          return res.status(errorRes.status).json(errorRes).end();
        }
      },
    )
    .post(
      "/eservices/:eserviceId/versions/:versionId/updateFrequency",
      async (req, res) => {
        try {
          await eServiceService.updateEserviceFrequency(
            req.params.eserviceId,
            req.params.versionId,
            req.body,
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
          return res.status(errorRes.status).json(errorRes).end();
        }
      },
    )
    .post(
      "/eservices/:eserviceId/versions/:versionId/saveEservice",
      async (req, res) => {
        try {
          await eServiceService.saveEservice(
            req.params.eserviceId,
            req.params.versionId,
            req.body,
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
          return res.status(errorRes.status).json(errorRes).end();
        }
      },
    )
    .delete("/eservices/:eserviceId/deleteEservice", async (req, res) => {
      try {
        await eServiceService.deleteEservice(req.params.eserviceId);

        return res.status(204).end();
      } catch (error) {
        const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .post(
      "/eservices/:eserviceRecordId/updateLastRequest",
      async (req, res) => {
        try {
          await eServiceService.updateEserviceLastRequest(
            Number(req.params.eserviceRecordId),
            req.body,
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
          return res.status(errorRes.status).json(errorRes).end();
        }
      },
    )
    .post(
      "/eservices/:eserviceRecordId/updateResponseReceived",
      async (req, res) => {
        try {
          await eServiceService.updateResponseReceived(
            Number(req.params.eserviceRecordId),
            req.body,
          );
          return res.status(204).end();
        } catch (error) {
          const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
          return res.status(errorRes.status).json(errorRes).end();
        }
      },
    )
    .get("/eservices", async (req, res) => {
      try {
        const eservices = await eServiceService.searchEservices(
          {
            eserviceName: req.query.eserviceName,
            producerName: req.query.producerName,
            versionNumber: req.query.versionNumber,
            state: req.query.state,
            limit: req.query.limit,
            offset: req.query.offset,
          },
          logger(req.ctx),
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
        const errorRes = makeApiProblem(error, () => 500, logger(req.ctx));
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/mainData/:eserviceRecordId", async (req, res) => {
      try {
        const eServiceMainData = await eServiceService.getEserviceMainData(
          Number(req.params.eserviceRecordId),
          logger(req.ctx),
        );

        return res.status(200).json(eServiceMainData).end();
      } catch (error) {
        const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/probingData/:eserviceRecordId", async (req, res) => {
      try {
        const eServiceProbingData =
          await eServiceService.getEserviceProbingData(
            Number(req.params.eserviceRecordId),
            logger(req.ctx),
          );

        return res.status(200).json(eServiceProbingData).end();
      } catch (error) {
        const errorRes = makeApiProblem(error, errorMapper, logger(req.ctx));
        return res.status(errorRes.status).json(errorRes).end();
      }
    })
    .get("/eservices/polling", async (req, res) => {
      try {
        const eservices = await eServiceService.getEservicesReadyForPolling(
          req.query,
          logger(req.ctx),
        );

        return res
          .status(200)
          .json({
            content: eservices.content,
            totalElements: eservices.totalElements,
          })
          .end();
      } catch (error) {
        const errorRes = makeApiProblem(error, () => 500, logger(req.ctx));
        return res.status(errorRes.status).json(errorRes).end();
      }
    });

  eServiceRouter.get("/producers", async (req, res) => {
    try {
      const eservices = await eServiceService.getEservicesProducers({
        producerName: req.query.producerName,
        limit: req.query.limit,
        offset: req.query.offset,
      });

      return res
        .status(200)
        .json({
          content: eservices.content,
        })
        .end();
    } catch (error) {
      const errorRes = makeApiProblem(error, () => 500, logger(req.ctx));
      return res.status(errorRes.status).json(errorRes).end();
    }
  });

  return eServiceRouter;
};

export default eServiceRouter;
