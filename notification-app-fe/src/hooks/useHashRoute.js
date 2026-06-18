import { useEffect, useState } from "react";

function readRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash === "/priority" ? "priority" : "all";
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = "/all";
    }

    const handleHashChange = () => {
      setRoute(readRoute());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (nextRoute) => {
    window.location.hash = nextRoute === "priority" ? "/priority" : "/all";
  };

  return { route, navigate };
}
