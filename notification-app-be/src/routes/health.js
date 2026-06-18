import { Router } from "express";
import { ACCEPTED_QUERY_PARAMETERS, getCredentialSnapshot, SUPPORTED_NOTIFICATION_TYPES } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/", (request, response) => {
  void request;

  const setup = getCredentialSnapshot();

  response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    setup: {
      ...setup,
      canFetchNotifications:
        setup.serviceBaseUrlConfigured && (setup.authReady || setup.registrationReady),
      acceptedQueryParameters: ACCEPTED_QUERY_PARAMETERS,
      supportedNotificationTypes: SUPPORTED_NOTIFICATION_TYPES,
    },
  });
});
