import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/Skeleton";

export function LoadingScreen() {
  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mx-auto flex max-w-[1300px] items-center justify-between gap-3.5 px-2 py-3.5"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-[10px] border border-white/40 bg-gradient-to-br from-blue-500/35 to-violet-500/25 shadow-sm"
            aria-hidden="true"
          >
            ◆
          </span>
          <span className="font-bold tracking-tight">University Application Hub</span>
        </div>
        <p className="hidden text-[0.85rem] text-[var(--tiny)] sm:block">Preparing your workspace…</p>
      </motion.div>

      <div className="mx-auto grid w-full max-w-[1300px] gap-4 p-4 md:grid-cols-[250px_1fr]">
        <div className="hidden gap-2.5 md:grid">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-[46px] rounded-2xl" />
          ))}
        </div>

        <div className="grid gap-3.5">
          <div className="grid gap-3.5 md:grid-cols-2">
            <Skeleton className="h-[210px] rounded-[var(--radius-glass-lg)]" />
            <Skeleton className="h-[210px] rounded-[var(--radius-glass-lg)]" />
          </div>
          <div className="grid gap-3.5 sm:grid-cols-3">
            <Skeleton className="h-[140px] rounded-[var(--radius-glass-lg)]" />
            <Skeleton className="h-[140px] rounded-[var(--radius-glass-lg)]" />
            <Skeleton className="h-[140px] rounded-[var(--radius-glass-lg)]" />
          </div>
          <Skeleton className="h-[190px] rounded-[var(--radius-glass-lg)]" />
        </div>
      </div>
    </div>
  );
}
