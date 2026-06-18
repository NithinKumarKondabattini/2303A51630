import { Router } from "express";

import { env } from "../config/env.js";
import { backendLogger } from "../config/logger.js";
import { asyncRoute } from "../utils/asyncRoute.js";
import { fetchNotifications } from "../services/upstreamService.js";
import { getPriorityNotifications } from "../services/priorityService.js";

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeFilter(value) {
  if (typeof value !== "string" || value.trim() === "" || value === "All") {
    return undefined;
  }

  return value;
}

export const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  asyncRoute(async (request, response) => {
    const page = toNumber(request.query.page, 1);
    const limit = toNumber(request.query.limit, 12);
    const notificationType = normalizeFilter(request.query.notification_type);
    const payload = await fetchNotifications(env.serviceBaseUrl, {
      page,
      limit,
      notification_type: notificationType,
    });
    const notifications = Array.isArray(payload.notifications) ? payload.notifications : [];

    await backendLogger.info(
      "route",
      `notifications page served page=${page} limit=${limit} filter=${notificationType ?? "All"}`
    );

    response.json({
      notifications,
      page,
      limit,
      hasMore: notifications.length === limit,
      fetchedAt: new Date().toISOString(),
    });
  })
);

notificationsRouter.get(
  "/priority",
  asyncRoute(async (request, response) => {
    const limit = toNumber(request.query.limit, 10);
    const notificationType = normalizeFilter(request.query.notification_type);
    const notifications = await getPriorityNotifications(limit, notificationType);

    await backendLogger.info(
      "route",
      `priority inbox served limit=${limit} filter=${notificationType ?? "All"}`
    );

    response.json({
      notifications,
      limit,
      fetchedAt: new Date().toISOString(),
    });
  })
);
