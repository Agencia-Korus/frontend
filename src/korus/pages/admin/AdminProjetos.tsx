import { useState } from "react";
import { useNavigate } from "@/src/korus/router-adapter";
import { getStatusLabel, getStatusColor } from "../../data/mock";
import { Plus, X } from "lucide-react";
import { useKorusData } from "../../live-data";

export function AdminProjetos() {
  const navigate = useNavigate();
  const { projects, users, tasks, createProject } = useKorusData();
  const [showModal, setShowModal] = useState(false);
  const clients = users.filter((u) => u.role === "cliente");
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    clientId: clients[0]?.id || "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!draft.name.trim() || !draft.clientId) return;
    setError(null);
    try {
      await createProject({
        name: draft.name,
        description: draft.description,
        clientId: draft.clientId,
        startDate: draft.startDate,
        endDate: draft.endDate,
        status: "a_fazer",
        progress: 0,
      });
      setShowModal(false);
      setDraft({ name: "", description: "", clientId: clients[0]?.id || "", startDate: "", endDate: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar projeto.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[#000]">Todos os Projetos</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => {
          const projectTaskResponsibles = tasks.filter((task) => task.projectId === p.id).map((task) => task.responsible);
          const responsible = users.filter((u) => p.responsible.includes(u.id) || projectTaskResponsibles.includes(u.id));
          return (
            <div key={p.id} className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-hidden cursor-pointer hover:border-[#39228C]/40 transition-colors" onClick={() => navigate(`/admin/projetos/${p.id}`)}>
              <div className="h-2 bg-[#39228C]" style={{ width: `${p.progress}%` }} />
              <div className="p-5">
                <h4 style={{ fontSize: 15, fontWeight: 600 }} className="text-[#000] mb-1">{p.name}</h4>
                <p className="text-[#6B7280] mb-3" style={{ fontSize: 13 }}>{p.client}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-white ${getStatusColor(p.status)}`} style={{ fontSize: 11 }}>{getStatusLabel(p.status)}</span>
                  <span className="text-[#6B7280]" style={{ fontSize: 12 }}>Até {p.endDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {responsible.map((u) => (
                      u.avatar ? (
                        <img key={u.id} src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white" />
                      ) : (
                        <div key={u.id} className="w-7 h-7 rounded-full bg-[#39228C] text-white flex items-center justify-center border-2 border-white" style={{ fontSize: 10 }}>{u.name.charAt(0)}</div>
                      )
                    ))}
                  </div>
                  <span className="text-[#39228C]" style={{ fontSize: 14, fontWeight: 600 }}>{p.progress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] mb-6">Novo Projeto</h3>
            <div className="space-y-4">
              {[
                { label: "Nome do projeto", type: "text" },
                { label: "Descrição", type: "textarea" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none" />
                  ) : (
                    <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
                  )}
                </div>
              ))}
              <div>
                <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Cliente</label>
                <select value={draft.clientId} onChange={(e) => setDraft({ ...draft, clientId: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg">
                  {clients.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Data início</label>
                  <input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Data fim</label>
                  <input type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
                </div>
              </div>
              {error && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}
              <button onClick={submit} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">Criar Projeto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}