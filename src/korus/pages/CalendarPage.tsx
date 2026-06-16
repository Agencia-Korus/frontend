import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Check, Clock, Calendar as CalIcon, Inbox, CalendarPlus } from "lucide-react";

type EventType = "entrega" | "reuniao" | "pessoal";
type RequestStatus = "pendente" | "aceita" | "recusada";

interface Person {
  id: string;
  name: string;
  role: string;
  color: string;
}

interface CalEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  type: EventType;
  personId: string;
}

interface MeetingRequest {
  id: string;
  fromId: string;
  toId: string;
  date: string;
  time: string;
  title: string;
  message?: string;
  status: RequestStatus;
}

const people: Person[] = [
  { id: "ana", name: "Ana Lima", role: "Designer", color: "#39228C" },
  { id: "bruno", name: "Pedro Souza", role: "Desenvolvedor", color: "#6744AA" },
  { id: "carla", name: "Tech Solutions", role: "Cliente", color: "#22C55E" },
  { id: "diego", name: "Carlos Mendes", role: "Administrador", color: "#F59E0B" },
];

const initialEvents: CalEvent[] = [
  // Ana — funcionária
  { id: "e1", date: "2026-04-22", time: "10:00", title: "Reunião kickoff", type: "reuniao", personId: "ana" },
  { id: "e4", date: "2026-05-01", title: "Entrega Logotipo v1", type: "entrega", personId: "ana" },
  { id: "e6", date: "2026-04-28", time: "15:00", title: "Revisão de moodboard", type: "pessoal", personId: "ana" },
  // Bruno
  { id: "e2", date: "2026-04-25", time: "14:30", title: "Review Site Sabor & Arte", type: "entrega", personId: "bruno" },
  // Diego — admin
  { id: "e3", date: "2026-04-28", time: "09:00", title: "Sprint Planning", type: "reuniao", personId: "diego" },
  { id: "e7", date: "2026-05-05", time: "11:00", title: "Alinhamento estratégico", type: "reuniao", personId: "diego" },
  // Carla — cliente
  { id: "e5", date: "2026-04-30", time: "16:00", title: "Apresentação da identidade", type: "reuniao", personId: "carla" },
  { id: "e8", date: "2026-05-08", time: "10:30", title: "Entrega final do projeto", type: "entrega", personId: "carla" },
];

const initialRequests: MeetingRequest[] = [
  {
    id: "r1",
    fromId: "carla",
    toId: "ana",
    date: "2026-04-29",
    time: "11:00",
    title: "Ajustes na identidade visual",
    message: "Gostaria de revisar a paleta antes do fechamento.",
    status: "pendente",
  },
  {
    id: "r2",
    fromId: "diego",
    toId: "bruno",
    date: "2026-05-02",
    time: "15:00",
    title: "Code review do checkout",
    status: "pendente",
  },
];

export function CalendarPage({ title = "Agenda", currentUserId = "ana" }: { title?: string; currentUserId?: string }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [view, setView] = useState<"mensal" | "lista" | "solicitacoes">("mensal");
  const selectedPerson = currentUserId;
  const me = people.find((p) => p.id === currentUserId);
  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [requests, setRequests] = useState<MeetingRequest[]>(initialRequests);
  const [showRequest, setShowRequest] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [reqForm, setReqForm] = useState({ toId: "bruno", date: "2026-04-30", time: "10:00", title: "", message: "" });
  const [addForm, setAddForm] = useState<{ type: EventType; title: string; date: string; time: string }>({ type: "pessoal", title: "", date: "2026-04-30", time: "10:00" });

  const submitAdd = () => {
    if (!addForm.title.trim()) return;
    setEvents((prev) => [
      ...prev,
      { id: `e${Date.now()}`, date: addForm.date, time: addForm.time, title: addForm.title, type: addForm.type, personId: selectedPerson },
    ]);
    setAddForm({ type: "pessoal", title: "", date: "2026-04-30", time: "10:00" });
    setShowAdd(false);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const personEvents = useMemo(
    () => events.filter((e) => e.personId === selectedPerson),
    [events, selectedPerson]
  );

  const acceptedAsEvents = useMemo<CalEvent[]>(
    () =>
      requests
        .filter((r) => r.status === "aceita" && (r.toId === selectedPerson || r.fromId === selectedPerson))
        .map((r) => ({ id: `req-${r.id}`, date: r.date, time: r.time, title: r.title, type: "reuniao", personId: selectedPerson })),
    [requests, selectedPerson]
  );

  const allShown = [...personEvents, ...acceptedAsEvents];

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allShown.filter((e) => e.date === dateStr);
  };

  const myInbox = requests.filter((r) => r.toId === selectedPerson);
  const mySent = requests.filter((r) => r.fromId === selectedPerson);
  const pendingCount = myInbox.filter((r) => r.status === "pendente").length;

  const updateRequest = (id: string, status: RequestStatus) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const submitRequest = () => {
    if (!reqForm.title.trim()) return;
    setRequests((prev) => [
      ...prev,
      {
        id: `r${Date.now()}`,
        fromId: selectedPerson,
        toId: reqForm.toId,
        date: reqForm.date,
        time: reqForm.time,
        title: reqForm.title,
        message: reqForm.message,
        status: "pendente",
      },
    ]);
    setReqForm({ toId: "bruno", date: "2026-04-30", time: "10:00", title: "", message: "" });
    setShowRequest(false);
  };

  const personName = (id: string) => people.find((p) => p.id === id)?.name ?? id;
  const personColor = (id: string) => people.find((p) => p.id === id)?.color ?? "#39228C";

  const typeStyles = (type: EventType) =>
    type === "entrega"
      ? "bg-[#39228C]/10 text-[#39228C] dark:bg-[#39228C]/30 dark:text-white"
      : type === "reuniao"
      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#000] dark:text-white">{title}</h2>
          <p className="text-[#6B7280] dark:text-white/60 flex items-center gap-2" style={{ fontSize: 13 }}>
            {me && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ fontSize: 10, fontWeight: 600, backgroundColor: me.color }}>{me.name.charAt(0)}</span>
                {me.name} · {me.role}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 13 }}>
            <CalendarPlus size={14} /> Adicionar à agenda
          </button>
          <button onClick={() => setShowRequest(true)} className="flex items-center gap-2 px-4 py-2 border border-[#6744AA] text-[#6744AA] dark:text-[#A78BFA] dark:border-[#A78BFA] rounded-lg hover:bg-[#6744AA]/5 dark:hover:bg-[#A78BFA]/10" style={{ fontSize: 13 }}>
            <Plus size={14} /> Solicitar reunião
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


      {view === "mensal" && (
        <div className="bg-white dark:bg-[#130D22] rounded-xl border border-[rgba(103,68,170,0.15)] p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-[#F3F4F6] dark:hover:bg-[#1A1230] rounded text-[#000] dark:text-white"><ChevronLeft size={20} /></button>
            <h3 className="text-[#000] dark:text-white capitalize" style={{ fontSize: 18, fontWeight: 600 }}>{monthName}</h3>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-[#F3F4F6] dark:hover:bg-[#1A1230] rounded text-[#000] dark:text-white"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="text-center text-[#6B7280] dark:text-white/60 py-2" style={{ fontSize: 12, fontWeight: 500 }}>{d}</div>
            ))}
            {days.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              return (
                <div key={i} className={`min-h-[80px] p-1 border border-[rgba(103,68,170,0.05)] dark:border-[rgba(103,68,170,0.2)] rounded ${day ? "bg-white dark:bg-[#0C0819]" : ""}`}>
                  {day && (
                    <>
                      <span className="text-[#000] dark:text-white block mb-1" style={{ fontSize: 13 }}>{day}</span>
                      {dayEvents.map((e) => (
                        <div key={e.id} className={`px-1 py-0.5 rounded mb-0.5 truncate ${typeStyles(e.type)}`} style={{ fontSize: 10 }}>
                          {e.time ? `${e.time} · ` : ""}{e.title}
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
          {allShown.length === 0 && (
            <div className="px-4 py-8 text-center text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>
              Nenhum evento para {personName(selectedPerson)}.
            </div>
          )}
          {allShown.map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-4 py-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: personColor(selectedPerson) }} />
              <div className="flex-1">
                <p style={{ fontSize: 14, fontWeight: 500 }} className="text-[#000] dark:text-white">{e.title}</p>
                <p className="text-[#6B7280] dark:text-white/60 flex items-center gap-2" style={{ fontSize: 12 }}>
                  <CalIcon size={11} /> {e.date}{e.time ? <><Clock size={11} /> {e.time}</> : null}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded ${typeStyles(e.type)}`} style={{ fontSize: 11 }}>
                {e.type === "entrega" ? "Entrega" : e.type === "reuniao" ? "Reunião" : "Pessoal"}
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
            {myInbox.length === 0 && <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>Nenhuma solicitação.</p>}
            <div className="space-y-3">
              {myInbox.map((r) => (
                <div key={r.id} className="border border-[rgba(103,68,170,0.15)] rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[#000] dark:text-white" style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</p>
                      <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 12 }}>De: {personName(r.fromId)} · {r.date} às {r.time}</p>
                      {r.message && <p className="text-[#6B7280] dark:text-white/70 mt-2" style={{ fontSize: 12 }}>&quot;{r.message}&quot;</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full ${
                      r.status === "pendente" ? "bg-amber-100 text-amber-700" :
                      r.status === "aceita" ? "bg-emerald-100 text-emerald-700" :
                      "bg-red-100 text-red-700"
                    }`} style={{ fontSize: 10, fontWeight: 600 }}>{r.status}</span>
                  </div>
                  {r.status === "pendente" && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => updateRequest(r.id, "aceita")} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#22C55E] text-white rounded-lg hover:opacity-90" style={{ fontSize: 12 }}>
                        <Check size={12} /> Aceitar
                      </button>
                      <button onClick={() => updateRequest(r.id, "recusada")} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#EF4444] text-white rounded-lg hover:opacity-90" style={{ fontSize: 12 }}>
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
              <h4 className="text-[#000] dark:text-white" style={{ fontSize: 15, fontWeight: 600 }}>Enviadas</h4>
            </div>
            {mySent.length === 0 && <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 13 }}>Você ainda não enviou solicitações.</p>}
            <div className="space-y-3">
              {mySent.map((r) => (
                <div key={r.id} className="border border-[rgba(103,68,170,0.15)] rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[#000] dark:text-white" style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</p>
                      <p className="text-[#6B7280] dark:text-white/60" style={{ fontSize: 12 }}>Para: {personName(r.toId)} · {r.date} às {r.time}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full ${
                      r.status === "pendente" ? "bg-amber-100 text-amber-700" :
                      r.status === "aceita" ? "bg-emerald-100 text-emerald-700" :
                      "bg-red-100 text-red-700"
                    }`} style={{ fontSize: 10, fontWeight: 600 }}>{r.status}</span>
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
            <p className="text-[#6B7280] dark:text-white/60 mb-5" style={{ fontSize: 13 }}>Novo evento na agenda de {personName(selectedPerson)}</p>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["pessoal", "reuniao", "entrega"] as const).map((t) => {
                    const active = addForm.type === t;
                    const label = t === "pessoal" ? "Pessoal" : t === "reuniao" ? "Reunião" : "Entrega";
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAddForm({ ...addForm, type: t })}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          active
                            ? "bg-[#39228C] border-[#39228C] text-white"
                            : "border-[rgba(103,68,170,0.3)] text-[#000] dark:text-white"
                        }`}
                        style={{ fontSize: 13 }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Título</label>
                <input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} placeholder="Ex: Estudo de tipografia" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Data</label>
                  <input type="date" value={addForm.date} onChange={(e) => setAddForm({ ...addForm, date: e.target.value })} className="w-full px-3 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
                </div>
                <div>
                  <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Horário</label>
                  <input type="time" value={addForm.time} onChange={(e) => setAddForm({ ...addForm, time: e.target.value })} className="w-full px-3 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
                </div>
              </div>
              <button onClick={submitAdd} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">Adicionar evento</button>
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
            <p className="text-[#6B7280] dark:text-white/60 mb-5" style={{ fontSize: 13 }}>De: {personName(selectedPerson)}</p>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Para</label>
                <select value={reqForm.toId} onChange={(e) => setReqForm({ ...reqForm, toId: e.target.value })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white">
                  {people.filter((p) => p.id !== selectedPerson).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
                  ))}
                </select>
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
                <input value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })} placeholder="Ex: Alinhamento de paleta" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg bg-white dark:bg-[#1A1230] dark:text-white" />
              </div>
              <div>
                <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 13 }}>Mensagem (opcional)</label>
                <textarea value={reqForm.message} onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none bg-white dark:bg-[#1A1230] dark:text-white" />
              </div>
              <button onClick={submitRequest} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">Enviar Solicitação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}