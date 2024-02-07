import { z } from "zod";

export const ConsumerConfig = z
  .object({
    DEFAULT_CONSUMER_TIMEOUT_SECONDS: z.coerce.number().min(1),
  })
  .transform((c) => ({
    defaultConsumerTimeout: c.DEFAULT_CONSUMER_TIMEOUT_SECONDS,
  }));


export type ConsumerConfig = z.infer<typeof ConsumerConfig>;

export const consumerConfig: () => ConsumerConfig = () =>
  ConsumerConfig.parse(process.env);
