import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useThemeSync() {
  const theme = useAppStore((s) => s.meta.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
}
