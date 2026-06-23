import { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { uploadImageToSupabase } from "../supabase-storage";
import { useKorusData } from "../live-data";

interface ProfilePageProps {
  userId: string;
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const { users, updateUser } = useKorusData();
  const user = users.find((u) => u.id === userId) || users[0];
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState({ name: user?.name ?? "", phone: "(61) 99999-0000", currentPassword: "", newPassword: "", confirmPassword: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setAvatar(user?.avatar), [user?.avatar]);
  // Mantém o nome do formulário em sincronia quando o usuário carrega de forma assíncrona.
  useEffect(() => {
    if (user?.name) setForm((prev) => (prev.name ? prev : { ...prev, name: user.name }));
  }, [user?.name]);

  // Enquanto a lista de usuários ainda não carregou, evita acessar campos de `user`
  // indefinido (causava o "This page couldn't load").
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-[#6B7280] dark:text-white/60" style={{ fontSize: 14 }}>
        Carregando perfil...
      </div>
    );
  }

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingAvatar(true);
    setUploadError(null);

    try {
      const url = await uploadImageToSupabase(f, "avatars");
      setAvatar(url);
      await updateUser(user.id, { avatar: url });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Erro ao enviar imagem.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-[#000] dark:text-white">Meu Perfil</h2>

      <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-6 border-b border-[rgba(103,68,170,0.1)]">
          <div className="relative group">
            {avatar ? (
              <img src={avatar} alt={user.name} className="w-28 h-28 rounded-full object-cover ring-4 ring-[#39228C]/15" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#39228C] flex items-center justify-center text-white" style={{ fontSize: 32, fontWeight: 700 }}>
                {user.name.charAt(0)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#39228C] hover:bg-[#6744AA] text-white flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-[#22262E] transition-colors"
              aria-label="Trocar foto"
              title="Trocar foto"
            >
              <Camera size={16} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-[#000] dark:text-white">{user.name}</h3>
            <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 14 }}>{user.email}</p>
            {user.cargo && <span className="inline-block mt-2 px-2.5 py-0.5 bg-[#39228C]/10 text-[#39228C] rounded-full" style={{ fontSize: 12, fontWeight: 500 }}>{user.cargo}</span>}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-4">
              <button type="button" disabled={uploadingAvatar} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#6744AA] text-[#6744AA] dark:text-[#A78BFA] dark:border-[#A78BFA] rounded-lg hover:bg-[#6744AA]/5 disabled:opacity-60" style={{ fontSize: 13 }}>
                <Camera size={14} /> {uploadingAvatar ? "Enviando..." : "Carregar nova foto"}
              </button>
              {avatar && (
                <button type="button" onClick={() => setAvatar(undefined)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#EF4444]/40 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/5" style={{ fontSize: 13 }}>
                  <Trash2 size={14} /> Remover
                </button>
              )}
            </div>
            <p className="text-[#6B7280] dark:text-white/50 mt-2" style={{ fontSize: 11 }}>JPG, PNG ou GIF · até 5MB</p>
            {uploadError && <p className="text-[#EF4444] mt-2" style={{ fontSize: 12 }}>{uploadError}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Nome</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
          </div>
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>E-mail</label>
            <input value={user.email} readOnly className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-[#F3F4F6]" />
          </div>
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Telefone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
          </div>
          {user.cargo && (
            <div>
              <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Cargo</label>
              <input value={user.cargo} readOnly className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-[#F3F4F6]" />
            </div>
          )}
          {user.xp !== undefined && (
            <div className="md:col-span-2">
              <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Nível XP</label>
              <input value={`Nível ${user.level} — ${user.xp?.toLocaleString()} XP`} readOnly className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-[#F3F4F6]" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] p-6 sm:p-8">
        <h3 className="text-[#000] dark:text-white mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Segurança</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Senha atual</label>
            <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
          </div>
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Nova senha</label>
            <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
          </div>
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Confirmar nova senha</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {savedMsg && (
          <p className={savedMsg.ok ? "text-[#22C55E]" : "text-[#EF4444]"} style={{ fontSize: 13 }}>{savedMsg.text}</p>
        )}
        <button
          onClick={async () => {
            setSaving(true);
            setSavedMsg(null);
            try {
              await updateUser(user.id, { name: form.name.trim() || user.name });
              setSavedMsg({ ok: true, text: "Alterações salvas." });
            } catch (err) {
              setSavedMsg({ ok: false, text: err instanceof Error ? err.message : "Erro ao salvar." });
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="px-6 py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}