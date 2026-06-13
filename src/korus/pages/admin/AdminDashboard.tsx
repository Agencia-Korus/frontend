import { Users, Target, CheckCircle, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useKorusData } from "../../live-data";

export function AdminDashboard() {
  const { leads, users, adminDashboard } = useKorusData();
  const cards = adminDashboard?.cards;
  const kpis = [
    { label: "Leads no mês", value: cards?.leads_no_mes ?? leads.length, change: 15, up: true, icon: Target, color: "bg-[#3B82F6]/10 text-[#3B82F6]" },
    { label: "Projetos ativos", value: cards?.projetos_ativos ?? 3, change: 0, up: true, icon: TrendingUp, color: "bg-[#39228C]/10 text-[#39228C]" },
    { label: "Tarefas concluídas", value: cards?.tarefas_concluidas ?? 8, change: 25, up: true, icon: CheckCircle, color: "bg-[#22C55E]/10 text-[#22C55E]" },
    { label: "Clientes ativos", value: cards?.clientes_ativos ?? users.filter((u) => u.role === "cliente" && u.status === "ativo").length, change: -10, up: false, icon: Users, color: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  ];
  const leadsWeekly = adminDashboard?.leads_por_semana?.map((item, index) => ({
    week: `Sem ${index + 1}`,
    leads: item.total,
  })) || [
    { week: "Sem 1", leads: 3 }, { week: "Sem 2", leads: 5 }, { week: "Sem 3", leads: 2 }, { week: "Sem 4", leads: 4 },
  ];
  const tasksDaily = adminDashboard?.tarefas_concluidas_por_dia?.map((item) => ({
    day: new Date(item.periodo).toLocaleDateString("pt-BR", { weekday: "short" }),
    tarefas: item.total,
  })) || [
    { day: "Seg", tarefas: 2 }, { day: "Ter", tarefas: 3 }, { day: "Qua", tarefas: 1 }, { day: "Qui", tarefas: 4 },
    { day: "Sex", tarefas: 2 }, { day: "Sáb", tarefas: 0 }, { day: "Dom", tarefas: 1 },
  ];
  const ranking = adminDashboard?.ranking_xp_semanal?.map((item) => ({
    id: String(item.funcionario_id),
    name: item.nome,
    cargo: item.cargo,
    xp: item.xp_total,
  })) || users.filter((u) => u.role === "funcionario").sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[#000]">Dashboard</h2>
        <p className="text-[#6B7280]" style={{ fontSize: 14 }}>Visão geral da agência.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white p-5 rounded-xl border border-[rgba(103,68,170,0.15)]">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${k.color}`}>
                  <Icon size={20} />
                </div>
                {k.change !== 0 && (
                  <span className={`flex items-center gap-0.5 ${k.up ? "text-[#22C55E]" : "text-[#EF4444]"}`} style={{ fontSize: 12, fontWeight: 500 }}>
                    {k.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(k.change)}%
                  </span>
                )}
              </div>
              <p style={{ fontSize: 28, fontWeight: 700 }} className="text-[#000]">{k.value}</p>
              <p className="text-[#6B7280]" style={{ fontSize: 13 }}>{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[rgba(103,68,170,0.15)]">
          <h3 className="text-[#000] mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Leads por Semana</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={leadsWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(103,68,170,0.1)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="leads" fill="#39228C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[rgba(103,68,170,0.15)]">
          <h3 className="text-[#000] mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Tarefas Concluídas por Dia</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={tasksDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(103,68,170,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="tarefas" stroke="#39228C" strokeWidth={2} dot={{ fill: "#39228C" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leads Recentes + Projetos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-[#000] mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Leads Recentes</h3>
          <div className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  {["Nome", "Serviço", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(103,68,170,0.1)]">
                {(adminDashboard?.leads_recentes?.map((lead) => ({
                  id: String(lead.id),
                  name: lead.nome,
                  service: lead.empresa || "Lead",
                  status: lead.status,
                })) || leads.slice(0, 5)).map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3 text-[#000]" style={{ fontSize: 13 }}>{l.name}</td>
                    <td className="px-4 py-3 text-[#6B7280]" style={{ fontSize: 13 }}>{l.service}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-white ${l.status === "novo" ? "bg-[#3B82F6]" : l.status === "em_contato" ? "bg-[#F59E0B]" : l.status === "convertido" ? "bg-[#22C55E]" : "bg-gray-400"}`} style={{ fontSize: 11 }}>
                        {l.status === "novo" ? "Novo" : l.status === "em_contato" ? "Em Contato" : l.status === "convertido" ? "Convertido" : l.status === "proposta_enviada" ? "Proposta" : "Perdido"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-[#000] mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Ranking XP Semanal</h3>
          <div className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] divide-y divide-[rgba(103,68,170,0.1)]">
                {ranking.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <span style={{ fontSize: 18 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                {"avatar" in u && u.avatar ? <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> : null}
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
    </div>
  );
}