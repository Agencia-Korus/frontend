import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "korus-theme";
const CHANGE_EVENT = "korus-theme-change";

type Theme = "dark" | "light";

function getClientTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useDarkMode() {
  // Server and the first client render both see "light", so they match;
  // useSyncExternalStore swaps to the real theme after hydration without a
  // mismatch warning.
  const theme = useSyncExternalStore(subscribe, getClientTheme, () => "light" as Theme);
  const dark = theme === "dark";

  // Keep the <html> class in sync with the current theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return { dark, toggle: () => setTheme(dark ? "light" : "dark") };
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { dark, toggle } = useDarkMode();
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={dark ? "Modo claro" : "Modo escuro"}
      className={`w-10 h-10 cursor-pointer rounded-lg flex items-center justify-center border border-[rgba(103,68,170,0.25)] bg-white dark:bg-[#130D22] text-[#39228C] dark:text-[#F59E0B] hover:bg-[#39228C]/5 dark:hover:bg-[#6744AA]/20 transition-colors ${className}`}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
