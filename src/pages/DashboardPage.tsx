import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useUIStore } from "@/store/useUIStore";
import { toast } from "@/store/useToastStore";
import { daysUntil, formatDate, formatDaysUntil } from "@/lib/dates";
import { priorityScore } from "@/lib/priority";
import { cn } from "@/lib/cn";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Meter } from "@/components/ui/Meter";
import { PipelineChart } from "@/components/dashboard/PipelineChart";

export function DashboardPage() {
  const universities = useAppStore((s) => s.universities);
  const tasks = useAppStore((s) => s.tasks);
  const essays = useAppStore((s) => s.essays);
  const focusSchoolId = useAppStore((s) => s.meta.focusSchoolId);
  const setFocusSchool = useAppStore((s) => s.setFocusSchool);
  const toggleTaskDone = useAppStore((s) => s.toggleTaskDone);
  const query = useSearchStore((s) => s.query).trim().toLowerCase();
  const setAddUniversityOpen = useUIStore((s) => s.setAddUniversityOpen);
  const setSelectedUniversityId = useUIStore((s) => s.setSelectedUniversityId);
  const navigate = useNavigate();

  function openSchool(id: string) {
    setSelectedUniversityId(id);
    navigate("/universities");
  }

  const [focusPick, setFocusPick] = useState(focusSchoolId ?? "");

  const nextDeadlines = useMemo(() => {
    return universities
      .filter((u) => !!u.deadline && u.name.toLowerCase().includes(query))
      .filter((u) => !focusSchoolId || u.id === focusSchoolId)
      .map((u) => ({ u, d: daysUntil(u.deadline) }))
      .filter((x): x is { u: (typeof universities)[number]; d: number } => x.d !== null)
      .sort((a, b) => a.d - b.d)
      .slice(0, 6);
  }, [universities, query, focusSchoolId]);

  const nextActions = useMemo(() => {
    return tasks
      .filter((t) => t.status !== "done" && t.title.toLowerCase().includes(query))
      .filter((t) => !focusSchoolId || !t.universityId || t.universityId === focusSchoolId)
      .map((t) => ({ t, due: t.dueDate ? (daysUntil(t.dueDate) ?? 99999) : 99999 }))
      .sort((a, b) => a.due - b.due || priorityScore(b.t.priority) - priorityScore(a.t.priority))
      .slice(0, 6);
  }, [tasks, query, focusSchoolId]);

  const remainingTasks = tasks.filter((t) => t.status !== "done").length;
  const doneTasks = tasks.length - remainingTasks;
  const inProgressEssays = essays.filter((e) => e.status !== "Final").length;

  function getUniName(id: string) {
    return universities.find((u) => u.id === id)?.name;
  }

  return (
    <div className="grid gap-3.5">
      <div className="grid gap-3.5 @xl:grid-cols-2">
        <GlassCard>
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-bold">
              Next deadlines
              {focusSchoolId && (
                <span className="ml-2 text-[0.75rem] font-semibold text-[var(--color-accent-text)]">
                  · focused on {getUniName(focusSchoolId)}
                </span>
              )}
            </h2>
            <Button size="sm" onClick={() => setAddUniversityOpen(true)}>
              + Add
            </Button>
          </header>
          <ul className="mt-3 grid gap-2.5 list-none p-0">
            {nextDeadlines.length === 0 && (
              <li className="text-[var(--muted)]">
                {query
                  ? "No deadlines match your search."
                  : focusSchoolId
                    ? "No upcoming deadline for the focused school."
                    : "No deadlines yet. Add a university to start tracking."}
              </li>
            )}
            {nextDeadlines.map(({ u, d }) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => openSchool(u.id)}
                  className="w-full rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] p-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-extrabold tracking-tight">{u.name}</div>
                      <div className="text-[0.85rem] text-[var(--tiny)]">
                        {u.round || "—"} • {formatDate(u.deadline)}
                      </div>
                    </div>
                    <div className="font-extrabold">{formatDaysUntil(d)}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-bold">What should I do next?</h2>
            <Button size="sm" onClick={() => navigate("/tasks")}>
              Focus: next 3
            </Button>
          </header>
          <ul className="mt-3 grid gap-2.5 list-none p-0">
            {nextActions.length === 0 && (
              <li className="text-[var(--muted)]">
                {query
                  ? "No tasks match your search."
                  : focusSchoolId
                    ? "No open tasks for the focused school."
                    : "No tasks queued. Add tasks to stay on track."}
              </li>
            )}
            {nextActions.map(({ t }) => {
              const clickable = !!t.universityId;
              return (
                <li key={t.id}>
                  <div
                    onClick={clickable ? () => openSchool(t.universityId) : undefined}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") openSchool(t.universityId);
                          }
                        : undefined
                    }
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] p-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.08)]",
                      clickable && "cursor-pointer transition-shadow hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)]",
                    )}
                  >
                    <div>
                      <div className="font-extrabold tracking-tight">{t.title}</div>
                      <div className="text-[0.85rem] text-[var(--tiny)]">
                        {t.universityId && getUniName(t.universityId) ? `${getUniName(t.universityId)} • ` : ""}
                        {t.dueDate ? formatDate(t.dueDate) : "No due date"} • {t.priority || "normal"}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskDone(t.id);
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassCard>
      </div>

      <div className="grid gap-3.5 @xl:grid-cols-2 @4xl:grid-cols-[1fr_1fr_1fr_1.6fr]">
        <GlassCard>
          <h3 className="font-bold">Schools</h3>
          <motion.p
            key={universities.length}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-2.5 text-[2rem] font-extrabold tracking-tight"
          >
            {universities.length}
          </motion.p>
          <p className="text-[0.85rem] text-[var(--tiny)]">Total tracked</p>
        </GlassCard>

        <GlassCard>
          <h3 className="font-bold">Tasks remaining</h3>
          <motion.p
            key={remainingTasks}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-2.5 text-[2rem] font-extrabold tracking-tight"
          >
            {remainingTasks}
          </motion.p>
          <Meter value={doneTasks} max={tasks.length} label={`${doneTasks} of ${tasks.length} tasks done`} />
        </GlassCard>

        <GlassCard>
          <h3 className="font-bold">Essays in progress</h3>
          <motion.p
            key={inProgressEssays}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-2.5 text-[2rem] font-extrabold tracking-tight"
          >
            {inProgressEssays}
          </motion.p>
          <p className="text-[0.85rem] text-[var(--tiny)]">Draft / revised</p>
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="font-bold">Pipeline breakdown</h3>
          <div className="mt-2">
            <PipelineChart universities={universities} />
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <header>
          <h2 className="text-[1.05rem] font-bold">Focus mode</h2>
        </header>
        <div className="mt-2 grid gap-2.5">
          <p className="text-[var(--muted)]">Work on only 1 school today. Everything else stays quiet.</p>
          <div className="flex flex-wrap gap-2.5">
            <Select
              aria-label="Select a school for focus mode"
              value={focusPick}
              onChange={(e) => setFocusPick(e.target.value)}
              className="w-auto min-w-[220px]"
            >
              <option value="">Pick a school…</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
            <Button
              variant="primary"
              onClick={() => {
                if (!focusPick) {
                  toast("Pick a school first.");
                  return;
                }
                setFocusSchool(focusPick);
                toast("Focus mode enabled.", "success");
              }}
            >
              Start focus
            </Button>
            <Button
              onClick={() => {
                setFocusSchool(null);
                toast("Focus mode ended.");
              }}
            >
              End focus
            </Button>
          </div>
          {focusSchoolId && (
            <p className="text-[0.85rem] text-[var(--tiny)]">
              Currently focused on <strong>{getUniName(focusSchoolId)}</strong>.
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
