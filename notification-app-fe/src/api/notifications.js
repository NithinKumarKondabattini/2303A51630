import { requestJson } from "./httpClient";
import {
  getStaticDemoNotificationPage,
  getStaticDemoPriorityNotifications,
} from "./demoNotifications";

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
  }).catch(() => getStaticDemoNotificationPage({ page, limit, notificationType }));
}

export function fetchPriorityNotifications({ limit, notificationType, signal }) {
  return requestJson("/api/notifications/priority", {
    params: {
      limit,
      ...filterToParams(notificationType),
    },
    signal,
  }).catch(() => getStaticDemoPriorityNotifications({ limit, notificationType }));
}
