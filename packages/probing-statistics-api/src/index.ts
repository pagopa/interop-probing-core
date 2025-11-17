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
const telemetryQueryService: TelemetryQueryService =
  telemetryQueryServiceBuilder(telemetryManager);
const statisticsService: StatisticsService = statisticsServiceBuilder(
  telemetryQueryService,
);

startServer(createApp(statisticsService), config);
