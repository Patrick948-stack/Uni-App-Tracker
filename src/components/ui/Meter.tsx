import { motion } from "motion/react";

export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);

  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)]">
        <motion.div
          className="h-full rounded-full bg-[var(--color-accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>
      <p className="mt-1.5 text-[0.8rem] text-[var(--tiny)]">{label}</p>
    </div>
  );
}
