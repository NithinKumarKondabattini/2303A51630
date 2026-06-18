import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { backendLogger } from "./config/logger.js";
import { refreshPriorityCache } from "./services/priorityService.js";

const app = createApp();

app.listen(env.port, async () => {
  await backendLogger.info("service", `notification backend listening on port ${env.port}`);

  try {
    await refreshPriorityCache();
  } catch (error) {
    await backendLogger.warn("cache", `priority cache warmup skipped: ${error.message}`);
  }
});
