import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/lib/dates";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { AddEssayModal } from "@/components/essays/AddEssayModal";
import { EssayEditor } from "@/components/essays/EssayEditor";
import { NoteListEditor } from "@/components/essays/NoteListEditor";
import { uid } from "@/lib/id";

export function EssaysPage() {
  const universities = useAppStore((s) => s.universities);
  const essays = useAppStore((s) => s.essays);
  const storyVault = useAppStore((s) => s.storyVault);
  const reusableBlocks = useAppStore((s) => s.reusableBlocks);
  const addStorySnippet = useAppStore((s) => s.addStorySnippet);
  const removeStorySnippet = useAppStore((s) => s.removeStorySnippet);
  const addReusableBlock = useAppStore((s) => s.addReusableBlock);
  const removeReusableBlock = useAppStore((s) => s.removeReusableBlock);

  const [schoolId, setSchoolId] = useState("");
  const [activeEssayId, setActiveEssayId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const schoolEssays = useMemo(() => essays.filter((e) => e.universityId === schoolId), [essays, schoolId]);
  const activeEssay = activeEssayId ? essays.find((e) => e.id === activeEssayId) : undefined;

  return (
    <div className="grid gap-3.5">
      <div className="grid gap-1.5">
        <h1 className="text-[1.25rem] font-bold tracking-tight">Essays</h1>
        <p className="text-[var(--muted)]">Unlimited supplementals + a lightweight rich-text editor.</p>
      </div>

      <div className="grid gap-3.5 md:grid-cols-2">
        <GlassCard>
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem] font-bold">Essay list</h2>
            <div className="flex gap-2.5">
              <Select
                aria-label="Select school"
                value={schoolId}
                onChange={(e) => {
                  setSchoolId(e.target.value);
                  setActiveEssayId(null);
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
              <Button size="sm" onClick={() => (schoolId ? setAddOpen(true) : undefined)} disabled={!schoolId}>
                + Add
              </Button>
            </div>
          </header>

          <ul className="mt-3 grid list-none gap-2.5 p-0">
            {!schoolId && <li className="text-[var(--muted)]">Pick a school to see essays.</li>}
            {schoolId && schoolEssays.length === 0 && <li className="text-[var(--muted)]">No essays yet. Add one.</li>}
            {schoolEssays.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setActiveEssayId(e.id)}
                  className="w-full rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] p-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="font-black tracking-tight">{e.title}</div>
                      <div className="text-[0.85rem] text-[var(--tiny)]">
                        {e.status || "Not started"} • {e.lastEdited ? `Edited: ${formatDate(e.lastEdited)}` : "Never edited"}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-xl border border-[var(--glass-border)] px-2.5 py-1.5 text-[0.85rem] font-semibold">
                      Open
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <header>
            <h2 className="text-[1.05rem] font-bold">Editor</h2>
          </header>
          <div className="mt-3">
            <EssayEditor essay={activeEssay} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-3.5 md:grid-cols-2">
        <GlassCard>
          <header>
            <h2 className="text-[1.05rem] font-bold">Story vault / idea bank</h2>
          </header>
          <NoteListEditor
            items={storyVault}
            emptyLabel="No stories saved yet."
            titlePlaceholder="Story title"
            bodyPlaceholder="What happened, why it matters, what you learned…"
            onAdd={(title, body) => addStorySnippet({ id: uid(), title, body })}
            onRemove={removeStorySnippet}
          />
        </GlassCard>

        <GlassCard>
          <header>
            <h2 className="text-[1.05rem] font-bold">Reusable blocks</h2>
          </header>
          <NoteListEditor
            items={reusableBlocks}
            emptyLabel="No reusable blocks yet."
            titlePlaceholder="Block title"
            bodyPlaceholder="A paragraph you might reuse across supplements…"
            onAdd={(title, body) => addReusableBlock({ id: uid(), title, body })}
            onRemove={removeReusableBlock}
          />
        </GlassCard>
      </div>

      <AddEssayModal open={addOpen} onClose={() => setAddOpen(false)} universityId={schoolId} />
    </div>
  );
}
