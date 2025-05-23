import { configureStore } from '@reduxjs/toolkit';
import propertyReducer from './features/propertySlice';
import authReducer from './features/authSlice';

export const store = configureStore({
  reducer: {
    property: propertyReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
}); 