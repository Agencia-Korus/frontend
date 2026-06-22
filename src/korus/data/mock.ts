import { IMAGES } from "../assets";

export { IMAGES };

export type UserRole = "admin" | "funcionario" | "cliente" | "visitante";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cargo?: string;
  avatar?: string;
  status: "ativo" | "inativo" | "pendente";
  xp?: number;
  level?: number;
  levelName?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  clientId: string;
  status: "a_fazer" | "em_andamento" | "em_revisao" | "concluido";
  progress: number;
  startDate: string;
  endDate: string;
  responsible: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "a_fazer" | "em_andamento" | "em_revisao" | "concluido";
  responsible: string;
  dueDate: string;
  priority: "alta" | "media" | "baixa";
  category: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  service: string;
  budget: string;
  date: string;
  status: "novo" | "em_contato" | "proposta_enviada" | "convertido" | "perdido";
  priority: "alta" | "media" | "baixa";
  notes?: string;
}

export type ServiceIcon = "Palette" | "Share2" | "Globe" | "FileText" | "TrendingUp" | "Camera";

export interface Service {
  id: string;
  name: string;
  slug: string;
  icon: ServiceIcon;
  description: string;
  deliverables: string[];
  status: "ativo" | "inativo";
}

export interface PortfolioItem {
  id: string;
  name: string;
  client: string;
  category: string;
  image: string;
  year: string;
  description: string;
  tags: string[];
  featured: boolean;
}

export interface AcademyItem {
  id: string;
  title: string;
  type: "E-book" | "Curso";
  description: string;
  price: string;
  image: string;
  // Link externo (Hotmart, Eduzz, etc.) para onde o aluno é direcionado na compra.
  url: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  target: "funcionarios" | "clientes" | "todos" | "admins";
  read: boolean;
}

export function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    a_fazer: "A Fazer",
    em_andamento: "Em Andamento",
    em_revisao: "Em Revisão",
    concluido: "Concluído",
    novo: "Novo",
    em_contato: "Em Contato",
    proposta_enviada: "Proposta Enviada",
    convertido: "Convertido",
    perdido: "Perdido",
  };
  return map[status] || status;
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    a_fazer: "bg-gray-500",
    em_andamento: "bg-blue-500",
    em_revisao: "bg-[#8B5CF6]",
    concluido: "bg-[#22C55E]",
    novo: "bg-[#3B82F6]",
    em_contato: "bg-[#F59E0B]",
    proposta_enviada: "bg-[#8B5CF6]",
    convertido: "bg-[#22C55E]",
    perdido: "bg-[#EF4444]",
  };
  return map[status] || "bg-gray-500";
}

export function getPriorityColor(p: string) {
  return p === "alta" ? "bg-[#EF4444] text-white" : p === "media" ? "bg-[#F59E0B] text-white" : "bg-gray-400 text-white";
}