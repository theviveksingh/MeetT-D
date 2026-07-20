import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import socketService from '../utils/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { user: userData } = await api.getMe();
      setUser(userData);
      socketService.connect(token);
      socketService.authenticate(userData._id);
    } catch (err) {
      localStorage.removeItem('token');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const { token, user: userData } = await api.login(email, password);
      localStorage.setItem('token', token);
      setUser(userData);
      socketService.connect(token);
      socketService.authenticate(userData._id);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email, password, displayName) => {
    setError(null);
    try {
      const { token, user: userData } = await api.signup(email, password, displayName);
      localStorage.setItem('token', token);
      setUser(userData);
      socketService.connect(token);
      socketService.authenticate(userData._id);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    socketService.disconnect();
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
