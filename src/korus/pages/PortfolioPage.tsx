import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { X } from "lucide-react";
import { SupabaseImage } from "../components/SupabaseImage";
import { useKorusData } from "../live-data";

const filters = ["Todos", "Identidade Visual", "Web", "Social Media", "Fotografia"];

export function PortfolioPage() {
  const [filter, setFilter] = useState("Todos");
  const { portfolioItems } = useKorusData();
  const [selected, setSelected] = useState<typeof portfolioItems[0] | null>(null);

  const filtered = filter === "Todos" ? portfolioItems : portfolioItems.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="py-12 bg-white border-b border-[rgba(103,68,170,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="text-[#6B7280] mb-2" style={{ fontSize: 13 }}>Home / Portfólio</p>
          <h2 className="text-[#000]">Portfólio</h2>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg transition-colors ${filter === f ? "bg-[#39228C] text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`} style={{ fontSize: 14 }}>
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div key={p.id} className="group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer" onClick={() => setSelected(p)}>
                <SupabaseImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#39228C]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <p style={{ fontSize: 18, fontWeight: 600 }}>{p.name}</p>
                  <p style={{ fontSize: 14 }} className="text-white/80">{p.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-[#6B7280] hover:text-[#000] z-10">
              <X size={24} />
            </button>
            <SupabaseImage src={selected.image} alt={selected.name} className="w-full h-64 object-cover rounded-t-2xl" />
            <div className="p-6">
              <h3 className="text-[#000] mb-2">{selected.name}</h3>
              <div className="flex gap-4 text-[#6B7280] mb-4" style={{ fontSize: 14 }}>
                <span>Cliente: {selected.client}</span>
                <span>Ano: {selected.year}</span>
                <span>{selected.category}</span>
              </div>
              <p className="text-[#6B7280]" style={{ fontSize: 14, lineHeight: 1.6 }}>
                Projeto desenvolvido pela Korus Agency com foco em qualidade, inovação e resultados mensuráveis para o cliente.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}