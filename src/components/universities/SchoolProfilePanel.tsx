import { useState } from "react";
import { motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/lib/dates";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input, Textarea } from "@/components/ui/Field";
import { useAutosaveField } from "@/hooks/useAutosaveField";
import { EntryListEditor } from "./EntryListEditor";
import type { University } from "@/types";

const TABS = [
  { key: "admissions", label: "Admissions" },
  { key: "academics", label: "Academics" },
  { key: "courses", label: "Courses" },
  { key: "research", label: "Research" },
  { key: "clubs", label: "Clubs" },
  { key: "location", label: "Location" },
  { key: "cost", label: "Cost & Aid" },
  { key: "outcomes", label: "Outcomes" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function NotesTab({
  university,
  field,
  placeholder,
}: {
  university: University;
  field: keyof University["notes"];
  placeholder: string;
}) {
  const updateUniversity = useAppStore((s) => s.updateUniversity);
  const [value, setValue] = useAutosaveField(university.notes[field], (v) =>
    updateUniversity(university.id, { notes: { ...university.notes, [field]: v } }),
  );

  return (
    <GlassCard>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-h-[220px]"
      />
    </GlassCard>
  );
}

export function SchoolProfilePanel({ university, onClose }: { university: University; onClose: () => void }) {
  const updateUniversity = useAppStore((s) => s.updateUniversity);
  const [tab, setTab] = useState<TabKey>("admissions");

  const [portal, setPortal] = useAutosaveField(university.links.portal, (v) =>
    updateUniversity(university.id, { links: { ...university.links, portal: v } }),
  );
  const [feeNotes, setFeeNotes] = useAutosaveField(university.feeNotes ?? "", (v) =>
    updateUniversity(university.id, { feeNotes: v }),
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3.5"
      aria-label="School profile"
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[1.1rem] font-bold">{university.name}</h2>
          <p className="text-[0.85rem] text-[var(--tiny)]">
            {university.round || "—"} • Deadline: {formatDate(university.deadline)}
          </p>
        </div>
        <Button onClick={onClose}>Close</Button>
      </header>

      <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1.5" role="tablist" aria-label="School sections">
        {TABS.map((t) => (
          <Chip key={t.key} role="tab" active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {tab === "admissions" && (
        <div className="grid gap-3.5 md:grid-cols-2">
          <NotesTab
            university={university}
            field="admissions"
            placeholder="Testing policy, interview policy, required materials…"
          />
          <GlassCard>
            <h3 className="mb-3 font-bold">Links</h3>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label htmlFor="profilePortal" className="text-[0.92rem] font-semibold text-[var(--muted)]">
                  Portal link
                </label>
                <Input
                  id="profilePortal"
                  type="url"
                  placeholder="https://…"
                  value={portal}
                  onChange={(e) => setPortal(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="profileFee" className="text-[0.92rem] font-semibold text-[var(--muted)]">
                  Application fee / waiver
                </label>
                <Input
                  id="profileFee"
                  placeholder="$ / waiver notes"
                  value={feeNotes}
                  onChange={(e) => setFeeNotes(e.target.value)}
                />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "academics" && (
        <NotesTab
          university={university}
          field="academics"
          placeholder="Majors you care about, departments, degree requirements, catalog highlights…"
        />
      )}

      {tab === "courses" && (
        <GlassCard>
          <h3 className="font-bold">Courses</h3>
          <EntryListEditor
            items={university.lists.courses}
            emptyLabel="No courses saved yet."
            showTag
            nameLabel="Course name"
            onAdd={(entry) =>
              updateUniversity(university.id, {
                lists: { ...university.lists, courses: [...university.lists.courses, entry] },
              })
            }
            onRemove={(i) =>
              updateUniversity(university.id, {
                lists: { ...university.lists, courses: university.lists.courses.filter((_, idx) => idx !== i) },
              })
            }
          />
        </GlassCard>
      )}

      {tab === "research" && (
        <GlassCard>
          <h3 className="font-bold">Research</h3>
          <EntryListEditor
            items={university.lists.research}
            emptyLabel="No research notes saved yet."
            nameLabel="Lab / professor / title"
            onAdd={(entry) =>
              updateUniversity(university.id, {
                lists: { ...university.lists, research: [...university.lists.research, entry] },
              })
            }
            onRemove={(i) =>
              updateUniversity(university.id, {
                lists: { ...university.lists, research: university.lists.research.filter((_, idx) => idx !== i) },
              })
            }
          />
        </GlassCard>
      )}

      {tab === "clubs" && (
        <GlassCard>
          <h3 className="font-bold">Clubs & student life</h3>
          <EntryListEditor
            items={university.lists.clubs}
            emptyLabel="No clubs saved yet."
            showTag
            nameLabel="Club name"
            onAdd={(entry) =>
              updateUniversity(university.id, {
                lists: { ...university.lists, clubs: [...university.lists.clubs, entry] },
              })
            }
            onRemove={(i) =>
              updateUniversity(university.id, {
                lists: { ...university.lists, clubs: university.lists.clubs.filter((_, idx) => idx !== i) },
              })
            }
          />
        </GlassCard>
      )}

      {tab === "location" && (
        <NotesTab
          university={university}
          field="location"
          placeholder="City/state, weather/vibe, travel notes, transportation links…"
        />
      )}

      {tab === "cost" && (
        <NotesTab university={university} field="cost" placeholder="NPC link, scholarships, aid policies, dealbreakers…" />
      )}

      {tab === "outcomes" && (
        <NotesTab
          university={university}
          field="outcomes"
          placeholder="Internships notes, alumni outcomes link, career center notes…"
        />
      )}
    </motion.section>
  );
}
