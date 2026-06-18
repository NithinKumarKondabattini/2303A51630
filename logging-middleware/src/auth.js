function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseExpiry(expiresIn) {
  if (typeof expiresIn !== "number" || Number.isNaN(expiresIn)) {
    return Date.now() + 10 * 60 * 1000;
  }

  if (expiresIn > 10_000_000_000) {
    return expiresIn;
  }

  if (expiresIn > 1_000_000_000) {
    return expiresIn * 1000;
  }

  return Date.now() + expiresIn * 1000;
}

function cloneCredentials(credentials) {
  return {
    email: credentials.email ?? "",
    name: credentials.name ?? "",
    mobileNo: credentials.mobileNo ?? "",
    githubUsername: credentials.githubUsername ?? "",
    rollNo: credentials.rollNo ?? "",
    accessCode: credentials.accessCode ?? "",
    clientID: credentials.clientID ?? "",
    clientSecret: credentials.clientSecret ?? "",
  };
}

export function hasAuthInputs(credentials) {
  return (
    hasValue(credentials.email) &&
    hasValue(credentials.name) &&
    hasValue(credentials.rollNo) &&
    hasValue(credentials.accessCode) &&
    (hasValue(credentials.clientID) && hasValue(credentials.clientSecret))
  );
}

export function canRegister(credentials) {
  return (
    hasValue(credentials.email) &&
    hasValue(credentials.name) &&
    hasValue(credentials.mobileNo) &&
    hasValue(credentials.githubUsername) &&
    hasValue(credentials.rollNo) &&
    hasValue(credentials.accessCode)
  );
}

export function createServiceAuthClient(options) {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;
  const state = {
    credentials: cloneCredentials(options.credentials),
    accessToken: "",
    expiresAt: 0,
  };

  async function register() {
    if (!canRegister(state.credentials)) {
      throw new Error("Registration requires email, name, mobileNo, githubUsername, rollNo, and accessCode.");
    }

    const response = await fetchImpl(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: state.credentials.email,
        name: state.credentials.name,
        mobileNo: state.credentials.mobileNo,
        githubUsername: state.credentials.githubUsername,
        rollNo: state.credentials.rollNo,
        accessCode: state.credentials.accessCode,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Registration failed with status ${response.status}: ${details}`);
    }

    const data = await response.json();
    state.credentials.clientID = data.clientID ?? "";
    state.credentials.clientSecret = data.clientSecret ?? "";

    return data;
  }

  async function ensureClientCredentials() {
    if (hasValue(state.credentials.clientID) && hasValue(state.credentials.clientSecret)) {
      return {
        clientID: state.credentials.clientID,
        clientSecret: state.credentials.clientSecret,
      };
    }

    const data = await register();
    return {
      clientID: data.clientID,
      clientSecret: data.clientSecret,
    };
  }

  async function getAccessToken() {
    if (state.accessToken && Date.now() < state.expiresAt - 15_000) {
      return state.accessToken;
    }

    await ensureClientCredentials();

    if (!hasAuthInputs(state.credentials)) {
      throw new Error("Authorization requires email, name, rollNo, accessCode, clientID, and clientSecret.");
    }

    const response = await fetchImpl(`${baseUrl}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: state.credentials.email,
        name: state.credentials.name,
        rollNo: state.credentials.rollNo,
        accessCode: state.credentials.accessCode,
        clientID: state.credentials.clientID,
        clientSecret: state.credentials.clientSecret,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Authorization failed with status ${response.status}: ${details}`);
    }

    const data = await response.json();
    state.accessToken = data.access_token ?? "";
    state.expiresAt = parseExpiry(data.expires_in);

    if (!state.accessToken) {
      throw new Error("Authorization succeeded without returning an access token.");
    }

    return state.accessToken;
  }

  function updateCredentials(nextCredentials) {
    state.credentials = {
      ...state.credentials,
      ...nextCredentials,
    };
  }

  return {
    canRegister: () => canRegister(state.credentials),
    ensureClientCredentials,
    getAccessToken,
    getCredentials: () => ({ ...state.credentials }),
    updateCredentials,
  };
}
