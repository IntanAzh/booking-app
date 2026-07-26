import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const profileData = await authService.getProfile();
          // Backend mengembalikan user dengan role
          setUser(profileData.user || profileData);
        } catch (error) {
          console.error("Failed to fetch profile", error);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      // Fetch user profile since backend login only returns token
      try {
        const profileData = await authService.getProfile();
        const loggedInUser = profileData.user || profileData;
        setUser(loggedInUser);
        return { ...data, user: loggedInUser };
      } catch (error) {
        console.error("Failed to fetch profile after login", error);
      }
      return data;
    }
    throw new Error('No token received');
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    authService.logout().catch(e => console.log(e)); // Fire and forget
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
