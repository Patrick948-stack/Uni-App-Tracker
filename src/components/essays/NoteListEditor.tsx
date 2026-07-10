import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";

interface Note {
  id: string;
  title: string;
  body: string;
}

export function NoteListEditor({
  items,
  onAdd,
  onRemove,
  emptyLabel,
  titlePlaceholder,
  bodyPlaceholder,
}: {
  items: Note[];
  onAdd: (title: string, body: string) => void;
  onRemove: (id: string) => void;
  emptyLabel: string;
  titlePlaceholder: string;
  bodyPlaceholder: string;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function reset() {
    setTitle("");
    setBody("");
    setAdding(false);
  }

  function submit() {
    if (!title.trim()) return;
    onAdd(title.trim(), body.trim());
    reset();
  }

  return (
    <div className="mt-2.5 grid gap-2.5">
      {items.length === 0 && !adding && <div className="text-[0.85rem] text-[var(--tiny)]">{emptyLabel}</div>}

      {items.map((n) => (
        <div
          key={n.id}
          className="rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] p-3.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-extrabold">{n.title}</div>
              {n.body && <div className="mt-1.5 whitespace-pre-wrap text-[0.85rem] text-[var(--tiny)]">{n.body}</div>}
            </div>
            <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => onRemove(n.id)}>
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
          <Input placeholder={titlePlaceholder} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <Textarea placeholder={bodyPlaceholder} value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[80px]" />
          <Button variant="primary" size="sm" onClick={submit} className="justify-self-start">
            Save
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
