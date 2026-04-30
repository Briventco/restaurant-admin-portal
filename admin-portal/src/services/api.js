const API_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL || "https://restaurant-bot-11mh.onrender.com/api/v1"
).replace(/\/+$/, "");
const FIREBASE_API_KEY = String(import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
const FIREBASE_SECURE_TOKEN_BASE_URL = "https://securetoken.googleapis.com/v1";

function debugLog(message, meta) {
  void message;
  void meta;
}

function readStoredIdToken() {
  return String(
    localStorage.getItem("portal.token") ||
      localStorage.getItem("token") ||
      ""
  ).trim();
}

function readStoredRefreshToken() {
  return String(localStorage.getItem("portal.refreshToken") || "").trim();
}

async function refreshPortalSessionIfPossible() {
  const refreshToken = readStoredRefreshToken();
  if (!refreshToken || !FIREBASE_API_KEY) {
    return false;
  }

  const refreshResponse = await fetch(
    `${FIREBASE_SECURE_TOKEN_BASE_URL}/token?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    }
  );

  if (!refreshResponse.ok) {
    return false;
  }

  const refreshed = await refreshResponse.json();
  const nextIdToken = String(refreshed.id_token || "").trim();
  const nextRefreshToken = String(refreshed.refresh_token || refreshToken).trim();
  if (!nextIdToken) {
    return false;
  }

  const portalSessionResponse = await fetch(`${API_BASE_URL}/auth/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${nextIdToken}`,
    },
    body: JSON.stringify({ idToken: nextIdToken }),
  });

  if (!portalSessionResponse.ok) {
    return false;
  }

  const sessionPayload = await portalSessionResponse.json();
  const user = sessionPayload && sessionPayload.user ? sessionPayload.user : null;

  localStorage.setItem("portal.token", nextIdToken);
  localStorage.setItem("portal.refreshToken", nextRefreshToken);
  if (user) {
    localStorage.setItem("portal.user", JSON.stringify(user));
  }

  return true;
}

function summarizeToken(token) {
  const normalized = String(token || "").trim();
  return {
    present: Boolean(normalized),
    length: normalized.length,
    preview: normalized ? normalized.slice(0, 12) : "",
  };
}

function resolveErrorMessage(payload, status) {
  if (!payload) {
    return `Request failed with status ${status}`;
  }

  if (typeof payload === "string") {
    return payload || `Request failed with status ${status}`;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  if (payload.details && typeof payload.details === "object") {
    if (typeof payload.details.message === "string" && payload.details.message.trim()) {
      return payload.details.message.trim();
    }

    if (Array.isArray(payload.details.allowedTransitions) && payload.details.allowedTransitions.length) {
      return `Request failed with status ${status}. Allowed transitions: ${payload.details.allowedTransitions.join(", ")}`;
    }
  }

  return `Request failed with status ${status}`;
}

async function request(path, options = {}, context = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body != null) {
    headers.set("Content-Type", "application/json");
  }

  const token = readStoredIdToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  debugLog("API request started", {
    method: options.method || "GET",
    url: `${API_BASE_URL}${path}`,
    hasBody: options.body != null,
    token: summarizeToken(token),
  });

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const isJson = String(response.headers.get("content-type") || "").includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  debugLog("API response received", {
    method: options.method || "GET",
    url: `${API_BASE_URL}${path}`,
    status: response.status,
    ok: response.ok,
    payload,
  });

  if (!response.ok) {
    if (response.status === 401 && !context.retriedAfterRefresh) {
      const refreshed = await refreshPortalSessionIfPossible();
      if (refreshed) {
        return request(path, options, { retriedAfterRefresh: true });
      }
    }

    const error = new Error(resolveErrorMessage(payload, response.status));
    error.status = response.status;
    error.payload = payload;
    debugLog("API request failed", {
      method: options.method || "GET",
      url: `${API_BASE_URL}${path}`,
      status: response.status,
      payload,
    });
    throw error;
  }

  return payload;
}

export { API_BASE_URL, request };
