import { CommonConfig } from "pagopa-interop-probing-commons";
import { z } from "zod";

const apiConfig = CommonConfig;

export type ApiConfig = z.infer<typeof apiConfig>;

export const config: ApiConfig = {
  ...apiConfig.parse(process.env),
};
