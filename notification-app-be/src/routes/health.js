import { Router } from "express";
import {
  ACCEPTED_QUERY_PARAMETERS,
  canUseProtectedNotifications,
  getCredentialSnapshot,
  SUPPORTED_NOTIFICATION_TYPES,
} from "../config/env.js";
import { authClient } from "../config/logger.js";
import { asyncRoute } from "../utils/asyncRoute.js";

export const healthRouter = Router();

healthRouter.get("/", asyncRoute(async (request, response) => {
  void request;

  const setup = getCredentialSnapshot();
  let canFetchLiveNotifications = false;
  let liveAuthError = "";

  if (canUseProtectedNotifications(setup)) {
    try {
      await authClient.getAccessToken();
      canFetchLiveNotifications = true;
    } catch (error) {
      liveAuthError = error.message || "Protected API authorization failed.";
    }
  }

  response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    setup: {
      ...setup,
      canFetchLiveNotifications,
      usingDemoData: !canFetchLiveNotifications,
      canFetchNotifications: true,
      liveAuthError,
      acceptedQueryParameters: ACCEPTED_QUERY_PARAMETERS,
      supportedNotificationTypes: SUPPORTED_NOTIFICATION_TYPES,
    },
  });
}));
