"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  AcademyItem,
  Announcement,
  Lead,
  PortfolioItem,
  Project,
  Service,
  Task,
  User,
} from "./data/mock";
import { IMAGES } from "./assets";
import { apiDelete, apiGet, apiPatch, apiPost, apiUrl, type AuthUser } from "./api-client";
import { useAuth } from "./auth-context";

type EntityId = string | number;
type EditableService = Partial<Omit<Service, "id" | "icon">> & { id?: EntityId; icon?: string };
type EditablePortfolioItem = Partial<Omit<PortfolioItem, "id">> & { id?: EntityId };
type EditableAcademyItem = Partial<Omit<AcademyItem, "id" | "type">> & { id?: EntityId; type?: string };

type AdminDashboardData = {
  cards?: {
    leads_no_mes?: number;
    projetos_ativos?: number;
    tarefas_concluidas?: number;
    clientes_ativos?: number;
  };
  leads_por_semana?: Array<{ periodo: string; total: number }>;
  tarefas_concluidas_por_dia?: Array<{ periodo: string; total: number }>;
  leads_recentes?: Array<{ id: number; nome: string; status: string; empresa?: string | null }>;
  ranking_xp_semanal?: Array<{ funcionario_id: number; nome: string; cargo?: string; xp_total: number }>;
};

type KorusDataContextValue = {
  services: Service[];
  portfolioItems: PortfolioItem[];
  academyItems: AcademyItem[];
  leads: Lead[];
  users: User[];
  projects: Project[];
  tasks: Task[];
  announcements: Announcement[];
  adminDashboard: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createLead: (payload: unknown) => Promise<void>;
  createService: (payload: EditableService) => Promise<void>;
  updateService: (id: EntityId, payload: EditableService) => Promise<void>;
  deleteService: (id: EntityId) => Promise<void>;
  createPortfolio: (payload: EditablePortfolioItem) => Promise<void>;
  updatePortfolio: (id: EntityId, payload: EditablePortfolioItem) => Promise<void>;
  deletePortfolio: (id: EntityId) => Promise<void>;
  createAcademy: (payload: EditableAcademyItem) => Promise<void>;
  updateAcademy: (id: EntityId, payload: EditableAcademyItem) => Promise<void>;
  deleteAcademy: (id: EntityId) => Promise<void>;
  updateLead: (id: EntityId, payload: Partial<Lead>) => Promise<void>;
  updateTask: (id: EntityId, payload: Partial<Task>) => Promise<void>;
  createTask: (payload: Partial<Task>) => Promise<void>;
  deleteTask: (id: EntityId) => Promise<void>;
  createUser: (payload: Partial<User> & { password?: string }) => Promise<void>;
  updateUser: (id: EntityId, payload: Partial<User>) => Promise<void>;
  deleteUser: (id: EntityId) => Promise<void>;
  createAnnouncement: (payload: Partial<Announcement>) => Promise<void>;
  updateAnnouncement: (id: EntityId, payload: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: EntityId) => Promise<void>;
  createProject: (payload: Partial<Project> & { description?: string }) => Promise<Project>;
  updateProject: (id: EntityId, payload: Partial<Project> & { description?: string }) => Promise<void>;
  deleteProject: (id: EntityId) => Promise<void>;
  addProjectMember: (projectId: EntityId, funcionarioId: EntityId, papel?: string) => Promise<void>;
  removeProjectMember: (projectId: EntityId, funcionarioId: EntityId) => Promise<void>;
  googleCalendarIntegration: Integration | null;
  saveGoogleCalendarIntegration: (payload: { chave?: string; status: "conectado" | "desconectado" }) => Promise<void>;
};

export type Integration = {
  id: number;
  nome: string;
  chave: string | null;
  status: "conectado" | "desconectado";
  atualizado_em: string;
};

const KorusDataContext = createContext<KorusDataContextValue | null>(null);

export function KorusDataProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [academyItems, setAcademyItems] = useState<AcademyItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [adminDashboard, setAdminDashboard] = useState<AdminDashboardData | null>(null);
  const [googleCalendarIntegration, setGoogleCalendarIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPublic = useCallback(async () => {
    const [remoteServices, remotePortfolio, remoteAcademy] = await Promise.allSettled([
      apiGet<ApiService[]>("/servicos?limit=100"),
      apiGet<ApiPortfolio[]>("/portfolio?limit=100"),
      apiGet<ApiAcademy[]>("/academy?limit=100&publicado=true"),
    ]);

    let servicosAtuais: Service[] = [];
    if (remoteServices.status === "fulfilled") {
      servicosAtuais = remoteServices.value.map(mapService);
      setServices(servicosAtuais);
      void hydrateDeliverables(remoteServices.value, setServices);
    }
    if (remotePortfolio.status === "fulfilled") {
      setPortfolioItems(remotePortfolio.value.map(mapPortfolio));
    }
    if (remoteAcademy.status === "fulfilled") {
      setAcademyItems(remoteAcademy.value.map(mapAcademy));
    }
    return servicosAtuais;
  }, []);

  const loadPrivate = useCallback(async (usuarioAtual: AuthUser | null, servicosAtuais: Service[]) => {
    if (!usuarioAtual) {
      setAdminDashboard(null);
      return;
    }

    const [remoteProjects, remoteTasks, remoteAnnouncements] = await Promise.allSettled([
      apiGet<ApiProject[]>("/projetos?limit=100", true),
      apiGet<ApiTask[]>("/tarefas?limit=100", true),
      apiGet<ApiAnnouncement[]>("/comunicados?limit=100", true),
    ]);

    if (remoteProjects.status === "fulfilled") {
      const projetos = remoteProjects.value.map(mapProject);
      setProjects(projetos);
      void hydrateEquipe(remoteProjects.value, setProjects);
    }
    if (remoteTasks.status === "fulfilled") setTasks(remoteTasks.value.map(mapTask));
    if (remoteAnnouncements.status === "fulfilled") setAnnouncements(remoteAnnouncements.value.map(mapAnnouncement));

    if (usuarioAtual.role !== "admin") {
      // Funcionário/cliente não acessam /usuarios; carrega ao menos o próprio
      // usuário para que Perfil e Dashboard tenham dados (evita crash).
      const remoteMe = await apiGet<ApiUser>("/usuarios/me", true).catch(() => null);
      if (remoteMe) setUsers([mapUser(remoteMe)]);
      return;
    }

    const [remoteUsers, remoteLeads, remoteDashboard, remoteIntegracoes] = await Promise.allSettled([
      apiGet<ApiUser[]>("/usuarios?limit=100", true),
      apiGet<ApiLead[]>("/leads?limit=100", true),
      apiGet<AdminDashboardData>("/dashboard/admin", true),
      apiGet<Integration[]>("/integracoes?limit=20", true),
    ]);

    if (remoteUsers.status === "fulfilled") setUsers(remoteUsers.value.map(mapUser));
    if (remoteLeads.status === "fulfilled") setLeads(remoteLeads.value.map((lead) => mapLead(lead, servicosAtuais)));
    if (remoteDashboard.status === "fulfilled") setAdminDashboard(remoteDashboard.value);
    if (remoteIntegracoes.status === "fulfilled") {
      const googleCalendar = remoteIntegracoes.value.find((item) => item.nome === "google_calendar");
      setGoogleCalendarIntegration(googleCalendar || null);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      const servicosAtuais = await loadPublic();
      await loadPrivate(user, servicosAtuais);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar dados da API.");
    } finally {
      setLoading(false);
    }
  }, [ready, user, loadPublic, loadPrivate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const createLead = useCallback(async (payload: unknown) => {
    await apiPost<ApiLead>("/leads", payload);
    await refresh();
  }, [refresh]);

  const createService = useCallback(async (payload: EditableService) => {
    await apiPost<ApiService>("/servicos", servicePayload(payload), true);
    await refresh();
  }, [refresh]);

  const updateService = useCallback(async (id: EntityId, payload: EditableService) => {
    await apiPatch<ApiService>(`/servicos/${id}`, servicePayload(payload), true);
    await refresh();
  }, [refresh]);

  const deleteService = useCallback(async (id: EntityId) => {
    await apiDelete(`/servicos/${id}`, true);
    await refresh();
  }, [refresh]);

  const createPortfolio = useCallback(async (payload: EditablePortfolioItem) => {
    await apiPost<ApiPortfolio>("/portfolio", portfolioPayload(payload), true);
    await refresh();
  }, [refresh]);

  const updatePortfolio = useCallback(async (id: EntityId, payload: EditablePortfolioItem) => {
    await apiPatch<ApiPortfolio>(`/portfolio/${id}`, portfolioPayload(payload), true);
    await refresh();
  }, [refresh]);

  const deletePortfolio = useCallback(async (id: EntityId) => {
    await apiDelete(`/portfolio/${id}`, true);
    await refresh();
  }, [refresh]);

  const createAcademy = useCallback(async (payload: EditableAcademyItem) => {
    await apiPost<ApiAcademy>("/academy", academyPayload(payload), true);
    await refresh();
  }, [refresh]);

  const updateAcademy = useCallback(async (id: EntityId, payload: EditableAcademyItem) => {
    await apiPatch<ApiAcademy>(`/academy/${id}`, academyPayload(payload), true);
    await refresh();
  }, [refresh]);

  const deleteAcademy = useCallback(async (id: EntityId) => {
    await apiDelete(`/academy/${id}`, true);
    await refresh();
  }, [refresh]);

  const updateLead = useCallback(async (id: EntityId, payload: Partial<Lead>) => {
    await apiPatch<ApiLead>(`/leads/${id}`, leadPayload(payload), true);
    await refresh();
  }, [refresh]);

  const updateTask = useCallback(async (id: EntityId, payload: Partial<Task>) => {
    await apiPatch<ApiTask>(`/tarefas/${id}`, taskPayload(payload), true);
    await refresh();
  }, [refresh]);

  const createTask = useCallback(async (payload: Partial<Task>) => {
    await apiPost<ApiTask>("/tarefas", taskCreatePayload(payload), true);
    await refresh();
  }, [refresh]);

  const deleteTask = useCallback(async (id: EntityId) => {
    await apiDelete(`/tarefas/${id}`, true);
    await refresh();
  }, [refresh]);

  const createUser = useCallback(async (payload: Partial<User> & { password?: string }) => {
    await apiPost<ApiUser>("/usuarios", userPayload(payload), true);
    await refresh();
  }, [refresh]);

  const updateUser = useCallback(async (id: EntityId, payload: Partial<User>) => {
    const path = user && String(user.id) === String(id) ? "/usuarios/me" : `/usuarios/${id}`;
    await apiPatch<ApiUser>(path, userUpdatePayload(payload), true);
    await refresh();
  }, [refresh, user]);

  const deleteUser = useCallback(async (id: EntityId) => {
    await apiDelete(`/usuarios/${id}`, true);
    await refresh();
  }, [refresh]);

  const createAnnouncement = useCallback(async (payload: Partial<Announcement>) => {
    await apiPost<ApiAnnouncement>("/comunicados", {
      titulo: payload.title,
      conteudo: payload.content,
      alvo: payload.target || "todos",
      autor_id: user?.id,
    }, true);
    await refresh();
  }, [refresh, user]);

  const updateAnnouncement = useCallback(async (id: EntityId, payload: Partial<Announcement>) => {
    await apiPatch<ApiAnnouncement>(`/comunicados/${id}`, {
      titulo: payload.title,
      conteudo: payload.content,
      alvo: payload.target,
    }, true);
    await refresh();
  }, [refresh]);

  const deleteAnnouncement = useCallback(async (id: EntityId) => {
    await apiDelete(`/comunicados/${id}`, true);
    await refresh();
  }, [refresh]);

  const createProject = useCallback(async (payload: Partial<Project> & { description?: string }) => {
    const created = await apiPost<ApiProject>("/projetos", {
      nome: payload.name,
      descricao: payload.description || "",
      cliente_id: Number(payload.clientId),
      data_inicio: payload.startDate || null,
      data_fim: payload.endDate || null,
      status: payload.status === "a_fazer" ? "planejamento" : payload.status || "planejamento",
      progresso: payload.progress || 0,
    }, true);
    await refresh();
    return mapProject(created);
  }, [refresh]);

  const updateProject = useCallback(async (id: EntityId, payload: Partial<Project> & { description?: string }) => {
    await apiPatch<ApiProject>(`/projetos/${id}`, {
      nome: payload.name,
      descricao: payload.description,
      data_inicio: payload.startDate || undefined,
      data_fim: payload.endDate || undefined,
      status: payload.status === "a_fazer" ? "planejamento" : payload.status,
      progresso: payload.progress,
    }, true);
    await refresh();
  }, [refresh]);

  const deleteProject = useCallback(async (id: EntityId) => {
    await apiDelete(`/projetos/${id}`, true);
    await refresh();
  }, [refresh]);

  const addProjectMember = useCallback(async (projectId: EntityId, funcionarioId: EntityId, papel?: string) => {
    await apiPost(`/projetos/${projectId}/equipe`, {
      funcionario_id: Number(funcionarioId),
      papel: papel || null,
    }, true);
    await refresh();
  }, [refresh]);

  const removeProjectMember = useCallback(async (projectId: EntityId, funcionarioId: EntityId) => {
    await apiDelete(`/projetos/${projectId}/equipe/${funcionarioId}`, true);
    await refresh();
  }, [refresh]);

  const saveGoogleCalendarIntegration = useCallback(async (payload: { chave?: string; status: "conectado" | "desconectado" }) => {
    if (googleCalendarIntegration) {
      await apiPatch<Integration>(`/integracoes/${googleCalendarIntegration.id}`, {
        chave: payload.chave,
        status: payload.status,
      }, true);
    } else {
      await apiPost<Integration>("/integracoes", {
        nome: "google_calendar",
        chave: payload.chave || null,
        status: payload.status,
      }, true);
    }
    await refresh();
  }, [refresh, googleCalendarIntegration]);

  const value = useMemo(
    () => ({
      services,
      portfolioItems,
      academyItems,
      leads,
      users,
      projects,
      tasks,
      announcements,
      adminDashboard,
      loading,
      error,
      refresh,
      createLead,
      createService,
      updateService,
      deleteService,
      createPortfolio,
      updatePortfolio,
      deletePortfolio,
      createAcademy,
      updateAcademy,
      deleteAcademy,
      updateLead,
      updateTask,
      createTask,
      deleteTask,
      createUser,
      updateUser,
      deleteUser,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      createProject,
      updateProject,
      deleteProject,
      addProjectMember,
      removeProjectMember,
      googleCalendarIntegration,
      saveGoogleCalendarIntegration,
    }),
    [
      services,
      portfolioItems,
      academyItems,
      leads,
      users,
      projects,
      tasks,
      announcements,
      adminDashboard,
      loading,
      error,
      refresh,
      createLead,
      createService,
      updateService,
      deleteService,
      createPortfolio,
      updatePortfolio,
      deletePortfolio,
      createAcademy,
      updateAcademy,
      deleteAcademy,
      updateLead,
      updateTask,
      createTask,
      deleteTask,
      createUser,
      updateUser,
      deleteUser,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      createProject,
      updateProject,
      deleteProject,
      addProjectMember,
      removeProjectMember,
      googleCalendarIntegration,
      saveGoogleCalendarIntegration,
    ],
  );

  return <KorusDataContext.Provider value={value}>{children}</KorusDataContext.Provider>;
}

export function useKorusData() {
  const value = useContext(KorusDataContext);
  if (!value) {
    throw new Error("useKorusData precisa ser usado dentro de KorusDataProvider.");
  }
  return value;
}

type ApiService = { id: number; nome: string; slug: string; descricao?: string | null; icone?: string | null; status: string };
type ApiDeliverable = { descricao: string };
type ApiPortfolio = { id: number; nome: string; cliente?: string | null; categoria?: string | null; descricao?: string | null; imagem?: string | null; ano?: number | null; destaque: boolean; tags: string[] };
type ApiAcademy = { id: number; titulo: string; tipo: "ebook" | "curso"; descricao?: string | null; preco: string | number; imagem?: string | null; url_externa?: string; publicado: boolean };
type ApiLead = { id: number; nome: string; email: string; whatsapp?: string | null; empresa?: string | null; servico_id?: number | null; orcamento?: string | null; prazo_desejado?: string | null; mensagem?: string | null; status: string; prioridade: "alta" | "media" | "baixa"; data: string };
type ApiUser = { id: number; nome: string; email: string; role: User["role"]; status: User["status"]; avatar?: string | null; telefone?: string | null };
type ApiProject = { id: number; nome: string; cliente_id: number; status: string; progresso: number; data_inicio?: string | null; data_fim?: string | null };
type ApiTask = { id: number; projeto_id: number; titulo: string; descricao?: string | null; status: string; responsavel_id?: number | null; prazo?: string | null; prioridade: Task["priority"]; categoria?: string | null };
type ApiAnnouncement = { id: number; titulo: string; conteudo: string; alvo: Announcement["target"]; autor_id: number; data: string };

function mapService(service: ApiService): Service {
  return {
    id: String(service.id),
    name: service.nome,
    slug: service.slug,
    icon: normalizeIcon(service.icone),
    description: service.descricao || "",
    deliverables: [],
    status: service.status === "inativo" ? "inativo" : "ativo",
  };
}

async function hydrateDeliverables(remoteServices: ApiService[], setServices: Dispatch<SetStateAction<Service[]>>) {
  const deliverables = await Promise.allSettled(
    remoteServices.map((service) => apiGet<ApiDeliverable[]>(`/servicos/${service.id}/entregaveis`)),
  );
  setServices((current) => current.map((service, index) => {
    const result = deliverables[index];
    if (!result || result.status !== "fulfilled" || !result.value.length) return service;
    return { ...service, deliverables: result.value.map((item) => item.descricao) };
  }));
}

function mapPortfolio(item: ApiPortfolio): PortfolioItem {
  return {
    id: String(item.id),
    name: item.nome,
    client: item.cliente || "Korus",
    category: item.categoria || "Identidade Visual",
    image: item.imagem || IMAGES.branding,
    year: String(item.ano || new Date().getFullYear()),
    description: item.descricao || "",
    tags: item.tags || [],
    featured: item.destaque,
  };
}

function mapAcademy(item: ApiAcademy): AcademyItem {
  const price = Number(item.preco);
  return {
    id: String(item.id),
    title: item.titulo,
    type: item.tipo === "ebook" ? "E-book" : "Curso",
    description: item.descricao || "",
    price: price === 0 ? "Gratuito" : price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    image: item.imagem || IMAGES.branding,
    url: item.url_externa && item.url_externa !== "#" ? item.url_externa : "",
  };
}

function mapLead(lead: ApiLead, services: Service[]): Lead {
  return {
    id: String(lead.id),
    name: lead.nome,
    email: lead.email,
    whatsapp: lead.whatsapp || "",
    service: services.find((service) => service.id === String(lead.servico_id))?.name || lead.empresa || "Serviço",
    budget: lead.orcamento || "Não informado",
    date: lead.data?.slice(0, 10) || "",
    status: lead.status === "qualificado" ? "proposta_enviada" : lead.status as Lead["status"],
    priority: lead.prioridade,
    notes: lead.mensagem || undefined,
  };
}

function mapUser(user: ApiUser): User {
  return {
    id: String(user.id),
    name: user.nome,
    email: user.email,
    role: user.role,
    avatar: user.avatar || undefined,
    status: user.status,
    cargo: user.role === "admin" ? "Administrador" : undefined,
  };
}

function mapProject(project: ApiProject): Project {
  return {
    id: String(project.id),
    name: project.nome,
    client: `Cliente #${project.cliente_id}`,
    clientId: String(project.cliente_id),
    status: project.status === "planejamento" || project.status === "pausado" ? "a_fazer" : project.status as Project["status"],
    progress: project.progresso,
    startDate: project.data_inicio || "",
    endDate: project.data_fim || "",
    responsible: [],
  };
}

type ApiProjetoFuncionario = { projeto_id: number; funcionario_id: number; papel?: string | null };

// Carrega a equipe (funcionários alocados) de cada projeto e preenche `responsible`.
async function hydrateEquipe(remoteProjects: ApiProject[], setProjects: Dispatch<SetStateAction<Project[]>>) {
  const equipes = await Promise.allSettled(
    remoteProjects.map((project) => apiGet<ApiProjetoFuncionario[]>(`/projetos/${project.id}/equipe`, true)),
  );
  setProjects((current) => current.map((project, index) => {
    const result = equipes[index];
    if (!result || result.status !== "fulfilled") return project;
    return { ...project, responsible: result.value.map((membro) => String(membro.funcionario_id)) };
  }));
}

// O backend usa "em_progresso" para a coluna que o frontend chama de "em_andamento".
// Estas funções traduzem o status entre os dois domínios.
function taskStatusFromApi(status: string): Task["status"] {
  return status === "em_progresso" ? "em_andamento" : (status as Task["status"]);
}

function taskStatusToApi(status?: Task["status"]): string | undefined {
  if (!status) return undefined;
  return status === "em_andamento" ? "em_progresso" : status;
}

function mapTask(task: ApiTask): Task {
  return {
    id: String(task.id),
    projectId: String(task.projeto_id),
    title: task.titulo,
    description: task.descricao || "",
    status: taskStatusFromApi(task.status),
    responsible: task.responsavel_id ? String(task.responsavel_id) : "",
    dueDate: task.prazo || "",
    priority: task.prioridade,
    category: task.categoria || "Geral",
  };
}

function mapAnnouncement(item: ApiAnnouncement): Announcement {
  return {
    id: String(item.id),
    title: item.titulo,
    content: item.conteudo,
    author: `Usuário #${item.autor_id}`,
    date: item.data?.slice(0, 10) || "",
    target: item.alvo,
    read: false,
  };
}

function servicePayload(service: EditableService) {
  return {
    nome: service.name,
    slug: service.slug || slugify(service.name || ""),
    descricao: service.description || "",
    icone: service.icon || "palette",
    status: service.status || "ativo",
  };
}

function portfolioPayload(item: EditablePortfolioItem) {
  return {
    nome: item.name,
    cliente: item.client,
    categoria: item.category,
    descricao: item.description,
    imagem: item.image,
    ano: item.year ? Number(item.year) : new Date().getFullYear(),
    destaque: item.featured ?? false,
    tags: item.tags || [],
  };
}

function academyPayload(item: EditableAcademyItem) {
  const price = item.price === "Gratuito" ? 0 : Number(String(item.price || "0").replace(/[^\d,.-]/g, "").replace(".", "").replace(",", "."));
  return {
    titulo: item.title,
    tipo: item.type === "E-book" ? "ebook" : "curso",
    descricao: item.description,
    preco: Number.isFinite(price) ? price : 0,
    imagem: item.image,
    url_externa: item.url?.trim() || "#",
    publicado: true,
  };
}

function leadPayload(lead: Partial<Lead>) {
  return {
    status: lead.status === "proposta_enviada" ? "qualificado" : lead.status,
    prioridade: lead.priority,
  };
}

function taskPayload(task: Partial<Task>) {
  return {
    titulo: task.title,
    descricao: task.description,
    status: taskStatusToApi(task.status),
    responsavel_id:
      task.responsible === undefined ? undefined : task.responsible ? Number(task.responsible) : null,
    prazo: normalizeDate(task.dueDate),
    prioridade: task.priority,
    categoria: task.category,
  };
}

function taskCreatePayload(task: Partial<Task>) {
  return {
    projeto_id: Number(task.projectId),
    responsavel_id: task.responsible ? Number(task.responsible) : undefined,
    titulo: task.title || "",
    descricao: task.description || "",
    categoria: task.category || "Geral",
    prazo: normalizeDate(task.dueDate) ?? null,
    ordem: 0,
    status: taskStatusToApi(task.status) || "a_fazer",
    complexidade: "media",
    prioridade: task.priority || "media",
  };
}

// A API aceita apenas datas ISO (YYYY-MM-DD). Datas vazias ou em outro formato
// (ex: dd/mm/yyyy) são descartadas para não quebrar a validação.
function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function userPayload(user: Partial<User> & { password?: string }) {
  const role = user.role || "cliente";
  return {
    nome: user.name || "",
    email: user.email || "",
    senha: user.password || "senha-forte-123",
    role,
    telefone: undefined,
    avatar: user.avatar,
    status: user.status || "ativo",
    cliente: role === "cliente"
      ? {
          razao_social: user.name || "",
          cnpj_cpf: `admin-${Date.now()}`,
          segmento: "Serviços",
        }
      : undefined,
    funcionario: role === "funcionario"
      ? {
          cargo: user.cargo || "Funcionário",
          especialidade: "Geral",
        }
      : undefined,
    admin: role === "admin" ? { nivel_acesso: 1 } : undefined,
  };
}

function userUpdatePayload(user: Partial<User>) {
  return {
    nome: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
  };
}

function normalizeIcon(icon?: string | null) {
  const map: Record<string, Service["icon"]> = {
    palette: "Palette",
    share2: "Share2",
    globe: "Globe",
    filetext: "FileText",
    "file-text": "FileText",
    trendingup: "TrendingUp",
    "trending-up": "TrendingUp",
    camera: "Camera",
  };
  return map[String(icon || "").toLowerCase()] || "Palette";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function leadCsvUrl() {
  return apiUrl("/leads/export.csv");
}