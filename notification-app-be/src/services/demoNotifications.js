import { matchesType, selectTopNotifications } from "../utils/priority.js";

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

function minutesAgo(offsetMinutes) {
  return new Date(Date.now() - offsetMinutes * 60_000).toISOString();
}

function buildDemoNotifications() {
  return DEMO_NOTIFICATION_TEMPLATES.map((notification) => ({
    ID: notification.ID,
    Type: notification.Type,
    Message: notification.Message,
    Timestamp: minutesAgo(notification.offsetMinutes),
  }));
}

export function getDemoNotificationPage({ page, limit, notificationType }) {
  const filtered = buildDemoNotifications().filter((notification) =>
    matchesType(notification, notificationType)
  );
  const startIndex = (page - 1) * limit;
  const notifications = filtered.slice(startIndex, startIndex + limit);

  return {
    notifications,
    total: filtered.length,
    hasMore: startIndex + limit < filtered.length,
  };
}

export function getDemoPriorityNotifications({ limit, notificationType }) {
  const filtered = buildDemoNotifications().filter((notification) =>
    matchesType(notification, notificationType)
  );

  return selectTopNotifications(filtered, limit);
}
