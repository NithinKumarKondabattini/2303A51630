import { useEffect, useState } from "react";

import { fetchPriorityNotifications } from "../api/notifications";
import { frontendLogger } from "../middleware/logger";

export function usePriorityNotifications({ limit, notificationType, enabled = true }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({
    notifications: [],
    fetchedAt: "",
    meta: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        notifications: [],
        fetchedAt: "",
        meta: null,
        loading: false,
        error: "",
      });
      return undefined;
    }

    const controller = new AbortController();

    async function load() {
      setState((currentState) => ({
        ...currentState,
        loading: true,
        error: "",
      }));

      try {
        await frontendLogger.debug(
          "hook",
          `loading priority notifications limit=${limit} filter=${notificationType}`
        );
        const payload = await fetchPriorityNotifications({
          limit,
          notificationType,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setState({
          notifications: Array.isArray(payload.notifications) ? payload.notifications : [],
          fetchedAt: payload.fetchedAt ?? "",
          meta: payload.meta ?? null,
          loading: false,
          error: "",
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        await frontendLogger.error("hook", `priority fetch failed: ${error.message}`);
        setState((currentState) => ({
          ...currentState,
          loading: false,
          error: error.message || "Unable to load priority notifications.",
        }));
      }
    }

    load();

    const intervalId = window.setInterval(load, 60_000);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [enabled, limit, notificationType, refreshKey]);

  return {
    ...state,
    retry: () => setRefreshKey((value) => value + 1),
  };
}
