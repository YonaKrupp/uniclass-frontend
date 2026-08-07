import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // Skip all Base44 auth checks if we're returning from payment
      const isPaymentCallback = window.location.pathname === '/payment-success' || window.location.pathname === '/payment-failed';
      
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // Check if user has custom auth token (e.g., from C# API login)
      const hasCustomAuthToken = typeof window !== 'undefined' && localStorage.getItem('authToken');
      
      if (isPaymentCallback || hasCustomAuthToken) {
        // During payment callbacks OR with custom auth token, skip Base44 entirely
        console.log('[AuthContext] Custom auth detected - skipping Base44 auth');
        // Clear any stale Base44 tokens so the SDK doesn't auto-call User/me (causes 401)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('base44_access_token');
          localStorage.removeItem('base44_token');
        }
        setIsAuthenticated(!!hasCustomAuthToken);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        setIsLoadingPublicSettings(false);
        return;
      }
      
      // Only try to fetch Base44 public settings if we have a Base44 token
       if (appParams.token && !hasCustomAuthToken) {
         try {
           await checkUserAuth();
        } catch (appError) {
          // If token is invalid, clear it and treat as unauthenticated
          if (appError.status === 401 || appError.status === 403) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('base44_access_token');
              localStorage.removeItem('base44_token');
            }
            setIsAuthenticated(false);
            setIsLoadingAuth(false);
            setAuthChecked(true);
          }
          setIsLoadingPublicSettings(false);
        }
      } else {
        // No Base44 token - skip Base44 auth entirely
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAuthChecked(true);
        setIsLoadingPublicSettings(false);
      }
    } catch (error) {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
      try {
        setIsLoadingAuth(true);
        // Skip all Base44 auth checks — using custom C# API auth exclusively
        console.log('[AuthContext] Skipping Base44 auth (custom C# API auth in use)');
        setIsLoadingAuth(false);
        setAuthChecked(true);
        setIsAuthenticated(false);
      } catch (error) {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};