import { frontendLogger } from "../middleware/logger";

function buildUrl(path, params) {
  const url = new URL(path, window.location.origin);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

export async function requestJson(path, options = {}) {
  const url = buildUrl(path, options.params);
  const method = options.method ?? "GET";

  await frontendLogger.info("api", `request initiated ${method} ${url.pathname}`);

  const response = await fetch(url, {
    method,
    signal: options.signal,
    headers: {
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const details = await response.text();
    await frontendLogger.error("api", `request failed ${method} ${url.pathname}`);
    throw new Error(details || `Request failed with status ${response.status}.`);
  }

  await frontendLogger.info("api", `response received ${method} ${url.pathname}`);
  return response.json();
}
