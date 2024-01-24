import { CommonConfig } from "pagopa-interop-probing-commons";
import { ReadModelDbConfig } from "./readmodelDbConfig.js";
import { z } from "zod";

const eServiceOperationsConfig = CommonConfig.and(ReadModelDbConfig);

export type EServiceOperationsConfig = z.infer<typeof eServiceOperationsConfig>;

export const config: EServiceOperationsConfig = {
  ...eServiceOperationsConfig.parse(process.env),
};
