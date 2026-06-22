import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Check, Clock, Calendar as CalIcon, Inbox, CalendarPlus, ExternalLink, RefreshCw } from "lucide-react";
import { apiGet, apiPatch, apiPost } from "../api-client";

type EventType = "entrega" | "reuniao" | "pessoal" | "tarefa";
type RequestStatus = "pendente" | "aceita" | "recusada" | "cancelada";

type SiteEvent = {
  id: string;
  origem: "local" | "google_calendar";
  titulo: string;
  descricao?: string | null;
  tipo?: string | null;
  data: string; // YYYY-MM-DD
  hora?: string | null; // HH:MM:SS
  duracao_min?: number | null;
  link?: string | null;
};

type Contato = { id: number; nome: string; role: string };

type Solicitacao = {
  id: number;
  titulo: string;
  mensagem?: string | null;
  data: string;
  hora: string;
  remetente_id: number;
  destinatario_id: number;
  status: RequestStatus;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function shortTime(hora?: string | null) {
  return hora ? hora.slice(0, 5) : "";
}

export function CalendarPage({ title = "Agenda", currentUserId = "" }: { title?: string; currentUserId?: string }) {
  const meId = Number(currentUserId) || 0;
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<"mensal" | "lista" | "solicitacoes">("mensal");

  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [received, setReceived] = useState<Solicitacao[]>([]);
  const [sent, setSent] = useState<Solicitacao[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showRequest, setShowRequest] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);

  const [reqForm, setReqForm] = useState({ toId: "", date: "", time: "10:00", title: "", message: "" });
  const [addForm, setAddForm] = useState<{ type: EventType; title: string; description: string; date: string; time: string; duracao: number }>(
    { type: "reuniao", title: "", description: "", date: "", time: "10:00", duracao: 60 },
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ev, ct] = await Promise.all([
        apiGet<SiteEvent[]>("/agenda/eventos", true),
        apiGet<Contato[]>("/agenda/contatos", true).catch(() => [] as Contato[]),
      ]);
      setEvents(ev);
      setContatos(ct);
      if (meId) {
        const rec = await apiGet<Solicitacao[]>(`/agenda/solicitacoes/recebidas/${meId}`, true).catch(() => [] as Solicitacao[]);
        setReceived(rec);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }, [meId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, SiteEvent[]>();
    for (const e of events) {
      const list = map.get(e.data) || [];
      list.push(e);
      map.set(e.data, list);
    }
    return map;
  }, [events]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || ""))),
    [events],
  );

  const pendingCount = received.filter((r) => r.status === "pendente").length;
  const contatoNome = (id: number) => contatos.find((c) => c.id === id)?.nome || `Usuário #${id}`;

  const typeStyles = (tipo?: string | null, origem?: string) => {
    if (origem === "google_calendar") return "bg-[#39228C]/10 text-[#39228C] dark:bg-[#39228C]/30 dark:text-white";
    return tipo === "entrega"
      ? "bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
      : tipo === "reuniao"
      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300";
  };

  const submitAdd = async () => {
    if (!addForm.title.trim() || !addForm.date) return;
    setBusy(true);
    setError(null);
    try {
      await apiPost("/agenda/eventos", {
        titulo: addForm.title.trim(),
        descricao: addForm.description.trim() || null,
        tipo: addForm.type,
        data: addForm.date,
        hora: addForm.time ? `${addForm.time}:00` : null,
        duracao_min: addForm.duracao,
        usuario_id: meId,
      }, true);
      setShowAdd(false);
      setAddForm({ type: "reuniao", title: "", description: "", date: "", time: "10:00", duracao: 60 });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar evento.");
    } finally {
      setBusy(false);
    }
  };

  const submitRequest = async () => {
    if (!reqForm.title.trim() || !reqForm.toId || !reqForm.date) return;
    setBusy(true);
    setError(null);
    try {
      const created = await apiPost<Solicitacao>("/agenda/solicitacoes", {
        titulo: reqForm.title.trim(),
        mensagem: reqForm.message.trim() || null,
        data: reqForm.date,
        hora: `${reqForm.time}:00`,
        remetente_id: meId,
        destinatario_id: Number(reqForm.toId),
        status: "pendente",
      }, true);
      setSent((prev) => [created, ...prev]);
      setShowRequest(false);
      setReqForm({ toId: "", date: "", time: "10:00", title: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar solicitação.");
    } finally {
      setBusy(false);
    }
  };

  const respondRequest = async (req: Solicitacao, status: "aceita" | "recusada") => {
    setBusy(true);
    setError(null);
    try {
      await apiPatch(`/agenda/solicitacoes/${req.id}`, { status }, true);
      setReceived((prev) => prev.map((r) => (r.id === req.id ? { ...r, status } : r)));
      // Ao aceitar, cria o evento correspondente na agenda (sincroniza com o Google Calendar).
      if (status === "aceita") {
        await apiPost("/agenda/eventos", {
          titulo: req.titulo,
          descricao: req.mensagem || `Reunião com ${contatoNome(req.remetente_id)}`,
          tipo: "reuniao",
          data: req.data,
          hora: req.hora,
          duracao_min: 60,
          usuario_id: meId,
        }, true).catch(() => undefined);
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao responder solicitação.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#000] dark:text-white">{title}</h2>
          <p className="text-[#6B7280] dark:text-white/60 flex items-center gap-2" style={{ fontSize: 13 }}>
            <CalIcon size={13} /> Sincronizada com o Google Calendar
            {loading && <span className="text-[#6744AA]">· carregando...</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setError(null); setShowAdd(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 13 }}>
            <CalendarPlus size={14} /> Adicionar à agenda
          </button>
          <button onClick={() => { setError(null); setShowRequest(true); }} className="flex items-center gap-2 px-4 py-2 border border-[#6744AA] text-[#6744AA] dark:text-[#A78BFA] dark:border-[#A78BFA] rounded-lg hover:bg-[#6744AA]/5 dark:hover:bg-[#A78BFA]/10" style={{ fontSize: 13 }}>
            <Plus size={14} /> Solicitar reunião
          </button>
          <button onClick={() => void load()} title="Atualizar" className="flex items-center gap-2 px-3 py-2 bg-[#F3F4F6] dark:bg-[#1A1230] text-[#6B7280] dark:text-white/70 rounded-lg hover:opacity-90" style={{ fontSize: 13 }}>
            <RefreshCw size={14} />
          </button>
          {(["mensal", "lista", "solicitacoes"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`relative px-3 py-1.5 rounded-lg capitalize ${view === v ? "bg-[#39228C] text-white" : "bg-[#F3F4F6] dark:bg-[#1A1230] text-[#6B7280] dark:text-white/70"}`}
              style={{ fontSize: 13 }}
            >
              {v === "solicitacoes" ? "Solicitações" : v}
              {v === "solicitacoes" && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white rounded-full w-4 h-4 flex items-center justify-center" style={{ fontSize: 10 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-[#EF4444]" style={{ fontSize: 13 }}>{error}</p>}

      {view === "mensal" && (
        <div className="bg-white dark:bg-[#130D22] rounded-xl border border-[rgba(103,68,170,0.15)] p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-[#F3F4F6] dark:hover:bg-[#1A1230] rounded text-[#000] dark:text-white"><ChevronLeft size={20} /></button>
            <h3 className="text-[#000] dark:text-white capitalize" style={{ fontSize: 18, fontWeight: 600 }}>{monthName}</h3>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-[#F3F4F6] dark:hover:bg-[#1A1230] rounded text-[#000] dark:text-white"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[#6B7280] dark:text-white/60 py-2" style={{ fontSize: 12, fontWeight: 500 }}>{d}</div>
            ))}
            {days.map((day, i) => {
              const dayEvents = day ? eventsByDay.get(dateKey(year, month, day)) || [] : [];
              return (
                <div key={i} className={`min-h-[80px] p-1 border border-[rgba(103,68,170,0.05)] dark:border-[rgba(103,68,170,0.2)] rounded ${day ? "bg-white dark:bg-[#0C0819]" : ""}`}>
                  {day && (
                    <>
                      <span className="text-[#000] dark:text-white block mb-1" style={{ fontSize: 13 }}>{day}</span>
                      {dayEvents.map((e) => (
                        <div key={e.id} className={`px-1 py-0.5 rounded mb-0.5 truncate ${typeStyles(e.tipo, e.origem)}`} style={{ fontSize: 10 }} title={e.titulo}>
                          {shortTime(e.hora) ? `${shortTime(e.hora)} · ` : ""}{e.titulo}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "lista" && (
        <div className="bg-white dark:bg-[#130D22] rounded-xl border border-[rgba(103,68,170,0.15)] divide-y divide-[rgba(103,68,170,0.1)]">
          {sortedEvents.length === 0 && (
            <div className="px-4 py-8 text-center text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>
              Nenhum evento na agenda.
            </div>
          )}
          {sortedEvents.map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-4 py-3">
              <div className={`w-2.5 h-2.5 rounded-full ${e.origem === "google_calendar" ? "bg-[#39228C]" : "bg-[#6744AA]"}`} />
              <div className="flex-1">
                <p style={{ fontSize: 14, fontWeight: 500 }} className="text-[#000] dark:text-white flex items-center gap-2">
                  {e.titulo}
                  {e.link && <a href={e.link} target="_blank" rel="noopener noreferrer" className="text-[#6744AA]"><ExternalLink size={12} /></a>}
                </p>
                <p className="text-[#6B7280] dark:text-white/60 flex items-center gap-2" style={{ fontSize: 12 }}>
                  <CalIcon size={11} /> {e.data}{shortTime(e.hora) ? <><Clock size={11} /> {shortTime(e.hora)}</> : null}
                  {e.origem === "google_calendar" && <span className="text-[#39228C] dark:text-[#A78BFA]">· Google Calendar</span>}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded ${typeStyles(e.tipo, e.origem)}`} style={{ fontSize: 11 }}>
                {e.tipo === "entrega" ? "Entrega" : e.tipo === "reuniao" ? "Reunião" : e.tipo === "tarefa" ? "Tarefa" : "Pessoal"}
              </span>
            </div>
          ))}
        </div>
      )}

      {view === "solicitacoes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#130D22] rounded-xl border border-[rgba(103,68,170,0.15)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Inbox size={16} className="text-[#39228C] dark:text-[#A78BFA]" />
              <h4 className="text-[#000] dark:text-white" style={{ fontSize: 15, fontWeight: 600 }}>Recebidas</h4>
            </div>
            {received.length === 0 && <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>Nenhuma solicitação.</p>}
            <div className="space-y-3">
              {received.map((r) => (
                <div key={r.id} className="border border-[rgba(103,68,170,0.15)] rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[#000] dark:text-white" style={{ fontSize: 14, fontWeight: 600 }}>{r.titulo}</p>
                      <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 12 }}>De: {contatoNome(r.remetente_id)} · {r.data} às {shortTime(r.hora)}</p>
                      {r.mensagem && <p className="text-[#6B7280] dark:text-white/70 mt-2" style={{ fontSize: 12 }}>&quot;{r.mensagem}&quot;</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full ${
                      r.status === "pendente" ? "bg-amber-100 text-amber-700" :
                      r.status === "aceita" ? "bg-emerald-100 text-emerald-700" :
                      "bg-red-100 text-red-700"
                    }`} style={{ fontSize: 10, fontWeight: 600 }}>{r.status}</span>
                  </div>
                  {r.status === "pendente" && (
                    <div className="flex gap-2 mt-3">
                      <button disabled={busy} onClick={() => respondRequest(r, "aceita")} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#22C55E] text-white rounded-lg hover:opacity-90 disabled:opacity-60" style={{ fontSize: 12 }}>
                        <Check size={12} /> Aceitar
                      </button>
                      <button disabled={busy} onClick={() => respondRequest(r, "recusada")} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#EF4444] text-white rounded-lg hover:opacity-90 disabled:opacity-60" style={{ fontSize: 12 }}>
                        <X size={12} /> Recusar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#130D22] rounded-xl border border-[rgba(103,68,170,0.15)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalIcon size={16} className="text-[#6744AA]" />
              <h4 className="text-[#000] dark:text-white" style={{ fontSize: 15, fontWeight: 600 }}>Enviadas (nesta sessão)</h4>
            </div>
            {sent.length === 0 && <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>Você ainda não enviou solicitações.</p>}
            <div className="space-y-3">
              {sent.map((r) => (
                <div key={r.id} className="border border-[rgba(103,68,170,0.15)] rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[#000] dark:text-white" style={{ fontSize: 14, fontWeight: 600 }}>{r.titulo}</p>
                      <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 12 }}>Para: {contatoNome(r.destinatario_id)} · {r.data} às {shortTime(r.hora)}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700" style={{ fontSize: 10, fontWeight: 600 }}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-[#130D22] rounded-2xl max-w-lg w-full p-6">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] dark:text-white mb-1">Adicionar à Agenda</h3>
            <p className="text-[#6B7280] dark:text-white/60 mb-5" style={{ fontSize: 13 }}>O evento será sincronizado com o Google Calendar.</p>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Tipo</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["reuniao", "entrega", "tarefa", "pessoal"] as const).map((t) => {
                    const active = addForm.type === t;
                    const label = t === "reuniao" ? "Reunião" : t === "entrega" ? "Entrega" : t === "tarefa" ? "Tarefa" : "Pessoal";
                    return (
                      <button key={t} type="button" onClick={() => setAddForm({ ...addForm, type: t })}
                        className={`px-2 py-2 rounded-lg border transition-colors ${active ? "bg-[#39228C] border-[#39228C] text-white" : "border-[rgba(103,68,170,0.3)] text-[#000] dark:text-white"}`}
                        style={{ fontSize: 12 }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Título</label>
                <input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} placeholder="Ex: Reunião de alinhamento" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Descrição (opcional)</label>
                <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none bg-white dark:bg-[#1A1230] dark:text-white" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Data</label>
                  <input type="date" value={addForm.date} onChange={(e) => setAddForm({ ...addForm, date: e.target.value })} className="w-full px-3 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
                </div>
                <div>
                  <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Horário</label>
                  <input type="time" value={addForm.time} onChange={(e) => setAddForm({ ...addForm, time: e.target.value })} className="w-full px-3 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
                </div>
                <div>
                  <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Duração (min)</label>
                  <input type="number" min={15} step={15} value={addForm.duracao} onChange={(e) => setAddForm({ ...addForm, duracao: Number(e.target.value) || 60 })} className="w-full px-3 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
                </div>
              </div>
              <button onClick={submitAdd} disabled={busy} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] disabled:opacity-60">{busy ? "Salvando..." : "Adicionar evento"}</button>
            </div>
          </div>
        </div>
      )}

      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRequest(false)} />
          <div className="relative bg-white dark:bg-[#130D22] rounded-2xl max-w-lg w-full p-6">
            <button onClick={() => setShowRequest(false)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] dark:text-white mb-1">Solicitar Reunião</h3>
            <p className="text-[#6B7280] dark:text-white/60 mb-5" style={{ fontSize: 13 }}>Envie um convite de reunião para outro usuário.</p>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Para</label>
                {contatos.length ? (
                  <select value={reqForm.toId} onChange={(e) => setReqForm({ ...reqForm, toId: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white">
                    <option value="">Selecione...</option>
                    {contatos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome} — {p.role}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>Nenhum contato disponível.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Data</label>
                  <input type="date" value={reqForm.date} onChange={(e) => setReqForm({ ...reqForm, date: e.target.value })} className="w-full px-3 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
                </div>
                <div>
                  <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Horário</label>
                  <input type="time" value={reqForm.time} onChange={(e) => setReqForm({ ...reqForm, time: e.target.value })} className="w-full px-3 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Assunto</label>
                <input value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })} placeholder="Ex: Alinhamento do projeto" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Mensagem (opcional)</label>
                <textarea value={reqForm.message} onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none bg-white dark:bg-[#1A1230] dark:text-white" />
              </div>
              <button onClick={submitRequest} disabled={busy || !contatos.length} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] disabled:opacity-60">{busy ? "Enviando..." : "Enviar Solicitação"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
