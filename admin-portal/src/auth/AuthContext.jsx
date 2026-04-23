import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createPortalSession,
  firebasePasswordSignIn,
  firebaseRefreshSession,
  loadCurrentPortalUser,
  logoutPortalSession,
} from "../services/authService";

const AuthContext = createContext();

const STORAGE_KEYS = Object.freeze({
  user: "portal.user",
  token: "portal.token",
  refreshToken: "portal.refreshToken",
});

function debugLog(message, meta) {
  console.log(`[portal-debug] ${message}`, meta || {});
}

function readStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) {
    debugLog("No stored user found in localStorage");
    return null;
  }

  try {
    const parsedUser = JSON.parse(raw);
    debugLog("Read stored user from localStorage", {
      user: parsedUser,
    });
    return parsedUser;
  } catch (error) {
    debugLog("Failed to parse stored user", {
      message: error.message,
      raw,
    });
    return null;
  }
}

function persistSession({ user, idToken, refreshToken }) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.token, idToken);
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  }
  debugLog("Persisted session to localStorage", {
    user,
    tokenLength: String(idToken || "").trim().length,
    refreshTokenLength: String(refreshToken || "").trim().length,
  });
}

function clearSessionStorage() {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  debugLog("Cleared session storage");
}

function getAvailableRoles(currentRole) {
  const roleHierarchy = {
    super_admin: ["super_admin"],
    restaurant_admin: ["restaurant_admin"],
    restaurant_staff: ["restaurant_staff"],
  };

  return roleHierarchy[currentRole] || [currentRole];
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      debugLog("Auth bootstrap started");
      const storedUser = readStoredUser();
      const storedToken = String(localStorage.getItem(STORAGE_KEYS.token) || "").trim();
      const storedRefreshToken = String(
        localStorage.getItem(STORAGE_KEYS.refreshToken) || ""
      ).trim();

      debugLog("Auth bootstrap storage snapshot", {
        hasStoredUser: Boolean(storedUser),
        storedTokenLength: storedToken.length,
        storedRefreshTokenLength: storedRefreshToken.length,
      });

      if (!storedUser || !storedToken) {
        clearSessionStorage();
        if (!cancelled) {
          setUser(null);
          setAvailableRoles([]);
          setLoading(false);
          debugLog("Auth bootstrap finished without session");
        }
        return;
      }

      try {
        let effectiveIdToken = storedToken;
        let effectiveRefreshToken = storedRefreshToken;
        let liveUser;

        try {
          debugLog("Auth bootstrap requesting /auth/me");
          liveUser = await loadCurrentPortalUser();
        } catch (error) {
          debugLog("Auth bootstrap /auth/me failed", {
            status: error?.status || 0,
            message: error?.message || "",
            payload: error?.payload,
          });
          if (error?.status !== 401 || !storedRefreshToken) {
            throw error;
          }

          const refreshedSession = await firebaseRefreshSession(storedRefreshToken);
          effectiveIdToken = refreshedSession.idToken;
          effectiveRefreshToken = refreshedSession.refreshToken || storedRefreshToken;
          localStorage.setItem(STORAGE_KEYS.token, effectiveIdToken);
          if (effectiveRefreshToken) {
            localStorage.setItem(STORAGE_KEYS.refreshToken, effectiveRefreshToken);
          }

          liveUser = await createPortalSession(effectiveIdToken);
        }

        if (cancelled) {
          debugLog("Auth bootstrap cancelled before completion");
          return;
        }

        persistSession({
          user: liveUser,
          idToken: effectiveIdToken,
          refreshToken: effectiveRefreshToken,
        });
        setUser(liveUser);
        setAvailableRoles(getAvailableRoles(liveUser.role));
        debugLog("Auth bootstrap completed successfully", {
          user: liveUser,
        });
      } catch (error) {
        debugLog("Auth bootstrap failed", {
          message: error.message,
          status: error?.status || 0,
          payload: error?.payload,
        });
        clearSessionStorage();
        if (!cancelled) {
          setUser(null);
          setAvailableRoles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          debugLog("Auth bootstrap finished", {
            cancelled,
          });
        }
      }
    }

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async ({ email, password, role }) => {
    try {
      debugLog("Login started", {
        email,
        expectedRole: role,
      });
      const firebaseAuth = await firebasePasswordSignIn({ email, password });
      debugLog("Firebase sign-in succeeded", {
        email,
        idTokenLength: String(firebaseAuth?.idToken || "").trim().length,
        refreshTokenLength: String(firebaseAuth?.refreshToken || "").trim().length,
      });
      const portalUser = await createPortalSession(firebaseAuth.idToken);
      debugLog("Portal session user received after login", {
        user: portalUser,
      });

      if (role && portalUser.role !== role) {
        debugLog("Login role mismatch", {
          expectedRole: role,
          actualRole: portalUser.role,
        });
        clearSessionStorage();
        return {
          success: false,
          message: `This account is not allowed to sign in as ${role.replace("_", " ")}.`,
        };
      }

      persistSession({
        user: portalUser,
        idToken: firebaseAuth.idToken,
        refreshToken: firebaseAuth.refreshToken,
      });
      setUser(portalUser);
      setAvailableRoles(getAvailableRoles(portalUser.role));
      debugLog("Login completed successfully", {
        user: portalUser,
      });

      return {
        success: true,
        user: portalUser,
        message: "Login successful",
      };
    } catch (error) {
      debugLog("Login failed", {
        message: error.message,
        status: error?.status || 0,
        code: error?.code || "",
        payload: error?.payload,
      });
      clearSessionStorage();
      setUser(null);
      setAvailableRoles([]);

      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    debugLog("Logout started");
    await logoutPortalSession();
    clearSessionStorage();
    setUser(null);
    setAvailableRoles([]);
    debugLog("Logout completed");
  };

  const switchRole = (newRole) => {
    if (user && user.role === newRole) {
      setAvailableRoles(getAvailableRoles(newRole));
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    availableRoles,
    switchRole,
  };

  debugLog("AuthProvider render state", {
    loading,
    isAuthenticated: !!user,
    user,
    availableRoles,
  });

  return React.createElement(AuthContext.Provider, { value }, children);
};
