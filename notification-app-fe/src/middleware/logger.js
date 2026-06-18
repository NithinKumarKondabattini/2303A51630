import { createHttpLogTransport, createLogger } from "logging-middleware";

export const frontendLogger = createLogger({
  stack: "frontend",
  transport: createHttpLogTransport({
    endpoint: "/api/logs",
  }),
});
