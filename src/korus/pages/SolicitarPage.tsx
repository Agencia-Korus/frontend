import { useState } from "react";
import { useParams, useNavigate } from "@/src/korus/router-adapter";
import { Navbar } from "../components/Navbar";
import { Check, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useKorusData } from "../live-data";
import { ApiError } from "../api-client";

export function SolicitarPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { services, createLead } = useKorusData();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const service = services.find((s) => s.slug === slug);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    description: "", budget: "", deadline: "",
    terms: false,
  });

  const update = (k: string, v: string | boolean) => setForm({ ...form, [k]: v });

  const steps = ["Seus Dados", "Sobre o Projeto", "Confirmação"];

  if (done) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#22C55E]/10 rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-[#22C55E]" />
          </div>
          <h2 className="text-[#000] mb-2">Solicitação enviada com sucesso!</h2>
          <p className="text-[#6B7280] mb-8" style={{ fontSize: 16 }}>Entraremos em contato em até 24h.</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError(null);
    setSending(true);
    const serviceId = Number(service?.id);
    try {
      await createLead({
        nome: form.name,
        email: form.email,
        whatsapp: form.phone,
        empresa: form.company,
        mensagem: form.description,
        orcamento: form.budget,
        prazo_desejado: form.deadline || null,
        servico_id: Number.isFinite(serviceId) ? serviceId : null,
        termos_aceitos: form.terms,
        status: "novo",
        prioridade: "media",
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível enviar a solicitação.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-12 gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${i <= step ? "bg-[#39228C]" : "bg-gray-300"}`} style={{ fontSize: 13, fontWeight: 600 }}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`hidden sm:inline ${i <= step ? "text-[#000]" : "text-[#6B7280]"}`} style={{ fontSize: 14 }}>{s}</span>
              {i < 2 && <div className={`w-8 sm:w-16 h-0.5 ${i < step ? "bg-[#39228C]" : "bg-gray-300"}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-[#000] mb-6">Seus Dados</h3>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Nome completo</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>E-mail</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Telefone/WhatsApp</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Nome da empresa</label>
              <input value={form.company} onChange={(e) => update("company", e.target.value)} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-[#000] mb-6">Sobre o Projeto</h3>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Serviço solicitado</label>
              <input value={service?.name || slug || ""} readOnly className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-[#F3F4F6]" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Descrição do projeto</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Orçamento estimado</label>
              <select value={form.budget} onChange={(e) => update("budget", e.target.value)} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none">
                <option value="">Selecione</option>
                <option>Até R$ 2.000</option>
                <option>R$ 2.000 - R$ 5.000</option>
                <option>R$ 5.000 - R$ 10.000</option>
                <option>R$ 10.000 - R$ 20.000</option>
                <option>Acima de R$ 20.000</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Prazo desejado</label>
              <input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-[#000] mb-6">Confirmação</h3>
            <div className="bg-[#F9FAFB] p-6 rounded-xl space-y-3">
              {[
                ["Nome", form.name], ["E-mail", form.email], ["Telefone", form.phone],
                ["Empresa", form.company], ["Serviço", service?.name || slug || ""],
                ["Descrição", form.description], ["Orçamento", form.budget], ["Prazo", form.deadline],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-[#6B7280]" style={{ fontSize: 14 }}>{l}</span>
                  <span className="text-[#000]" style={{ fontSize: 14, fontWeight: 500 }}>{v || "—"}</span>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input type="checkbox" checked={form.terms} onChange={(e) => update("terms", e.target.checked)} className="w-4 h-4 accent-[#39228C]" />
              <span style={{ fontSize: 14 }} className="text-[#000]">Li e aceito os Termos de Uso e Política de Privacidade</span>
            </label>
            {error && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-4 py-2 border border-[rgba(103,68,170,0.3)] text-[#6B7280] rounded-lg hover:bg-[#F3F4F6]" style={{ fontSize: 14 }}>
              <ArrowLeft size={16} /> Voltar
            </button>
          ) : <div />}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors" style={{ fontSize: 14 }}>
              Continuar <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!form.terms || sending} className="px-6 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors disabled:opacity-50" style={{ fontSize: 14 }}>
              {sending ? "Enviando..." : "Enviar Solicitação"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}