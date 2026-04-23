const API_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3002/api/v1"
).replace(/\/+$/, "");

function debugLog(message, meta) {
  console.log(`[portal-debug] ${message}`, meta || {});
}

function readStoredIdToken() {
  return String(
    localStorage.getItem("portal.token") ||
      localStorage.getItem("token") ||
      ""
  ).trim();
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

async function request(path, options = {}) {
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
