import {
  createProtectedLogTransport,
  createServiceAuthClient,
  createLogger,
  hasAuthInputs,
} from "logging-middleware";

import { env } from "./env.js";
import { persistClientCredentials } from "./credentialStore.js";

const authClient = createServiceAuthClient({
  baseUrl: env.serviceBaseUrl,
  credentials: env.credentials,
  onRegistered: async (data) => {
    await persistClientCredentials({
      clientID: data.clientID,
      clientSecret: data.clientSecret,
    });
    env.credentials.clientID = data.clientID ?? "";
    env.credentials.clientSecret = data.clientSecret ?? "";
  },
});

const transport = createProtectedLogTransport({
  authClient,
  endpoint: `${env.serviceBaseUrl}/logs`,
});

export const backendLogger = createLogger({
  stack: "backend",
  transport: async (entry) => {
    if (!env.serviceBaseUrl) {
      return;
    }

    const credentials = authClient.getCredentials();
    const readyForAuth = hasAuthInputs(credentials);
    const readyForRegister =
      authClient.canRegister() &&
      !credentials.clientID &&
      !credentials.clientSecret;

    if (!readyForAuth && !readyForRegister) {
      return;
    }

    await transport(entry);
  },
});

export { authClient };
