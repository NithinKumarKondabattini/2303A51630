import { Router } from "express";
import { validateLogEntry } from "logging-middleware";

import { canUseProtectedNotifications, env, getCredentialSnapshot } from "../config/env.js";
import { backendLogger } from "../config/logger.js";
import { asyncRoute } from "../utils/asyncRoute.js";
import { HttpError } from "../utils/httpError.js";
import { forwardLog } from "../services/upstreamService.js";

export const logsRouter = Router();

logsRouter.post(
  "/",
  asyncRoute(async (request, response) => {
    const entry = {
      stack: request.body?.stack,
      level: request.body?.level,
      package: request.body?.package,
      message: request.body?.message,
    };

    try {
      validateLogEntry(entry);
    } catch (error) {
      throw new HttpError(400, error.message);
    }

    if (!canUseProtectedNotifications(getCredentialSnapshot())) {
      await backendLogger.info("route", "frontend log accepted locally in demo mode");
      response.status(202).json({
        message: "Log accepted locally.",
        source: "demo",
      });
      return;
    }

    await forwardLog(env.serviceBaseUrl, entry);
    await backendLogger.info("route", "frontend log forwarded");

    response.status(202).json({
      message: "Log forwarded.",
    });
  })
);
