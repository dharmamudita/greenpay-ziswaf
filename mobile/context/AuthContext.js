import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItemAsync, setItemAsync, deleteItemAsync } from '../utils/storage';
import authService from '../services/authService';
import socket from '../services/socket';

const AuthContext = createContext({});

export const ROLES = {
  USER: 'user',
  DISTRIK: 'distrik',
  ADMIN: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token on startup
  useEffect(() => {
    loadToken();
  }, []);

  // Setup Socket.io connection when user changes
  useEffect(() => {
    if (user && user.id) {
      socket.connect();
      socket.emit('join_user_room', user.id);
      
      socket.on('USER_PROFILE_UPDATED', () => {
        refreshProfile();
      });

      return () => {
        socket.off('USER_PROFILE_UPDATED');
        socket.disconnect();
      };
    }
  }, [user?.id]);

  const loadToken = async () => {
    try {
      const savedToken = await getItemAsync('token');
      if (savedToken) {
        setToken(savedToken);
        // Fetch user profile
        const profile = await authService.getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.log('Token expired or invalid');
      await deleteItemAsync('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    await setItemAsync('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const setAuthState = async (newToken, newUser) => {
    await setItemAsync('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (email, password, displayName, role) => {
    const data = await authService.register(email, password, displayName, role);
    await setItemAsync('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await deleteItemAsync('token');
    setToken(null);
    setUser(null);
    socket.disconnect();
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.log('Failed to refresh profile');
    }
  };

  const hasRole = (role) => user?.role === role;
  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isDistrik = () => hasRole(ROLES.DISTRIK);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, refreshProfile, setAuthState,
      hasRole, isAdmin, isDistrik,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
