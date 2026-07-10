import { useState } from "react";
import { Check } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const RESEARCH_CARDS = [
  { key: "major-reqs", title: "Find your major requirements", desc: "Degree map, required courses, concentration rules." },
  { key: "two-courses", title: "Find 2 courses you would take", desc: "Course catalog + “why I care.”" },
  { key: "one-club", title: "Find 1 club you'd join", desc: "Student org directory, vibe notes." },
  { key: "lab-prof", title: "Find 1 professor/lab", desc: "Labs, centers, faculty pages." },
  { key: "npc", title: "Find net price calculator", desc: "Save link + cost notes." },
  { key: "support", title: "Find support services", desc: "Tutoring, disability services, advising." },
  { key: "outcomes", title: "Find outcomes page", desc: "Internships, first-destination reports." },
];

const TIME_PATHS: Record<"10" | "30" | "60", string[]> = {
  "10": ["Skim the admissions homepage", "Note the application deadline", "Bookmark the net price calculator"],
  "30": [
    "Read 1 department page for a major you like",
    "Find 2 courses that sound interesting",
    "Skim 1 outcomes / careers page",
  ],
  "60": [
    "Deep-dive your major's degree requirements",
    "Find 1 professor or lab doing work you like",
    "Find 1 club and 1 support service",
    "Draft notes for the “why this school” angle",
  ],
};

function TimeChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <ul className="mt-2.5 grid list-none gap-2.5 p-0">
      {items.map((label, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => toggle(i)}
            className="flex w-full items-center gap-2.5 rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] px-3 py-2.5 text-left"
          >
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-md border border-[var(--glass-border)]",
                checked.has(i) && "bg-[var(--color-accent)] border-[var(--color-accent)] text-white",
              )}
            >
              {checked.has(i) && <Check size={13} />}
            </span>
            <span className={cn(checked.has(i) && "line-through opacity-60")}>{label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function GuidedResearchPage() {
  return (
    <div className="grid gap-3.5">
      <div className="grid gap-1.5">
        <h1 className="text-[1.25rem] font-bold tracking-tight">Guided Research</h1>
        <p className="text-[var(--muted)]">
          Tap a box to see what to look for, suggested search queries, and a place to save links + notes.
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_CARDS.map((c) => (
          <GlassCard key={c.key} className="grid gap-2">
            <h3 className="font-bold tracking-tight">{c.title}</h3>
            <p className="text-[0.85rem] text-[var(--tiny)]">{c.desc}</p>
            <Button size="sm" className="justify-self-start">
              Open
            </Button>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <header>
          <h2 className="text-[1.05rem] font-bold">Time budget paths</h2>
        </header>
        <div className="mt-3 grid gap-3.5 sm:grid-cols-3">
          <div>
            <h3 className="font-bold">10 minutes</h3>
            <TimeChecklist items={TIME_PATHS["10"]} />
          </div>
          <div>
            <h3 className="font-bold">30 minutes</h3>
            <TimeChecklist items={TIME_PATHS["30"]} />
          </div>
          <div>
            <h3 className="font-bold">60 minutes</h3>
            <TimeChecklist items={TIME_PATHS["60"]} />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
