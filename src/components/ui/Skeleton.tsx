import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-xl bg-[color-mix(in_srgb,var(--glass-border)_55%,transparent)]",
        className,
      )}
      aria-hidden="true"
    />
  );
}
