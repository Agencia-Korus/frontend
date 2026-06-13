import { useNavigate } from "@/src/korus/router-adapter";
import { LayoutDashboard, FolderKanban, Rss, Calendar, Zap, User, LogOut, ChevronRight } from "lucide-react";
import { KorusLogo } from "../../components/KorusLogo";
import { IMAGES } from "../../assets";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/funcionario" },
  { label: "Meus Projetos", icon: FolderKanban, href: "/funcionario/projetos" },
  { label: "Feed", icon: Rss, href: "/funcionario/feed" },
  { label: "Agenda", icon: Calendar, href: "/funcionario/agenda" },
  { label: "Meu XP", icon: Zap, href: "/funcionario/xp" },
  { label: "Perfil", icon: User, href: "/funcionario/perfil" },
];

export function FuncionarioMobileMenu() {
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
            <img
              src={IMAGES.woman}
              alt="Ana Lima"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6744AA]"
            />
            <div className="text-left">
              <p className="text-white" style={{ fontSize: 15, fontWeight: 600 }}>Ana Lima</p>
              <p className="text-white/60" style={{ fontSize: 12 }}>Designer • Nível 4</p>
            </div>
          </div>
          {/* XP Badge */}
          <div className="mt-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#F59E0B]/20 to-[#F59E0B]/10 border border-[#F59E0B]/30">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[#F59E0B]" />
              <span className="text-[#F59E0B]" style={{ fontSize: 12, fontWeight: 600 }}>1.240 XP</span>
            </div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39228C] via-[#6744AA] to-[#F59E0B]" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isXP = item.label === "Meu XP";
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isXP ? "bg-[#F59E0B]/20 text-[#F59E0B] group-hover:bg-[#F59E0B]" : "bg-white/5 group-hover:bg-[#6744AA]"
                  } group-hover:text-white`}>
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