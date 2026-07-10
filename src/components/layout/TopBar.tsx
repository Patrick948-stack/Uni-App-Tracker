import { Download, Search, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import { useUIStore } from "@/store/useUIStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { exportJSON, importJSONFile } from "@/lib/backup";

export function TopBar() {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const [local, setLocal] = useState(query);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery(local), 120);
    return () => clearTimeout(t);
  }, [local, setQuery]);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3.5 border-b border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg)_70%,transparent)] px-4 py-3.5 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-8 w-8 place-items-center rounded-[10px] border border-white/40 bg-gradient-to-br from-blue-500/35 to-violet-500/25 shadow-sm"
          aria-hidden="true"
        >
          ◆
        </span>
        <span className="font-bold tracking-tight">Application Hub</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex items-center">
          <label className="sr-only" htmlFor="globalSearch">
            Search
          </label>
          <input
            id="globalSearch"
            type="search"
            placeholder="Search schools, tasks, essays…"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="w-[min(420px,50vw)] rounded-[14px] border border-[var(--field-border)] bg-[var(--field-bg)] py-2.5 pl-3.5 pr-9 outline-none focus:border-[color-mix(in_srgb,var(--field-focus)_65%,white)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--field-focus)_35%,transparent)]"
          />
          {local && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setLocal("")}
              className="absolute right-2 grid h-7 w-7 place-items-center rounded-xl opacity-80 hover:opacity-100"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden items-center gap-2 rounded-[14px] border border-[var(--field-border)] bg-[var(--field-bg)] px-3.5 py-2.5 text-[0.85rem] text-[var(--tiny)] transition-shadow hover:shadow-[var(--shadow)] sm:flex"
        >
          <Search size={15} />
          <span>Quick actions</span>
          <kbd className="ml-1 rounded-md border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--glass-bg-2)_80%,transparent)] px-1.5 py-0.5 font-mono text-[0.72rem]">
            ⌘K
          </kbd>
        </button>

        <ThemeToggle compact />

        <Button onClick={exportJSON} title="Export your data as JSON">
          <Download size={16} />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <Button onClick={() => fileInputRef.current?.click()} title="Import a JSON backup">
          <Upload size={16} />
          <span className="hidden sm:inline">Import</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            importJSONFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </header>
  );
}
