'use client';

import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export default function ClientWrapper({ children }) {
  const { updateLastActivity } = useAuth();

  useEffect(() => {
    // Update last activity when component mounts
    updateLastActivity();

    // Set up interval to update last activity
    const interval = setInterval(updateLastActivity, 5 * 60 * 1000); // Every 5 minutes

    // Clean up interval
    return () => clearInterval(interval);
  }, [updateLastActivity]);

  return <>{children}</>;
} 