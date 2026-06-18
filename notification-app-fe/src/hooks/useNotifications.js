import { useEffect, useState } from "react";

import { fetchNotifications } from "../api/notifications";
import { frontendLogger } from "../middleware/logger";

export function useNotifications({ page, limit, notificationType, enabled = true }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({
    notifications: [],
    fetchedAt: "",
    hasMore: false,
    meta: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        notifications: [],
        fetchedAt: "",
        hasMore: false,
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
          `loading notifications page=${page} limit=${limit} filter=${notificationType}`
        );
        const payload = await fetchNotifications({
          page,
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
          hasMore: Boolean(payload.hasMore),
          meta: payload.meta ?? null,
          loading: false,
          error: "",
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        await frontendLogger.error("hook", `notification fetch failed: ${error.message}`);
        setState((currentState) => ({
          ...currentState,
          loading: false,
          error: error.message || "Unable to load notifications.",
        }));
      }
    }

    load();

    return () => controller.abort();
  }, [enabled, page, limit, notificationType, refreshKey]);

  return {
    ...state,
    retry: () => setRefreshKey((value) => value + 1),
  };
}
