export function AdminConfiguracoes() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-[#000] dark:text-white">Configurações e Integrações</h2>

      {/* Integrações */}
      <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] p-6">
        <h3 className="text-[#000] dark:text-white mb-6" style={{ fontSize: 18, fontWeight: 600 }}>Integrações</h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[#000] dark:text-white" style={{ fontSize: 14, fontWeight: 500 }}>Google Analytics</label>
              <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded" style={{ fontSize: 11 }}>Conectado</span>
            </div>
            <input placeholder="GA4 Measurement ID (ex: G-XXXXXXXXXX)" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" style={{ fontSize: 14 }} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[#000] dark:text-white" style={{ fontSize: 14, fontWeight: 500 }}>Meta Pixel</label>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded" style={{ fontSize: 11 }}>Desconectado</span>
            </div>
            <input placeholder="Pixel ID" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" style={{ fontSize: 14 }} />
          </div>
          <button className="px-6 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>Salvar Integrações</button>
        </div>
      </div>

      {/* Notificações */}
      <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] p-6">
        <h3 className="text-[#000] dark:text-white mb-6" style={{ fontSize: 18, fontWeight: 600 }}>Notificações</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>E-mail para novos leads</label>
            <input defaultValue="contato@korusagencia.com.br" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" style={{ fontSize: 14 }} />
          </div>
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>WhatsApp</label>
            <input defaultValue="(61) 99999-0000" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" style={{ fontSize: 14 }} />
          </div>
          <button className="px-6 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>Salvar Notificações</button>
        </div>
      </div>

      {/* Sistema */}
      <div className="bg-white dark:bg-[#22262E] rounded-xl border border-[rgba(103,68,170,0.15)] p-6">
        <h3 className="text-[#000] dark:text-white mb-6" style={{ fontSize: 18, fontWeight: 600 }}>Sistema</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>Nome da agência</label>
            <input defaultValue="Korus Agency" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" style={{ fontSize: 14 }} />
          </div>
          <div>
            <label className="block mb-1 text-[#000] dark:text-white" style={{ fontSize: 14 }}>E-mail de contato público</label>
            <input defaultValue="contato@korusagencia.com.br" className="w-full px-4 py-2.5 border border-[rgba(103,68,170,0.3)] rounded-lg" style={{ fontSize: 14 }} />
          </div>
          <button className="px-6 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA]" style={{ fontSize: 14 }}>Salvar</button>
        </div>
      </div>

    </div>
  );
}