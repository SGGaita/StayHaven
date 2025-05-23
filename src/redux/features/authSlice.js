import { createSlice } from '@reduxjs/toolkit';

// Helper for safely checking if we're on the client side
const isClient = typeof window !== 'undefined';

// Load initial state from localStorage if available
const loadState = () => {
  try {
    if (!isClient) return undefined;
    
    const serializedState = localStorage.getItem('auth');
    if (serializedState === null) {
      return undefined;
    }
    
    const state = JSON.parse(serializedState);
    return state;
  } catch (err) {
    console.error('Failed to load auth state from localStorage:', err.message);
    return undefined;
  }
};

// Initial state with fallback
const initialState = loadState() || {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  lastActivity: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
      state.lastActivity = new Date().toISOString();
      
      // Save to localStorage if on client side
      if (isClient) {
        const stateToSave = {
          user: action.payload,
          isAuthenticated: true,
          loading: false,
          error: null,
          lastActivity: state.lastActivity
        };
        
        try {
          const stateJson = JSON.stringify(stateToSave);
          localStorage.setItem('auth', stateJson);
          
          // Also set a cookie for server-side access
          document.cookie = `auth=${encodeURIComponent(stateJson)};path=/;max-age=3600`;
        } catch (err) {
          console.error('Failed to persist auth state:', err.message);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.lastActivity = null;
      
      // Clear from localStorage if on client side
      if (isClient) {
        try {
          localStorage.removeItem('auth');
          
          // Also clear the cookie
          document.cookie = 'auth=;path=/;max-age=0';
        } catch (err) {
          console.error('Failed to clear auth state:', err.message);
        }
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateLastActivity: (state) => {
      state.lastActivity = new Date().toISOString();
      
      // Update localStorage with new activity timestamp
      if (isClient) {
        try {
          localStorage.setItem('auth', JSON.stringify(state));
        } catch (err) {
          console.error('Failed to update activity timestamp:', err.message);
        }
      }
    }
  }
});

export const { setUser, logout, setError, setLoading, updateLastActivity } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectUserRole = (state) => state.auth.user?.role;

// Role-based access control helper
export const hasRole = (state, roles) => {
  const userRole = selectUserRole(state);
  if (!userRole) return false;
  return Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
};

export default authSlice.reducer; 