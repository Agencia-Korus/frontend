"use client";

import { FuncionarioShell } from "@/src/korus/dashboard-shells";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <FuncionarioShell>{children}</FuncionarioShell>;
}