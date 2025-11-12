import { startServer } from "pagopa-interop-probing-commons";
import { createApp } from "./app.js";
import { makeDrizzleConnection } from "./db/utils.js";
import { dbServiceBuilder } from "./services/dbService.js";
import { eServiceServiceBuilder } from "./services/eserviceService.js";
import { tenantServiceBuilder } from "./services/tenantService.js";
import { config } from "./utilities/config.js";

const db = makeDrizzleConnection(config);

const dbRepository = dbServiceBuilder(db);
const eServiceService = eServiceServiceBuilder(dbRepository);
const tenantService = tenantServiceBuilder(dbRepository);

startServer(createApp(eServiceService, tenantService), config);
