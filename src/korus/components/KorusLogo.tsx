// Logo variants following the Korus brand identity manual
import { IMAGES } from "../assets";

/**
 * variant:
 * - "dark" → roxo escuro horizontal on white bg (for Navbar/light backgrounds)
 * - "light" → white vertical on roxo escuro bg (for Footer/Sidebar dark backgrounds)
 * - "black" → black horizontal on white bg (for neutral contexts)
 * - "azul" → azul noturno horizontal on white bg
 */
export function KorusLogo({
  variant = "dark",
  size = "sm",
}: {
  variant?: "dark" | "light" | "black" | "azul";
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = { sm: "h-8", md: "h-10", lg: "h-14" };

  const logoMap = {
    dark: IMAGES.logoHorizontalRoxo,
    light: IMAGES.logoVerticalBrancoRoxo,
    black: IMAGES.logoHorizontalPreto,
    azul: IMAGES.logoHorizontalAzul,
  };

  return (
    <img
      src={logoMap[variant]}
      alt="Korus"
      className={`${sizeMap[size]} object-contain ${variant === "light" ? "rounded-lg" : ""}`}
    />
  );
}

/**
 * Symbol-only (icon) variant
 * - "dark" → roxo claro icon on white bg (for light backgrounds)
 * - "light" → white icon on black bg (for dark backgrounds)
 * - "azul" → white icon on azul noturno bg
 */
export function KorusSymbol({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light" | "azul";
  className?: string;
}) {
  const iconMap = {
    dark: IMAGES.iconeRoxoClaro,
    light: IMAGES.iconeBrancoPreto,
    azul: IMAGES.iconeBrancoAzul,
  };

  return (
    <img
      src={iconMap[variant]}
      alt="Korus"
      className={`${className || "h-8 w-8"} object-contain rounded-lg`}
    />
  );
}