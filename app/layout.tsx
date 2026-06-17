import type { Metadata } from 'next';
import { KorusProviders } from '@/src/korus/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Korus',
  description: 'Marketing, design e tecnologia para transformar comunicação em resultado.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <KorusProviders>{children}</KorusProviders>
      </body>
    </html>
  );
}