import { useEffect } from "react";
import { useNavigate, useLocation } from "@/src/korus/router-adapter";
import { X, Home, Briefcase, FolderOpen, BookOpen, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { KorusLogo } from "./KorusLogo";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "Início", href: "/", icon: Home },
  { label: "Serviços", href: "/servicos", icon: Briefcase },
  { label: "Portfólio", href: "/portfolio", icon: FolderOpen },
  { label: "Academy", href: "/academy", icon: BookOpen },
];

const authItems = [
  { label: "Login", href: "/login", icon: LogIn },
  { label: "Cadastro", href: "/cadastro", icon: UserPlus },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavigate = (href: string) => {
    navigate(href);
    onClose();
  };

  const handleSectionClick = (section: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    onClose();
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-white z-50 shadow-2xl overflow-y-auto"
          >
            <div className="relative h-full flex flex-col">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#39228C] to-[#6744AA] p-6 pb-8">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>

                <div className="mt-4">
                  <div className="mb-3">
                    <KorusLogo variant="light" size="md" />
                  </div>
                  <p className="text-white/90" style={{ fontSize: 14 }}>
                    Agência de Marketing & Design
                  </p>
                </div>

              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6">
                <div className="space-y-1">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <motion.button
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleNavigate(item.href)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                          active
                            ? "bg-[#39228C]/10 text-[#39228C]"
                            : "text-[#000] hover:bg-[#F9FAFB]"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                            active ? "bg-[#39228C] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <span style={{ fontSize: 15, fontWeight: active ? 600 : 500 }}>
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Sections */}
                <div className="mt-6 pt-6 border-t border-[rgba(103,68,170,0.15)]">
                  <p className="px-4 mb-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Navegação Rápida
                  </p>
                  <div className="space-y-1">
                    {["sobre", "metodologia", "contato"].map((section, index) => (
                      <motion.button
                        key={section}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (menuItems.length + index) * 0.05 }}
                        onClick={() => handleSectionClick(section)}
                        className="w-full text-left px-4 py-2.5 text-[#000] hover:bg-[#F9FAFB] rounded-lg transition-colors"
                        style={{ fontSize: 14, fontWeight: 500 }}
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </nav>

              {/* Auth Buttons */}
              <div className="p-4 border-t border-[rgba(103,68,170,0.15)] bg-[#F9FAFB]">
                <div className="space-y-2">
                  {authItems.map((item, index) => {
                    const Icon = item.icon;
                    const isPrimary = item.label === "Cadastro";
                    return (
                      <motion.button
                        key={item.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        onClick={() => handleNavigate(item.href)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                          isPrimary
                            ? "bg-[#39228C] text-white hover:bg-[#6744AA] shadow-lg shadow-[#39228C]/20"
                            : "bg-white text-[#39228C] border border-[#39228C]/30 hover:bg-[#39228C]/5"
                        }`}
                        style={{ fontSize: 14, fontWeight: 600 }}
                      >
                        <Icon size={16} />
                        {item.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}