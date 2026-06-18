# Campus Notification System

React frontend, Express proxy, and a shared logging package for a campus notification workflow.

## Architecture

```mermaid
flowchart LR
    A["Browser UI (React + MUI)"] --> B["Local Proxy (Express)"]
    A --> C["Viewed State (localStorage)"]
    A --> D["Frontend Logger"]
    D --> B
    B --> E["Auth Client"]
    E --> F["External Auth APIs"]
    B --> G["Protected Notifications API"]
    B --> H["Protected Logs API"]
    G --> I["Priority Cache"]
```

## Local setup

1. Create `notification-app-be/.env` from `notification-app-be/.env.example`.
2. Fill the service credentials in that file.
3. Install dependencies:

```bash
cd notification-app-fe && npm install
cd ../notification-app-be && npm install
```

4. Start the backend:

```bash
cd notification-app-be
npm run dev
```

5. Start the frontend in a second terminal:

```bash
cd notification-app-fe
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Included folders

- `notification-app-fe`
- `notification-app-be`
- `logging-middleware`
- `notification-system-design.md`
