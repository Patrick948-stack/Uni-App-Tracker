import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/store/useToastStore";
import { exportJSON, importJSONFile } from "@/lib/backup";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";

export function StoragePage() {
  const autoSnapshot = useAppStore((s) => s.meta.autoSnapshot);
  const resetAll = useAppStore((s) => s.resetAll);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="grid gap-3.5">
      <div className="grid gap-1.5">
        <h1 className="text-[1.25rem] font-bold tracking-tight">Backup & Storage</h1>
        <p className="text-[var(--muted)]">Export/import JSON and manage local data safely.</p>
      </div>

      <div className="grid gap-3.5 md:grid-cols-2">
        <GlassCard>
          <h2 className="text-[1.05rem] font-bold">Backup</h2>
          <p className="mt-1 text-[var(--muted)]">Save your data to a JSON file you can restore later.</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <Button variant="primary" onClick={exportJSON}>
              Export to JSON
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>Import JSON</Button>
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
        </GlassCard>

        <GlassCard>
          <h2 className="text-[1.05rem] font-bold">Reset</h2>
          <p className="mt-1 text-[var(--muted)]">Clears local storage for this app on this device.</p>
          <Button variant="danger" className="mt-3" onClick={() => setConfirmOpen(true)}>
            Reset all data
          </Button>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-[1.05rem] font-bold">Auto-snapshot (optional)</h2>
        <div className="mt-3">
          <Switch
            id="toggle-autosnapshot"
            checked={autoSnapshot}
            onChange={(checked) => {
              useAppStore.setState((s) => ({ meta: { ...s.meta, autoSnapshot: checked } }));
              toast(checked ? "Daily auto-snapshot enabled." : "Daily auto-snapshot disabled.");
            }}
            label="Daily auto-snapshot"
          />
        </div>
        <p className="mt-2.5 text-[0.85rem] text-[var(--tiny)]">
          If enabled, the app records a daily backup marker in local storage.
        </p>
      </GlassCard>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset all data?"
        footer={
          <>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                resetAll();
                setConfirmOpen(false);
                toast("Data reset.", "success");
              }}
            >
              Reset
            </Button>
          </>
        }
      >
        <p className="text-[var(--muted)]">
          This will permanently clear your local data for this app on this device.
        </p>
      </Modal>
    </div>
  );
}
