// src/context/AuthContext.jsx
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
  const [authToken, setAuthToken] = useState(null);
  const FALLBACK_USER_KEY_STORAGE = 'domihive_fallback_user_id';
  const USER_KEY_STORAGE = 'domihive_user_key';

  const getOrCreateFallbackUserId = () => {
    try {
      const existing = localStorage.getItem(FALLBACK_USER_KEY_STORAGE);
      if (existing) return existing;
      const created = `user_guest_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(FALLBACK_USER_KEY_STORAGE, created);
      return created;
    } catch (_error) {
      return 'user_guest';
    }
  };

  const buildStableUserId = (payload = {}) => {
    if (payload?.id) return String(payload.id);
    if (payload?.phone) return `user_phone_${String(payload.phone)}`;
    if (payload?.email) return `user_email_${String(payload.email).toLowerCase()}`;
    if (payload?.username) return `user_username_${String(payload.username).toLowerCase()}`;
    return getOrCreateFallbackUserId();
  };

  const persistUserKey = (payload = {}) => {
    try {
      const key = buildStableUserId(payload);
      localStorage.setItem(USER_KEY_STORAGE, key);
      return key;
    } catch (_error) {
      return buildStableUserId(payload);
    }
  };

  const migrateUserScopedStorage = (stableKey, payload = {}) => {
    if (!stableKey) return;
    const prefixes = [
      'domihive_applications_state_',
      'domihive_dashboard_notifications_',
      'domihive_properties_',
      'domihive_favorites_',
      'domihive_payments_',
      'domihive_message_threads_',
      'domihive_maintenance_tickets_',
      'domihive_journey_notifications_'
    ];

    const candidateKeys = new Set([
      String(payload?.id || ''),
      payload?.phone ? `phone_${String(payload.phone)}` : '',
      payload?.phone ? `user_phone_${String(payload.phone)}` : '',
      payload?.email ? `email_${String(payload.email).toLowerCase()}` : '',
      payload?.email ? `user_email_${String(payload.email).toLowerCase()}` : '',
      payload?.username ? `username_${String(payload.username).toLowerCase()}` : '',
      payload?.username ? `user_username_${String(payload.username).toLowerCase()}` : '',
      localStorage.getItem(FALLBACK_USER_KEY_STORAGE) || '',
      localStorage.getItem(USER_KEY_STORAGE) || ''
    ]);

    candidateKeys.delete('');
    candidateKeys.delete(stableKey);

    prefixes.forEach((prefix) => {
      const targetKey = `${prefix}${stableKey}`;
      const targetRaw = localStorage.getItem(targetKey);
      if (targetRaw && targetRaw !== '[]') return;

      for (const legacyUserKey of candidateKeys) {
        const legacyKey = `${prefix}${legacyUserKey}`;
        const legacyRaw = localStorage.getItem(legacyKey);
        if (!legacyRaw) continue;
        try {
          localStorage.setItem(targetKey, legacyRaw);
          break;
        } catch (_error) {
          break;
        }
      }
    });
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('domihive_user');
        const storedToken = localStorage.getItem('domihive_auth_token');
        
        if (storedUser && storedToken) {
          const parsed = JSON.parse(storedUser);
          const stableId = persistUserKey(parsed);
          migrateUserScopedStorage(stableId, parsed);
          const hydrated = {
            ...parsed,
            id: stableId
          };
          localStorage.setItem('domihive_user', JSON.stringify(hydrated));
          setUser(hydrated);
          setAuthToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading auth:', error);
        logout(); // Clear invalid data
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (phone, password) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load user from localStorage (from signup)
      const storedUser = localStorage.getItem('domihive_user');
      const storedToken = localStorage.getItem('domihive_auth_token');
      
      if (!storedUser || !storedToken) {
        throw new Error('No account found');
      }
      
      const userData = JSON.parse(storedUser);
      const stableId = persistUserKey(userData);
      migrateUserScopedStorage(stableId, userData);
      const hydratedUser = {
        ...userData,
        id: stableId
      };
      localStorage.setItem('domihive_user', JSON.stringify(hydratedUser));
      
      // Simple password check (in real app, this would be API validation)
      if (!password || password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      setUser(hydratedUser);
      setAuthToken(storedToken);
      
      return { 
        success: true, 
        user: hydratedUser,
        token: storedToken
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Signup function (to be called from Signup.jsx)
  const signup = async (userData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser = {
        id: buildStableUserId(userData),
        name: userData.name,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        countryCode: userData.countryCode,
        profilePhoto: userData.profilePhoto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dashboards: {
          rent: true, // Default dashboard enabled
          buy: false,
          commercial: false,
          shortlet: false
        }
      };
      
      const token = `domihive_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save to localStorage
      localStorage.setItem('domihive_user', JSON.stringify(newUser));
      localStorage.setItem('domihive_auth_token', token);
      localStorage.setItem('domihive_last_dashboard', 'rent'); // Default to rent
      persistUserKey(newUser);
      migrateUserScopedStorage(newUser.id, newUser);
      
      setUser(newUser);
      setAuthToken(token);
      
      return { 
        success: true, 
        user: newUser,
        token: token
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Signup failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('domihive_user');
    localStorage.removeItem('domihive_auth_token');
    localStorage.removeItem(USER_KEY_STORAGE);
    setUser(null);
    setAuthToken(null);
  };

  // Update user function
  const updateUser = (updatedData) => {
    if (!user) return;
    
    const updatedUser = {
      ...user, 
      ...updatedData,
      id: user.id || buildStableUserId(user),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('domihive_user', JSON.stringify(updatedUser));
    persistUserKey(updatedUser);
    migrateUserScopedStorage(updatedUser.id, updatedUser);
    setUser(updatedUser);
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!authToken;

  const value = {
    user,
    authToken,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
