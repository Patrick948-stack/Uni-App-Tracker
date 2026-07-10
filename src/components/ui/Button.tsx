import type { HTMLMotionProps } from "motion/react";
import { motion } from "motion/react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "glass" | "danger" | "ghost";
type Size = "md" | "sm" | "icon";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-[color-mix(in_srgb,var(--color-accent)_55%,white)] bg-gradient-to-b from-[color-mix(in_srgb,var(--color-accent)_88%,white)] to-[var(--color-accent)] text-white shadow-[0_14px_34px_rgba(59,130,246,0.28)] hover:brightness-[1.06]",
  glass:
    "border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-gradient-to-b from-white/20 to-white/10 text-[var(--text)] shadow-[0_8px_20px_rgba(0,0,0,0.10)] backdrop-blur-md",
  danger:
    "border border-[color-mix(in_srgb,var(--color-danger)_55%,white)] bg-gradient-to-b from-[color-mix(in_srgb,var(--color-danger)_88%,white)] to-[var(--color-danger)] text-white shadow-[0_14px_34px_rgba(239,68,68,0.22)]",
  ghost: "border border-transparent bg-transparent text-[var(--text)] hover:bg-white/10",
};

const sizeClasses: Record<Size, string> = {
  md: "h-10 px-4 rounded-[14px] text-[0.95rem]",
  sm: "h-8 px-2.5 rounded-xl text-[0.85rem]",
  icon: "h-10 w-10 rounded-[14px] grid place-items-center p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "glass", size = "md", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ y: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] cursor-pointer transition-shadow",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
