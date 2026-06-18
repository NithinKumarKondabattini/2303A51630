function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: toNumber(process.env.PORT, 3001),
  serviceBaseUrl: process.env.SERVICE_BASE_URL ?? "",
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
