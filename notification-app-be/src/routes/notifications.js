import { Router } from "express";

import {
  ACCEPTED_QUERY_PARAMETERS,
  canUseProtectedNotifications,
  env,
  getCredentialSnapshot,
  SUPPORTED_NOTIFICATION_TYPES,
} from "../config/env.js";
import { backendLogger } from "../config/logger.js";
import { asyncRoute } from "../utils/asyncRoute.js";
import { fetchNotifications } from "../services/upstreamService.js";
import { getPriorityNotifications } from "../services/priorityService.js";
import {
  getDemoNotificationPage,
  getDemoPriorityNotifications,
} from "../services/demoNotifications.js";
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

function createMeta({ setup, notificationType, source, warning }) {
  const canFetchLiveNotifications = canUseProtectedNotifications(setup);

  return {
    acceptedQueryParameters: ACCEPTED_QUERY_PARAMETERS,
    supportedNotificationTypes: SUPPORTED_NOTIFICATION_TYPES,
    activeFilter: notificationType ?? "All",
    source,
    usingDemoData: source === "demo",
    canFetchLiveNotifications,
    warning,
  };
}

export const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  asyncRoute(async (request, response) => {
    const page = toNumber(request.query.page, 1, { min: 1, max: 1000 });
    const limit = toNumber(request.query.limit, 12, { min: 1, max: 100 });
    const notificationType = normalizeFilter(request.query.notification_type);
    const setup = getCredentialSnapshot();
    const canFetchLiveNotifications = canUseProtectedNotifications(setup);
    let source = "live";
    let warning = "";
    let notifications = [];
    let hasMore = false;

    if (canFetchLiveNotifications) {
      try {
        const payload = await fetchNotifications(env.serviceBaseUrl, {
          page,
          limit,
          notification_type: notificationType,
        });
        notifications = Array.isArray(payload.notifications) ? payload.notifications : [];
        hasMore = notifications.length === limit;
      } catch (error) {
        source = "demo";
        warning = `Live protected API failed, showing demo data instead: ${error.message}`;
        await backendLogger.warn("route", warning);
      }
    } else {
      source = "demo";
      warning = "Protected API credentials are incomplete, showing demo data.";
    }

    if (source === "demo") {
      const demoPayload = getDemoNotificationPage({ page, limit, notificationType });
      notifications = demoPayload.notifications;
      hasMore = demoPayload.hasMore;
    }

    await backendLogger.info(
      "route",
      `notifications page served source=${source} page=${page} limit=${limit} filter=${notificationType ?? "All"}`
    );

    response.json({
      notifications,
      page,
      limit,
      hasMore,
      fetchedAt: new Date().toISOString(),
      meta: createMeta({ setup, notificationType, source, warning }),
    });
  })
);

notificationsRouter.get(
  "/priority",
  asyncRoute(async (request, response) => {
    const limit = toNumber(request.query.limit, 10, { min: 1, max: 20 });
    const notificationType = normalizeFilter(request.query.notification_type);
    const setup = getCredentialSnapshot();
    const canFetchLiveNotifications = canUseProtectedNotifications(setup);
    let source = "live";
    let warning = "";
    let notifications = [];

    if (canFetchLiveNotifications) {
      try {
        notifications = await getPriorityNotifications(limit, notificationType);
      } catch (error) {
        source = "demo";
        warning = `Live protected API failed, showing demo data instead: ${error.message}`;
        await backendLogger.warn("route", warning);
      }
    } else {
      source = "demo";
      warning = "Protected API credentials are incomplete, showing demo data.";
    }

    if (source === "demo") {
      notifications = getDemoPriorityNotifications({ limit, notificationType });
    }

    await backendLogger.info(
      "route",
      `priority inbox served source=${source} limit=${limit} filter=${notificationType ?? "All"}`
    );

    response.json({
      notifications,
      limit,
      fetchedAt: new Date().toISOString(),
      meta: createMeta({ setup, notificationType, source, warning }),
    });
  })
);
