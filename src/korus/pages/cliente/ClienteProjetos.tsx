import { useNavigate } from "@/src/korus/router-adapter";
import { useAuth } from "../../auth-context";
import { useKorusData } from "../../live-data";

export function ClienteProjetos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useKorusData();
  const currentUserId = String(user?.id || "5");
  const clientProjects = projects.filter((p) => p.clientId === currentUserId);

  return (
    <div className="space-y-6">
      <h2 className="text-[#000]">Meus Projetos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientProjects.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-hidden cursor-pointer hover:border-[#39228C]/40 transition-colors" onClick={() => navigate(`/cliente/projetos/${p.id}`)}>
            <div className="h-2 bg-[#39228C]" style={{ width: `${p.progress}%` }} />
            <div className="p-5">
              <h4 style={{ fontSize: 15, fontWeight: 600 }} className="text-[#000] mb-2">{p.name}</h4>
              <span className={`inline-block px-2 py-0.5 rounded text-white mb-3 ${p.status === "em_andamento" ? "bg-blue-500" : p.status === "em_revisao" ? "bg-[#8B5CF6]" : "bg-gray-500"}`} style={{ fontSize: 11, fontWeight: 500 }}>
                {p.status === "em_andamento" ? "Em Andamento" : p.status === "em_revisao" ? "Em Revisão" : "A Fazer"}
              </span>
              <div className="flex justify-between text-[#6B7280]" style={{ fontSize: 13 }}>
                <span>Início: {p.startDate}</span>
                <span>{p.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}