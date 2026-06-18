function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeServiceBaseUrl(value) {
  if (!hasText(value)) {
    return "";
  }

  try {
    const url = new URL(value.trim());
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname
      .replace(/\/+$/, "")
      .replace(/\/(notifications|logs|auth|register)$/i, "");

    return url.toString().replace(/\/+$/, "");
  } catch {
    return value
      .trim()
      .replace(/\/+$/, "")
      .replace(/\/(notifications|logs|auth|register)$/i, "");
  }
}

export const SUPPORTED_NOTIFICATION_TYPES = ["Event", "Result", "Placement"];
export const ACCEPTED_QUERY_PARAMETERS = ["limit", "page", "notification_type"];

export const env = {
  port: toNumber(process.env.PORT, 3001),
  serviceBaseUrl: normalizeServiceBaseUrl(process.env.SERVICE_BASE_URL ?? ""),
  priorityScanPageSize: toNumber(process.env.PRIORITY_SCAN_PAGE_SIZE, 100),
  priorityScanMaxPages: toNumber(process.env.PRIORITY_SCAN_MAX_PAGES, 10),
  credentials: {
    email: process.env.SERVICE_EMAIL ?? "",
    name: process.env.SERVICE_NAME ?? "",
    mobileNo: process.env.SERVICE_MOBILE_NO ?? "",
    githubUsername: process.env.SERVICE_GITHUB_USERNAME ?? "",
    rollNo: process.env.SERVICE_ROLL_NO ?? "",
    accessCode: process.env.SERVICE_ACCESS_CODE ?? "",
    clientID: process.env.SERVICE_CLIENT_ID ?? "",
    clientSecret: process.env.SERVICE_CLIENT_SECRET ?? "",
  },
};

export function getCredentialSnapshot() {
  const registrationFields = {
    SERVICE_EMAIL: env.credentials.email,
    SERVICE_NAME: env.credentials.name,
    SERVICE_MOBILE_NO: env.credentials.mobileNo,
    SERVICE_GITHUB_USERNAME: env.credentials.githubUsername,
    SERVICE_ROLL_NO: env.credentials.rollNo,
    SERVICE_ACCESS_CODE: env.credentials.accessCode,
  };

  const authFields = {
    SERVICE_EMAIL: env.credentials.email,
    SERVICE_NAME: env.credentials.name,
    SERVICE_ROLL_NO: env.credentials.rollNo,
    SERVICE_ACCESS_CODE: env.credentials.accessCode,
    SERVICE_CLIENT_ID: env.credentials.clientID,
    SERVICE_CLIENT_SECRET: env.credentials.clientSecret,
  };

  const missingRegistrationFields = Object.entries(registrationFields)
    .filter(([, value]) => !hasText(value))
    .map(([key]) => key);
  const missingAuthFields = Object.entries(authFields)
    .filter(([, value]) => !hasText(value))
    .map(([key]) => key);

  return {
    serviceBaseUrlConfigured: hasText(env.serviceBaseUrl),
    serviceBaseUrl: env.serviceBaseUrl,
    registrationReady: missingRegistrationFields.length === 0,
    authReady: missingAuthFields.length === 0,
    missingRegistrationFields,
    missingAuthFields,
  };
}
