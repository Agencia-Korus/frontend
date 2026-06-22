import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SupabaseImage } from "../components/SupabaseImage";
import { useKorusData } from "../live-data";

export function AcademyPage() {
  const [filter, setFilter] = useState<"Todos" | "E-book" | "Curso">("Todos");
  const { academyItems } = useKorusData();
  const filtered = filter === "Todos" ? academyItems : academyItems.filter((a) => a.type === filter);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="py-12 bg-white border-b border-[rgba(103,68,170,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h1 className="text-[#000]" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>Korus Academy</h1>
          <p className="text-[#6B7280] mt-2" style={{ fontSize: 16 }}>E-books, cursos e materiais digitais para sua evolução.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex gap-2 mb-8">
            {(["Todos", "E-book", "Curso"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg ${filter === f ? "bg-[#39228C] text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`} style={{ fontSize: 14 }}>
                {f === "Todos" ? "Todos" : f + "s"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((a) => (
              <div key={a.id} className="bg-white border border-[rgba(103,68,170,0.2)] rounded-xl overflow-hidden">
                <SupabaseImage src={a.image} alt={a.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-white mb-2 ${a.type === "E-book" ? "bg-[#39228C]" : "bg-[#6744AA]"}`} style={{ fontSize: 11, fontWeight: 500 }}>
                    {a.type}
                  </span>
                  <h4 className="text-[#000] mb-1" style={{ fontSize: 15, fontWeight: 600 }}>{a.title}</h4>
                  <p className="text-[#6B7280] mb-3" style={{ fontSize: 13, lineHeight: 1.5 }}>{a.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#39228C]" style={{ fontSize: 14, fontWeight: 600 }}>{a.price}</span>
                    {a.url ? (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors"
                        style={{ fontSize: 13 }}
                      >
                        {a.price === "Gratuito" ? "Acessar" : "Comprar"}
                      </a>
                    ) : (
                      <button
                        disabled
                        title="Link de compra não configurado"
                        className="px-3 py-1.5 bg-[#39228C]/40 text-white rounded-lg cursor-not-allowed"
                        style={{ fontSize: 13 }}
                      >
                        {a.price === "Gratuito" ? "Acessar" : "Comprar"}
                      </button>
                    )}
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