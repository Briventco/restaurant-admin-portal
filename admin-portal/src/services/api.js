const API_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3002/api/v1"
).replace(/\/+$/, "");

function readStoredIdToken() {
  return String(
    localStorage.getItem("portal.token") ||
      localStorage.getItem("token") ||
      ""
  ).trim();
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const isJson = String(response.headers.get("content-type") || "").includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(
      (payload && payload.error) || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export { API_BASE_URL, request };
