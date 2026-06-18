import { backendLogger } from "../config/logger.js";

export function errorHandler(error, request, response, next) {
  void next;

  const status = error.status ?? 500;
  const message = error.message ?? "Unexpected server error.";

  void backendLogger.error(
    "handler",
    `request failed ${request.method} ${request.originalUrl}: ${message}`
  );

  response.status(status).json({
    message,
    details: error.details,
  });
}
