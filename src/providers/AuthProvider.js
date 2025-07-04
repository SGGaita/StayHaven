'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          setAuthState(JSON.parse(storedAuth));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (session && typeof window !== 'undefined') {
      const authData = {
        user: session.user,
        isAuthenticated: true,
        lastActivity: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem('auth', JSON.stringify(authData));
        setAuthState(authData);
      } catch (error) {
        console.error('Error saving auth state:', error);
      }
    }
  }, [session]);

  const clearAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth');
        setAuthState(null);
      } catch (error) {
        console.error('Error clearing auth state:', error);
      }
    }
  }, []);

  const updateLastActivity = useCallback(() => {
    if (typeof window !== 'undefined') {
      setAuthState(currentAuthState => {
        if (!currentAuthState) return currentAuthState;
        
        const updatedAuth = {
          ...currentAuthState,
          lastActivity: new Date().toISOString(),
        };
        
        try {
          localStorage.setItem('auth', JSON.stringify(updatedAuth));
          return updatedAuth;
        } catch (error) {
          console.error('Error updating last activity:', error);
          return currentAuthState;
        }
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth: authState,
        status,
        clearAuth,
        updateLastActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 