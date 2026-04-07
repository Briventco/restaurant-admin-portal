import { request } from "./api";

const FIREBASE_API_KEY = String(import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
const FIREBASE_AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";

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
  if (!response.ok) {
    const error = new Error(mapFirebaseError(payload?.error?.message));
    error.code = payload?.error?.message || "";
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function createPortalSession(idToken) {
  const response = await request("/auth/session", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

  return response.user;
}

async function loadCurrentPortalUser() {
  const response = await request("/auth/me", {
    method: "GET",
  });

  return response.user;
}

async function logoutPortalSession() {
  try {
    await request("/auth/logout", {
      method: "POST",
    });
  } catch (_error) {
    // Best-effort logout. Local token removal is what really ends the session in this client.
  }
}

export {
  createPortalSession,
  firebasePasswordSignIn,
  loadCurrentPortalUser,
  logoutPortalSession,
};
