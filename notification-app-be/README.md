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
