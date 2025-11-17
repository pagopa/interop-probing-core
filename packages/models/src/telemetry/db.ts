import { z } from "zod";

export const TelemetryPointInfluxModel = z.object({
  eservice_record_id: z.string(),
  time: z.string(),
  status: z.enum(["OK", "N_D", "KO"]),
  response_time: z.number(),
  ko_reason: z.string(),
});
export type TelemetryPointInfluxModel = z.infer<
  typeof TelemetryPointInfluxModel
>;
