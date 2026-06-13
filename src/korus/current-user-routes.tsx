"use client";

import { useAuth } from "./auth-context";
import { CalendarPage } from "./pages/CalendarPage";
import { KanbanBoard } from "./pages/KanbanBoard";
import { ProfilePage } from "./pages/ProfilePage";

export function ClienteAgendaRoute() {
  const { user } = useAuth();
  return <CalendarPage title="Minha Agenda" currentUserId={String(user?.id || "")} />;
}

export function ClientePerfilRoute() {
  const { user } = useAuth();
  return <ProfilePage userId={String(user?.id || "5")} />;
}

export function ClienteProjetoRoute() {
  return <KanbanBoard mode="cliente" />;
}

export function FuncionarioAgendaRoute() {
  const { user } = useAuth();
  return <CalendarPage title="Minha Agenda" currentUserId={String(user?.id || "")} />;
}

export function FuncionarioPerfilRoute() {
  const { user } = useAuth();
  return <ProfilePage userId={String(user?.id || "2")} />;
}

export function FuncionarioProjetoRoute() {
  const { user } = useAuth();
  return <KanbanBoard mode="funcionario" currentUserId={String(user?.id || "2")} />;
}

export function AdminAgendaRoute() {
  const { user } = useAuth();
  return <CalendarPage title="Agenda Geral" currentUserId={String(user?.id || "")} />;
}

export function AdminPerfilRoute() {
  const { user } = useAuth();
  return <ProfilePage userId={String(user?.id || "1")} />;
}

export function AdminProjetoRoute() {
  return <KanbanBoard mode="admin" />;
}