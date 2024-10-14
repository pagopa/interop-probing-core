import { genericLogger } from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import app from "./app.js";

// App
app.listen(config.port, config.host, () => {
  genericLogger.info(`listening on ${config.host}:${config.port}`);
});
