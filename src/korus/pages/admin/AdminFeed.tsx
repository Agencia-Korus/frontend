import { useState } from "react";
import { Plus, Edit, Trash2, X, ShieldCheck, Users, Briefcase, Globe } from "lucide-react";
import { useKorusData } from "../../live-data";

type Target = "funcionarios" | "clientes" | "todos" | "admins";

interface Announcement {
  id: number | string;
  title: string;
  content: string;
  author: string;
  date: string;
  target: Target;
}

const targetMeta: Record<Target, { label: string; icon: typeof Users; color: string }> = {
  funcionarios: { label: "Funcionários", icon: Briefcase, color: "#6744AA" },
  clientes: { label: "Clientes", icon: Users, color: "#22C55E" },
  todos: { label: "Todos", icon: Globe, color: "#39228C" },
  admins: { label: "Apenas Administradores", icon: ShieldCheck, color: "#F59E0B" },
};

export function AdminFeed() {
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useKorusData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<Target>("todos");
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setTarget("todos");
    setError(null);
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setTarget(a.target);
    setError(null);
    setShowModal(true);
  };

  const submit = async () => {
    if (!title.trim() || !content.trim()) return;
    setError(null);
    try {
      if (editingId !== null) {
        await updateAnnouncement(editingId, { title, content, target });
      } else {
        await createAnnouncement({ title, content, target });
      }
      setEditingId(null);
      setTitle("");
      setContent("");
      setTarget("todos");
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao publicar comunicado.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[#000] dark:text-white">Publicar Comunicados</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>
          <Plus size={16} /> Novo Comunicado
        </button>
      </div>

      <div className="space-y-4">
        {(announcements as Announcement[]).map((a) => {
          const meta = targetMeta[a.target] ?? targetMeta.todos;
          const Icon = meta.icon;
          const isAdminOnly = a.target === "admins";
          return (
            <div key={a.id} className={`bg-white dark:bg-[#130D22] p-5 rounded-xl border ${isAdminOnly ? "border-[#F59E0B]/50" : "border-[rgba(103,68,170,0.15)]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#39228C] flex items-center justify-center text-white" style={{ fontSize: 14, fontWeight: 600 }}>{a.author.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 style={{ fontSize: 15, fontWeight: 600 }} className="text-[#000] dark:text-white">{a.title}</h4>
                      {isAdminOnly && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30" style={{ fontSize: 11, fontWeight: 600 }}>
                          <ShieldCheck size={12} /> Interno
                        </span>
                      )}
                    </div>
                    <p className="text-[#6B7280] dark:text-white/60 flex items-center gap-1" style={{ fontSize: 12 }}>
                      {a.date} · <Icon size={12} style={{ color: meta.color }} />
                      <span style={{ color: meta.color }}>{meta.label}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="p-2 text-[#6B7280] hover:text-[#39228C]" title="Editar"><Edit size={14} /></button>
                  <button onClick={() => void deleteAnnouncement(a.id).catch((err) => setError(err instanceof Error ? err.message : "Erro ao excluir comunicado."))} className="p-2 text-[#6B7280] hover:text-[#EF4444]" title="Excluir"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-[#6B7280] dark:text-white/70 mt-3" style={{ fontSize: 14 }}>{a.content}</p>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-[#130D22] rounded-2xl max-w-lg w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] dark:text-white mb-6">{editingId !== null ? "Editar Comunicado" : "Novo Comunicado"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Título</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Conteúdo</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none bg-white dark:bg-[#1A1230] dark:text-white" />
              </div>
              <div>
                <label className="block mb-2 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Público-alvo</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(targetMeta) as Target[]).map((t) => {
                    const meta = targetMeta[t];
                    const Icon = meta.icon;
                    const active = target === t;
                    const isAdmin = t === "admins";
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTarget(t)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors text-left ${
                          active
                            ? isAdmin
                              ? "bg-[#F59E0B]/10 border-[#F59E0B] text-[#F59E0B]"
                              : "bg-[#39228C]/10 border-[#39228C] text-[#39228C]"
                            : "border-[rgba(103,68,170,0.3)] text-[#000] dark:text-white"
                        }`}
                        style={{ fontSize: 13 }}
                      >
                        <Icon size={16} />
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
                {target === "admins" && (
                  <p className="mt-2 text-[#F59E0B] flex items-center gap-1" style={{ fontSize: 12 }}>
                    <ShieldCheck size={12} /> Visível somente para outros administradores.
                  </p>
                )}
              </div>
              {error && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}
              <button onClick={submit} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">{editingId !== null ? "Salvar alterações" : "Publicar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}