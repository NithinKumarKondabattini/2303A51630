export const STACKS = ["frontend", "backend"];

export const LEVELS = ["debug", "info", "warn", "error", "fatal"];

export const SHARED_PACKAGES = ["auth", "config", "middleware", "utils"];

export const FRONTEND_PACKAGES = ["api", "component", "hook", "page", "state", "style"];

export const BACKEND_PACKAGES = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
];

export function getAllowedPackages(stack) {
  if (stack === "frontend") {
    return [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];
  }

  if (stack === "backend") {
    return [...BACKEND_PACKAGES, ...SHARED_PACKAGES];
  }

  return [];
}

export function isAllowedPackage(stack, packageName) {
  return getAllowedPackages(stack).includes(packageName);
}
