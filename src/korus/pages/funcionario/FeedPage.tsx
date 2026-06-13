import { useState } from "react";
import { X } from "lucide-react";
import { useKorusData } from "../../live-data";

export function FeedPage() {
  const { announcements } = useKorusData();
  const [selected, setSelected] = useState<typeof announcements[0] | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-[#000]">Feed de Comunicados</h2>
      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white p-5 rounded-xl border border-[rgba(103,68,170,0.15)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#39228C] flex items-center justify-center text-white" style={{ fontSize: 14, fontWeight: 600 }}>
                {a.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {!a.read && <div className="w-2 h-2 rounded-full bg-[#39228C]" />}
                  <h4 style={{ fontSize: 15, fontWeight: 600 }} className="text-[#000]">{a.title}</h4>
                </div>
                <p className="text-[#6B7280]" style={{ fontSize: 12 }}>{a.author} · {a.date}</p>
              </div>
            </div>
            <p className="text-[#6B7280] mb-3" style={{ fontSize: 14, lineHeight: 1.6 }}>{a.content.substring(0, 120)}...</p>
            <button onClick={() => setSelected(a)} className="text-[#39228C]" style={{ fontSize: 14, fontWeight: 500 }}>Ler mais</button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] mb-2">{selected.title}</h3>
            <p className="text-[#6B7280] mb-4" style={{ fontSize: 12 }}>{selected.author} · {selected.date}</p>
            <p className="text-[#000]" style={{ fontSize: 14, lineHeight: 1.6 }}>{selected.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}