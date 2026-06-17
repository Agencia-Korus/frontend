// Logo variants following the Korus brand identity manual.
// Rendered as inline SVGs (see KorusBrand) using `currentColor`, so each
// variant just picks a text color and the marks adapt to light/dark.
import { KorusWordmark, KorusIcon } from "./KorusBrand";

const sizeMap = { sm: "h-8", md: "h-10", lg: "h-14" };

/**
 * variant:
 * - "dark"  → roxo escuro (for light backgrounds)
 * - "light" → white (for dark backgrounds)
 * - "black" → black (for neutral contexts)
 * - "azul"  → azul noturno
 */
export function KorusLogo({
  variant = "dark",
  size = "sm",
  className = "",
}: {
  variant?: "dark" | "light" | "black" | "azul";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const colorMap = {
    dark: "text-[#39228C]",
    light: "text-white",
    black: "text-black",
    azul: "text-[#0C0819]",
  };

  return <KorusWordmark className={`${sizeMap[size]} w-auto ${colorMap[variant]} ${className}`} />;
}

/**
 * Symbol-only (icon) variant.
 * - "dark"  → roxo claro (for light backgrounds)
 * - "light" → white (for dark backgrounds)
 * - "azul"  → azul noturno
 */
export function KorusSymbol({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light" | "azul";
  className?: string;
}) {
  const colorMap = {
    dark: "text-[#6744AA]",
    light: "text-white",
    azul: "text-[#0C0819]",
  };

  return <KorusIcon className={`${className || "h-8 w-8"} ${colorMap[variant]}`} />;
}
