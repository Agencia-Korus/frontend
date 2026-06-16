"use client";

import { AuthProvider } from "./auth-context";
import { CookieConsent } from "./components/CookieConsent";
import { KorusDataProvider } from "./live-data";

export function KorusProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <KorusDataProvider>
        {children}
        <CookieConsent />
      </KorusDataProvider>
    </AuthProvider>
  );
}