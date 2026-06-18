import { Router } from "express";

import {
  ACCEPTED_QUERY_PARAMETERS,
  env,
  SUPPORTED_NOTIFICATION_TYPES,
} from "../config/env.js";
import { backendLogger } from "../config/logger.js";
import { asyncRoute } from "../utils/asyncRoute.js";
import { fetchNotifications } from "../services/upstreamService.js";
import { getPriorityNotifications } from "../services/priorityService.js";
import { HttpError } from "../utils/httpError.js";

function toNumber(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

function normalizeFilter(value) {
  if (typeof value !== "string" || value.trim() === "" || value === "All") {
    return undefined;
  }

  const normalizedValue =
    value.trim().charAt(0).toUpperCase() + value.trim().slice(1).toLowerCase();

  if (!SUPPORTED_NOTIFICATION_TYPES.includes(normalizedValue)) {
    throw new HttpError(
      400,
      `notification_type must be one of: ${SUPPORTED_NOTIFICATION_TYPES.join(", ")}.`
    );
  }

  return normalizedValue;
}

export const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  asyncRoute(async (request, response) => {
    const page = toNumber(request.query.page, 1, { min: 1, max: 1000 });
    const limit = toNumber(request.query.limit, 12, { min: 1, max: 100 });
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
      meta: {
        acceptedQueryParameters: ACCEPTED_QUERY_PARAMETERS,
        supportedNotificationTypes: SUPPORTED_NOTIFICATION_TYPES,
        activeFilter: notificationType ?? "All",
      },
    });
  })
);

notificationsRouter.get(
  "/priority",
  asyncRoute(async (request, response) => {
    const limit = toNumber(request.query.limit, 10, { min: 1, max: 20 });
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
      meta: {
        acceptedQueryParameters: ACCEPTED_QUERY_PARAMETERS,
        supportedNotificationTypes: SUPPORTED_NOTIFICATION_TYPES,
        activeFilter: notificationType ?? "All",
      },
    });
  })
);
