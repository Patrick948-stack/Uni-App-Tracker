import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/store/useToastStore";

export function exportJSON() {
  const state = useAppStore.getState();

  const payload = JSON.stringify(
    {
      meta: state.meta,
      universities: state.universities,
      tasks: state.tasks,
      essays: state.essays,
      storyVault: state.storyVault,
      reusableBlocks: state.reusableBlocks,
      snapshots: state.snapshots,
      dailySnapshots: state.dailySnapshots,
    },
    null,
    2,
  );

  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `university-application-hub-backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Exported JSON.", "success");
}

export function importJSONFile(file: File | undefined | null) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result ?? "{}"));
      const ok = useAppStore.getState().importState(parsed);
      if (!ok) throw new Error("Invalid shape");
      toast("Import complete.", "success");
    } catch {
      toast("Import failed. Make sure it's a valid backup JSON.", "error");
    }
  };
  reader.readAsText(file);
}
