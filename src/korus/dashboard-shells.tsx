"use client";

import type { ReactNode } from "react";
import {
  BookOpen,
  Calendar,
  FolderKanban,
  Image,
  LayoutDashboard,
  MessageSquare,
  Palette,
  Rss,
  Settings,
  Target,
  User,
  Users,
  Zap,
} from "lucide-react";

import { IMAGES } from "./assets";
import { useAuth } from "./auth-context";
import { DashboardLayout } from "./components/DashboardLayout";
import { useKorusData } from "./live-data";
import { LoginPage } from "./pages/LoginPage";

const clienteNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/cliente" },
  { label: "Meus Projetos", icon: FolderKanban, href: "/cliente/projetos" },
  { label: "Agenda", icon: Calendar, href: "/cliente/agenda" },
  { label: "Meu Perfil", icon: User, href: "/cliente/perfil" },
];

const funcionarioNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/funcionario" },
  { label: "Meus Projetos", icon: FolderKanban, href: "/funcionario/projetos" },
  { label: "Feed", icon: Rss, href: "/funcionario/feed" },
  { label: "Agenda", icon: Calendar, href: "/funcionario/agenda" },
  { label: "Meu XP", icon: Zap, href: "/funcionario/xp" },
  { label: "Perfil", icon: User, href: "/funcionario/perfil" },
];

const adminNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Usuários", icon: Users, href: "/admin/usuarios" },
  { label: "Leads", icon: Target, href: "/admin/leads" },
  { label: "Projetos", icon: FolderKanban, href: "/admin/projetos" },
  { label: "Serviços", icon: Palette, href: "/admin/servicos" },
  { label: "Portfólio", icon: Image, href: "/admin/portfolio" },
  { label: "Academy", icon: BookOpen, href: "/admin/academy" },
  { label: "Feed", icon: MessageSquare, href: "/admin/feed" },
  { label: "Agenda", icon: Calendar, href: "/admin/agenda" },
  { label: "Gamificação", icon: Zap, href: "/admin/gamificacao" },
  { label: "Configurações", icon: Settings, href: "/admin/configuracoes" },
  { label: "Perfil", icon: User, href: "/admin/perfil" },
];

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0C0819]">
      <div className="text-[#6B7280]" style={{ fontSize: 14 }}>Carregando...</div>
    </div>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();

  if (!ready) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  return <>{children}</>;
}

export function ClienteShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { users } = useKorusData();
  const currentUser = users.find((u) => u.id === String(user?.id)) || users.find((u) => u.role === "cliente");

  return (
    <AuthGate>
      <DashboardLayout
        items={clienteNav}
        userName={currentUser?.name || "Cliente"}
        userRole="Cliente"
      >
        {children}
      </DashboardLayout>
    </AuthGate>
  );
}

export function FuncionarioShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { users } = useKorusData();
  const currentUser = users.find((u) => u.id === String(user?.id)) || users.find((u) => u.role === "funcionario");

  return (
    <AuthGate>
      <DashboardLayout
        items={funcionarioNav}
        userName={currentUser?.name || "Funcionário"}
        userRole={currentUser?.cargo || "Designer"}
        userAvatar={currentUser?.avatar || IMAGES.woman}
      >
        {children}
      </DashboardLayout>
    </AuthGate>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { users } = useKorusData();
  const currentUser = users.find((u) => u.id === String(user?.id)) || users.find((u) => u.role === "admin");

  return (
    <AuthGate>
      <DashboardLayout
        items={adminNav}
        userName={currentUser?.name || "Administrador"}
        userRole={currentUser?.cargo || "Administrador"}
        userAvatar={currentUser?.avatar || IMAGES.man}
      >
        {children}
      </DashboardLayout>
    </AuthGate>
  );
}