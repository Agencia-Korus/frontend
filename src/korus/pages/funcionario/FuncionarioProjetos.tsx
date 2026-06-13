import { useNavigate } from "@/src/korus/router-adapter";
import { useAuth } from "../../auth-context";
import { useKorusData } from "../../live-data";

export function FuncionarioProjetos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, tasks } = useKorusData();
  const currentUserId = String(user?.id || "2");
  const taskProjectIds = new Set(tasks.filter((t) => t.responsible === currentUserId).map((t) => t.projectId));
  const myProjects = projects.filter((p) => p.responsible.includes(currentUserId) || taskProjectIds.has(p.id));

  return (
    <div className="space-y-6">
      <h2 className="text-[#000]">Meus Projetos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myProjects.map((p) => {
          const myTasks = tasks.filter((t) => t.projectId === p.id && t.responsible === currentUserId);
          return (
            <div key={p.id} className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-hidden cursor-pointer hover:border-[#39228C]/40 transition-colors" onClick={() => navigate(`/funcionario/projetos/${p.id}`)}>
              <div className="h-2 bg-[#39228C]" style={{ width: `${p.progress}%` }} />
              <div className="p-5">
                <h4 style={{ fontSize: 15, fontWeight: 600 }} className="text-[#000] mb-2">{p.name}</h4>
                <span className="inline-block px-2 py-0.5 bg-[#39228C] text-white rounded mb-3" style={{ fontSize: 11, fontWeight: 500 }}>
                  {myTasks.length} tarefas suas
                </span>
                <div className="w-full bg-[#F3F4F6] rounded-full h-2 mb-1">
                  <div className="bg-[#39228C] h-2 rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
                <p className="text-[#6B7280]" style={{ fontSize: 13 }}>{p.progress}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}