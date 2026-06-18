export function formatTimestamp(timestamp) {
  const parsed = Date.parse(timestamp ?? "");

  if (Number.isNaN(parsed)) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function getRelativeTimeLabel(timestamp) {
  const parsed = Date.parse(timestamp ?? "");

  if (Number.isNaN(parsed)) {
    return "Unscheduled";
  }

  const diffMs = parsed - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}
