'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReduxProvider } from "@/redux/provider";
import { Toaster } from "react-hot-toast";
import theme from '@/theme';

export default function ClientLayout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReduxProvider>
        {children}
        <Toaster position="bottom-right" />
      </ReduxProvider>
    </ThemeProvider>
  );
} 