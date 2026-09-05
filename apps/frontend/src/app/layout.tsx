import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Censo de Motos — Sabanalarga',
  description: 'Sistema de Censo de Motos — Alcaldía Municipal de Sabanalarga',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  );
}

