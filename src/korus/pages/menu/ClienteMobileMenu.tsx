import { useNavigate } from "@/src/korus/router-adapter";
import { LayoutDashboard, FolderKanban, Calendar, User, LogOut, ChevronRight } from "lucide-react";
import { KorusLogo } from "../../components/KorusLogo";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/cliente" },
  { label: "Meus Projetos", icon: FolderKanban, href: "/cliente/projetos" },
  { label: "Agenda", icon: Calendar, href: "/cliente/agenda" },
  { label: "Meu Perfil", icon: User, href: "/cliente/perfil" },
];

export function ClienteMobileMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0C0819] flex flex-col">
      {/* Header */}
      <div className="relative px-6 pt-8 pb-6 border-b border-white/10">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <KorusLogo variant="light" size="lg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#39228C] to-[#6744AA] flex items-center justify-center text-white" style={{ fontSize: 16, fontWeight: 600 }}>
              TS
            </div>
            <div className="text-left">
              <p className="text-white" style={{ fontSize: 15, fontWeight: 600 }}>Tech Solutions</p>
              <p className="text-white/60" style={{ fontSize: 12 }}>Cliente</p>
            </div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39228C] via-[#6744AA] to-[#39228C]" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#39228C] transition-colors">
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</span>
                </div>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white/80 hover:bg-red-500/20 hover:text-red-400 transition-all"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
}