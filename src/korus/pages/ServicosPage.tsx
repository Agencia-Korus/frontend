import { useState } from "react";
import { useNavigate } from "@/src/korus/router-adapter";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Palette, Share2, Globe, FileText, TrendingUp, Camera, CheckCircle } from "lucide-react";
import { useKorusData } from "../live-data";

const iconMap: Record<string, React.ReactNode> = {
  Palette: <Palette size={24} />, Share2: <Share2 size={24} />, Globe: <Globe size={24} />,
  FileText: <FileText size={24} />, TrendingUp: <TrendingUp size={24} />, Camera: <Camera size={24} />,
};

const categories = ["Todos", "Design", "Marketing Digital", "Conteúdo", "Web"];

export function ServicosPage() {
  const [filter, setFilter] = useState("Todos");
  const navigate = useNavigate();
  const { services } = useKorusData();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="py-12 bg-white border-b border-[rgba(103,68,170,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="text-[#6B7280] mb-2" style={{ fontSize: 13 }}>Home / Serviços</p>
          <h2 className="text-[#000]">Nossos Serviços</h2>
          <p className="text-[#6B7280] mt-2" style={{ fontSize: 16 }}>Soluções completas para sua marca crescer.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-lg transition-colors ${filter === c ? "bg-[#39228C] text-white" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#39228C]/10"}`}
                style={{ fontSize: 14 }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((s) => (
              <div key={s.id} className="p-6 bg-white border border-[rgba(103,68,170,0.2)] rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] shrink-0">
                    {iconMap[s.icon]}
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontSize: 18, fontWeight: 600 }} className="text-[#000] mb-2">{s.name}</h3>
                    <p className="text-[#6B7280] mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>{s.description}</p>
                    <ul className="space-y-1 mb-4">
                      {s.deliverables.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-[#000]" style={{ fontSize: 14 }}>
                          <CheckCircle size={14} className="text-[#39228C] shrink-0" /> {d}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate(`/solicitar/${s.slug}`)}
                      className="px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors"
                      style={{ fontSize: 14 }}
                    >
                      Solicitar este Serviço
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}