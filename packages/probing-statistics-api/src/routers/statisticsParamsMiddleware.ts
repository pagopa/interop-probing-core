import { RequestHandler, RequestParamHandler } from "express";
import { match, P } from "ts-pattern";

export const eserviceRecordIdParamHandler: RequestParamHandler = (
  req,
  _res,
  next,
) => {
  Object.assign(req.params, {
    eserviceRecordId: Number(req.params.eserviceRecordId),
  });
  next();
};

export const statisticsQueryParamsMiddleware: RequestHandler = (
  req,
  _res,
  next,
) => {
  Object.assign(req.query, {
    pollingFrequency: match(req.query.pollingFrequency)
      .with(P.string, Number)
      .otherwise((value) => value),
  });
  next();
};
