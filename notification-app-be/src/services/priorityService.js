import { env } from "../config/env.js";
import { backendLogger } from "../config/logger.js";
import { fetchNotifications } from "./upstreamService.js";
import { matchesType, selectTopNotifications } from "../utils/priority.js";

let priorityCache = {
  loadedAt: 0,
  notifications: [],
};

export async function refreshPriorityCache() {
  const collected = [];

  for (let page = 1; page <= env.priorityScanMaxPages; page += 1) {
    const payload = await fetchNotifications(env.serviceBaseUrl, {
      page,
      limit: env.priorityScanPageSize,
    });

    const pageNotifications = Array.isArray(payload.notifications) ? payload.notifications : [];
    collected.push(...pageNotifications);

    if (pageNotifications.length < env.priorityScanPageSize) {
      break;
    }
  }

  priorityCache = {
    loadedAt: Date.now(),
    notifications: collected,
  };

  await backendLogger.info(
    "cache",
    `priority cache refreshed with ${collected.length} notifications`
  );
}

function shouldRefreshCache() {
  return Date.now() - priorityCache.loadedAt > 60_000;
}

export async function getPriorityNotifications(limit, notificationType) {
  if (shouldRefreshCache()) {
    await refreshPriorityCache();
  }

  const filtered = priorityCache.notifications.filter((notification) =>
    matchesType(notification, notificationType)
  );

  return selectTopNotifications(filtered, limit);
}
