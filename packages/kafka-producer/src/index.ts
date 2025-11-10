import express from "express";
import tenantRouter from "./routes/tenants.js";
import eServiceRouter from "./routes/eservices.js";
import { config } from "./config/env.js";
import { initProducer } from "./producer.js";

const app = express();
const port = 3007;

export const producer = await initProducer(
  {
    awsRegion: config.awsRegion,
    kafkaBrokers: config.kafkaBrokers,
    kafkaClientId: config.kafkaClientId,
    kafkaDisableAwsIamAuth: true,
    kafkaLogLevel: config.kafkaLogLevel,
    kafkaReauthenticationThreshold: config.kafkaReauthenticationThreshold,
    kafkaTopics: config.kafkaTopics,
  },
  config.kafkaTopics,
);

app.use(express.json());
app.use("/tenants", tenantRouter);
app.use("/eservices", eServiceRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Kafka-producer topics: [${config.kafkaTopics}] listening on port: ${port}`,
  );
});
