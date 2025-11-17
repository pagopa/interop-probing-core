import {
  initTelemetryManager,
  startServer,
  TelemetryManager,
} from "pagopa-interop-probing-commons";
import { config } from "./utilities/config.js";
import { createApp } from "./app.js";
import {
  TelemetryQueryService,
  telemetryQueryServiceBuilder,
} from "./services/telemetryQueryService.js";
import {
  StatisticsService,
  statisticsServiceBuilder,
} from "./services/statisticsService.js";

const telemetryManager: TelemetryManager = initTelemetryManager(config);
const telemetryService: TelemetryQueryService =
  telemetryQueryServiceBuilder(telemetryManager);
const statisticsService: StatisticsService =
  statisticsServiceBuilder(telemetryService);

startServer(createApp(statisticsService), config);
