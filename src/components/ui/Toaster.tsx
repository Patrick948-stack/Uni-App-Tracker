import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { cn } from "@/lib/cn";

const ICONS = {
  info: Info,
  success: CheckCircle2,
  error: XCircle,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] grid gap-2.5"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              role="status"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "glass-surface flex items-center gap-2.5 rounded-[16px] px-3.5 py-3 text-sm font-medium max-w-[320px]",
                t.type === "error" && "text-[var(--color-danger)]",
                t.type === "success" && "text-[var(--color-success)]",
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-[var(--text)]">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
