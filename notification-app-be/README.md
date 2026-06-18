## Notification App Backend

Express proxy for the protected service APIs.

### Endpoints

- `GET /api/health`
- `GET /api/notifications`
- `GET /api/notifications/priority`
- `POST /api/logs`

### Runtime

The backend keeps service credentials on the server, acquires bearer tokens,
forwards logs upstream, and exposes a frontend-safe API surface through the Vite
proxy.

When `SERVICE_MOBILE_NO`, `SERVICE_CLIENT_ID`, or `SERVICE_CLIENT_SECRET` are
missing, notification endpoints stay available with backend-served demo data.
Add the missing `.env` values to switch the same routes to the protected
Affordmed APIs.
