import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/Button";
import type { Task, University } from "@/types";

export function TaskListItem({
  task,
  university,
  onToggle,
  onEdit,
}: {
  task: Task;
  university?: University;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <li className="rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <div className="font-extrabold tracking-tight">{task.title}</div>
          <div className="text-[0.85rem] text-[var(--tiny)]">
            {university ? `${university.name} • ` : ""}
            {task.dueDate ? formatDate(task.dueDate) : "No due date"} • {task.priority || "normal"}
          </div>
          {task.notes && <div className="mt-1.5 text-[0.85rem] text-[var(--tiny)]">{task.notes}</div>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" onClick={onToggle}>
            {task.status === "done" ? "Undo" : "Done"}
          </Button>
          <Button size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
    </li>
  );
}
