"use client";

import { ClienteShell } from "@/src/korus/dashboard-shells";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClienteShell>{children}</ClienteShell>;
}