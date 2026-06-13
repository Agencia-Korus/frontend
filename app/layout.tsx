import type { Metadata } from 'next';
import { KorusProviders } from '@/src/korus/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Korus Agency',
  description: 'Marketing, design e tecnologia para transformar comunicação em resultado.',
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