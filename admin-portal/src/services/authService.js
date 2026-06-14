import { request } from "./api";

const FIREBASE_API_KEY = String(import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
const APP_BASE_URL = String(import.meta.env.VITE_APP_URL || "").trim().replace(/\/$/, "");
const FIREBASE_AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";
const FIREBASE_SECURE_TOKEN_BASE_URL = "https://securetoken.googleapis.com/v1";

function getPasswordResetContinueUrl() {
  const baseUrl =
    APP_BASE_URL ||
    (typeof window !== "undefined" && window.location?.origin
      ? String(window.location.origin).trim().replace(/\/$/, "")
      : "");

  if (!baseUrl) {
    return "";
  }

  try {
    return new URL("/reset-password", baseUrl).toString();
  } catch (_error) {
    return "";
  }
}

function debugLog(message, meta) {
  void message;
  void meta;
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
    case "WEAK_PASSWORD":
      return "Password must be at least 6 characters.";
    case "INVALID_OOB_CODE":
    case "EXPIRED_OOB_CODE":
      return "This reset link is invalid or has expired. Please request a new one.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    case "MISSING_CONTINUE_URI":
    case "INVALID_CONTINUE_URI":
    case "UNAUTHORIZED_CONTINUE_URI":
      return "The password reset link is not configured correctly. Check the app URL and Firebase authorized domains.";
    case "CREDENTIAL_TOO_OLD_LOGIN_AGAIN":
      return "Please sign out and sign in again before changing your password.";
    default:
      return "Unable to complete this request right now.";
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

async function firebaseUpdatePassword({ idToken, newPassword }) {
  ensureFirebaseApiKey();

  const response = await fetch(
    `${FIREBASE_AUTH_BASE_URL}/accounts:update?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
        password: newPassword,
        returnSecureToken: true,
      }),
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(mapFirebaseError(payload?.error?.message));
    error.code = payload?.error?.message || "";
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function firebaseChangePassword({ email, currentPassword, newPassword }) {
  const auth = await firebasePasswordSignIn({ email, password: currentPassword });
  const updated = await firebaseUpdatePassword({
    idToken: auth.idToken,
    newPassword,
  });

  return {
    idToken: String(updated.idToken || auth.idToken || "").trim(),
    refreshToken: String(updated.refreshToken || auth.refreshToken || "").trim(),
  };
}

async function firebaseSendPasswordResetEmail({ email }) {
  ensureFirebaseApiKey();

  const continueUrl = getPasswordResetContinueUrl();
  const body = {
    requestType: "PASSWORD_RESET",
    email,
  };

  if (continueUrl) {
    body.continueUrl = continueUrl;
  }

  const response = await fetch(
    `${FIREBASE_AUTH_BASE_URL}/accounts:sendOobCode?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(mapFirebaseError(payload?.error?.message));
    error.code = payload?.error?.message || "";
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function firebaseConfirmPasswordReset({ oobCode, newPassword }) {
  ensureFirebaseApiKey();

  const response = await fetch(
    `${FIREBASE_AUTH_BASE_URL}/accounts:resetPassword?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oobCode,
        newPassword,
      }),
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(mapFirebaseError(payload?.error?.message));
    error.code = payload?.error?.message || "";
    error.payload = payload;
    throw error;
  }

  return payload;
}

export {
  createPortalSession,
  firebaseChangePassword,
  firebaseConfirmPasswordReset,
  firebasePasswordSignIn,
  firebaseRefreshSession,
  firebaseSendPasswordResetEmail,
  loadCurrentPortalUser,
  logoutPortalSession,
};
