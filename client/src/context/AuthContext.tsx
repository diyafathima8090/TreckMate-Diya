import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../utils/axios';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup } from 'firebase/auth';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }) => {
  const [sessions, setSessions] = useState({
    trekker: null,
    organizer: null,
    admin: null
  });
  const [activeRole, setActiveRoleState] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('trekmate_role') || 'trekker';
    }
    return 'trekker';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const setActiveRole = (role) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('trekmate_role', role);
    }
    setActiveRoleState(role);
  };

  // Check if user is logged in for the active tab's role
  const checkUserStatus = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('trekmate_token') : null;
    const currentRole = typeof window !== 'undefined' ? (sessionStorage.getItem('trekmate_role') || 'trekker') : 'trekker';

    if (!token) {
      setSessions({ trekker: null, organizer: null, admin: null });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/auth/me', {
        headers: { 'x-active-role': currentRole }
      });
      if (res.data.success && res.data.data) {
        setSessions(prev => ({ ...prev, [currentRole]: res.data.data }));
      } else {
        sessionStorage.removeItem('trekmate_token');
        setSessions(prev => ({ ...prev, [currentRole]: null }));
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        sessionStorage.removeItem('trekmate_token');
      }
      setSessions(prev => ({ ...prev, [currentRole]: null }));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const userData = res.data.data;
        const role = userData.role || 'trekker';
        
        if (res.data.token) {
          sessionStorage.setItem('trekmate_token', res.data.token);
          sessionStorage.setItem('trekmate_role', role);
        }
        
        setSessions(prev => ({ ...prev, [role]: userData }));
        setActiveRoleState(role);
        return { success: true, user: userData, role };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Connection error, please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', userData);
      
      if (res.data.success) {
        const newUserData = res.data.data;
        const role = newUserData.role || 'trekker';
        
        if (res.data.token) {
          sessionStorage.setItem('trekmate_token', res.data.token);
          sessionStorage.setItem('trekmate_role', role);
        }
        
        setSessions(prev => ({ ...prev, [role]: newUserData }));
        setActiveRoleState(role);
        return { success: true, user: newUserData, role };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase is not configured. Please add your API keys to the .env file.');
      }

      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post('/auth/google', { idToken });

      if (res.data.success) {
        const userData = res.data.data;
        const role = userData.role || 'trekker';
        
        if (res.data.token) {
          sessionStorage.setItem('trekmate_token', res.data.token);
          sessionStorage.setItem('trekmate_role', role);
        }
        
        setSessions(prev => ({ ...prev, [role]: userData }));
        setActiveRoleState(role);
        return { success: true, user: userData, role };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Google login failed.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (role = 'trekker') => {
    setLoading(true);
    try {
      await axios.post('/auth/logout', {}, {
        headers: { 'x-active-role': activeRole }
      });
    } catch (err) {
      console.error(`Error logging out ${role}:`, err);
    } finally {
      setSessions(prev => ({ ...prev, [activeRole]: null }));
      sessionStorage.removeItem('trekmate_token');
      sessionStorage.removeItem('trekmate_role');
      setActiveRoleState('trekker');
      setLoading(false);
    }
  };

  const updateUser = (updatedData) => {
    const role = updatedData.role || 'trekker';
    setSessions(prev => ({ ...prev, [role]: updatedData }));
  };

  return (
    <AuthContext.Provider value={{ sessions, loading, error, login, register, loginWithGoogle, logout, updateUser, activeRole, setActiveRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
