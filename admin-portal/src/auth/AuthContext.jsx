/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ROLES } from './roleConfig';

const STORAGE_KEY = 'admin_portal_auth_v1';

const MOCK_USERS = [
  {
    id: 'u_super_1',
    name: 'Brivent Ops',
    email: 'super@brivent.com',
    password: 'admin123',
    role: ROLES.SUPER_ADMIN,
    restaurantId: null,
  },
  {
    id: 'u_rest_admin_1',
    name: 'Restaurant Owner',
    email: 'owner@demo.com',
    password: 'admin123',
    role: ROLES.RESTAURANT_ADMIN,
    restaurantId: 'rst_001',
  },
  {
    id: 'u_staff_1',
    name: 'Floor Staff',
    email: 'staff@demo.com',
    password: 'admin123',
    role: ROLES.RESTAURANT_STAFF,
    restaurantId: 'rst_001',
  },
];

const AuthContext = createContext(null);

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeStoredAuth = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const clearStoredAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const stored = readStoredAuth();
    if (!stored?.user) {
      return { isAuthenticated: false, user: null };
    }
    return { isAuthenticated: true, user: stored.user };
  });

  const login = async ({ email, password, role }) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password || '').trim();

    if (!normalizedEmail || !normalizedPassword) {
      return { success: false, message: 'Email and password are required.' };
    }

    const matchedUser = MOCK_USERS.find(
      (item) => item.email === normalizedEmail && item.password === normalizedPassword,
    );

    const resolvedRole = matchedUser?.role || role || ROLES.RESTAURANT_ADMIN;
    const user = {
      id: matchedUser?.id || `u_${Date.now()}`,
      name: matchedUser?.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: resolvedRole,
      restaurantId: matchedUser?.restaurantId || (resolvedRole === ROLES.SUPER_ADMIN ? null : 'rst_001'),
    };

    const nextState = { isAuthenticated: true, user };
    setAuthState(nextState);
    writeStoredAuth(nextState);
    return { success: true, user };
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null });
    clearStoredAuth();
  };

  const switchRole = (nextRole) => {
    setAuthState((previous) => {
      if (!previous.user) {
        return previous;
      }

      const updatedUser = {
        ...previous.user,
        role: nextRole,
        restaurantId: nextRole === ROLES.SUPER_ADMIN ? null : previous.user.restaurantId || 'rst_001',
      };

      const updatedState = { ...previous, user: updatedUser };
      writeStoredAuth(updatedState);
      return updatedState;
    });
  };

  const value = useMemo(() => {
    return {
      ...authState,
      login,
      logout,
      switchRole,
      availableRoles: Object.values(ROLES),
      demoUsers: MOCK_USERS.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        restaurantId: item.restaurantId,
      })),
    };
  }, [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
