import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import type { LinkEntry } from "@/types";

export function EntryListEditor({
  items,
  onAdd,
  onRemove,
  emptyLabel,
  showTag,
  nameLabel = "Name",
}: {
  items: LinkEntry[];
  onAdd: (entry: LinkEntry) => void;
  onRemove: (index: number) => void;
  emptyLabel: string;
  showTag?: boolean;
  nameLabel?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setName("");
    setTag("");
    setLink("");
    setNotes("");
    setAdding(false);
  }

  function submit() {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), tag: tag.trim(), link: link.trim(), notes: notes.trim() });
    reset();
  }

  return (
    <div className="mt-2.5 grid gap-2.5">
      {items.length === 0 && !adding && <div className="text-[0.85rem] text-[var(--tiny)]">{emptyLabel}</div>}

      {items.map((entry, i) => (
        <div
          key={`${entry.name}-${i}`}
          className="rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] p-3.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-extrabold">{entry.name}</div>
              <div className="text-[0.85rem] text-[var(--tiny)]">
                {entry.tag ? `${entry.tag}${entry.link ? " • " : ""}` : ""}
                {entry.link}
              </div>
              {entry.notes && <div className="mt-1.5 text-[0.85rem] text-[var(--tiny)]">{entry.notes}</div>}
            </div>
            <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => onRemove(i)}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="grid gap-2.5 rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_75%,transparent)] p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.85rem] font-bold text-[var(--muted)]">New entry</span>
            <Button size="icon" variant="ghost" aria-label="Cancel" onClick={reset}>
              <X size={16} />
            </Button>
          </div>
          <Input placeholder={nameLabel} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          {showTag && <Input placeholder="Tag (e.g., CS, STEM)" value={tag} onChange={(e) => setTag(e.target.value)} />}
          <Input placeholder="Link (optional)" type="url" value={link} onChange={(e) => setLink(e.target.value)} />
          <Textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[70px]"
          />
          <Button variant="primary" size="sm" onClick={submit} className="justify-self-start">
            Save entry
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={() => setAdding(true)} className="justify-self-start">
          <Plus size={15} /> Add
        </Button>
      )}
    </div>
  );
}
