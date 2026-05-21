import { createApp } from "../src/app.js";
import { OperationsService } from "../src/services/operationsService.js";

export const operationsService = {} as OperationsService;

export const api = createApp(operationsService);
