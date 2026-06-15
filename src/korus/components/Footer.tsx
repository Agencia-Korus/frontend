import { Link } from "@/src/korus/router-adapter";
import { KorusLogo } from "./KorusLogo";

export function Footer() {
  return (
    <footer className="bg-[#0C0819] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <KorusLogo variant="light" size="sm" />
            <p className="mt-4 text-white/60" style={{ fontSize: 14 }}>
              Transformamos sua comunicação em resultado. Agência de marketing e design focada em performance.
            </p>
          </div>
          <div>
            <h4 className="text-white mb-4" style={{ fontSize: 14, fontWeight: 600 }}>Institucional</h4>
            <ul className="space-y-2 text-white/60" style={{ fontSize: 14 }}>
              <li><Link to="/#sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              <li><Link to="/#metodologia" className="hover:text-white transition-colors">Metodologia</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors">Portfólio</Link></li>
              <li><Link to="/academy" className="hover:text-white transition-colors">Academy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white mb-4" style={{ fontSize: 14, fontWeight: 600 }}>Serviços</h4>
            <ul className="space-y-2 text-white/60" style={{ fontSize: 14 }}>
              <li>Identidade Visual</li>
              <li>Gestão de Redes Sociais</li>
              <li>Desenvolvimento Web</li>
              <li>Tráfego Pago</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white mb-4" style={{ fontSize: 14, fontWeight: 600 }}>Contato</h4>
            <ul className="space-y-2 text-white/60" style={{ fontSize: 14 }}>
              <li>contato@korusagencia.com.br</li>
              <li>(61) 99999-0000</li>
              <li>Brasília, DF</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-white/40" style={{ fontSize: 13 }}>
          <span>&copy; 2026 Korus Agency. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="#" className="hover:text-white transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}