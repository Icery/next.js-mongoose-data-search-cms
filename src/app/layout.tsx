'use client';

import { ReactElement } from 'react';

import { LoadScript } from '@react-google-maps/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import localFont from 'next/font/local';

import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';

import GoogleAnalytics from './global-components/GoogleAnalytics';
import Header from './global-components/Header';

import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const RootLayout = ({ children }: { children: ReactElement }) => {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F5F5F5]`}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_MAP_KEY}>
                <Header>{children}</Header>
              </LoadScript>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
};

export default RootLayout;
