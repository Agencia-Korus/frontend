import { useNavigate } from "@/src/korus/router-adapter";
import { Calendar, ArrowRight, FolderKanban, CheckCircle, Clock, Mail, Phone } from "lucide-react";
import { BIPanel } from "../../components/BIPanel";
import { useAuth } from "../../auth-context";
import { useKorusData } from "../../live-data";

export function ClienteDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, tasks, announcements } = useKorusData();
  const currentUserId = String(user?.id || "5");
  const clientProjects = projects.filter((p) => p.clientId === currentUserId);
  const projectIds = clientProjects.map((p) => p.id);
  const myTasks = tasks.filter((t) => projectIds.includes(t.projectId));
  const concluded = myTasks.filter((t) => t.status === "concluido").length;
  const inProgress = myTasks.filter((t) => t.status === "em_andamento" || t.status === "em_revisao").length;
  const visibleAnnouncements = announcements.filter((a) => a.target === "todos" || a.target === "clientes").slice(0, 2);

  const summary = [
    { label: "Projetos ativos", value: clientProjects.length, icon: FolderKanban, color: "#39228C" },
    { label: "Tarefas em andamento", value: inProgress, icon: Clock, color: "#3B82F6" },
    { label: "Entregas concluídas", value: concluded, icon: CheckCircle, color: "#22C55E" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[#000] dark:text-white">Olá, {user?.nome || "cliente"} 👋</h2>
        <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 14 }}>Acompanhe o andamento dos seus projetos e entregas.</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-[#22262E] p-5 rounded-xl border border-[rgba(103,68,170,0.15)]">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}1A`, color: s.color }}>
                  <Icon size={20} />
                </span>
                <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 12 }}>{s.label}</p>
              </div>
              <p className="text-[#000] dark:text-white" style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Projetos Ativos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#000] dark:text-white" style={{ fontSize: 18, fontWeight: 600 }}>Projetos Ativos</h3>
          <button onClick={() => navigate("/cliente/projetos")} className="text-[#39228C] dark:text-[#A78BFA] flex items-center gap-1" style={{ fontSize: 13, fontWeight: 500 }}>
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientProjects.map((p) => (
            <div key={p.id} className="bg-white dark:bg-[#22262E] p-6 rounded-xl border border-[rgba(103,68,170,0.15)] cursor-pointer hover:border-[#39228C]/40 transition-colors" onClick={() => navigate(`/cliente/projetos/${p.id}`)}>
              <div className="flex items-center justify-between mb-3">
                <h4 style={{ fontSize: 15, fontWeight: 600 }} className="text-[#000] dark:text-white">{p.name}</h4>
                <span className={`px-2 py-0.5 rounded text-white ${p.status === "em_andamento" ? "bg-blue-500" : p.status === "em_revisao" ? "bg-[#8B5CF6]" : "bg-gray-500"}`} style={{ fontSize: 11, fontWeight: 500 }}>
                  {p.status === "em_andamento" ? "Em Andamento" : p.status === "em_revisao" ? "Em Revisão" : "A Fazer"}
                </span>
              </div>
              <div className="w-full bg-[#F3F4F6] dark:bg-[#1A1D24] rounded-full h-2 mb-2">
                <div className="bg-[#39228C] h-2 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>{p.progress}% concluído</p>
                <p className="text-[#6B7280] dark:text-white/60 flex items-center gap-1" style={{ fontSize: 12 }}>
                  <Calendar size={11} /> Entrega: {p.endDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BIPanel role="cliente" />

      {/* Próximas Entregas */}
      <div>
        <h3 className="text-[#000] dark:text-white mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Próximas Entregas</h3>
        <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] divide-y divide-[rgba(103,68,170,0.1)]">
          {[
            { name: "Paleta de cores aprovada", date: "20 Abr 2026" },
            { name: "Logotipo v1", date: "01 Mai 2026" },
            { name: "Manual da marca", date: "15 Mai 2026" },
          ].map((e) => (
            <div key={e.name} className="flex items-center gap-3 px-4 py-3">
              <Calendar size={16} className="text-[#39228C] dark:text-[#A78BFA]" />
              <span className="flex-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>{e.name}</span>
              <span className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>{e.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comunicados */}
        <div className="lg:col-span-2">
          <h3 className="text-[#000] dark:text-white mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Comunicados Recentes</h3>
          <div className="space-y-3">
            {visibleAnnouncements.map((a) => (
              <div key={a.id} className="bg-white dark:bg-[#22262E] p-4 rounded-xl border border-[rgba(103,68,170,0.15)]">
                <div className="flex items-center justify-between mb-1">
                  <h4 style={{ fontSize: 14, fontWeight: 600 }} className="text-[#000] dark:text-white">{a.title}</h4>
                  <span className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 12 }}>{a.date}</span>
                </div>
                <p className="text-[#6B7280] dark:text-white/70" style={{ fontSize: 13 }}>{a.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contato com a equipe */}
        <div>
          <h3 className="text-[#000] dark:text-white mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Fale com a equipe</h3>
          <div className="bg-white dark:bg-[#22262E] p-5 rounded-xl border border-[rgba(103,68,170,0.15)] space-y-3">
            <button onClick={() => navigate("/cliente/agenda")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[rgba(103,68,170,0.2)] hover:border-[#39228C]/40 text-left">
              <span className="w-9 h-9 rounded-lg bg-[#39228C]/10 text-[#39228C] flex items-center justify-center"><Calendar size={16} /></span>
              <div className="flex-1">
                <p className="text-[#000] dark:text-white" style={{ fontSize: 13, fontWeight: 500 }}>Agendar reunião</p>
                <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 11 }}>Marque pela agenda</p>
              </div>
            </button>
            <a href="mailto:contato@korusagencia.com.br" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[rgba(103,68,170,0.2)] hover:border-[#39228C]/40">
              <span className="w-9 h-9 rounded-lg bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center"><Mail size={16} /></span>
              <div className="flex-1">
                <p className="text-[#000] dark:text-white" style={{ fontSize: 13, fontWeight: 500 }}>E-mail</p>
                <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 11 }}>contato@korusagencia.com.br</p>
              </div>
            </a>
            <a href="tel:+5561999990000" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[rgba(103,68,170,0.2)] hover:border-[#39228C]/40">
              <span className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center"><Phone size={16} /></span>
              <div className="flex-1">
                <p className="text-[#000] dark:text-white" style={{ fontSize: 13, fontWeight: 500 }}>WhatsApp</p>
                <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 11 }}>(61) 99999-0000</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}