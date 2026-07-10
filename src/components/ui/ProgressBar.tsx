import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export function ProgressBar({
  pct,
  indeterminate = false,
  className,
}: {
  pct?: number;
  indeterminate?: boolean;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : pct}
      className={cn(
        "h-3 w-full overflow-hidden rounded-full border border-white/40 bg-white/30",
        className,
      )}
    >
      {indeterminate ? (
        <motion.div
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)]"
          animate={{ x: ["-20%", "120%"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, pct ?? 0))}%` }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        />
      )}
    </div>
  );
}
