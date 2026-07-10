import { useUIStore } from "@/store/useUIStore";
import { Modal } from "./Modal";

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "⌘K / Ctrl K", label: "Open the command menu" },
  { keys: "/", label: "Focus the search bar" },
  { keys: "?", label: "Show this shortcuts panel" },
  { keys: "Esc", label: "Close a dialog or the command menu" },
  { keys: "↑ ↓", label: "Move through command menu results" },
  { keys: "↵", label: "Run the highlighted command" },
];

export function ShortcutsOverlay() {
  const open = useUIStore((s) => s.shortcutsOpen);
  const setOpen = useUIStore((s) => s.setShortcutsOpen);

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Keyboard shortcuts">
      <ul className="grid gap-2">
        {SHORTCUTS.map((s) => (
          <li
            key={s.keys}
            className="flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] px-3.5 py-2.5"
          >
            <span className="text-[var(--muted)]">{s.label}</span>
            <kbd className="rounded-lg border border-[var(--glass-border)] bg-[var(--field-bg)] px-2 py-1 font-mono text-[0.8rem] font-semibold">
              {s.keys}
            </kbd>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
