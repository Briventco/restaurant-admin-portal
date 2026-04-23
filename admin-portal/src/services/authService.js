import { request } from "./api";

const FIREBASE_API_KEY = String(import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
const FIREBASE_AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";
const FIREBASE_SECURE_TOKEN_BASE_URL = "https://securetoken.googleapis.com/v1";

function debugLog(message, meta) {
  console.log(`[portal-debug] ${message}`, meta || {});
}

function ensureFirebaseApiKey() {
  if (!FIREBASE_API_KEY) {
    throw new Error("Missing VITE_FIREBASE_API_KEY in frontend environment");
  }
}

function mapFirebaseError(errorCode) {
  const normalized = String(errorCode || "").trim().toUpperCase();

  switch (normalized) {
    case "EMAIL_NOT_FOUND":
    case "INVALID_PASSWORD":
    case "INVALID_LOGIN_CREDENTIALS":
      return "Invalid email or password.";
    case "USER_DISABLED":
      return "This account has been disabled.";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "Too many login attempts. Please try again later.";
    default:
      return "Unable to sign in right now.";
  }
}

async function firebasePasswordSignIn({ email, password }) {
  ensureFirebaseApiKey();
  debugLog("Firebase password sign-in started", {
    email,
  });

  const response = await fetch(
    `${FIREBASE_AUTH_BASE_URL}/accounts:signInWithPassword?key=${encodeURIComponent(
      FIREBASE_API_KEY
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  const payload = await response.json();
  debugLog("Firebase password sign-in response", {
    email,
    ok: response.ok,
    status: response.status,
    payload,
  });
  if (!response.ok) {
    const error = new Error(mapFirebaseError(payload?.error?.message));
    error.code = payload?.error?.message || "";
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function createPortalSession(idToken) {
  debugLog("Portal session creation started", {
    tokenLength: String(idToken || "").trim().length,
  });
  const response = await request("/auth/session", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

  debugLog("Portal session creation succeeded", {
    user: response.user,
  });
  return response.user;
}

async function loadCurrentPortalUser() {
  debugLog("Loading current portal user");
  const response = await request("/auth/me", {
    method: "GET",
  });

  debugLog("Loaded current portal user", {
    user: response.user,
  });
  return response.user;
}

async function firebaseRefreshSession(refreshToken) {
  ensureFirebaseApiKey();

  const normalizedRefreshToken = String(refreshToken || "").trim();
  if (!normalizedRefreshToken) {
    throw new Error("Missing refresh token.");
  }

  debugLog("Firebase refresh session started", {
    refreshTokenLength: normalizedRefreshToken.length,
  });

  const response = await fetch(
    `${FIREBASE_SECURE_TOKEN_BASE_URL}/token?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: normalizedRefreshToken,
      }).toString(),
    }
  );

  const payload = await response.json();
  debugLog("Firebase refresh session response", {
    ok: response.ok,
    status: response.status,
    payload,
  });
  if (!response.ok) {
    const error = new Error(mapFirebaseError(payload?.error?.message || "INVALID_REFRESH_TOKEN"));
    error.code = payload?.error?.message || "INVALID_REFRESH_TOKEN";
    error.payload = payload;
    throw error;
  }

  return {
    idToken: String(payload.id_token || "").trim(),
    refreshToken: String(payload.refresh_token || normalizedRefreshToken).trim(),
  };
}

async function logoutPortalSession() {
  try {
    debugLog("Portal logout started");
    await request("/auth/logout", {
      method: "POST",
    });
    debugLog("Portal logout succeeded");
  } catch (_error) {
    // Best-effort logout. Local token removal is what really ends the session in this client.
  }
}

export {
  createPortalSession,
  firebasePasswordSignIn,
  firebaseRefreshSession,
  loadCurrentPortalUser,
  logoutPortalSession,
};
