import { authClient, backendLogger } from "../config/logger.js";
import { HttpError } from "../utils/httpError.js";

function buildUrl(baseUrl, path, query) {
  const url = new URL(path, `${baseUrl.replace(/\/+$/, "")}/`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function requestJson(baseUrl, path, options = {}) {
  if (!baseUrl) {
    throw new HttpError(500, "SERVICE_BASE_URL is not configured.");
  }

  const method = options.method ?? "GET";
  const url = buildUrl(baseUrl, path, options.query);
  const token = await authClient.getAccessToken();

  await backendLogger.info("service", `upstream request started ${method} ${url.pathname}`);

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const details = await response.text();
    await backendLogger.error(
      "service",
      `upstream request failed ${method} ${url.pathname} (${response.status})`
    );
    throw new HttpError(
      response.status,
      response.status === 401
        ? "Protected API authorization failed. Check the service credentials in the backend .env file."
        : "Upstream service request failed.",
      details
    );
  }

  await backendLogger.info("service", `upstream request completed ${method} ${url.pathname}`);
  return response.json();
}

export async function fetchNotifications(baseUrl, params) {
  return requestJson(baseUrl, "notifications", {
    query: params,
  });
}

export async function forwardLog(baseUrl, entry) {
  return requestJson(baseUrl, "logs", {
    method: "POST",
    body: {
      stack: entry.stack,
      level: entry.level,
      package: entry.package,
      message: entry.message,
    },
  });
}
