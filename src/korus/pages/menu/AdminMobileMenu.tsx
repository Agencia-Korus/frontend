import { useNavigate } from "@/src/korus/router-adapter";
import {
  LayoutDashboard, Users, Target, FolderKanban, Palette, Image,
  BookOpen, MessageSquare, Calendar, Settings, User, LogOut, ChevronRight
} from "lucide-react";
import { KorusLogo } from "../../components/KorusLogo";
import { IMAGES } from "../../assets";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Usuários", icon: Users, href: "/admin/usuarios" },
  { label: "Leads", icon: Target, href: "/admin/leads" },
  { label: "Projetos", icon: FolderKanban, href: "/admin/projetos" },
  { label: "Serviços", icon: Palette, href: "/admin/servicos" },
  { label: "Portfólio", icon: Image, href: "/admin/portfolio" },
  { label: "Academy", icon: BookOpen, href: "/admin/academy" },
  { label: "Feed", icon: MessageSquare, href: "/admin/feed" },
  { label: "Agenda", icon: Calendar, href: "/admin/agenda" },
  { label: "Configurações", icon: Settings, href: "/admin/configuracoes" },
  { label: "Perfil", icon: User, href: "/admin/perfil" },
];

export function AdminMobileMenu() {
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
              src={IMAGES.man}
              alt="Carlos Mendes"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#39228C]"
            />
            <div className="text-left">
              <p className="text-white" style={{ fontSize: 15, fontWeight: 600 }}>Carlos Mendes</p>
              <p className="text-white/60" style={{ fontSize: 12 }}>Administrador</p>
            </div>
          </div>
          {/* Admin Badge */}
          <div className="mt-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#39228C] to-[#6744AA]">
            <span className="text-white" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Acesso Total
            </span>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39228C] via-[#6744AA] to-[#39228C]" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isConfig = item.label === "Configurações";
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isConfig ? "bg-white/10" : "bg-white/5"
                  } group-hover:bg-[#39228C]`}>
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