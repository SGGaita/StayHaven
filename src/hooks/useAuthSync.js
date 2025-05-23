'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/features/authSlice';

/**
 * Hook to sync auth state from localStorage to cookies
 * This ensures server-side API routes can access the auth state
 */
export function useAuthSync() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Sync auth state from localStorage to cookies on mount and when auth changes
    const syncAuthState = () => {
      try {
        const authState = localStorage.getItem('auth');
        if (authState) {
          // Set cookie with path and expiry (1 hour)
          document.cookie = `auth=${encodeURIComponent(authState)};path=/;max-age=3600`;
        } else {
          // Clear the cookie if no auth state exists
          document.cookie = 'auth=;path=/;max-age=0';
        }
      } catch (error) {
        console.error('Error syncing auth state to cookie:', error);
      }
    };

    // Initial sync
    syncAuthState();

    // Set up an interval to refresh the cookie
    const interval = setInterval(syncAuthState, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]); // Re-run when authentication state changes
} 