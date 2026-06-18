export const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function normalizeNotificationType(type) {
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

export function getPriorityWeight(type) {
  return PRIORITY_WEIGHTS[normalizeNotificationType(type)] ?? 1;
}
