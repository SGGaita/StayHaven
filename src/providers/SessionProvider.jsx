'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/redux/features/authSlice';

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

export default function SessionProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const userData = getStoredUser();
    
    if (userData) {
      dispatch(setUser(userData));
    } else {
      dispatch(clearUser());
    }
  }, [dispatch]);

  return children;
} 