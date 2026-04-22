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

function readStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
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
}

function clearSessionStorage() {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
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
      const storedUser = readStoredUser();
      const storedToken = String(localStorage.getItem(STORAGE_KEYS.token) || "").trim();
      const storedRefreshToken = String(
        localStorage.getItem(STORAGE_KEYS.refreshToken) || ""
      ).trim();

      if (!storedUser || !storedToken) {
        clearSessionStorage();
        if (!cancelled) {
          setUser(null);
          setAvailableRoles([]);
          setLoading(false);
        }
        return;
      }

      try {
        let effectiveIdToken = storedToken;
        let effectiveRefreshToken = storedRefreshToken;
        let liveUser;

        try {
          liveUser = await loadCurrentPortalUser();
        } catch (error) {
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
          return;
        }

        persistSession({
          user: liveUser,
          idToken: effectiveIdToken,
          refreshToken: effectiveRefreshToken,
        });
        setUser(liveUser);
        setAvailableRoles(getAvailableRoles(liveUser.role));
      } catch (_error) {
        clearSessionStorage();
        if (!cancelled) {
          setUser(null);
          setAvailableRoles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
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
      const firebaseAuth = await firebasePasswordSignIn({ email, password });
      const portalUser = await createPortalSession(firebaseAuth.idToken);

      if (role && portalUser.role !== role) {
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

      return {
        success: true,
        user: portalUser,
        message: "Login successful",
      };
    } catch (error) {
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
    await logoutPortalSession();
    clearSessionStorage();
    setUser(null);
    setAvailableRoles([]);
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

  return React.createElement(AuthContext.Provider, { value }, children);
};
