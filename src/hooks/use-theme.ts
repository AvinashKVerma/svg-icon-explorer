import { useEffect } from "react";
import { useIconStore } from "@/store/icon-store";

export function useThemeEffect() {
  const theme = useIconStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: light)");

    function apply() {
      const resolved = theme === "system" ? (media.matches ? "light" : "dark") : theme;
      root.classList.toggle("light", resolved === "light");
    }

    apply();
    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);
}
