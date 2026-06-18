import { requestJson } from "./httpClient";

function filterToParams(notificationType) {
  if (!notificationType || notificationType === "All") {
    return {};
  }

  return {
    notification_type: notificationType,
  };
}

export function fetchNotifications({ page, limit, notificationType, signal }) {
  return requestJson("/api/notifications", {
    params: {
      page,
      limit,
      ...filterToParams(notificationType),
    },
    signal,
  });
}

export function fetchPriorityNotifications({ limit, notificationType, signal }) {
  return requestJson("/api/notifications/priority", {
    params: {
      limit,
      ...filterToParams(notificationType),
    },
    signal,
  });
}
