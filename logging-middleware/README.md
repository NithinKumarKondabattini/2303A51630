## Logging Middleware

Reusable ESM logging package shared by the frontend and backend.

### Exports

- `createLogger`
- `createHttpLogTransport`
- `createServiceAuthClient`
- `createProtectedLogTransport`
- `validateLogEntry`

### Responsibilities

- validates stack, level, and package names
- forwards frontend logs to the local backend endpoint
- acquires and refreshes bearer tokens for protected upstream logging from the backend
