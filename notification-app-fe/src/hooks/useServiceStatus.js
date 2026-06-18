import { useEffect, useState } from "react";

export function useServiceStatus() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({
    loading: true,
    error: "",
    data: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState((currentState) => ({
        ...currentState,
        loading: true,
        error: "",
      }));

      try {
        const response = await fetch("/api/health", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to read local service status (${response.status}).`);
        }

        const data = await response.json();

        if (controller.signal.aborted) {
          return;
        }

        setState({
          loading: false,
          error: "",
          data,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          loading: false,
          error: "",
          data: {
            status: "static-demo",
            timestamp: new Date().toISOString(),
            setup: {
              serviceBaseUrlConfigured: false,
              registrationReady: false,
              authReady: false,
              missingRegistrationFields: [],
              missingAuthFields: [],
              canFetchLiveNotifications: false,
              usingDemoData: true,
              staticDemo: true,
              canFetchNotifications: true,
              acceptedQueryParameters: ["limit", "page", "notification_type"],
              supportedNotificationTypes: ["Event", "Result", "Placement"],
              warning: error.message || "Unable to read local service status.",
            },
          },
        });
      }
    }

    load();

    return () => controller.abort();
  }, [refreshKey]);

  return {
    ...state,
    retry: () => setRefreshKey((value) => value + 1),
  };
}
