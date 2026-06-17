import { useSyncExternalStore } from "react";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "korus-cookie-consent";
const CHANGE_EVENT = "korus-cookie-consent-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function CookieConsent() {
  // Server and the initial client render both see "ssr", so they match;
  // after hydration the client reads the real value from localStorage.
  const consent = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(STORAGE_KEY),
    () => "ssr",
  );

  const decide = (value: "all" | "essential" | "rejected") => {
    localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  if (consent !== null) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50">
      <div className="bg-white dark:bg-[#22262E] border border-[rgba(103,68,170,0.25)] rounded-2xl shadow-xl shadow-black/10 p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#39228C]/10 flex items-center justify-center text-[#39228C] shrink-0">
            <Cookie size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-[#000] dark:text-white" style={{ fontSize: 15, fontWeight: 600 }}>Sua privacidade importa</h4>
            <p className="text-[#6B7280] dark:text-white/70 mt-1" style={{ fontSize: 13, lineHeight: 1.5 }}>
              Usamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo. Você pode aceitar todos ou apenas os essenciais. Veja nossa{" "}
              <a href="#politica" className="text-[#39228C] dark:text-[#A78BFA] underline">Política de Privacidade</a>.
            </p>
          </div>
          <button onClick={() => decide("rejected")} aria-label="Fechar" className="cursor-pointer text-[#6B7280] hover:text-[#000] dark:hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => decide("all")}
            className="flex-1 cursor-pointer px-4 py-2 bg-[#39228C] text-white rounded-lg hover:bg-[#6744AA] transition-colors"
            style={{ fontSize: 13, fontWeight: 500 }}
          >
            Aceitar todos
          </button>
          <button
            onClick={() => decide("essential")}
            className="flex-1 cursor-pointer px-4 py-2 border border-[#6744AA] text-[#6744AA] dark:text-[#A78BFA] dark:border-[#A78BFA] rounded-lg hover:bg-[#6744AA]/5 transition-colors"
            style={{ fontSize: 13, fontWeight: 500 }}
          >
            Apenas essenciais
          </button>
        </div>
      </div>
    </div>
  );
}