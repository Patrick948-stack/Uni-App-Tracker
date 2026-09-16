import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAutosaveField } from "@/hooks/useAutosaveField";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Select, Textarea, UrlField } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

const RESEARCH_CARDS = [
  {
    key: "major-reqs",
    title: "Find your major requirements",
    desc: "Degree map, required courses, concentration rules.",
    queries: (name: string) => [`${name} major requirements`, `${name} degree requirements site:.edu`],
  },
  {
    key: "two-courses",
    title: "Find 2 courses you would take",
    desc: "Course catalog + “why I care.”",
    queries: (name: string) => [`${name} course catalog`, `${name} undergraduate courses`],
  },
  {
    key: "one-club",
    title: "Find 1 club you'd join",
    desc: "Student org directory, vibe notes.",
    queries: (name: string) => [`${name} student clubs directory`, `${name} student organizations list`],
  },
  {
    key: "lab-prof",
    title: "Find 1 professor/lab",
    desc: "Labs, centers, faculty pages.",
    queries: (name: string) => [`${name} faculty research`, `${name} labs and centers`],
  },
  {
    key: "npc",
    title: "Find net price calculator",
    desc: "Save link + cost notes.",
    queries: (name: string) => [`${name} net price calculator`],
  },
  {
    key: "support",
    title: "Find support services",
    desc: "Tutoring, disability services, advising.",
    queries: (name: string) => [`${name} tutoring center`, `${name} disability services`, `${name} academic advising`],
  },
  {
    key: "outcomes",
    title: "Find outcomes page",
    desc: "Internships, first-destination reports.",
    queries: (name: string) => [`${name} career outcomes report`, `${name} first destination survey`],
  },
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

function ResearchCard({
  card,
  universityId,
  universityName,
  expanded,
  onToggle,
}: {
  card: (typeof RESEARCH_CARDS)[number];
  universityId: string;
  universityName: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const note = useAppStore((s) => s.universities.find((u) => u.id === universityId)?.guidedResearch?.[card.key]);
  const updateNote = useAppStore((s) => s.updateGuidedResearchNote);

  const [link, setLink] = useAutosaveField(note?.link ?? "", (v) =>
    updateNote(universityId, card.key, { link: v }),
  );
  const [notes, setNotes] = useAutosaveField(note?.notes ?? "", (v) =>
    updateNote(universityId, card.key, { notes: v }),
  );

  const done = note?.done ?? false;

  return (
    <GlassCard className="grid gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold tracking-tight">{card.title}</h3>
        {done && (
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--color-accent)] text-white">
            <Check size={13} />
          </span>
        )}
      </div>
      <p className="text-[0.85rem] text-[var(--tiny)]">{card.desc}</p>
      <Button size="sm" className="justify-self-start" onClick={onToggle}>
        {expanded ? "Close" : "Open"}
        <ChevronDown size={15} className={cn("transition-transform", expanded && "rotate-180")} />
      </Button>

      {expanded && (
        <div className="mt-2 grid gap-3 border-t border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] pt-3">
          <div>
            <p className="text-[0.8rem] font-semibold text-[var(--muted)]">Suggested search queries</p>
            <ul className="mt-1.5 grid list-none gap-1.5 p-0">
              {card.queries(universityName || "this school").map((q) => (
                <li
                  key={q}
                  className="rounded-lg bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] px-2.5 py-1.5 text-[0.85rem]"
                >
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor={`link-${card.key}`} className="text-[0.8rem] font-semibold text-[var(--muted)]">
              Link
            </label>
            <UrlField
              id={`link-${card.key}`}
              placeholder="https://…"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor={`notes-${card.key}`} className="text-[0.8rem] font-semibold text-[var(--muted)]">
              Notes
            </label>
            <Textarea
              id={`notes-${card.key}`}
              placeholder="What you found…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => updateNote(universityId, card.key, { done: !done })}
            className="flex w-full items-center gap-2.5 justify-self-start"
          >
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-md border border-[var(--glass-border)]",
                done && "bg-[var(--color-accent)] border-[var(--color-accent)] text-white",
              )}
            >
              {done && <Check size={13} />}
            </span>
            <span className="text-[0.9rem] font-semibold">Mark as done</span>
          </button>
        </div>
      )}
    </GlassCard>
  );
}

export function GuidedResearchPage() {
  const universities = useAppStore((s) => s.universities);
  const [schoolId, setSchoolId] = useState("");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const university = universities.find((u) => u.id === schoolId);

  return (
    <div className="grid gap-3.5">
      <div className="grid gap-1.5 @lg:flex @lg:items-center @lg:justify-between @lg:gap-3">
        <div className="grid gap-1.5">
          <h1 className="text-[1.25rem] font-bold tracking-tight">Guided Research</h1>
          <p className="text-[var(--muted)]">
            Tap a box to see what to look for, suggested search queries, and a place to save links + notes.
          </p>
        </div>
        <Select
          aria-label="Select a school for guided research"
          value={schoolId}
          onChange={(e) => {
            setSchoolId(e.target.value);
            setExpandedKey(null);
          }}
          className="w-auto"
        >
          <option value="">Pick a school…</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
      </div>

      {!university ? (
        <p className="text-[0.9rem] text-[var(--tiny)]">Pick a school above to save links and notes per topic.</p>
      ) : null}

      <div className="grid gap-3.5 @lg:grid-cols-2 @4xl:grid-cols-3">
        {RESEARCH_CARDS.map((c) =>
          university ? (
            <ResearchCard
              key={c.key}
              card={c}
              universityId={university.id}
              universityName={university.name}
              expanded={expandedKey === c.key}
              onToggle={() => setExpandedKey((k) => (k === c.key ? null : c.key))}
            />
          ) : (
            <GlassCard key={c.key} className="grid gap-2 opacity-60">
              <h3 className="font-bold tracking-tight">{c.title}</h3>
              <p className="text-[0.85rem] text-[var(--tiny)]">{c.desc}</p>
              <Button size="sm" className="justify-self-start" disabled>
                Pick a school first
              </Button>
            </GlassCard>
          ),
        )}
      </div>

      <GlassCard>
        <header>
          <h2 className="text-[1.05rem] font-bold">Time budget paths</h2>
        </header>
        <div className="mt-3 grid gap-3.5 @xl:grid-cols-3">
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
