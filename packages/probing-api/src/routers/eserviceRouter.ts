import { ZodiosEndpointDefinitions, ZodiosInstance } from "@zodios/core";
import { ZodiosRouter } from "@zodios/express";
import { resolveOperationsApiClientProblem } from "../model/domain/errors.js";
import {
  ExpressContext,
  ZodiosContext,
  logger,
} from "pagopa-interop-probing-commons";
import { Api } from "pagopa-interop-probing-eservice-operations-client";
import {
  OperationsService,
  operationsServiceBuilder,
} from "../services/operationsService.js";
import { api } from "../model/generated/api.js";
import {
  fromECToMonitorState,
  fromEPDToMonitorState,
  isActive,
} from "../utilities/enumUtils.js";
import { ApiEServiceContent } from "../model/eservice.js";
import { genericError } from "pagopa-interop-probing-models";
import { z } from "zod";

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

          const mappedContent = eservices.content.map((el) => ({
            ...el,
            state: fromECToMonitorState(el),
          }));

          const result = z.array(ApiEServiceContent).safeParse(mappedContent);
          if (!result.success) {
            logger.error(
              `Unable to parse eservices items: result ${JSON.stringify(
                result
              )} - data ${JSON.stringify(eservices.content)} `
            );

            throw genericError("Unable to parse eservices items");
          }

          return res
            .status(200)
            .json({
              content: result.data,
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

          return res
            .status(200)
            .json({
              probingEnabled: eServiceProbingData.probingEnabled,
              eserviceActive: isActive(eServiceProbingData.state),
              state: fromEPDToMonitorState(eServiceProbingData),
              ...(eServiceProbingData.responseReceived && {
                responseReceived: eServiceProbingData.responseReceived,
              }),
            })
            .end();
        } catch (error) {
          const errorRes = resolveOperationsApiClientProblem(error);
          return res.status(errorRes.status).json(errorRes).end();
        }
      })
      .get("/producers", async (req, res) => {
        try {
          const { content } = await operationsService.getEservicesProducers(
            req.query
          );

          return res
            .status(200)
            .json(content.map((el) => ({ label: el, value: el })))
            .end();
        } catch (error) {
          const errorRes = resolveOperationsApiClientProblem(error);
          return res.status(errorRes.status).json(errorRes).end();
        }
      });

    return router;
  };
};

export default eServiceRouter;
