import { useState } from "react";
import { useNavigate } from "@/src/korus/router-adapter";
import { getStatusLabel, getStatusColor, type Project } from "../../data/mock";
import { Plus, X, Users, Trash2 } from "lucide-react";
import { useKorusData } from "../../live-data";

export function AdminProjetos() {
  const navigate = useNavigate();
  const {
    projects, users, tasks,
    createProject, deleteProject, addProjectMember, removeProjectMember,
  } = useKorusData();
  const [showModal, setShowModal] = useState(false);
  const clients = users.filter((u) => u.role === "cliente");
  const funcionarios = users.filter((u) => u.role === "funcionario");
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    clientId: clients[0]?.id || "",
    startDate: "",
    endDate: "",
    team: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [teamProject, setTeamProject] = useState<Project | null>(null);
  const [teamBusy, setTeamBusy] = useState(false);

  const clientName = (p: Project) => clients.find((c) => c.id === p.clientId)?.name || p.client;

  const toggleDraftMember = (id: string) => {
    setDraft((d) => ({
      ...d,
      team: d.team.includes(id) ? d.team.filter((x) => x !== id) : [...d.team, id],
    }));
  };

  const submit = async () => {
    if (!draft.name.trim() || !draft.clientId) return;
    setError(null);
    try {
      const created = await createProject({
        name: draft.name,
        description: draft.description,
        clientId: draft.clientId,
        startDate: draft.startDate,
        endDate: draft.endDate,
        status: "a_fazer",
        progress: 0,
      });
      for (const funcionarioId of draft.team) {
        await addProjectMember(created.id, funcionarioId);
      }
      setShowModal(false);
      setDraft({ name: "", description: "", clientId: clients[0]?.id || "", startDate: "", endDate: "", team: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar projeto.");
    }
  };

  const removeProject = async (p: Project) => {
    if (!confirm(`Excluir o projeto "${p.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteProject(p.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir projeto.");
    }
  };

  const toggleTeamMember = async (project: Project, funcionarioId: string) => {
    setTeamBusy(true);
    setError(null);
    try {
      if (project.responsible.includes(funcionarioId)) {
        await removeProjectMember(project.id, funcionarioId);
      } else {
        await addProjectMember(project.id, funcionarioId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar equipe.");
    } finally {
      setTeamBusy(false);
    }
  };

  // Mantém o modal de equipe sincronizado com os dados recarregados.
  const teamProjectLive = teamProject ? projects.find((p) => p.id === teamProject.id) || teamProject : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[#000] dark:text-white">Todos os Projetos</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      {error && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => {
          const projectTaskResponsibles = tasks.filter((task) => task.projectId === p.id).map((task) => task.responsible);
          const responsible = users.filter((u) => p.responsible.includes(u.id) || projectTaskResponsibles.includes(u.id));
          return (
            <div key={p.id} className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] overflow-hidden hover:border-[#39228C]/40 transition-colors">
              <div className="h-2 bg-[#39228C]" style={{ width: `${p.progress}%` }} />
              <div className="p-5">
                <div className="cursor-pointer" onClick={() => navigate(`/admin/projetos/${p.id}`)}>
                  <h4 style={{ fontSize: 15, fontWeight: 600 }} className="text-[#000] dark:text-white mb-1">{p.name}</h4>
                  <p className="text-[#6B7280] dark:text-white/60 mb-3" style={{ fontSize: 13 }}>{clientName(p)}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-white ${getStatusColor(p.status)}`} style={{ fontSize: 11 }}>{getStatusLabel(p.status)}</span>
                    {p.endDate && <span className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 12 }}>Até {p.endDate}</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {responsible.map((u) => (
                      u.avatar ? (
                        <img key={u.id} src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-[#22262E]" />
                      ) : (
                        <div key={u.id} className="w-7 h-7 rounded-full bg-[#39228C] text-white flex items-center justify-center border-2 border-white dark:border-[#22262E]" style={{ fontSize: 10 }} title={u.name}>{u.name.charAt(0)}</div>
                      )
                    ))}
                    {responsible.length === 0 && <span className="text-[#9CA3AF]" style={{ fontSize: 12 }}>Sem equipe</span>}
                  </div>
                  <span className="text-[#39228C] dark:text-[#A78BFA]" style={{ fontSize: 14, fontWeight: 600 }}>{p.progress}%</span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[rgba(103,68,170,0.1)]">
                  <button onClick={() => { setError(null); setTeamProject(p); }} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#6744AA] text-[#6744AA] dark:text-[#A78BFA] dark:border-[#A78BFA] rounded-lg hover:bg-[#6744AA]/5" style={{ fontSize: 12 }}>
                    <Users size={14} /> Gerenciar equipe
                  </button>
                  <button onClick={() => removeProject(p)} className="flex items-center gap-1.5 px-3 py-1.5 text-[#EF4444] hover:bg-[#EF4444]/5 rounded-lg" style={{ fontSize: 12 }}>
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-[#22262E] rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] dark:text-white mb-6">Novo Projeto</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Nome do projeto</label>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Descrição</label>
                <textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none" />
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Cliente</label>
                {clients.length ? (
                  <select value={draft.clientId} onChange={(e) => setDraft({ ...draft, clientId: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg">
                    {clients.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                ) : (
                  <p className="text-[#EF4444]" style={{ fontSize: 13 }}>Cadastre um cliente antes de criar um projeto.</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Equipe (funcionários)</label>
                {funcionarios.length ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-[rgba(103,68,170,0.2)] rounded-lg p-2">
                    {funcionarios.map((f) => (
                      <label key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F9FAFB] dark:hover:bg-[#1A1D24] cursor-pointer">
                        <input type="checkbox" checked={draft.team.includes(f.id)} onChange={() => toggleDraftMember(f.id)} />
                        <span className="text-[#000] dark:text-white" style={{ fontSize: 13 }}>{f.name}</span>
                        {f.cargo && <span className="text-[#6B7280] dark:text-white/50" style={{ fontSize: 12 }}>· {f.cargo}</span>}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>Nenhum funcionário cadastrado.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Data início</label>
                  <input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
                </div>
                <div>
                  <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Data fim</label>
                  <input type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
                </div>
              </div>
              {error && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}
              <button onClick={submit} disabled={!clients.length} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] disabled:opacity-60">Criar Projeto</button>
            </div>
          </div>
        </div>
      )}

      {teamProjectLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setTeamProject(null)} />
          <div className="relative bg-white dark:bg-[#22262E] rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setTeamProject(null)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] dark:text-white mb-1">Equipe do projeto</h3>
            <p className="text-[#6B7280] dark:text-white/60 mb-5" style={{ fontSize: 13 }}>{teamProjectLive.name}</p>
            {funcionarios.length ? (
              <div className="space-y-2">
                {funcionarios.map((f) => {
                  const member = teamProjectLive.responsible.includes(f.id);
                  return (
                    <div key={f.id} className="flex items-center justify-between gap-3 border border-[rgba(103,68,170,0.15)] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#39228C] text-white flex items-center justify-center" style={{ fontSize: 12, fontWeight: 600 }}>{f.name.charAt(0)}</div>
                        <div>
                          <p className="text-[#000] dark:text-white" style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</p>
                          {f.cargo && <p className="text-[#6B7280] dark:text-white/50" style={{ fontSize: 11 }}>{f.cargo}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleTeamMember(teamProjectLive, f.id)}
                        disabled={teamBusy}
                        className={`px-3 py-1.5 rounded-lg disabled:opacity-60 ${member ? "border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5" : "bg-[#39228C] text-white hover:bg-[#6744AA]"}`}
                        style={{ fontSize: 12 }}
                      >
                        {member ? "Remover" : "Adicionar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>Nenhum funcionário cadastrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
