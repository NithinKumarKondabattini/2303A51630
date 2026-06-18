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
          error: error.message || "Unable to read local service status.",
          data: null,
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
