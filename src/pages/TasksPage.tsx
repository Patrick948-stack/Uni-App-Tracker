import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/store/useToastStore";
import { daysUntil } from "@/lib/dates";
import { priorityScore } from "@/lib/priority";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { TaskListItem } from "@/components/tasks/TaskListItem";
import { TaskModal } from "@/components/tasks/TaskModal";
import type { Task } from "@/types";

export function TasksPage() {
  const tasks = useAppStore((s) => s.tasks);
  const universities = useAppStore((s) => s.universities);
  const toggleTaskDone = useAppStore((s) => s.toggleTaskDone);

  const [schoolId, setSchoolId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [modalDefaultSchool, setModalDefaultSchool] = useState<string | undefined>(undefined);

  const globalQueue = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const da = a.dueDate ? (daysUntil(a.dueDate) ?? 99999) : 99999;
        const db = b.dueDate ? (daysUntil(b.dueDate) ?? 99999) : 99999;
        return da - db || priorityScore(b.priority) - priorityScore(a.priority);
      }),
    [tasks],
  );

  const schoolTasks = useMemo(() => tasks.filter((t) => t.universityId === schoolId), [tasks, schoolId]);

  function getUniversity(id: string) {
    return universities.find((u) => u.id === id);
  }

  function openAdd(defaultSchool?: string) {
    setEditingTask(undefined);
    setModalDefaultSchool(defaultSchool);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setModalDefaultSchool(undefined);
    setModalOpen(true);
  }

  return (
    <div className="grid gap-3.5">
      <div className="grid gap-1.5">
        <h1 className="text-[1.25rem] font-bold tracking-tight">Tasks</h1>
        <p className="text-[var(--muted)]">Per-school lists + a global urgency queue.</p>
      </div>

      <div className="grid gap-3.5 md:grid-cols-2">
        <GlassCard>
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-bold">Global task queue</h2>
            <Button size="sm" onClick={() => openAdd()}>
              + Add
            </Button>
          </header>
          <ul className="mt-3 grid list-none gap-2.5 p-0">
            {globalQueue.length === 0 && <li className="text-[var(--muted)]">No tasks yet.</li>}
            {globalQueue.map((t) => (
              <TaskListItem
                key={t.id}
                task={t}
                university={t.universityId ? getUniversity(t.universityId) : undefined}
                onToggle={() => toggleTaskDone(t.id)}
                onEdit={() => openEdit(t)}
              />
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-bold">Per-school tasks</h2>
            <div className="flex gap-2.5">
              <Select aria-label="Select school" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="w-auto">
                <option value="">Pick a school…</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                onClick={() => {
                  if (!schoolId) {
                    toast("Pick a school first.");
                    return;
                  }
                  openAdd(schoolId);
                }}
              >
                + Add
              </Button>
            </div>
          </header>
          <ul className="mt-3 grid list-none gap-2.5 p-0">
            {!schoolId && <li className="text-[var(--muted)]">Pick a school to view tasks.</li>}
            {schoolId && schoolTasks.length === 0 && <li className="text-[var(--muted)]">No tasks for this school yet.</li>}
            {schoolTasks.map((t) => (
              <TaskListItem
                key={t.id}
                task={t}
                university={getUniversity(schoolId)}
                onToggle={() => toggleTaskDone(t.id)}
                onEdit={() => openEdit(t)}
              />
            ))}
          </ul>
        </GlassCard>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editingTask}
        defaultUniversityId={modalDefaultSchool}
      />
    </div>
  );
}
