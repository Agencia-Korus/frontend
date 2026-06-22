import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Zap } from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../api-client";

type Complexity = "baixa" | "media" | "alta" | "critica";

interface XpRule {
  id: number | string;
  task: string;
  complexity: Complexity;
  xp: number;
}

type ApiRegraXp = { id: number; tarefa: string; complexidade: Complexity; xp: number };

const complexityMeta: Record<Complexity, { label: string; color: string; defaultXp: number }> = {
  baixa: { label: "Baixa", color: "#22C55E", defaultXp: 10 },
  media: { label: "Média", color: "#3B82F6", defaultXp: 25 },
  alta: { label: "Alta", color: "#F59E0B", defaultXp: 50 },
  critica: { label: "Crítica", color: "#EF4444", defaultXp: 100 },
};

export function AdminGamificacao() {
  const [rules, setRules] = useState<XpRule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<XpRule>({ id: "", task: "", complexity: "media", xp: 25 });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const remote = await apiGet<ApiRegraXp[]>("/gamificacao/regras?limit=100", true);
      setRules(remote.map((r) => ({ id: r.id, task: r.tarefa, complexity: r.complexidade, xp: r.xp })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar regras de XP.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const openNew = () => { setEditing({ id: "", task: "", complexity: "media", xp: complexityMeta.media.defaultXp }); setError(null); setShowModal(true); };
  const openEdit = (r: XpRule) => { setEditing({ ...r }); setError(null); setShowModal(true); };
  const remove = async (id: XpRule["id"]) => {
    if (!confirm("Excluir esta regra de XP?")) return;
    try {
      await apiDelete(`/gamificacao/regras/${id}`, true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir regra.");
    }
  };
  const save = async () => {
    if (!editing.task.trim()) return;
    const payload = { tarefa: editing.task.trim(), complexidade: editing.complexity, xp: editing.xp };
    try {
      if (editing.id !== "") {
        await apiPatch(`/gamificacao/regras/${editing.id}`, payload, true);
      } else {
        await apiPost("/gamificacao/regras", payload, true);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar regra.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-[#000] dark:text-white">Gamificação</h2>
      {error && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}

      <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-[#000] dark:text-white flex items-center gap-2" style={{ fontSize: 18, fontWeight: 600 }}>
              <Zap size={18} className="text-[#F59E0B]" /> Regras de XP por complexidade
            </h3>
            <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>
              Defina a quantidade de XP por tarefa conforme a complexidade.
            </p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 13 }}>
            <Plus size={14} /> Nova regra
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(Object.keys(complexityMeta) as Complexity[]).map((c) => {
            const meta = complexityMeta[c];
            return (
              <div key={c} className="border border-[rgba(103,68,170,0.15)] rounded-lg p-3">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: meta.color }} />
                <span className="text-[#000] dark:text-white" style={{ fontSize: 13, fontWeight: 600 }}>{meta.label}</span>
                <p className="text-[#6B7280] dark:text-white/60 mt-0.5" style={{ fontSize: 11 }}>Padrão: {meta.defaultXp} XP</p>
              </div>
            );
          })}
        </div>

        <div className="border border-[rgba(103,68,170,0.15)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] dark:bg-[#1A1D24]">
                <th className="text-left px-4 py-2 text-[#6B7280] dark:text-white/60" style={{ fontSize: 12, fontWeight: 500 }}>Tarefa</th>
                <th className="text-left px-4 py-2 text-[#6B7280] dark:text-white/60" style={{ fontSize: 12, fontWeight: 500 }}>Complexidade</th>
                <th className="text-left px-4 py-2 text-[#6B7280] dark:text-white/60" style={{ fontSize: 12, fontWeight: 500 }}>XP</th>
                <th className="text-right px-4 py-2 text-[#6B7280] dark:text-white/60" style={{ fontSize: 12, fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(103,68,170,0.1)]">
              {rules.map((r) => {
                const meta = complexityMeta[r.complexity];
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-[#000] dark:text-white" style={{ fontSize: 13 }}>{r.task}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ fontSize: 11, fontWeight: 500, backgroundColor: `${meta.color}1A`, color: meta.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#39228C] dark:text-[#A78BFA]" style={{ fontSize: 13, fontWeight: 600 }}>+{r.xp} XP</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-[#6B7280] hover:text-[#39228C]" title="Editar"><Edit size={14} /></button>
                      <button onClick={() => remove(r.id)} className="p-1.5 text-[#6B7280] hover:text-[#EF4444]" title="Excluir"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-[#22262E] rounded-2xl max-w-md w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] dark:text-white mb-1">{rules.find((r) => r.id === editing.id) ? "Editar Regra" : "Nova Regra de XP"}</h3>
            <p className="text-[#6B7280] dark:text-white/60 mb-5" style={{ fontSize: 13 }}>O XP é definido pela complexidade da tarefa.</p>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Tarefa</label>
                <input value={editing.task} onChange={(e) => setEditing({ ...editing, task: e.target.value })} placeholder="Ex: Concluir card de design" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
              </div>
              <div>
                <label className="block mb-2 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Complexidade</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(complexityMeta) as Complexity[]).map((c) => {
                    const meta = complexityMeta[c];
                    const active = editing.complexity === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditing({ ...editing, complexity: c, xp: meta.defaultXp })}
                        className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors ${active ? "border-transparent text-white" : "border-[rgba(103,68,170,0.3)] text-[#000] dark:text-white"}`}
                        style={{ fontSize: 13, backgroundColor: active ? meta.color : undefined }}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? "rgba(255,255,255,0.7)" : meta.color }} />
                          {meta.label}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600 }}>+{meta.defaultXp}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>XP personalizado</label>
                <input type="number" min={0} value={editing.xp} onChange={(e) => setEditing({ ...editing, xp: Number(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
                <p className="text-[#6B7280] dark:text-white/50 mt-1" style={{ fontSize: 11 }}>Sobrescreve o padrão da complexidade.</p>
              </div>
              <button onClick={save} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">Salvar regra</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}