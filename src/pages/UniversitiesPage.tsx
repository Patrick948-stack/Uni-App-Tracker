import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useUIStore } from "@/store/useUIStore";
import { daysUntil } from "@/lib/dates";
import { priorityScore } from "@/lib/priority";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { UniversityCard } from "@/components/universities/UniversityCard";
import { SchoolProfilePanel } from "@/components/universities/SchoolProfilePanel";
import type { UniversityStatus } from "@/types";

type SortKey = "soonest" | "priority" | "alpha";

export function UniversitiesPage() {
  const universities = useAppStore((s) => s.universities);
  const tasks = useAppStore((s) => s.tasks);
  const query = useSearchStore((s) => s.query).trim().toLowerCase();

  const [statusFilter, setStatusFilter] = useState<UniversityStatus | "">("");
  const [sort, setSort] = useState<SortKey>("soonest");
  const selectedId = useUIStore((s) => s.selectedUniversityId);
  const setSelectedId = useUIStore((s) => s.setSelectedUniversityId);
  const setAddUniversityOpen = useUIStore((s) => s.setAddUniversityOpen);

  const list = useMemo(() => {
    let items = [...universities];

    if (query) {
      items = items.filter((u) => {
        const hay = [u.name, u.round, u.status, ...u.tags, u.notes.admissions, u.notes.academics, u.notes.cost]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
    }

    if (statusFilter) items = items.filter((u) => u.status === statusFilter);

    if (sort === "alpha") items.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "soonest") {
      items.sort((a, b) => {
        const da = a.deadline ? (daysUntil(a.deadline) ?? 99999) : 99999;
        const db = b.deadline ? (daysUntil(b.deadline) ?? 99999) : 99999;
        return da - db;
      });
    }
    if (sort === "priority") items.sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority));

    return items;
  }, [universities, query, statusFilter, sort]);

  const selected = selectedId ? universities.find((u) => u.id === selectedId) : undefined;

  return (
    <div className="grid gap-3.5">
      <div className="grid gap-2.5">
        <h1 className="text-[1.25rem] font-bold tracking-tight">Universities</h1>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <Button variant="primary" onClick={() => setAddUniversityOpen(true)}>
            + Add University
          </Button>

          <div className="flex flex-wrap gap-2.5">
            <Select
              aria-label="Status filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UniversityStatus | "")}
              className="w-auto"
            >
              <option value="">All statuses</option>
              <option value="Researching">Researching</option>
              <option value="Drafting">Drafting</option>
              <option value="Submitted">Submitted</option>
            </Select>

            <Select
              aria-label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-auto"
            >
              <option value="soonest">Soonest deadline</option>
              <option value="priority">Priority</option>
              <option value="alpha">Alphabetical</option>
            </Select>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={query ? "No results" : "No universities here yet"}
          description={query ? "Try a different search." : "Add one, or clear filters."}
          action={
            !query && (
              <Button variant="primary" onClick={() => setAddUniversityOpen(true)}>
                + Add University
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((u) => (
            <UniversityCard key={u.id} university={u} tasks={tasks} onOpen={() => setSelectedId(u.id)} />
          ))}
        </div>
      )}

      {selected && <SchoolProfilePanel university={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
