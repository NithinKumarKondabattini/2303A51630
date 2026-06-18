const DEMO_NOTIFICATION_TEMPLATES = [
  {
    ID: "demo-placement-001",
    Type: "Placement",
    Message: "Campus placement drive for Afford Medical Technologies opens registration today.",
    offsetMinutes: 12,
  },
  {
    ID: "demo-result-001",
    Type: "Result",
    Message: "Semester result review window is available for final-year students.",
    offsetMinutes: 38,
  },
  {
    ID: "demo-event-001",
    Type: "Event",
    Message: "Innovation lab orientation starts at 2:00 PM in Block B seminar hall.",
    offsetMinutes: 74,
  },
  {
    ID: "demo-placement-002",
    Type: "Placement",
    Message: "Resume shortlisting closes tonight for the backend internship track.",
    offsetMinutes: 126,
  },
  {
    ID: "demo-result-002",
    Type: "Result",
    Message: "Hackathon qualifier scores have been published on the student portal.",
    offsetMinutes: 183,
  },
  {
    ID: "demo-event-002",
    Type: "Event",
    Message: "Library extended hours are active this week for exam preparation.",
    offsetMinutes: 240,
  },
  {
    ID: "demo-placement-003",
    Type: "Placement",
    Message: "Mock interview slots are open for placement registered students.",
    offsetMinutes: 315,
  },
  {
    ID: "demo-event-003",
    Type: "Event",
    Message: "Technical club meetup has moved to the auditorium due to maintenance.",
    offsetMinutes: 420,
  },
  {
    ID: "demo-result-003",
    Type: "Result",
    Message: "Internal assessment marks for batch 2303 are ready for verification.",
    offsetMinutes: 510,
  },
  {
    ID: "demo-event-004",
    Type: "Event",
    Message: "Transport desk shared updated evening bus timings for all routes.",
    offsetMinutes: 650,
  },
  {
    ID: "demo-placement-004",
    Type: "Placement",
    Message: "Pre-placement talk schedule is confirmed for the cloud engineering role.",
    offsetMinutes: 810,
  },
  {
    ID: "demo-result-004",
    Type: "Result",
    Message: "Revaluation status updates are now visible for submitted requests.",
    offsetMinutes: 960,
  },
];

const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function minutesAgo(offsetMinutes) {
  return new Date(Date.now() - offsetMinutes * 60_000).toISOString();
}

function normalizeType(type) {
  const trimmed = String(type ?? "").trim().toLowerCase();

  if (trimmed === "placement") {
    return "Placement";
  }

  if (trimmed === "result") {
    return "Result";
  }

  return "Event";
}

function buildDemoNotifications() {
  return DEMO_NOTIFICATION_TEMPLATES.map((notification) => ({
    ID: notification.ID,
    Type: notification.Type,
    Message: notification.Message,
    Timestamp: minutesAgo(notification.offsetMinutes),
  }));
}

function matchesType(notification, notificationType) {
  return !notificationType || notificationType === "All"
    ? true
    : normalizeType(notification.Type) === normalizeType(notificationType);
}

function createMeta(notificationType) {
  return {
    acceptedQueryParameters: ["limit", "page", "notification_type"],
    supportedNotificationTypes: ["Event", "Result", "Placement"],
    activeFilter: notificationType ?? "All",
    source: "static-demo",
    usingDemoData: true,
    staticDemo: true,
    canFetchLiveNotifications: false,
    warning: "Backend API is unavailable on this static link, showing demo data.",
  };
}

function comparePriority(left, right) {
  const weightDelta =
    (PRIORITY_WEIGHTS[normalizeType(right.Type)] ?? 0) -
    (PRIORITY_WEIGHTS[normalizeType(left.Type)] ?? 0);

  if (weightDelta !== 0) {
    return weightDelta;
  }

  return Date.parse(right.Timestamp ?? 0) - Date.parse(left.Timestamp ?? 0);
}

export function getStaticDemoNotificationPage({ page, limit, notificationType }) {
  const filtered = buildDemoNotifications().filter((notification) =>
    matchesType(notification, notificationType)
  );
  const startIndex = (page - 1) * limit;
  const notifications = filtered.slice(startIndex, startIndex + limit);

  return {
    notifications,
    page,
    limit,
    hasMore: startIndex + limit < filtered.length,
    fetchedAt: new Date().toISOString(),
    meta: createMeta(notificationType),
  };
}

export function getStaticDemoPriorityNotifications({ limit, notificationType }) {
  const notifications = buildDemoNotifications()
    .filter((notification) => matchesType(notification, notificationType))
    .sort(comparePriority)
    .slice(0, limit);

  return {
    notifications,
    limit,
    fetchedAt: new Date().toISOString(),
    meta: createMeta(notificationType),
  };
}
