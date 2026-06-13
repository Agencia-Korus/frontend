import { useEffect, useRef, useState } from "react";
import { Plus, Edit, Trash2, X, Upload, ImageIcon } from "lucide-react";
import { SupabaseImage } from "../../components/SupabaseImage";
import { uploadImageToSupabase } from "../../supabase-storage";
import { useKorusData } from "../../live-data";

interface PortfolioItem {
  id: number | string;
  name: string;
  client: string;
  category: string;
  description?: string;
  image: string;
}

const blank: PortfolioItem = { id: "", name: "", client: "", category: "Identidade Visual", description: "", image: "" };
const categories = ["Identidade Visual", "Web", "Social Media", "Fotografia"];

export function AdminPortfolio() {
  const { portfolioItems, createPortfolio, updatePortfolio, deletePortfolio } = useKorusData();
  const [items, setItems] = useState<PortfolioItem[]>(portfolioItems as PortfolioItem[]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem>(blank);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setItems(portfolioItems as PortfolioItem[]), [portfolioItems]);

  const openNew = () => { setEditing({ ...blank, id: Date.now() }); setUploadError(null); setShowModal(true); };
  const openEdit = (item: PortfolioItem) => { setEditing({ ...item }); setUploadError(null); setShowModal(true); };
  const remove = (id: PortfolioItem["id"]) => {
    if (!confirm("Excluir este item do portfólio?")) return;
    void deletePortfolio(id).catch((err) => setSaveError(err instanceof Error ? err.message : "Erro ao excluir item."));
  };
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingImage(true);
    setUploadError(null);

    try {
      const url = await uploadImageToSupabase(f, "portfolio");
      setEditing((prev) => ({ ...prev, image: url }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Erro ao enviar imagem.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };
  const save = async () => {
    if (!editing.name.trim()) return;
    setSaveError(null);
    try {
      if (portfolioItems.find((i) => i.id === editing.id)) await updatePortfolio(editing.id, editing);
      else await createPortfolio(editing);
      setShowModal(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar item.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[#000] dark:text-white">Gerenciar Portfólio</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>
          <Plus size={16} /> Novo Item
        </button>
      </div>
      {saveError && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{saveError}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <div key={p.id} className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] overflow-hidden">
            {p.image
              ? <SupabaseImage src={p.image} alt={p.name} className="w-full h-40 object-cover" />
              : <div className="w-full h-40 bg-[#F3F4F6] dark:bg-[#2C313A] flex items-center justify-center text-[#9CA3AF]"><ImageIcon size={32} /></div>}
            <div className="p-4">
              <h4 style={{ fontSize: 14, fontWeight: 600 }} className="text-[#000] dark:text-white">{p.name}</h4>
              <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 12 }}>{p.client} · {p.category}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(p)} className="p-2 text-[#6B7280] hover:text-[#39228C] hover:bg-[#39228C]/5 rounded-lg" title="Editar"><Edit size={14} /></button>
                <button onClick={() => remove(p.id)} className="p-2 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/5 rounded-lg" title="Excluir"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-[#22262E] rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] dark:text-white mb-6">{items.find((i) => i.id === editing.id) ? "Editar Item" : "Novo Item do Portfólio"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Imagem</label>
                <div className="flex items-center gap-4">
                  <div className="w-28 h-20 rounded-lg border-2 border-dashed border-[rgba(103,68,170,0.3)] overflow-hidden flex items-center justify-center bg-[#F9FAFB] dark:bg-[#1A1D24]">
                    {editing.image
                      ? <img src={editing.image} alt="" className="w-full h-full object-cover" />
                      : <ImageIcon size={22} className="text-[#9CA3AF]" />}
                  </div>
                  <div className="flex-1">
                    <button type="button" disabled={uploadingImage} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#6744AA] text-[#6744AA] dark:text-[#A78BFA] dark:border-[#A78BFA] rounded-lg hover:bg-[#6744AA]/5 disabled:opacity-60" style={{ fontSize: 13 }}>
                      <Upload size={14} /> {uploadingImage ? "Enviando..." : editing.image ? "Trocar imagem" : "Carregar imagem"}
                    </button>
                    {editing.image && (
                      <button type="button" onClick={() => setEditing({ ...editing, image: "" })} className="ml-2 text-[#EF4444]" style={{ fontSize: 12 }}>Remover</button>
                    )}
                    {uploadError && <p className="text-[#EF4444] mt-2" style={{ fontSize: 12 }}>{uploadError}</p>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </div>
              </div>
              <div><label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Nome do projeto</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" /></div>
              <div><label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Cliente</label><input value={editing.client} onChange={(e) => setEditing({ ...editing, client: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" /></div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Categoria</label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg">
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Descrição</label><textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none" /></div>
              <button onClick={save} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}