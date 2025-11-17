import { createApp } from "../src/app.js";
import { StatisticsService } from "../src/services/statisticsService.js";

export const statisticsService = {} as StatisticsService;

export const api = createApp(statisticsService);
