import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import {
  BookMarked,
  Compass,
  Download,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Moon,
  PenLine,
  Plus,
  Save,
  Sun,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
import { exportJSON } from "@/lib/backup";

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setSelectedUniversityId = useUIStore((s) => s.setSelectedUniversityId);
  const setAddUniversityOpen = useUIStore((s) => s.setAddUniversityOpen);
  const universities = useAppStore((s) => s.universities);
  const theme = useAppStore((s) => s.meta.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const navigate = useNavigate();

  function run(fn: () => void) {
    fn();
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          label="Command menu"
          shouldFilter
          className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]"
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            className="glass-surface relative z-10 w-full max-w-[560px] overflow-hidden rounded-[var(--radius-glass-lg)]"
          >
            <Command.Input
              placeholder="Type a command or search…"
              className="w-full border-b border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-transparent px-4 py-3.5 text-[0.95rem] outline-none placeholder:text-[var(--tiny)]"
            />
            <Command.List className="max-h-[min(60vh,480px)] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-center text-[0.9rem] text-[var(--muted)]">
                No results found.
              </Command.Empty>

              <Command.Group heading="Navigate" className="px-2 py-1.5 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--tiny)] [&_[cmdk-group-items]]:mt-1">
                {[
                  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
                  { label: "Universities", to: "/universities", icon: GraduationCap },
                  { label: "Guided Research", to: "/guided", icon: Compass },
                  { label: "Tasks", to: "/tasks", icon: ListChecks },
                  { label: "Essays", to: "/essays", icon: PenLine },
                  { label: "Tracking", to: "/tracking", icon: BookMarked },
                  { label: "Backup", to: "/storage", icon: Save },
                ].map(({ label, to, icon: Icon }) => (
                  <Command.Item
                    key={to}
                    onSelect={() => run(() => navigate(to))}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.92rem] data-[selected=true]:bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
                  >
                    <Icon size={16} className="text-[var(--tiny)]" />
                    Go to {label}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Actions" className="px-2 py-1.5 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--tiny)] [&_[cmdk-group-items]]:mt-1">
                <Command.Item
                  onSelect={() => run(() => setAddUniversityOpen(true))}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.92rem] data-[selected=true]:bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
                >
                  <Plus size={16} className="text-[var(--tiny)]" />
                  Add university
                </Command.Item>
                <Command.Item
                  onSelect={() => run(toggleTheme)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.92rem] data-[selected=true]:bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
                >
                  {theme === "dark" ? <Sun size={16} className="text-[var(--tiny)]" /> : <Moon size={16} className="text-[var(--tiny)]" />}
                  Switch to {theme === "dark" ? "light" : "night"} mode
                </Command.Item>
                <Command.Item
                  onSelect={() => run(exportJSON)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.92rem] data-[selected=true]:bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
                >
                  <Download size={16} className="text-[var(--tiny)]" />
                  Export data as JSON
                </Command.Item>
                <Command.Item
                  onSelect={() => run(() => navigate("/storage"))}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.92rem] data-[selected=true]:bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
                >
                  <Upload size={16} className="text-[var(--tiny)]" />
                  Import data from JSON
                </Command.Item>
              </Command.Group>

              {universities.length > 0 && (
                <Command.Group heading="Universities" className="px-2 py-1.5 text-[0.75rem] font-bold uppercase tracking-wide text-[var(--tiny)] [&_[cmdk-group-items]]:mt-1">
                  {universities.map((u) => (
                    <Command.Item
                      key={u.id}
                      value={`university ${u.name}`}
                      onSelect={() =>
                        run(() => {
                          setSelectedUniversityId(u.id);
                          navigate("/universities");
                        })
                      }
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.92rem] data-[selected=true]:bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
                    >
                      <GraduationCap size={16} className="text-[var(--tiny)]" />
                      Open {u.name}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
            <div className="flex items-center justify-between border-t border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] px-4 py-2 text-[0.75rem] text-[var(--tiny)]">
              <span>↑↓ navigate · ↵ select</span>
              <span>esc to close</span>
            </div>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}
