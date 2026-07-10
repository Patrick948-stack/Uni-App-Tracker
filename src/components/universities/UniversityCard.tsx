import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { daysUntil, formatDate, formatDaysUntil } from "@/lib/dates";
import type { Task, University } from "@/types";

export function UniversityCard({
  university,
  tasks,
  onOpen,
}: {
  university: University;
  tasks: Task[];
  onOpen: () => void;
}) {
  const schoolTasks = tasks.filter((t) => t.universityId === university.id);
  const done = schoolTasks.filter((t) => t.status === "done").length;
  const total = schoolTasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const d = university.deadline ? daysUntil(university.deadline) : null;

  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[1.02rem] font-black tracking-tight">{university.name}</div>
          <div className="text-[0.85rem] text-[var(--tiny)]">
            {university.round || "—"} •{" "}
            {university.deadline
              ? `${formatDate(university.deadline)} (${d !== null ? formatDaysUntil(d) : ""})`
              : "No deadline"}
          </div>
          <div className="text-[0.85rem] text-[var(--tiny)]">Status: {university.status || "Researching"}</div>
        </div>
        <Button size="sm" onClick={onOpen}>
          Open
        </Button>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-[0.85rem] text-[var(--tiny)]">
          <span>Tasks</span>
          <span>
            {done}/{total}
          </span>
        </div>
        <ProgressBar pct={pct} className="mt-2" />
      </div>
    </GlassCard>
  );
}
