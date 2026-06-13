import { useState } from "react";
import { Link, useNavigate } from "@/src/korus/router-adapter";
import { Menu } from "lucide-react";
import { KorusLogo } from "./KorusLogo";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { label: "Academy", href: "/academy" },
  { label: "Serviços", href: "/servicos" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Contato", href: "/#contato" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-[#0F1115]/90 backdrop-blur-xl border-b border-[rgba(103,68,170,0.1)] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          <Link to="/" className="dark:[&_img]:brightness-150 dark:[&_img]:contrast-125">
            <KorusLogo variant="dark" size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link key={l.href} to={l.href} className="text-[#000] dark:text-[#E6E8EB] hover:text-[#39228C] dark:hover:text-[#A78BFA] transition-colors" style={{ fontSize: 15 }}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => navigate("/login")} className="px-4 py-2 border border-[#6744AA] dark:border-[#A78BFA] text-[#6744AA] dark:text-[#A78BFA] rounded-lg hover:bg-[#6744AA]/5 dark:hover:bg-[#A78BFA]/10 transition-colors" style={{ fontSize: 14 }}>
              Entrar
            </button>
            <button onClick={() => navigate("/solicitar/identidade-visual")} className="px-4 py-2 bg-[#39228C] dark:bg-[#6744AA] text-white rounded-lg hover:bg-[#6744AA] dark:hover:bg-[#8B6FD8] transition-colors" style={{ fontSize: 14 }}>
              Solicitar Orçamento
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="w-10 h-10 rounded-lg bg-[#F3F4F6] dark:bg-[#22262E] flex items-center justify-center text-[#39228C] dark:text-[#A78BFA] hover:bg-[#39228C]/10 dark:hover:bg-[#A78BFA]/10 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}