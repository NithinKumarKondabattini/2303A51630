export function createHttpLogTransport(options) {
  const endpoint = options.endpoint;
  const fetchImpl = options.fetchImpl ?? fetch;
  const getHeaders = options.getHeaders ?? (() => ({}));

  return async function httpTransport(entry) {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getHeaders(entry)),
      },
      body: JSON.stringify({
        stack: entry.stack,
        level: entry.level,
        package: entry.package,
        message: entry.message,
        timestamp: entry.timestamp,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Log transport failed with status ${response.status}: ${details}`);
    }
  };
}

export function createProtectedLogTransport(options) {
  const authClient = options.authClient;
  const endpoint = options.endpoint.replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;

  return createHttpLogTransport({
    endpoint,
    fetchImpl,
    getHeaders: async () => {
      const token = await authClient.getAccessToken();
      return {
        Authorization: `Bearer ${token}`,
      };
    },
  });
}
