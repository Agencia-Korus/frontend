import { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useKorusData } from "../../live-data";

interface Service {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

const blank: Service = { id: "", name: "", slug: "", description: "", icon: "Palette" };

export function AdminServicos() {
  const { services, createService, updateService, deleteService } = useKorusData();
  const items = services as Service[];
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service>(blank);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => { setEditing({ ...blank, id: Date.now() }); setShowModal(true); };
  const openEdit = (s: Service) => { setEditing({ ...s }); setShowModal(true); };
  const remove = (id: Service["id"]) => {
    if (!confirm("Excluir este serviço?")) return;
    void deleteService(id).catch((err) => setError(err instanceof Error ? err.message : "Erro ao excluir serviço."));
  };
  const save = async () => {
    if (!editing.name.trim()) return;
    const slug = editing.slug.trim() || editing.name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const final = { ...editing, slug };
    setError(null);
    try {
      if (services.find((i) => i.id === editing.id)) await updateService(editing.id, final);
      else await createService(final);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar serviço.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[#000] dark:text-white">Gerenciar Serviços</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>
          <Plus size={16} /> Novo Serviço
        </button>
      </div>
      {error && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}

      <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] divide-y divide-[rgba(103,68,170,0.1)]">
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <h4 style={{ fontSize: 15, fontWeight: 600 }} className="text-[#000] dark:text-white">{s.name}</h4>
              <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>{s.description?.substring(0, 80)}...</p>
            </div>
            <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded" style={{ fontSize: 11, fontWeight: 500 }}>Ativo</span>
            <div className="flex gap-2">
              <button onClick={() => openEdit(s)} className="p-2 text-[#6B7280] hover:text-[#39228C] hover:bg-[#39228C]/5 rounded-lg" title="Editar"><Edit size={16} /></button>
              <button onClick={() => remove(s.id)} className="p-2 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/5 rounded-lg" title="Excluir"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-[#22262E] rounded-2xl max-w-md w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] dark:text-white mb-6">{items.find((i) => i.id === editing.id) ? "Editar Serviço" : "Novo Serviço"}</h3>
            <div className="space-y-4">
              <div><label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Nome</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" /></div>
              <div><label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Slug <span className="text-[#9CA3AF]" style={{ fontSize: 11 }}>(opcional — gerado do nome)</span></label><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" /></div>
              <div><label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Descrição</label><textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none" /></div>
              <button onClick={save} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}