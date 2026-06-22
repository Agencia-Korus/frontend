import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "@/src/korus/router-adapter";
import { getStatusLabel, type Task } from "../data/mock";
import {
  Plus, MoreHorizontal, X, MessageSquare, Lock, Eye,
  Calendar, Edit3, Trash2, Send,
  AlertCircle, Clock,
} from "lucide-react";
import { useKorusData } from "../live-data";
import { apiGet, apiPost } from "../api-client";
import { useAuth } from "../auth-context";

interface KanbanProps {
  mode: "cliente" | "funcionario" | "admin";
  currentUserId?: string;
}

const columns = [
  { key: "a_fazer", label: "A Fazer" },
  { key: "em_andamento", label: "Em Andamento" },
  { key: "em_revisao", label: "Em Revisão" },
  { key: "concluido", label: "Concluído" },
] as const;

type TaskStatus = (typeof columns)[number]["key"];

const labelColors = [
  { name: "Urgente", color: "bg-red-500" },
  { name: "Design", color: "bg-blue-500" },
  { name: "Dev", color: "bg-green-500" },
  { name: "Review", color: "bg-yellow-500" },
  { name: "Marketing", color: "bg-purple-500" },
];

function getTaskLabels(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("design")) return [labelColors[1]];
  if (cat.includes("dev") || cat.includes("web")) return [labelColors[2]];
  if (cat.includes("marketing") || cat.includes("social")) return [labelColors[4]];
  return [labelColors[0], labelColors[1]];
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

type ApiComment = { id: number; tarefa_id: number; autor_id: number; conteudo: string; criado_em: string };

type TaskType = Omit<Task, "status"> & {
  status: TaskStatus;
  comments?: Comment[];
};

export function KanbanBoard({ mode, currentUserId = "2" }: KanbanProps) {
  const { id } = useParams();
  const { user } = useAuth();
  const { tasks, projects, users, updateTask, createTask, deleteTask: deleteRemoteTask } = useKorusData();
  const project = projects.find((p) => p.id === id);
  const [projectTasks, setProjectTasks] = useState<TaskType[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [addingCard, setAddingCard] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [colMenuOpen, setColMenuOpen] = useState<string | null>(null);
  const nextTaskId = useRef(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProjectTasks(
      tasks.filter((t) => t.projectId === id).map((t) => ({ ...t, comments: [] })),
    );
    nextTaskId.current = tasks.length + 1;
  }, [id, tasks]);

  const loadComments = useCallback(async (taskId: string) => {
    try {
      const remote = await apiGet<ApiComment[]>(`/tarefas/${taskId}/comentarios`, true);
      const comments: Comment[] = remote.map((c) => ({
        id: String(c.id),
        userId: String(c.autor_id),
        text: c.conteudo,
        timestamp: new Date(c.criado_em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      }));
      setProjectTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, comments } : t)));
      setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, comments } : prev));
    } catch {
      // Tarefas recém-criadas localmente ainda não existem na API.
    }
  }, []);

  const openTask = useCallback((task: TaskType) => {
    setSelectedTask(task);
    if (/^\d+$/.test(task.id)) void loadComments(task.id);
  }, [loadComments]);

  const canEdit = mode === "admin" || mode === "funcionario";
  const canDrag = (taskId: string) => {
    if (mode === "admin") return true;
    if (mode === "funcionario") {
      const task = projectTasks.find((t) => t.id === taskId);
      return task?.responsible === currentUserId;
    }
    return false;
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask) return;
    const task = projectTasks.find((t) => t.id === draggedTask);
    if (!task) return;
    if (task.status === status) { setDraggedTask(null); setDragOverCol(null); return; }

    setProjectTasks((prev) =>
      prev.map((t) => t.id === draggedTask ? { ...t, status } : t)
    );
    void updateTask(draggedTask, { status }).catch(() => undefined);
    if (selectedTask?.id === draggedTask) {
      setSelectedTask((prev) => prev ? { ...prev, status } : null);
    }
    const colLabel = columns.find(c => c.key === status)?.label || status;
    showToast(`Tarefa movida para "${colLabel}"`);
    if (status === "em_andamento" && mode === "funcionario") setTimeout(() => showToast("+10 XP ganhos!"), 1500);
    if (status === "concluido" && mode === "funcionario") setTimeout(() => showToast("+25 XP ganhos!"), 1500);
    setDraggedTask(null);
    setDragOverCol(null);
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedTask) return;
    const text = newComment.trim();
    const comment: Comment = {
      id: `c${Date.now()}`,
      userId: String(user?.id || currentUserId),
      text,
      timestamp: new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    const updated = {
      ...selectedTask,
      comments: [...(selectedTask.comments || []), comment],
    };
    setSelectedTask(updated);
    setProjectTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    setNewComment("");
    showToast("Comentário adicionado!");
    if (/^\d+$/.test(selectedTask.id)) {
      void apiPost(`/tarefas/${selectedTask.id}/comentarios`, { conteudo: text }, true)
        .then(() => loadComments(selectedTask.id))
        .catch(() => undefined);
    }
  };

  const assignResponsible = (taskId: string, responsible: string) => {
    setProjectTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, responsible } : t)));
    setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, responsible } : prev));
    void updateTask(taskId, { responsible }).catch(() => undefined);
  };

  const changeDueDate = (taskId: string, dueDate: string) => {
    setProjectTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, dueDate } : t)));
    setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, dueDate } : prev));
    void updateTask(taskId, { dueDate }).catch(() => undefined);
  };

  const saveTitle = () => {
    if (!editTitle.trim() || !selectedTask) return;
    const updated = { ...selectedTask, title: editTitle.trim() };
    setSelectedTask(updated);
    setProjectTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    void updateTask(updated.id, { title: updated.title }).catch(() => undefined);
    setEditingTitle(false);
  };

  const saveDesc = () => {
    if (!selectedTask) return;
    const updated = { ...selectedTask, description: editDesc.trim() };
    setSelectedTask(updated);
    setProjectTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    void updateTask(updated.id, { description: updated.description }).catch(() => undefined);
    setEditingDesc(false);
  };

  const deleteTask = (taskId: string) => {
    setProjectTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
    void deleteRemoteTask(taskId).catch(() => undefined);
    showToast("Tarefa removida!");
  };

  const changeStatus = (taskId: string, newStatus: TaskStatus) => {
    setProjectTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t)
    );
    void updateTask(taskId, { status: newStatus }).catch(() => undefined);
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => prev ? { ...prev, status: newStatus } : null);
    }
    const colLabel = columns.find(c => c.key === newStatus)?.label || newStatus;
    showToast(`Movido para "${colLabel}"`);
  };

  const addNewCard = (colKey: TaskStatus) => {
    if (!newCardTitle.trim()) return;
    const newTask: TaskType = {
      id: `t${nextTaskId.current++}`,
      projectId: id || "1",
      title: newCardTitle.trim(),
      description: "",
      status: colKey,
      priority: "media",
      category: "Geral",
      responsible: "",
      dueDate: "",
      comments: [],
    };
    setProjectTasks((prev) => [...prev, newTask]);
    void createTask(newTask).catch((err) => showToast(err instanceof Error ? err.message : "Erro ao salvar cartão."));
    setNewCardTitle("");
    setAddingCard(null);
    showToast("Cartão adicionado!");
  };

  if (!project) return <div className="text-[#6B7280] p-8">Projeto não encontrado</div>;

  const currentUser = users.find((u) => u.id === currentUserId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[#6B7280]" style={{ fontSize: 13 }}>Projetos &gt; {project.name}</p>
          <h2 className="text-[#000]">{project.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] rounded-lg">
            {mode === "cliente" && <><Lock size={14} className="text-[#6B7280]" /><span className="text-[#6B7280]" style={{ fontSize: 12 }}>Somente visualização e comentários</span></>}
            {mode === "funcionario" && <><Edit3 size={14} className="text-[#39228C]" /><span className="text-[#39228C]" style={{ fontSize: 12 }}>Edição permitida</span></>}
            {mode === "admin" && <><AlertCircle size={14} className="text-[#39228C]" /><span className="text-[#39228C]" style={{ fontSize: 12 }}>Acesso total</span></>}
          </div>
          <span className={`px-3 py-1 rounded text-white ${project.status === "em_andamento" ? "bg-blue-500" : project.status === "em_revisao" ? "bg-[#8B5CF6]" : "bg-gray-500"}`} style={{ fontSize: 12, fontWeight: 500 }}>
            {getStatusLabel(project.status)}
          </span>
          <span className="text-[#39228C]" style={{ fontSize: 14, fontWeight: 600 }}>{project.progress}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#F3F4F6] rounded-full h-2">
        <div className="bg-[#39228C] h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
      </div>

      {/* Trello-style Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4 items-start">
        {columns.map((col) => {
          const colTasks = projectTasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className={`min-w-[272px] w-[272px] flex-shrink-0 rounded-xl p-2 transition-colors ${
                dragOverCol === col.key ? "bg-[#DDD6FE]" : "bg-[#F1F2F4]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.key)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <div className="flex items-center gap-2">
                  <h4 style={{ fontSize: 14, fontWeight: 600 }} className="text-[#44546F]">{col.label}</h4>
                  <span className="bg-[#DFE1E6] text-[#44546F] px-1.5 rounded-full" style={{ fontSize: 11 }}>{colTasks.length}</span>
                </div>
                <div className="relative">
                  <button onClick={() => setColMenuOpen(colMenuOpen === col.key ? null : col.key)}>
                    <MoreHorizontal size={16} className="text-[#44546F] cursor-pointer hover:text-[#000]" />
                  </button>
                  {colMenuOpen === col.key && canEdit && (
                    <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-[#E0E0E0] z-10 w-48 py-1">
                      <button className="w-full text-left px-3 py-2 hover:bg-[#F1F2F4] text-[#1D2125]" style={{ fontSize: 13 }} onClick={() => { setAddingCard(col.key); setColMenuOpen(null); }}>
                        Adicionar cartão
                      </button>
                      <button className="w-full text-left px-3 py-2 hover:bg-[#F1F2F4] text-[#1D2125]" style={{ fontSize: 13 }} onClick={() => setColMenuOpen(null)}>
                        Ordenar por data
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {colTasks.map((task) => {
                  const draggable = canDrag(task.id);
                  const user = users.find((u) => u.id === task.responsible);
                  const labels = getTaskLabels(task.category);
                  const commentCount = task.comments?.length || 0;
                  return (
                    <div
                      key={task.id}
                      draggable={draggable}
                      onDragStart={() => setDraggedTask(task.id)}
                      onDragEnd={() => { setDraggedTask(null); setDragOverCol(null); }}
                      onClick={() => openTask(task)}
                      className={`bg-white rounded-lg shadow-sm border border-[#E0E0E0] cursor-pointer hover:border-[#39228C]/40 hover:shadow-md transition-all ${
                        draggedTask === task.id ? "opacity-40 rotate-1 scale-105" : ""
                      } ${!draggable && mode === "cliente" ? "cursor-default" : ""}`}
                    >
                      {/* Color labels bar */}
                      <div className="flex gap-1 px-3 pt-2">
                        {labels.map((l, i) => (
                          <div key={i} className={`h-2 w-10 rounded-full ${l.color}`} />
                        ))}
                      </div>

                      <div className="px-3 py-2">
                        <p style={{ fontSize: 14 }} className="text-[#1D2125] mb-2">{task.title}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            {mode === "cliente" && <Lock size={11} className="text-[#9CA3AF]" />}
                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-[#626F86] bg-[#F1F2F4] px-1.5 py-0.5 rounded" style={{ fontSize: 11 }}>
                                <Calendar size={10} />
                                {task.dueDate}
                              </span>
                            )}
                            {commentCount > 0 && (
                              <span className="flex items-center gap-0.5 text-[#626F86]" style={{ fontSize: 11 }}>
                                <MessageSquare size={10} /> {commentCount}
                              </span>
                            )}
                          </div>
                          {user && (
                            <div className="w-6 h-6 rounded-full bg-[#39228C] flex items-center justify-center text-white" style={{ fontSize: 10, fontWeight: 600 }}>
                              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add card area */}
              {addingCard === col.key && canEdit ? (
                <div className="mt-2">
                  <textarea
                    autoFocus
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNewCard(col.key); } }}
                    placeholder="Insira um título para este cartão..."
                    className="w-full p-2 rounded-lg border border-[#E0E0E0] bg-white resize-none text-[#1D2125]"
                    style={{ fontSize: 14 }}
                    rows={2}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => addNewCard(col.key)} className="px-3 py-1.5 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors" style={{ fontSize: 13 }}>
                      Adicionar cartão
                    </button>
                    <button onClick={() => { setAddingCard(null); setNewCardTitle(""); }} className="p-1.5 hover:bg-[#D6D9DE] rounded">
                      <X size={16} className="text-[#44546F]" />
                    </button>
                  </div>
                </div>
              ) : canEdit ? (
                <button onClick={() => setAddingCard(col.key)} className="flex items-center gap-1 w-full px-2 py-1.5 mt-1 rounded-lg text-[#44546F] hover:bg-[#D6D9DE] transition-colors" style={{ fontSize: 14 }}>
                  <Plus size={16} /> Adicionar um cartão
                </button>
              ) : null}
            </div>
          );
        })}

        {/* Add list button - only for admin/funcionario */}
        {canEdit && (
          <div className="min-w-[272px] w-[272px] flex-shrink-0">
            <button className="flex items-center gap-1 w-full px-3 py-2.5 rounded-xl bg-white/60 hover:bg-white/80 text-[#44546F] transition-colors" style={{ fontSize: 14 }}>
              <Plus size={16} /> Adicionar outra lista
            </button>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (() => {
        const assignedUser = users.find((u) => u.id === selectedTask.responsible);
        const labels = getTaskLabels(selectedTask.category);
        const colLabel = columns.find(c => c.key === selectedTask.status)?.label || "";
        // Opções de responsável: equipe alocada no projeto (quando conhecida) ou todos os funcionários.
        const teamMembers = users.filter((u) => project.responsible.includes(u.id));
        const funcionarios = users.filter((u) => u.role === "funcionario" || u.role === "admin");
        const responsibleOptions = (teamMembers.length ? teamMembers : funcionarios);
        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
            <div className="absolute inset-0 bg-black/60" onClick={() => { setSelectedTask(null); setEditingTitle(false); setEditingDesc(false); }} />
            <div className="relative bg-[#F1F2F4] rounded-2xl max-w-3xl w-full mb-8">
              {/* Modal Header */}
              <div className="p-5 pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-[#44546F] text-white px-2 py-0.5 rounded" style={{ fontSize: 12 }}>
                        {colLabel}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-white ${
                        selectedTask.priority === "alta" ? "bg-red-500" : selectedTask.priority === "media" ? "bg-yellow-500" : "bg-green-500"
                      }`} style={{ fontSize: 11 }}>
                        {selectedTask.priority === "alta" ? "Alta" : selectedTask.priority === "media" ? "Média" : "Baixa"}
                      </span>
                    </div>
                    {editingTitle && canEdit ? (
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                        className="w-full text-[#1D2125] bg-white border border-[#39228C] rounded-lg px-2 py-1"
                        style={{ fontSize: 20, fontWeight: 600 }}
                      />
                    ) : (
                      <h3
                        className={`text-[#1D2125] ${canEdit ? "cursor-pointer hover:bg-white/60 rounded px-1 -mx-1" : ""}`}
                        style={{ fontSize: 20, fontWeight: 600 }}
                        onClick={() => { if (canEdit) { setEditingTitle(true); setEditTitle(selectedTask.title); } }}
                      >
                        {selectedTask.title}
                      </h3>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-[#D6D9DE] rounded"><Eye size={18} className="text-[#44546F]" /></button>
                    <button className="p-1.5 hover:bg-[#D6D9DE] rounded" onClick={() => { setSelectedTask(null); setEditingTitle(false); setEditingDesc(false); }}>
                      <X size={18} className="text-[#44546F]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 p-5">
                {/* Left side */}
                <div className="space-y-5">
                  {/* Members, Labels, Due date row */}
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <span className="text-[#44546F] block mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Responsável</span>
                      {canEdit ? (
                        <select
                          value={selectedTask.responsible}
                          onChange={(e) => assignResponsible(selectedTask.id, e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-[#C1C7D0] bg-white text-[#1D2125]"
                          style={{ fontSize: 13 }}
                        >
                          <option value="">Não atribuído</option>
                          {responsibleOptions.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="flex items-center gap-2 text-[#1D2125]" style={{ fontSize: 13 }}>
                          {assignedUser ? (
                            <>
                              <span className="w-7 h-7 rounded-full bg-[#39228C] flex items-center justify-center text-white" style={{ fontSize: 11, fontWeight: 600 }}>
                                {assignedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </span>
                              {assignedUser.name}
                            </>
                          ) : "Não atribuído"}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[#44546F] block mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Etiquetas</span>
                      <div className="flex items-center gap-1">
                        {labels.map((l, i) => (
                          <span key={i} className={`${l.color} text-white px-3 py-0.5 rounded`} style={{ fontSize: 12 }}>{l.name}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#44546F] block mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Data Entrega</span>
                      {canEdit ? (
                        <input
                          type="date"
                          value={selectedTask.dueDate}
                          onChange={(e) => changeDueDate(selectedTask.id, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-[#C1C7D0] bg-white text-[#1D2125]"
                          style={{ fontSize: 13 }}
                        />
                      ) : (
                        <span className="flex items-center gap-1 bg-[#E2E4EA] px-2 py-1 rounded text-[#1D2125]" style={{ fontSize: 13 }}>
                          <Clock size={12} /> {selectedTask.dueDate || "Sem data"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-[#1D2125] mb-2 flex items-center gap-2" style={{ fontSize: 16, fontWeight: 600 }}>
                      Descrição
                      {canEdit && !editingDesc && (
                        <button onClick={() => { setEditingDesc(true); setEditDesc(selectedTask.description || ""); }} className="text-[#44546F] hover:text-[#1D2125]">
                          <Edit3 size={14} />
                        </button>
                      )}
                    </h4>
                    {editingDesc && canEdit ? (
                      <div>
                        <textarea
                          autoFocus
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full p-3 rounded-lg border border-[#39228C] bg-white text-[#1D2125] resize-none"
                          style={{ fontSize: 14 }}
                          rows={4}
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={saveDesc} className="px-3 py-1.5 bg-[#39228C] text-white rounded-lg" style={{ fontSize: 13 }}>Salvar</button>
                          <button onClick={() => setEditingDesc(false)} className="px-3 py-1.5 bg-[#E2E4EA] text-[#44546F] rounded-lg" style={{ fontSize: 13 }}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`bg-white rounded-lg p-3 min-h-[60px] text-[#626F86] border border-[#E0E0E0] ${canEdit ? "cursor-pointer hover:bg-[#FAFBFC]" : ""}`}
                        style={{ fontSize: 14, lineHeight: 1.6 }}
                        onClick={() => { if (canEdit) { setEditingDesc(true); setEditDesc(selectedTask.description || ""); } }}
                      >
                        {selectedTask.description || (canEdit ? "Clique para adicionar uma descrição..." : "Sem descrição.")}
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="text-[#1D2125] mb-3 flex items-center gap-2" style={{ fontSize: 16, fontWeight: 600 }}>
                      <MessageSquare size={18} /> Atividade
                    </h4>

                    {/* Comment input - ALL roles can comment */}
                    <div className="flex gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#39228C] flex-shrink-0 flex items-center justify-center text-white" style={{ fontSize: 10, fontWeight: 600 }}>
                        {currentUser?.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "VC"}
                      </div>
                      <div className="flex-1">
                        <input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
                          placeholder="Escreva um comentário..."
                          className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1D2125] focus:border-[#39228C] focus:outline-none"
                          style={{ fontSize: 13 }}
                        />
                        {newComment.trim() && (
                          <button onClick={addComment} className="mt-1.5 px-3 py-1.5 bg-[#39228C] text-white rounded-lg flex items-center gap-1" style={{ fontSize: 12 }}>
                            <Send size={12} /> Enviar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-3">
                      {(selectedTask.comments || []).slice().reverse().map((c) => {
                        const commentUser = users.find((u) => u.id === c.userId);
                        return (
                          <div key={c.id} className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#6744AA] flex-shrink-0 flex items-center justify-center text-white" style={{ fontSize: 10 }}>
                              {commentUser?.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "??"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[#1D2125]" style={{ fontSize: 13, fontWeight: 600 }}>{commentUser?.name || "Usuário"}</span>
                                <span className="text-[#626F86]" style={{ fontSize: 11 }}>{c.timestamp}</span>
                              </div>
                              <div className="bg-white rounded-lg p-2 mt-1 border border-[#E0E0E0]">
                                <p className="text-[#1D2125]" style={{ fontSize: 13 }}>{c.text}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right sidebar - actions */}
                <div className="space-y-2">
                  <span className="text-[#44546F] block mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Ações</span>

                  {/* Move card - for admin and funcionario */}
                  {canEdit && (
                    <>
                      <div className="border-t border-[#D6D9DE] my-2" />
                      <span className="text-[#44546F] block mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Mover para</span>
                      {columns.filter(c => c.key !== selectedTask.status).map((c) => (
                        <button
                          key={c.key}
                          onClick={() => changeStatus(selectedTask.id, c.key)}
                          className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-[#D6D9DE] rounded text-[#44546F] transition-colors"
                          style={{ fontSize: 12 }}
                        >
                          → {c.label}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Delete - admin only */}
                  {mode === "admin" && (
                    <>
                      <div className="border-t border-[#D6D9DE] my-2" />
                      <button
                        onClick={() => deleteTask(selectedTask.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-red-50 hover:bg-red-100 rounded text-red-600 transition-colors"
                        style={{ fontSize: 13 }}
                      >
                        <Trash2 size={14} /> Excluir cartão
                      </button>
                    </>
                  )}

                  {/* Info for cliente */}
                  {mode === "cliente" && (
                    <div className="bg-[#FEF3C7] p-3 rounded-lg mt-3">
                      <p className="text-[#92400E] flex items-start gap-2" style={{ fontSize: 12 }}>
                        <Lock size={14} className="flex-shrink-0 mt-0.5" />
                        Você pode visualizar e comentar. Para alterações, entre em contato com a equipe.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#39228C] text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4" style={{ fontSize: 14, fontWeight: 500 }}>
          {toast}
        </div>
      )}
    </div>
  );
}