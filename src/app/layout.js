import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/providers/AuthProvider';
import ClientWrapper from '@/components/ClientWrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'StayHaven',
  description: 'Your home away from home',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AuthProvider>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 