import type { HTMLMotionProps } from "motion/react";
import { motion } from "motion/react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type GlassCardProps = HTMLMotionProps<"div"> & {
  hover?: boolean;
  padding?: "none" | "sm" | "md";
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, padding = "md", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-surface relative overflow-hidden rounded-[var(--radius-glass-lg)]",
          padding === "md" && "p-4 sm:p-5",
          padding === "sm" && "p-3",
          hover &&
            "transition-shadow duration-200 ease-[var(--ease-glass)] hover:shadow-[var(--shadow-strong)]",
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
GlassCard.displayName = "GlassCard";
