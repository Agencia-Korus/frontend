import { useNavigate } from "@/src/korus/router-adapter";
import { Play, CheckCircle, Trophy } from "lucide-react";
import { BIPanel } from "../../components/BIPanel";
import { useAuth } from "../../auth-context";
import { useKorusData } from "../../live-data";

export function FuncionarioDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, tasks, users, announcements, updateTask } = useKorusData();
  const currentUser = users.find((u) => u.id === String(user?.id)) || users.find((u) => u.role === "funcionario") || users[0];

  // Enquanto os dados do usuário não chegam, evita acessar `currentUser` indefinido
  // (causava o "This page couldn't load").
  if (!currentUser) {
    return (
      <div className="py-20 text-center text-[#6B7280]" style={{ fontSize: 14 }}>Carregando...</div>
    );
  }

  const myTasks = tasks.filter((t) => t.responsible === currentUser.id && t.status !== "concluido");
  const myProjects = projects.filter((p) => p.responsible.includes(currentUser.id!));
  const ranking = users.filter((u) => u.role === "funcionario").sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[#000]">Olá, {currentUser.name} 👋</h2>
        <p className="text-[#6B7280]" style={{ fontSize: 14 }}>Veja suas tarefas e desempenho.</p>
      </div>

      {/* XP Card */}
      <div className="bg-white p-6 rounded-xl border border-[rgba(103,68,170,0.15)]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
            <Trophy size={28} className="text-[#F59E0B]" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 14, fontWeight: 500 }} className="text-[#6B7280]">Nível {currentUser.level ?? 1}{currentUser.levelName ? ` — ${currentUser.levelName}` : ""}</p>
            <p style={{ fontSize: 24, fontWeight: 700 }} className="text-[#000]">{(currentUser.xp ?? 0).toLocaleString()} XP</p>
          </div>
        </div>
        <div className="w-full bg-[#F3F4F6] rounded-full h-3">
          <div className="bg-[#39228C] h-3 rounded-full" style={{ width: "62%" }} />
        </div>
        <p className="text-[#6B7280] mt-1" style={{ fontSize: 12 }}>760 XP para o próximo nível</p>
      </div>

      {/* Minhas Tarefas Hoje */}
      <div>
        <h3 className="text-[#000] mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Minhas Tarefas</h3>
        <div className="space-y-3">
          {myTasks.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-xl border border-[rgba(103,68,170,0.15)] flex items-center gap-4">
              <div className="flex-1">
                <p style={{ fontSize: 14, fontWeight: 500 }} className="text-[#000]">{t.title}</p>
                <p className="text-[#6B7280]" style={{ fontSize: 12 }}>Prazo: {t.dueDate}</p>
              </div>
              {t.status === "a_fazer" ? (
                <button onClick={() => void updateTask(t.id, { status: "em_andamento" })} className="flex items-center gap-1 px-3 py-1.5 bg-[#39228C] text-white rounded-lg" style={{ fontSize: 12 }}>
                  <Play size={12} /> Iniciar (+10 XP)
                </button>
              ) : (
                <button onClick={() => void updateTask(t.id, { status: "concluido" })} className="flex items-center gap-1 px-3 py-1.5 bg-[#22C55E] text-white rounded-lg" style={{ fontSize: 12 }}>
                  <CheckCircle size={12} /> Concluir (+25 XP)
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <BIPanel role="funcionario" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meus Projetos */}
        <div>
          <h3 className="text-[#000] mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Meus Projetos</h3>
          <div className="space-y-3">
            {myProjects.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-xl border border-[rgba(103,68,170,0.15)] cursor-pointer hover:border-[#39228C]/40" onClick={() => navigate(`/funcionario/projetos/${p.id}`)}>
                <p style={{ fontSize: 14, fontWeight: 500 }} className="text-[#000] mb-2">{p.name}</p>
                <div className="w-full bg-[#F3F4F6] rounded-full h-2 mb-1">
                  <div className="bg-[#39228C] h-2 rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
                <p className="text-[#6B7280]" style={{ fontSize: 12 }}>{p.progress}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking */}
        <div>
          <h3 className="text-[#000] mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Ranking Semanal</h3>
          <div className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] divide-y divide-[rgba(103,68,170,0.1)]">
            {ranking.slice(0, 3).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <span style={{ fontSize: 16 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#39228C] text-white flex items-center justify-center" style={{ fontSize: 12 }}>{u.name.charAt(0)}</div>
                )}
                <div className="flex-1">
                  <p style={{ fontSize: 14, fontWeight: 500 }} className="text-[#000]">{u.name}</p>
                  <p className="text-[#6B7280]" style={{ fontSize: 12 }}>{u.cargo}</p>
                </div>
                <span className="text-[#F59E0B]" style={{ fontSize: 14, fontWeight: 600 }}>{u.xp?.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Recente */}
      <div>
        <h3 className="text-[#000] mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Comunicados Recentes</h3>
        <div className="space-y-3">
          {announcements.slice(0, 2).map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-xl border border-[rgba(103,68,170,0.15)]">
              <div className="flex items-center gap-2 mb-1">
                {!a.read && <div className="w-2 h-2 rounded-full bg-[#39228C]" />}
                <h4 style={{ fontSize: 14, fontWeight: 600 }} className="text-[#000]">{a.title}</h4>
                <span className="ml-auto text-[#6B7280]" style={{ fontSize: 12 }}>{a.date}</span>
              </div>
              <p className="text-[#6B7280]" style={{ fontSize: 13 }}>{a.content.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}