import { readFile, writeFile } from "node:fs/promises";

const ENV_FILE_URL = new URL("../../.env", import.meta.url);

function upsertEnvValue(source, key, value) {
  const serializedValue = value ?? "";
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(source)) {
    return source.replace(pattern, `${key}=${serializedValue}`);
  }

  const normalizedSource = source.trimEnd();
  return `${normalizedSource}\n${key}=${serializedValue}\n`;
}

export async function persistClientCredentials({ clientID, clientSecret }) {
  let envText = "";

  try {
    envText = await readFile(ENV_FILE_URL, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const withClientId = upsertEnvValue(envText, "SERVICE_CLIENT_ID", clientID ?? "");
  const withClientSecret = upsertEnvValue(
    withClientId,
    "SERVICE_CLIENT_SECRET",
    clientSecret ?? ""
  );

  await writeFile(ENV_FILE_URL, withClientSecret, "utf8");
}
