import type { HTMLMotionProps } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

type ChipProps = HTMLMotionProps<"button"> & { active?: boolean };

export function Chip({ active, children, ...props }: ChipProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-2 text-sm font-bold transition-shadow",
        "border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_72%,transparent)] text-[var(--text)]",
        active &&
          "border-[color-mix(in_srgb,var(--color-accent)_45%,var(--glass-border))] shadow-[var(--shadow),var(--glow)]",
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
