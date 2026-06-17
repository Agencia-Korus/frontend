"use client";

import { AdminShell } from "@/src/korus/dashboard-shells";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}