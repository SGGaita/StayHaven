'use client';

import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/redux/store';
import SessionProvider from './SessionProvider';

export default function Providers({ children }) {
  return (
    <ReduxProvider store={store}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ReduxProvider>
  );
} 