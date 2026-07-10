import { useEffect } from "react";
import { useUIStore } from "@/store/useUIStore";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/**
 * Global keyboard shortcuts: Cmd/Ctrl+K opens the command palette from
 * anywhere (even while typing); "/" focuses search and "?" opens the
 * shortcuts overlay, but only when the user isn't already typing somewhere.
 */
export function useGlobalShortcuts() {
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      if (isTypingTarget(e.target) || commandPaletteOpen) return;

      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("globalSearch")?.focus();
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen, setShortcutsOpen]);
}
