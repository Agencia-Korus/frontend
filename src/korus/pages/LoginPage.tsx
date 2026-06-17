import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "@/src/korus/router-adapter";
import { KorusLogo } from "../components/KorusLogo";
import { KorusIcon } from "../components/KorusBrand";
import { useAuth } from "../auth-context";
import { ApiError } from "../api-client";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const current = await login(email, password);
      navigate(`/${current.role}`);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 403
          ? "Seu cadastro ainda está pendente de aprovação."
          : err instanceof Error
            ? err.message
            : "Não foi possível entrar agora.",
      );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex flex-1 bg-[#0C0819] flex-col items-center justify-center p-12 relative overflow-hidden">
        <KorusIcon className="w-40 h-40 text-white mb-8 relative z-10" />
        <p className="text-white/80 text-center max-w-sm relative z-10" style={{ fontSize: 18, lineHeight: 1.6 }}>
          Transformamos sua comunicação em resultado.
        </p>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1.5 mb-8 text-[#6B7280] hover:text-[#39228C] transition-colors" style={{ fontSize: 14 }}>
            <ArrowLeft size={16} />
            Voltar para a tela inicial
          </Link>
          <div className="lg:hidden mb-8">
            <KorusLogo variant="dark" size="md" />
          </div>
          <h2 className="text-[#000] mb-2">Bem-vindo de volta</h2>
          <p className="text-[#6B7280] mb-8" style={{ fontSize: 14 }}>Entre com suas credenciais para acessar o sistema.</p>
          {error && <p className="mb-4 text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div className="text-right">
              <a href="#" className="text-[#39228C] hover:text-[#6744AA]" style={{ fontSize: 13 }}>Esqueci minha senha</a>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors disabled:opacity-60">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center mt-6 text-[#6B7280]" style={{ fontSize: 14 }}>
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-[#39228C] hover:text-[#6744AA]" style={{ fontWeight: 500 }}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}