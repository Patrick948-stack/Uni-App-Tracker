import type { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <GlassCard hover={false} className="text-center">
      <h2 className="text-[1.05rem] font-bold">{title}</h2>
      {description && <p className="mt-1 text-[var(--muted)]">{description}</p>}
      {action && <div className="mt-4 flex justify-center gap-2.5">{action}</div>}
    </GlassCard>
  );
}
