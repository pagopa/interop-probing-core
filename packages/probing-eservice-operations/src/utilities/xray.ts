import { NextFunction, Request, Response } from "express";
import * as AWSXRay from "aws-xray-sdk";

interface XRayExpress extends Request {
  subsegment?: AWSXRay.Subsegment;
}

export const xRayWrapper =
  (
    handler: (
      req: Request | any,
      res: Response,
      next: NextFunction
    ) => Promise<any>
  ) =>
  async (req: XRayExpress, res: Response, next: NextFunction) => {
    const subsegment = AWSXRay.getSegment()?.addNewSubsegment("eServices");
    req.subsegment = subsegment;

    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    } finally {
      if (req.subsegment) {
        req.subsegment.close();
      }
    }
  };
