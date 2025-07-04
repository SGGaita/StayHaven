'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReduxProvider } from "@/redux/provider";
import { Toaster } from "react-hot-toast";
import theme from '@/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/providers/AuthProvider';
import ClientWrapper from '@/components/ClientWrapper';

export default function ClientLayout({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ReduxProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <ClientWrapper>
                {children}
                <Toaster position="bottom-right" />
              </ClientWrapper>
            </LocalizationProvider>
          </ReduxProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 