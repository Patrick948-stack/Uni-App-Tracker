import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAutosaveField } from "@/hooks/useAutosaveField";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { PIPELINE_STAGES } from "@/types";

function PortalAndNotes({ universityId }: { universityId: string }) {
  const university = useAppStore((s) => s.getUniversity(universityId));
  const updateUniversity = useAppStore((s) => s.updateUniversity);

  const [portal, setPortal] = useAutosaveField(university?.trackingPortal ?? "", (v) =>
    updateUniversity(universityId, { trackingPortal: v }),
  );
  const [creds, setCreds] = useAutosaveField(university?.trackingCreds ?? "", (v) =>
    updateUniversity(universityId, { trackingCreds: v }),
  );

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <label htmlFor="trackingPortal" className="text-[0.92rem] font-semibold text-[var(--muted)]">
          Portal link
        </label>
        <Input id="trackingPortal" type="url" placeholder="https://…" value={portal} onChange={(e) => setPortal(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <label htmlFor="trackingCreds" className="text-[0.92rem] font-semibold text-[var(--muted)]">
          Credentials notes (prototype only)
        </label>
        <Textarea
          id="trackingCreds"
          placeholder="Don't store real passwords. Use hints only."
          value={creds}
          onChange={(e) => setCreds(e.target.value)}
        />
      </div>
    </div>
  );
}

export function TrackingPage() {
  const universities = useAppStore((s) => s.universities);
  const setPipelineStage = useAppStore((s) => s.setPipelineStage);
  const addCheckItem = useAppStore((s) => s.addCheckItem);
  const toggleCheckItem = useAppStore((s) => s.toggleCheckItem);
  const removeCheckItem = useAppStore((s) => s.removeCheckItem);

  const [schoolId, setSchoolId] = useState("");
  const [newItem, setNewItem] = useState("");
  const university = universities.find((u) => u.id === schoolId);

  return (
    <div className="grid gap-3.5">
      <div className="grid gap-1.5">
        <h1 className="text-[1.25rem] font-bold tracking-tight">Application Tracking</h1>
        <p className="text-[var(--muted)]">Move schools through stages with a clean status pipeline.</p>
      </div>

      <GlassCard>
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-[1.05rem] font-bold">Status pipeline</h2>
          <Select aria-label="Select school" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="w-auto">
            <option value="">Pick a school…</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </header>

        {!university ? (
          <p className="mt-3 text-[var(--muted)]">Pick a school to manage its pipeline.</p>
        ) : (
          <>
            <div className="mt-3 mb-3.5 flex flex-wrap gap-2.5" aria-label="Pipeline stages">
              {PIPELINE_STAGES.map((stage) => (
                <Chip
                  key={stage}
                  active={university.pipelineStage === stage}
                  onClick={() => setPipelineStage(university.id, stage)}
                >
                  {stage}
                </Chip>
              ))}
            </div>

            <div className="grid gap-3.5 md:grid-cols-2">
              <div className="rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] p-3.5">
                <h3 className="font-bold">Submission checklist</h3>
                <ul className="mt-2.5 grid list-none gap-2.5 p-0">
                  {university.submissionChecklist.length === 0 && (
                    <li className="text-[0.85rem] text-[var(--tiny)]">No checklist items yet.</li>
                  )}
                  {university.submissionChecklist.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2.5 rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] px-3 py-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCheckItem(university.id, item.id)}
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-md border border-[var(--glass-border)]",
                          item.done && "bg-[var(--color-accent)] border-[var(--color-accent)]",
                        )}
                        aria-label={item.done ? "Mark as not done" : "Mark as done"}
                      />
                      <span className={cn("flex-1", item.done && "line-through opacity-60")}>{item.label}</span>
                      <button
                        type="button"
                        onClick={() => removeCheckItem(university.id, item.id)}
                        aria-label="Remove"
                        className="opacity-60 hover:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 flex gap-2">
                  <Input
                    placeholder="New checklist item"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newItem.trim()) {
                        addCheckItem(university.id, newItem.trim());
                        setNewItem("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!newItem.trim()) return;
                      addCheckItem(university.id, newItem.trim());
                      setNewItem("");
                    }}
                  >
                    <Plus size={15} /> Add item
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] p-3.5">
                <h3 className="font-bold">Portal & notes</h3>
                <div className="mt-2.5">
                  <PortalAndNotes universityId={university.id} />
                </div>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
