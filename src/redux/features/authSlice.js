import { createSlice } from '@reduxjs/toolkit';
import logger from '@/lib/logger';

// Load initial state from localStorage if available
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('auth');
    if (serializedState === null) {
      return undefined;
    }
    const state = JSON.parse(serializedState);
    logger.debug('auth', 'Loaded auth state from localStorage', { isAuthenticated: state.isAuthenticated });
    return state;
  } catch (err) {
    logger.error('auth', 'Failed to load auth state from localStorage', { error: err.message });
    return undefined;
  }
};

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
      
      // Save to localStorage
      const stateToSave = {
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
        lastActivity: state.lastActivity
      };
      
      try {
        localStorage.setItem('auth', JSON.stringify(stateToSave));
        logger.info('auth', 'User authenticated and state persisted', {
          userId: action.payload.id,
          role: action.payload.role
        });
        logger.activity(action.payload.id, 'LOGIN_SUCCESS', {
          role: action.payload.role,
          email: action.payload.email
        });
      } catch (err) {
        logger.error('auth', 'Failed to persist auth state', { error: err.message });
      }
    },
    logout: (state) => {
      // Log the logout activity before clearing the state
      if (state.user) {
        logger.activity(state.user.id, 'LOGOUT', {
          role: state.user.role,
          email: state.user.email
        });
      }
      
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.lastActivity = null;
      
      // Clear from localStorage
      try {
        localStorage.removeItem('auth');
        logger.info('auth', 'User logged out and state cleared');
      } catch (err) {
        logger.error('auth', 'Failed to clear auth state', { error: err.message });
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      logger.error('auth', 'Authentication error occurred', { error: action.payload });
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateLastActivity: (state) => {
      state.lastActivity = new Date().toISOString();
      // Update localStorage with new activity timestamp
      try {
        localStorage.setItem('auth', JSON.stringify(state));
      } catch (err) {
        logger.error('auth', 'Failed to update last activity', { error: err.message });
      }
    }
  }
});

export const { setUser, logout, setError, setLoading, updateLastActivity } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectLastActivity = (state) => state.auth.lastActivity;

// Role-based access control helper
export const hasRole = (state, roles) => {
  const userRole = selectUserRole(state);
  if (!userRole) return false;
  return Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
};

export default authSlice.reducer; 