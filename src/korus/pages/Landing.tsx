import { useEffect } from "react";
import { useLocation, useNavigate } from "@/src/korus/router-adapter";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { IMAGES } from "../assets";
import { Palette, Share2, Globe, FileText, TrendingUp, Camera, Star, ArrowRight, CheckCircle, Mail, Phone, MapPin, Kanban, Users, Trophy } from "lucide-react";
import { SupabaseImage } from "../components/SupabaseImage";
import { useKorusData } from "../live-data";

const iconMap: Record<string, React.ReactNode> = {
  Palette: <Palette size={24} />, Share2: <Share2 size={24} />, Globe: <Globe size={24} />,
  FileText: <FileText size={24} />, TrendingUp: <TrendingUp size={24} />, Camera: <Camera size={24} />,
};

const stats = [
  { value: "120+", label: "Projetos" },
  { value: "98%", label: "Satisfação" },
  { value: "5", label: "Anos no Mercado" },
];

const steps = [
  { num: "01", title: "Diagnóstico", desc: "Analisamos seu negócio, mercado e concorrência para entender suas necessidades." },
  { num: "02", title: "Planejamento", desc: "Traçamos estratégias e cronogramas personalizados para seus objetivos." },
  { num: "03", title: "Execução", desc: "Nossa equipe coloca o plano em ação com qualidade e agilidade." },
  { num: "04", title: "Resultados", desc: "Mensuramos, otimizamos e entregamos resultados reais." },
];

const testimonials = [
  { name: "Marcos Silva", company: "Tech Solutions", text: "A Korus transformou completamente nossa identidade visual. O resultado superou todas as expectativas!", avatar: IMAGES.man },
  { name: "Ana Ferreira", company: "Sabor & Arte", text: "Profissionais incríveis! O site ficou moderno e nosso faturamento online cresceu 40%.", avatar: IMAGES.woman },
  { name: "Roberto Alves", company: "Consultoria RV", text: "A gestão de redes sociais da Korus dobrou nosso engajamento em apenas 3 meses.", avatar: IMAGES.man },
];

export function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { services, portfolioItems, academyItems } = useKorusData();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#F9FAFB] min-h-[calc(100vh-4rem)] flex flex-col py-12 sm:py-16">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 border border-[#39228C] text-[#39228C] rounded-full mb-6" style={{ fontSize: 13, fontWeight: 500 }}>
              Agência de Marketing & Design
            </span>
            <h1 className="text-[#000] mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              Transformamos sua comunicação em resultado.
            </h1>
            <p className="text-[#6B7280] mb-8 max-w-lg" style={{ fontSize: 16, lineHeight: 1.6 }}>
              Estratégia, design e tecnologia para elevar sua marca ao próximo nível. Conheça a Korus Agency.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/solicitar/identidade-visual")} className="px-6 py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors">
                Solicitar Orçamento
              </button>
              <button onClick={() => navigate("/portfolio")} className="px-6 py-3 border border-[#6744AA] text-[#6744AA] rounded-lg hover:bg-[#6744AA]/5 transition-colors">
                Ver Portfólio
              </button>
            </div>
          </div>
          <div className="flex-1 max-w-md lg:max-w-lg">
            <SupabaseImage src={IMAGES.agency} alt="Agência Korus" className="rounded-2xl shadow-lg shadow-[#39228C]/10 w-full" />
          </div>
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-10">
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-[rgba(103,68,170,0.15)]">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-[#39228C]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 700 }}>{s.value}</p>
                <p className="text-[#6B7280]" style={{ fontSize: 14 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-center text-[#000] mb-4">O que fazemos</h2>
          <p className="text-center text-[#6B7280] mb-12 max-w-2xl mx-auto" style={{ fontSize: 16 }}>
            Oferecemos soluções completas de marketing e design para impulsionar sua marca.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/solicitar/${s.slug}`)}
                className="text-left p-6 bg-white border border-[rgba(103,68,170,0.2)] rounded-xl hover:border-[#39228C]/40 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] mb-4">
                  {iconMap[s.icon]}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600 }} className="text-[#000] mb-2">{s.name}</h3>
                <p className="text-[#6B7280] mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>{s.description}</p>
                <span className="text-[#39228C] inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ fontSize: 14, fontWeight: 500 }}>
                  Solicitar este serviço <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Metodologia */}
      <section id="metodologia" className="py-16 sm:py-24 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-center text-[#000] mb-12">Nossa Metodologia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                <span className="text-[#39228C]/15" style={{ fontSize: 64, fontWeight: 700, lineHeight: 1 }}>{s.num}</span>
                <h3 style={{ fontSize: 18, fontWeight: 600 }} className="text-[#000] mt-2 mb-2">{s.title}</h3>
                <p className="text-[#6B7280]" style={{ fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
                {i < 3 && <div className="hidden lg:block absolute top-8 right-0 w-8 h-0.5 bg-[#39228C]/20 translate-x-full" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfólio Preview */}
      <section className="py-16 sm:py-24 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[#000] mb-4">Nosso Portfólio</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto" style={{ fontSize: 16 }}>
              Conheça alguns dos projetos que transformaram a comunicação de nossos clientes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {portfolioItems.filter(p => p.featured).map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-hidden group hover:border-[#39228C]/40 transition-all hover:shadow-lg">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <SupabaseImage src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-[#39228C] text-white rounded" style={{ fontSize: 11, fontWeight: 500 }}>
                      {p.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 style={{ fontSize: 16, fontWeight: 600 }} className="text-[#000] flex-1">{p.name}</h3>
                    <span className="text-[#6B7280] ml-2" style={{ fontSize: 12 }}>{p.year}</span>
                  </div>
                  <p className="text-[#6B7280] mb-3" style={{ fontSize: 13, lineHeight: 1.5 }}>{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-[#39228C]/10 text-[#39228C] rounded" style={{ fontSize: 11 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {portfolioItems.filter(p => !p.featured).map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-hidden group hover:border-[#39228C]/40 transition-all hover:shadow-lg">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <SupabaseImage src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <h3 style={{ fontSize: 14, fontWeight: 600 }} className="text-[#000] mb-1">{p.name}</h3>
                  <p className="text-[#6B7280]" style={{ fontSize: 12 }}>{p.category} • {p.year}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => navigate("/portfolio")} className="px-6 py-3 border border-[#6744AA] text-[#6744AA] rounded-lg hover:bg-[#6744AA]/5 transition-colors">
              Ver Portfólio Completo
            </button>
          </div>
        </div>
      </section>

      {/* Academy */}
      <section className="py-16 sm:py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-[#000] mb-4">Korus Academy</h2>
              <p className="text-[#6B7280] mb-6" style={{ fontSize: 16, lineHeight: 1.6 }}>
                E-books, cursos e materiais digitais para você dominar o marketing e o design. Acesse conteúdos exclusivos da nossa equipe.
              </p>
              <button onClick={() => navigate("/academy")} className="px-6 py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors">
                Explorar Academy
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {academyItems.slice(0, 2).map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-[rgba(103,68,170,0.2)] overflow-hidden">
                  <SupabaseImage src={a.image} alt={a.title} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-white mb-2 ${a.type === "E-book" ? "bg-[#39228C]" : "bg-[#6744AA]"}`} style={{ fontSize: 11, fontWeight: 500 }}>
                      {a.type}
                    </span>
                    <p style={{ fontSize: 14, fontWeight: 600 }} className="text-[#000]">{a.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plataforma Integrada */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[#000] mb-4">Plataforma Completa para Gestão de Projetos</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto" style={{ fontSize: 16 }}>
              Acompanhe seus projetos em tempo real através da nossa plataforma digital integrada.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[rgba(103,68,170,0.2)] rounded-xl p-6 hover:border-[#39228C]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] mb-4">
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }} className="text-[#000] mb-2">Formulários Inteligentes</h3>
              <p className="text-[#6B7280]" style={{ fontSize: 13, lineHeight: 1.6 }}>
                Solicite orçamentos online com formulários segmentados por serviço.
              </p>
            </div>
            <div className="bg-white border border-[rgba(103,68,170,0.2)] rounded-xl p-6 hover:border-[#39228C]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] mb-4">
                <Kanban size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }} className="text-[#000] mb-2">Quadro Kanban</h3>
              <p className="text-[#6B7280]" style={{ fontSize: 13, lineHeight: 1.6 }}>
                Acompanhe o progresso do seu projeto em tempo real com nosso sistema visual.
              </p>
            </div>
            <div className="bg-white border border-[rgba(103,68,170,0.2)] rounded-xl p-6 hover:border-[#39228C]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] mb-4">
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }} className="text-[#000] mb-2">Gestão de Equipe</h3>
              <p className="text-[#6B7280]" style={{ fontSize: 13, lineHeight: 1.6 }}>
                Permissões específicas para clientes, funcionários e administradores.
              </p>
            </div>
            <div className="bg-white border border-[rgba(103,68,170,0.2)] rounded-xl p-6 hover:border-[#39228C]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] mb-4">
                <Trophy size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }} className="text-[#000] mb-2">Gamificação</h3>
              <p className="text-[#6B7280]" style={{ fontSize: 13, lineHeight: 1.6 }}>
                Sistema de XP e conquistas para motivar a equipe e acompanhar evolução.
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button onClick={() => navigate("/login")} className="px-6 py-3 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors">
              Acessar Plataforma
            </button>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 sm:py-24 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-center text-[#000] mb-12">O que nossos clientes dizem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white p-6 rounded-xl border border-[rgba(103,68,170,0.15)]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-[#F59E0B] text-[#F59E0B]" />)}
                </div>
                <p className="text-[#000] mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }} className="text-[#000]">{t.name}</p>
                    <p style={{ fontSize: 12 }} className="text-[#6B7280]">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-[#39228C]">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-white mb-4" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>Pronto para elevar sua marca?</h2>
          <p className="text-white/70 mb-8" style={{ fontSize: 16 }}>Entre em contato conosco e descubra como podemos transformar sua comunicação.</p>
          <button onClick={() => navigate("/solicitar/identidade-visual")} className="px-8 py-3 bg-white text-[#39228C] rounded-lg hover:bg-white/90 transition-colors" style={{ fontWeight: 600 }}>
            Solicitar Orçamento
          </button>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-[#000] mb-4">Sobre a Korus</h2>
              <p className="text-[#6B7280] mb-4" style={{ fontSize: 16, lineHeight: 1.7 }}>
                A Korus Agency nasceu da paixão por transformar negócios através do marketing estratégico e do design criativo. Com mais de 5 anos de atuação no mercado, nos dedicamos a entender profundamente cada cliente para entregar soluções que realmente geram resultados.
              </p>
              <p className="text-[#6B7280] mb-6" style={{ fontSize: 16, lineHeight: 1.7 }}>
                Nossa equipe é formada por profissionais especializados em branding, desenvolvimento web, gestão de redes sociais e tráfego pago. Acreditamos que cada marca tem uma história única e nosso papel é contar essa história da melhor forma possível.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#39228C]" />
                  <span className="text-[#000]" style={{ fontSize: 14 }}>Equipe especializada</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#39228C]" />
                  <span className="text-[#000]" style={{ fontSize: 14 }}>Projetos personalizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#39228C]" />
                  <span className="text-[#000]" style={{ fontSize: 14 }}>Resultados mensuráveis</span>
                </div>
              </div>
            </div>
            <div className="bg-[#F9FAFB] rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-[#39228C]" style={{ fontSize: 32, fontWeight: 700 }}>{s.value}</p>
                    <p className="text-[#6B7280]" style={{ fontSize: 14 }}>{s.label}</p>
                  </div>
                ))}
                <div className="text-center">
                  <p className="text-[#39228C]" style={{ fontSize: 32, fontWeight: 700 }}>15+</p>
                  <p className="text-[#6B7280]" style={{ fontSize: 14 }}>Especialistas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16 sm:py-24 bg-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-center text-[#000] mb-4">Entre em Contato</h2>
          <p className="text-center text-[#6B7280] mb-12 max-w-2xl mx-auto" style={{ fontSize: 16 }}>
            Tem um projeto em mente? Fale conosco e vamos transformar sua ideia em realidade.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-[rgba(103,68,170,0.15)] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] mb-4">
                <Mail size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }} className="text-[#000] mb-2">E-mail</h3>
              <p className="text-[#6B7280]" style={{ fontSize: 14 }}>contato@korusagencia.com.br</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[rgba(103,68,170,0.15)] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] mb-4">
                <Phone size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }} className="text-[#000] mb-2">Telefone</h3>
              <p className="text-[#6B7280]" style={{ fontSize: 14 }}>(61) 99999-0000</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[rgba(103,68,170,0.15)] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] mb-4">
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }} className="text-[#000] mb-2">Endereço</h3>
              <p className="text-[#6B7280]" style={{ fontSize: 14 }}>Brasília, DF - Brasil</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}