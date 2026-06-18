# Notification System Design

## API Design

### Core user actions

- list notifications for the signed-in student
- filter notifications by type
- mark one notification as viewed
- mark all visible notifications as viewed
- fetch unread counts for the inbox badge
- subscribe to real-time notification arrivals

### REST endpoints

#### `GET /api/notifications`

Headers:

- `Authorization: Bearer <token>`

Query params:

- `page`
- `limit`
- `notification_type`
- `view_state` (`all`, `new`, `viewed`)

Response:

```json
{
  "data": [
    {
      "id": "0d4e2d43-3c9d-4ec3-b64d-2b30e4c1fa21",
      "type": "Placement",
      "message": "Interview shortlist published",
      "createdAt": "2026-04-22T17:51:18Z",
      "viewedAt": null
    }
  ],
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

#### `PATCH /api/notifications/{notificationId}/viewed`

Headers:

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request:

```json
{
  "viewedAt": "2026-04-22T17:55:00Z"
}
```

Response:

```json
{
  "id": "0d4e2d43-3c9d-4ec3-b64d-2b30e4c1fa21",
  "status": "viewed"
}
```

#### `PATCH /api/notifications/viewed/bulk`

Headers:

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Request:

```json
{
  "notificationIds": [
    "0d4e2d43-3c9d-4ec3-b64d-2b30e4c1fa21",
    "ce44ef41-f4df-4517-98a5-bd6cb64f8444"
  ]
}
```

Response:

```json
{
  "updated": 2
}
```

#### `GET /api/notifications/unread-summary`

Response:

```json
{
  "totalUnread": 12,
  "byType": {
    "Placement": 3,
    "Result": 5,
    "Event": 4
  }
}
```

### Real-time delivery

I would use Server-Sent Events for inbox updates because the flow is one-way, lightweight, and simpler than WebSockets for this use case. The client keeps the paginated REST API for history and receives newly created notification IDs over SSE, then re-fetches the first page or merges the new items into local state.

## Storage Model

### Storage choice

I would use PostgreSQL. The access pattern is highly relational: notifications belong to students, read state is per student, filters are predictable, and the query surface benefits from strong indexing and transactional guarantees.

### Schema

```sql
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  external_student_id BIGINT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_notifications (
  student_id BIGINT NOT NULL REFERENCES students(id),
  notification_id UUID NOT NULL REFERENCES notifications(id),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, notification_id)
);

CREATE INDEX idx_student_notifications_inbox
  ON student_notifications (student_id, is_read, created_at DESC);

CREATE INDEX idx_notifications_type_created_at
  ON notifications (type, created_at DESC);
```

### Why this scales better

- `notifications` stores shared notification payload once.
- `student_notifications` stores recipient state separately, which avoids duplicating large message bodies.
- Composite indexes line up with the inbox query shape.
- Table partitioning by month can be added later on `student_notifications.created_at` if data volume keeps growing.

### Example queries

#### Fetch inbox page

```sql
SELECT
  n.id,
  n.type,
  n.message,
  sn.created_at,
  sn.read_at,
  sn.is_read
FROM student_notifications sn
JOIN notifications n ON n.id = sn.notification_id
WHERE sn.student_id = $1
  AND ($2::notification_type IS NULL OR n.type = $2)
ORDER BY sn.created_at DESC
LIMIT $3 OFFSET $4;
```

#### Mark one notification as viewed

```sql
UPDATE student_notifications
SET is_read = TRUE,
    read_at = NOW()
WHERE student_id = $1
  AND notification_id = $2;
```

## Query Tuning

### Is the earlier query accurate?

Partially. It only works if the table already stores one row per student-notification pair and `isRead` is the read-state column on that same row. If the system separates notification content from recipient state, this query is incomplete because it ignores the notification payload table.

### Why it becomes slow

- It likely scans a large section of the table for a single student.
- `ORDER BY createdAt ASC` forces extra sorting work if the index does not match.
- `SELECT *` pulls more columns than the inbox actually needs.
- Ascending order is usually the opposite of the product requirement, because inboxes normally show newest items first.

### Better query

```sql
SELECT
  notification_id,
  is_read,
  read_at,
  created_at
FROM student_notifications
WHERE student_id = $1
  AND is_read = FALSE
ORDER BY created_at DESC
LIMIT $2;
```

### Safe index

```sql
CREATE INDEX idx_student_notifications_unread
  ON student_notifications (student_id, is_read, created_at DESC);
```

### Cost of indexing every column

That advice is unsafe. Every extra index increases write amplification, storage usage, and vacuum overhead. On a system receiving large fan-out writes, over-indexing can make inserts and updates noticeably slower.

### Query for students who received placement notifications in the last 7 days

```sql
SELECT DISTINCT sn.student_id
FROM student_notifications sn
JOIN notifications n ON n.id = sn.notification_id
WHERE n.type = 'Placement'
  AND sn.created_at >= NOW() - INTERVAL '7 days';
```

## Performance Strategy

### Problem

Fetching the full inbox from the database on every page load for every student creates too much repeated read pressure and punishes the user with slower first paint.

### Recommended improvements

- cache the first inbox page and unread counts in Redis
- use keyset pagination for deep inbox browsing instead of large offsets
- re-fetch only when the browser tab becomes active or after a push event arrives
- ship summary counts separately from the full page payload
- store viewed state updates asynchronously when strict real-time consistency is not required

### Tradeoffs

- Redis reduces database load and latency, but it adds operational complexity and cache invalidation rules.
- Keyset pagination is faster for deep scrolling, but it complicates direct page-number jumps.
- Event-driven refresh improves UX, but it needs reliable client reconnection logic.
- Async viewed-state persistence improves responsiveness, but the badge count can be briefly stale.

## Bulk Delivery

### Shortcomings in the naive loop

- email sending, database writes, and push delivery are tightly coupled
- one failure can interrupt the full bulk operation midway
- there is no idempotency, so retries can duplicate notifications
- processing 50,000 users serially is far too slow
- there is no audit-friendly separation between accepted work and completed work

### What happens when 200 email sends fail midway?

Do not restart the entire bulk operation from the top. Persist a bulk job record, keep per-recipient delivery status, and retry only the failed delivery tasks. The in-app notification should still be saved even if an email attempt fails.

### Should DB write and email send happen together?

No. They belong to different reliability domains. The database write is the source of truth for the notification record. Email is a best-effort side effect that should be handled asynchronously from a queue.

### Revised flow

```text
1. Create bulk_job row with status = accepted.
2. Insert notification payload once.
3. Insert recipient rows in batches.
4. Write outbox records for email and push delivery.
5. Queue workers send email/push independently with retries and idempotency keys.
6. Update recipient delivery status per channel.
```

### Revised pseudocode

```ts
async function notifyAll(studentIds, message) {
  const bulkJobId = await createBulkJob(message);
  const notificationId = await createNotification(message);

  for (const chunk of chunkArray(studentIds, 1000)) {
    await saveRecipientBatch(notificationId, chunk);
    await enqueueDeliveryBatch(bulkJobId, notificationId, chunk);
  }

  return { bulkJobId, notificationId, accepted: studentIds.length };
}
```

## Priority Inbox

### Priority strategy

Priority is computed with two ordered rules:

1. type weight: `Placement > Result > Event`
2. recency inside the same type bucket

That means a fresh placement alert outranks any result or event, while newer result alerts outrank older results.

### Efficient top-N maintenance

Because the requested `n` is small, a bounded top-N structure works well. The service keeps only the best `n` notifications seen so far, inserts new candidates in ranked order, and drops the lowest-ranked tail entry. This avoids sorting the entire dataset on every refresh.

### Current implementation

- the backend scans the upstream paginated API into a short-lived in-memory cache
- the cache is refreshed periodically and on startup
- the priority endpoint filters by type and returns only the best `n` records
- the frontend lets the user switch between `10`, `15`, and `20` items without reworking the ranking algorithm

## Implementation Notes

### Implementation summary

- the frontend now has two user-facing views: all notifications and priority inbox
- notification type filters are available on both views
- viewed vs new state is persisted in browser storage
- a backend proxy keeps secrets out of the client and forwards logs upstream
- the shared logging package validates log shape and centralizes log transport behavior

### Error handling choices

- frontend requests show retryable error banners
- backend failures return structured JSON with status and details
- logging failures do not crash user-facing flows
