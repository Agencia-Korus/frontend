import { useState } from "react";
import { TrendingUp, DollarSign, Activity, Target, BarChart3, CheckCircle, Clock, Zap, Users } from "lucide-react";

type Role = "cliente" | "funcionario" | "admin";

interface BIPanelProps {
  role: Role;
}

const projetoData = [
  { label: "Sem 1", value: 18 },
  { label: "Sem 2", value: 35 },
  { label: "Sem 3", value: 52 },
  { label: "Sem 4", value: 65 },
];

const performanceData = [
  { label: "Seg", value: 32 },
  { label: "Ter", value: 48 },
  { label: "Qua", value: 41 },
  { label: "Qui", value: 65 },
  { label: "Sex", value: 72 },
  { label: "Sáb", value: 58 },
  { label: "Dom", value: 44 },
];

const financeiroData = [
  { label: "Jan", value: 42 },
  { label: "Fev", value: 55 },
  { label: "Mar", value: 48 },
  { label: "Abr", value: 70 },
  { label: "Mai", value: 82 },
];

export function BIPanel({ role }: BIPanelProps) {
  const tabs: { id: string; label: string }[] =
    role === "cliente"
      ? [{ id: "projeto", label: "Andamento do Projeto" }]
      : role === "funcionario"
      ? [{ id: "performance", label: "Minha Performance" }]
      : [
          { id: "performance", label: "Performance" },
          { id: "financeiro", label: "Financeiro" },
        ];

  const [tab, setTab] = useState(tabs[0].id);

  const config = (() => {
    if (role === "cliente") {
      return {
        title: "Acompanhamento do seu projeto",
        subtitle: "Indicadores de progresso e entregas",
        kpis: [
          { label: "Progresso médio", value: "65%", icon: Activity, color: "#3B82F6" },
          { label: "Entregas concluídas", value: "8/12", icon: CheckCircle, color: "#22C55E" },
          { label: "Próximas entregas", value: "3", icon: Clock, color: "#F59E0B" },
        ],
        data: projetoData,
        chartLabel: "Evolução do projeto (%)",
      };
    }
    if (role === "funcionario") {
      return {
        title: "Minha performance",
        subtitle: "Suas tarefas e XP no período",
        kpis: [
          { label: "Tarefas concluídas", value: "12", icon: CheckCircle, color: "#22C55E" },
          { label: "XP no mês", value: "+340", icon: Zap, color: "#F59E0B" },
          { label: "Taxa de entrega", value: "94%", icon: Target, color: "#3B82F6" },
        ],
        data: performanceData,
        chartLabel: "Tarefas concluídas por dia",
      };
    }
    if (tab === "performance") {
      return {
        title: "Performance da agência",
        subtitle: "Indicadores operacionais do período",
        kpis: [
          { label: "Tarefas concluídas", value: "128", icon: Target, color: "#22C55E" },
          { label: "Taxa de entrega", value: "94%", icon: Activity, color: "#3B82F6" },
          { label: "Equipe ativa", value: "12", icon: Users, color: "#8B5CF6" },
        ],
        data: performanceData,
        chartLabel: "Performance semanal",
      };
    }
    return {
      title: "Visão financeira",
      subtitle: "Receita e indicadores comerciais",
      kpis: [
        { label: "Receita do mês", value: "R$ 82k", icon: DollarSign, color: "#22C55E" },
        { label: "Ticket médio", value: "R$ 5.4k", icon: TrendingUp, color: "#3B82F6" },
        { label: "Margem", value: "32%", icon: BarChart3, color: "#8B5CF6" },
      ],
      data: financeiroData,
      chartLabel: "Receita mensal",
    };
  })();

  const max = Math.max(...config.data.map((d) => d.value));

  return (
    <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-[#000] dark:text-white flex items-center gap-2" style={{ fontSize: 16, fontWeight: 600 }}>
            <BarChart3 size={18} className="text-[#39228C] dark:text-[#A78BFA]" /> {config.title}
          </h3>
          <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 12 }}>{config.subtitle}</p>
        </div>
        {tabs.length > 1 && (
          <div className="inline-flex bg-[#F3F4F6] dark:bg-[#1A1D24] rounded-lg p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-md transition-colors ${tab === t.id ? "bg-white dark:bg-[#2C313A] text-[#39228C] dark:text-[#A78BFA]" : "text-[#6B7280] dark:text-white/60"}`}
                style={{ fontSize: 12, fontWeight: 500 }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {config.kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="border border-[rgba(103,68,170,0.15)] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${k.color}1A`, color: k.color }}>
                  <Icon size={14} />
                </span>
                <span className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 11 }}>{k.label}</span>
              </div>
              <p className="text-[#000] dark:text-white" style={{ fontSize: 18, fontWeight: 700 }}>{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="border border-[rgba(103,68,170,0.15)] rounded-lg p-4">
        <p className="text-[#6B7280] dark:text-white/60 mb-3" style={{ fontSize: 11, fontWeight: 500 }}>{config.chartLabel}</p>
        <div className="flex items-end gap-2 h-32">
          {config.data.map((d) => {
            const h = (d.value / max) * 100;
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex-1 flex items-end">
                  <div className="w-full rounded-t bg-gradient-to-t from-[#39228C] to-[#A78BFA] transition-all" style={{ height: `${h}%` }} title={`${d.label}: ${d.value}`} />
                </div>
                <span className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 10 }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}