"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import { useKorusData } from "../../live-data";

export function AdminConfiguracoes() {
  const { googleCalendarIntegration, saveGoogleCalendarIntegration } = useKorusData();
  const [calendarId, setCalendarId] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "erro"; message: string } | null>(null);

  const conectado = googleCalendarIntegration?.status === "conectado";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCalendarId(googleCalendarIntegration?.chave || "");
  }, [googleCalendarIntegration]);

  const salvar = async (status: "conectado" | "desconectado") => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveGoogleCalendarIntegration({ chave: calendarId.trim() || undefined, status });
      setFeedback({
        type: "ok",
        message: status === "conectado" ? "Google Calendar conectado." : "Integração desativada.",
      });
    } catch (err) {
      setFeedback({ type: "erro", message: err instanceof Error ? err.message : "Erro ao salvar integração." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-[#000] dark:text-white">Configurações e Integrações</h2>
        <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 14 }}>
          Gerencie a integração de agenda da Korus.
        </p>
      </div>

      {/* Integrações — somente Google Calendar */}
      <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] p-6">
        <h3 className="text-[#000] dark:text-white mb-6" style={{ fontSize: 18, fontWeight: 600 }}>Integrações</h3>

        <div className="rounded-xl border border-[rgba(103,68,170,0.2)] p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] dark:text-[#A78BFA]">
                <CalendarCheck size={22} />
              </div>
              <div>
                <p className="text-[#000] dark:text-white" style={{ fontSize: 15, fontWeight: 600 }}>Google Calendar</p>
                <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>
                  Sincroniza reuniões e eventos da agenda com o Google Calendar.
                </p>
              </div>
            </div>
            {conectado ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded-full whitespace-nowrap" style={{ fontSize: 12, fontWeight: 600 }}>
                <CheckCircle2 size={13} /> Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 rounded-full whitespace-nowrap" style={{ fontSize: 12, fontWeight: 600 }}>
                <XCircle size={13} /> Desconectado
              </span>
            )}
          </div>

          <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14, fontWeight: 500 }}>
            ID do calendário (Calendar ID)
          </label>
          <input
            value={calendarId}
            onChange={(e) => setCalendarId(e.target.value)}
            placeholder="ex: ...@group.calendar.google.com ou primary"
            className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1D24] dark:text-white"
            style={{ fontSize: 14 }}
          />
          <p className="text-[#6B7280] dark:text-white/50 mt-1" style={{ fontSize: 12 }}>
            As credenciais da conta de serviço são configuradas no servidor (variáveis GOOGLE_CALENDAR_*).
          </p>

          {feedback && (
            <p className={feedback.type === "ok" ? "text-[#22C55E] mt-3" : "text-[#EF4444] mt-3"} style={{ fontSize: 13 }}>
              {feedback.message}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => salvar("conectado")}
              disabled={saving}
              className="px-6 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] disabled:opacity-60"
              style={{ fontSize: 14 }}
            >
              {saving ? "Salvando..." : conectado ? "Salvar alterações" : "Conectar"}
            </button>
            {conectado && (
              <button
                onClick={() => salvar("desconectado")}
                disabled={saving}
                className="px-6 py-2 border border-[#EF4444] text-[#EF4444] rounded-lg hover:bg-[#EF4444]/5 disabled:opacity-60"
                style={{ fontSize: 14 }}
              >
                Desconectar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
