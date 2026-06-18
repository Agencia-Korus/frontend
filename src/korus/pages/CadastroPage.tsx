import { useState } from "react";
import { Link, useNavigate } from "@/src/korus/router-adapter";
import { KorusLogo } from "../components/KorusLogo";
import { KorusIcon } from "../components/KorusBrand";
import { useAuth } from "../auth-context";
import { ApiError } from "../api-client";

export function CadastroPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "cliente" as "cliente" | "funcionario",
    phone: "",
    company: "",
    terms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password !== form.confirm) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    if (!form.terms) {
      setError("Você precisa aceitar os termos para continuar.");
      return;
    }

    try {
      await register({
        nome: form.name,
        email: form.email,
        senha: form.password,
        role: form.role,
        telefone: form.phone || undefined,
        cliente: form.role === "cliente"
          ? {
              razao_social: form.company || form.name,
              cnpj_cpf: `pendente-${Date.now()}`,
              segmento: "Serviços",
            }
          : undefined,
        funcionario: form.role === "funcionario"
          ? {
              cargo: form.company || "Funcionário",
              especialidade: "Geral",
            }
          : undefined,
      });
      setSuccess("Cadastro realizado. Agora aguarde a aprovação de um admin.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? "Esse e-mail já está cadastrado."
          : err instanceof Error
            ? err.message
            : "Não foi possível concluir o cadastro.",
      );
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-[#0C0819] flex-col items-center justify-center p-12 relative overflow-hidden">
        <KorusIcon className="w-40 h-40 text-white mb-8 relative z-10" />
        <p className="text-white/80 text-center max-w-sm relative z-10" style={{ fontSize: 18, lineHeight: 1.6 }}>
          Crie sua conta e comece a transformar sua marca.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><KorusLogo variant="dark" size="md" /></div>
          <h2 className="text-[#000] mb-2">Criar Conta</h2>
          <p className="text-[#6B7280] mb-8" style={{ fontSize: 14 }}>Preencha os dados abaixo para se cadastrar.</p>
          {error && <p className="mb-4 text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}
          {success && <p className="mb-4 text-[#22C55E]" style={{ fontSize: 13 }}>{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Nome completo</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Tipo de conta</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "cliente" | "funcionario" })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none">
                <option value="cliente">Cliente</option>
                <option value="funcionario">Funcionário</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>{form.role === "cliente" ? "Nome da empresa" : "Cargo"}</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Telefone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Senha</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Confirmar senha</label>
              <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} className="w-4 h-4 accent-[#39228C]" />
              <span style={{ fontSize: 14 }} className="text-[#000]">Li e aceito os <a href="#" className="text-[#39228C]">Termos</a> e <a href="#" className="text-[#39228C]">Privacidade</a></span>
            </label>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors disabled:opacity-60">{loading ? "Criando..." : "Criar Conta"}</button>
          </form>

          <p className="text-center mt-6 text-[#6B7280]" style={{ fontSize: 14 }}>
            Já tem conta? <Link to="/login" className="text-[#39228C]" style={{ fontWeight: 500 }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}