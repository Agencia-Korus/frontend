import { useState } from "react";
import { Search, Plus, MoreVertical, X, Mail, Users, Shield, UserCheck } from "lucide-react";
import { useKorusData } from "../../live-data";

type UserDraft = {
  id?: string;
  name: string;
  email: string;
  role: "admin" | "funcionario" | "cliente";
  cargo: string;
  password: string;
  status: "ativo" | "inativo" | "pendente";
};

const blankUser: UserDraft = {
  name: "",
  email: "",
  role: "cliente",
  cargo: "",
  password: "senha-forte-123",
  status: "ativo",
};

export function AdminUsuarios() {
  const { users, createUser, updateUser } = useKorusData();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<UserDraft>(blankUser);
  const [error, setError] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "todos" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      admin: "bg-[#39228C] text-white",
      funcionario: "bg-[#6744AA] text-white",
      cliente: "bg-[rgba(103,68,170,0.15)] text-[#6744AA] border border-[#6744AA]",
    };
    const labels: Record<string, string> = { admin: "Administrador", funcionario: "Funcionário", cliente: "Cliente" };
    return <span className={`px-2 py-0.5 rounded-full ${map[role]}`} style={{ fontSize: 11, fontWeight: 500 }}>{labels[role]}</span>;
  };

  const counts = {
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    funcionario: users.filter((u) => u.role === "funcionario").length,
    cliente: users.filter((u) => u.role === "cliente").length,
  };

  const openNew = () => {
    setDraft(blankUser);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (user: typeof users[0]) => {
    setDraft({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === "visitante" ? "cliente" : user.role,
      cargo: user.cargo || "",
      password: "",
      status: user.status,
    });
    setError(null);
    setShowModal(true);
  };

  const save = async () => {
    setError(null);
    try {
      if (draft.id) {
        await updateUser(draft.id, draft);
      } else {
        await createUser(draft);
      }
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar usuário.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#000]">Gestão de Usuários</h2>
          <p className="text-[#6B7280]" style={{ fontSize: 14 }}>Gerencie os usuários da plataforma.</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>
          <Plus size={16} /> Adicionar Novo Usuário
        </button>
      </div>
      {error && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="w-full pl-10 pr-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" style={{ fontSize: 14 }} />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" style={{ fontSize: 14 }}>
          <option value="todos">Todos os perfis</option>
          <option value="admin">Administrador</option>
          <option value="funcionario">Funcionário</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB]">
              {["", "Nome", "E-mail", "Perfil", "Cargo", "Status", ""].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(103,68,170,0.1)]">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-[#F9FAFB]">
                <td className="px-4 py-3">
                  {u.avatar ? (
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#39228C] text-white flex items-center justify-center" style={{ fontSize: 12 }}>{u.name.charAt(0)}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-[#000]" style={{ fontSize: 14 }}>{u.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-[#6B7280]" style={{ fontSize: 13 }}>
                    <Mail size={12} /> {u.email}
                  </div>
                </td>
                <td className="px-4 py-3">{roleBadge(u.role)}</td>
                <td className="px-4 py-3 text-[#6B7280]" style={{ fontSize: 13 }}>{u.cargo || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full ${u.status === "ativo" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-gray-100 text-gray-500"}`} style={{ fontSize: 11, fontWeight: 500 }}>
                    {u.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-[#6B7280] hover:text-[#39228C]" onClick={() => openEdit(u)}>
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, icon: Users, color: "text-[#39228C]" },
          { label: "Administradores", value: counts.admin, icon: Shield, color: "text-[#39228C]" },
          { label: "Funcionários", value: counts.funcionario, icon: UserCheck, color: "text-[#6744AA]" },
          { label: "Clientes", value: counts.cliente, icon: Users, color: "text-[#6B7280]" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white p-4 rounded-xl border border-[rgba(103,68,170,0.15)] text-center">
              <Icon size={20} className={`mx-auto mb-2 ${c.color}`} />
              <p style={{ fontSize: 24, fontWeight: 700 }} className="text-[#000]">{c.value}</p>
              <p className="text-[#6B7280]" style={{ fontSize: 12 }}>{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] mb-6">{draft.id ? "Editar Usuário" : "Novo Usuário"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Nome</label>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
              </div>
              <div>
                <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>E-mail</label>
                <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
              </div>
              {!draft.id && (
                <div>
                  <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Senha temporária</label>
                  <input type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
                </div>
              )}
              <div>
                <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Perfil</label>
                <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as UserDraft["role"] })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none">
                  <option value="admin">Administrador</option>
                  <option value="funcionario">Funcionário</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Cargo</label>
                <input value={draft.cargo} onChange={(e) => setDraft({ ...draft, cargo: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
              </div>
              <div>
                <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Status</label>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as UserDraft["status"] })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none">
                  <option value="ativo">Ativo</option>
                  <option value="pendente">Pendente</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <button onClick={save} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">
                {draft.id ? "Salvar Alterações" : "Criar Usuário"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}