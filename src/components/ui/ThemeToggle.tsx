import { Moon, Sun } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "./Button";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useAppStore((s) => s.meta.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <Button
      variant="glass"
      size={compact ? "icon" : "md"}
      aria-pressed={isDark}
      aria-label="Toggle light/night mode"
      onClick={toggleTheme}
    >
      {isDark ? <Moon size={18} /> : <Sun size={18} />}
      {!compact && <span>{isDark ? "Night" : "Light"}</span>}
    </Button>
  );
}
