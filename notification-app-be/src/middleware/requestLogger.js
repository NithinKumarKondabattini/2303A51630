import { backendLogger } from "../config/logger.js";

export function requestLogger(request, response, next) {
  const startedAt = Date.now();

  void backendLogger.info("middleware", `request started ${request.method} ${request.originalUrl}`);

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    void backendLogger.info(
      "middleware",
      `request completed ${request.method} ${request.originalUrl} ${response.statusCode} in ${durationMs}ms`
    );
  });

  next();
}
