import { useState } from "react";
import { getStatusLabel, getStatusColor, getPriorityColor } from "../../data/mock";
import { Search, Download, X } from "lucide-react";
import { getAccessToken } from "../../api-client";
import { leadCsvUrl, useKorusData } from "../../live-data";

export function AdminLeads() {
  const { leads, updateLead } = useKorusData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selected, setSelected] = useState<typeof leads[0] | null>(null);

  const filtered = leads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCsv = async () => {
    const token = getAccessToken();
    const response = await fetch(leadCsvUrl(), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) return;
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "leads.csv";
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#000]">Gestão de Leads</h2>
          <p className="text-[#6B7280]" style={{ fontSize: 14 }}>Gerencie e acompanhe seus leads.</p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 border border-[#6744AA] text-[#6744AA] rounded-lg hover:bg-[#6744AA]/5" style={{ fontSize: 14 }}>
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar leads..." className="w-full pl-10 pr-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg focus:border-[#6744AA] focus:outline-none" style={{ fontSize: 14 }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" style={{ fontSize: 14 }}>
          <option value="todos">Todos os status</option>
          <option value="novo">Novo</option>
          <option value="em_contato">Em Contato</option>
          <option value="proposta_enviada">Proposta Enviada</option>
          <option value="convertido">Convertido</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB]">
              {["Nome", "E-mail", "Serviço", "Orçamento", "Data", "Status", "Prioridade"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#6B7280] whitespace-nowrap" style={{ fontSize: 12, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(103,68,170,0.1)]">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-[#F9FAFB] cursor-pointer" onClick={() => setSelected(l)}>
                <td className="px-4 py-3 text-[#000]" style={{ fontSize: 13 }}>{l.name}</td>
                <td className="px-4 py-3 text-[#6B7280]" style={{ fontSize: 13 }}>{l.email}</td>
                <td className="px-4 py-3 text-[#6B7280]" style={{ fontSize: 13 }}>{l.service}</td>
                <td className="px-4 py-3 text-[#6B7280]" style={{ fontSize: 13 }}>{l.budget}</td>
                <td className="px-4 py-3 text-[#6B7280]" style={{ fontSize: 13 }}>{l.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-white ${getStatusColor(l.status)}`} style={{ fontSize: 11 }}>{getStatusLabel(l.status)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded ${getPriorityColor(l.priority)}`} style={{ fontSize: 11 }} >{l.priority.charAt(0).toUpperCase() + l.priority.slice(1)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-[#6B7280]"><X size={20} /></button>
            <h3 className="text-[#000] mb-4">{selected.name}</h3>
            <div className="space-y-3 mb-6" style={{ fontSize: 14 }}>
              {[
                ["E-mail", selected.email], ["WhatsApp", selected.whatsapp], ["Serviço", selected.service],
                ["Orçamento", selected.budget], ["Data", selected.date],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[#6B7280]">{k}</span>
                  <span className="text-[#000]">{v}</span>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Alterar Status</label>
              <select value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value as typeof selected.status })} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" style={{ fontSize: 14 }}>
                <option value="novo">Novo</option>
                <option value="em_contato">Em Contato</option>
                <option value="proposta_enviada">Proposta Enviada</option>
                <option value="convertido">Convertido</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-[#000]" style={{ fontSize: 14 }}>Anotações internas</label>
              <textarea rows={3} className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg resize-none" style={{ fontSize: 14 }} placeholder="Adicionar anotações..." />
            </div>
            <button onClick={async () => { await updateLead(selected.id, { status: selected.status }); setSelected(null); }} className="w-full py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]">Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}