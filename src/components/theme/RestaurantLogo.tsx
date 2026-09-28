import { useTheme } from "../../contexts/ThemeContext";

interface RestaurantLogoProps {
  className?: string;
  alt?: string;
}

export function RestaurantLogo({
  className = "h-16 w-16",
  alt = "Logo del restaurante",
}: RestaurantLogoProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden ${className}`}
    >
      <img
        key={theme.logoUrl || "default-logo"}
        src={theme.logoUrl || "/img/LogoS.svg"}
        alt={alt}
        className="block h-full w-full object-contain"
      />
    </div>
  );
}