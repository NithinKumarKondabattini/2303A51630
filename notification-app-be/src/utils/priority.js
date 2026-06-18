export const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function normalizeType(type) {
  if (typeof type !== "string") {
    return "Event";
  }

  const trimmed = type.trim().toLowerCase();

  if (trimmed === "placement") {
    return "Placement";
  }

  if (trimmed === "result") {
    return "Result";
  }

  return "Event";
}

export function comparePriority(left, right) {
  const weightDelta =
    (PRIORITY_WEIGHTS[normalizeType(right.Type)] ?? 0) -
    (PRIORITY_WEIGHTS[normalizeType(left.Type)] ?? 0);

  if (weightDelta !== 0) {
    return weightDelta;
  }

  const rightTime = Date.parse(right.Timestamp ?? 0);
  const leftTime = Date.parse(left.Timestamp ?? 0);

  if (rightTime !== leftTime) {
    return rightTime - leftTime;
  }

  return String(right.ID ?? "").localeCompare(String(left.ID ?? ""));
}

export function matchesType(notification, notificationType) {
  if (!notificationType || notificationType === "All") {
    return true;
  }

  return normalizeType(notification.Type) === normalizeType(notificationType);
}

export function selectTopNotifications(notifications, limit) {
  const bounded = [];

  for (const notification of notifications) {
    bounded.push(notification);
    bounded.sort(comparePriority);

    if (bounded.length > limit) {
      bounded.length = limit;
    }
  }

  return bounded;
}
