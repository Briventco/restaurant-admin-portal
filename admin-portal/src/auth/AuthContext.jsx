import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAvailableRoles(getAvailableRoles(parsedUser.role));
    }
    setLoading(false);
  }, []);

  const getAvailableRoles = (currentRole) => {
    const roleHierarchy = {
      super_admin: ['super_admin', 'restaurant_admin', 'restaurant_staff'],
      restaurant_admin: ['restaurant_admin', 'restaurant_staff'],
      restaurant_staff: ['restaurant_staff'],
    };
    return roleHierarchy[currentRole] || [currentRole];
  };

  const login = async ({ email, password, role }) => {
    try {
      const mockUser = {
        id: '1',
        email,
        role,
        name: email.split('@')[0],
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
      setAvailableRoles(getAvailableRoles(role));

      return {
        success: true,
        user: mockUser,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setAvailableRoles([]);
  };

  const switchRole = (newRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
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

  return React.createElement(
    AuthContext.Provider,
    { value: value },
    children
  );
};