import { useEffect, useRef, useState } from "react";
import { Plus, Edit, Trash2, X, Upload, ImageIcon } from "lucide-react";
import { SupabaseImage } from "../../components/SupabaseImage";
import { uploadImageToSupabase } from "../../supabase-storage";
import { useKorusData } from "../../live-data";

interface AcademyItem {
  id: number | string;
  title: string;
  type: string;
  price: string;
  description?: string;
  image: string;
}

const blank: AcademyItem = { id: "", title: "", type: "E-book", price: "Gratuito", description: "", image: "" };

export function AdminAcademy() {
  const { academyItems, createAcademy, updateAcademy, deleteAcademy } = useKorusData();
  const [items, setItems] = useState<AcademyItem[]>(academyItems as AcademyItem[]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AcademyItem>(blank);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setItems(academyItems as AcademyItem[]), [academyItems]);

  const openNew = () => { setEditing({ ...blank, id: Date.now() }); setUploadError(null); setShowModal(true); };
  const openEdit = (item: AcademyItem) => { setEditing({ ...item }); setUploadError(null); setShowModal(true); };
  const remove = (id: AcademyItem["id"]) => {
    if (!confirm("Excluir este conteúdo?")) return;
    void deleteAcademy(id).catch((err) => setSaveError(err instanceof Error ? err.message : "Erro ao excluir conteúdo."));
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingImage(true);
    setUploadError(null);

    try {
      const url = await uploadImageToSupabase(f, "academy");
      setEditing((prev) => ({ ...prev, image: url }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Erro ao enviar imagem.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const save = async () => {
    if (!editing.title.trim()) return;
    setSaveError(null);
    try {
      if (academyItems.find((i) => i.id === editing.id)) await updateAcademy(editing.id, editing);
      else await createAcademy(editing);
      setShowModal(false);
      setEditing(blank);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar conteúdo.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[#000] dark:text-white">Gerenciar Academy</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>
          <Plus size={16} /> Novo Conteúdo
        </button>
      </div>
      {saveError && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{saveError}</p>}

      <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] dark:bg-[#1A1D24]">
              {["", "Título", "Tipo", "Preço", "Status", "Ações"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#6B7280] dark:text-white/60" style={{ fontSize: 12, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(103,68,170,0.1)]">
            {items.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  {a.image
                    ? <SupabaseImage src={a.image} alt="" className="w-12 h-8 rounded object-cover" />
                    : <div className="w-12 h-8 rounded bg-[#F3F4F6] dark:bg-[#2C313A] flex items-center justify-center text-[#9CA3AF]"><ImageIcon size={14} /></div>}
                </td>
                <td className="px-4 py-3 text-[#000] dark:text-white" style={{ fontSize: 13 }}>{a.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-white ${a.type === "E-book" ? "bg-[#39228C]" : "bg-[#6744AA]"}`} style={{ fontSize: 11 }}>{a.type}</span>
                </td>
                <td className="px-4 py-3 text-[#6B7280] dark:text-white/70" style={{ fontSize: 13 }}>{a.price}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded" style={{ fontSize: 11 }}>Publicado</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-[#6B7280] hover:text-[#39228C]" title="Editar"><Edit size={14} /></button>
                    <button onClick={() => remove(a.id)} className="p-1.5 text-[#6B7280] hover:text-[#EF4444]" title="Excluir"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-[#22262E] rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] dark:text-white mb-6">{items.find((i) => i.id === editing.id) ? "Editar Conteúdo" : "Novo Conteúdo"}</h3>
            <div className="space-y-4">
              {/* Imagem */}
              <div>
                <label className="block mb-2 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Imagem de capa</label>
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
                    <p className="text-[#6B7280] dark:text-white/50 mt-1" style={{ fontSize: 11 }}>JPG, PNG ou GIF · até 5MB</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Título</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Tipo</label>
                <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg">
                  <option>E-book</option>
                  <option>Curso</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Descrição</label>
                <textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none" />
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Preço</label>
                <input value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} placeholder="Gratuito ou valor" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" />
              </div>
              <button onClick={save} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}