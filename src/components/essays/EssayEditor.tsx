import { Bold, Check, Heading2, Italic, List, ListOrdered, Loader2, Underline } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/store/useToastStore";
import { uid } from "@/lib/id";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import type { Essay } from "@/types";

type SaveState = "idle" | "saving" | "saved";

const TOOLBAR: { icon: typeof Bold; cmd: string; value?: string; label: string }[] = [
  { icon: Bold, cmd: "bold", label: "Bold" },
  { icon: Italic, cmd: "italic", label: "Italic" },
  { icon: Underline, cmd: "underline", label: "Underline" },
  { icon: List, cmd: "insertUnorderedList", label: "Bullets" },
  { icon: ListOrdered, cmd: "insertOrderedList", label: "Numbered list" },
  { icon: Heading2, cmd: "formatBlock", value: "h2", label: "Heading" },
];

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).filter(Boolean).length : 0;
}

export function EssayEditor({ essay }: { essay: Essay | undefined }) {
  const updateEssay = useAppStore((s) => s.updateEssay);
  const addSnapshot = useAppStore((s) => s.addSnapshot);

  const editorRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState(essay?.prompt ?? "");
  const [wordLimit, setWordLimit] = useState(essay?.wordLimit ? String(essay.wordLimit) : "");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Load the essay's saved content whenever the selected essay changes.
  useEffect(() => {
    setPrompt(essay?.prompt ?? "");
    setWordLimit(essay?.wordLimit ? String(essay.wordLimit) : "");
    if (editorRef.current) editorRef.current.innerHTML = essay?.bodyHtml ?? "";
    updateCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [essay?.id]);

  function getPlainText() {
    return editorRef.current?.innerText ?? "";
  }

  function updateCounts() {
    const text = getPlainText();
    setWordCount(countWords(text));
    setCharCount(text.length);
  }

  function save(showToast = true) {
    if (!essay) {
      if (showToast) toast("Open an essay first.");
      return;
    }
    const bodyHtml = editorRef.current?.innerHTML ?? "";
    const text = getPlainText();
    let status = essay.status;
    if (text.trim().length === 0) status = "Not started";
    else if (status === "Not started") status = "Draft";

    if (showToast) setSaveState("saving");

    updateEssay(essay.id, {
      prompt,
      wordLimit: parseInt(wordLimit || "0", 10) || 0,
      bodyHtml,
      lastEdited: new Date().toISOString(),
      status,
    });

    if (showToast) {
      // A deliberately visible beat before "saved" — the save itself is
      // instant (it's just an in-memory store write), but a save button
      // that flickers state in under a frame reads as broken, not fast.
      window.setTimeout(() => {
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 1100);
      }, 220);
    }
  }

  function snapshot() {
    if (!essay) {
      toast("Open an essay first.");
      return;
    }
    addSnapshot({
      id: uid(),
      essayId: essay.id,
      title: `Snapshot • ${new Date().toLocaleString()}`,
      bodyHtml: editorRef.current?.innerHTML ?? "",
      createdAt: new Date().toISOString(),
    });
    toast("Snapshot saved.", "success");
  }

  function runCommand(cmd: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    updateCounts();
  }

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function scheduleAutosave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(false), 500);
  }

  const limit = parseInt(wordLimit || "0", 10) || 0;
  const limitDiff = limit ? limit - wordCount : null;

  return (
    <div className="grid gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5 text-[0.85rem] text-[var(--tiny)]">
        <span>{essay?.status ?? "Not started"}</span>
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
      </div>

      <div
        role="toolbar"
        aria-label="Editor toolbar"
        className="flex flex-wrap gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_75%,transparent)] p-2.5"
      >
        {TOOLBAR.map(({ icon: Icon, cmd, value, label }) => (
          <Button key={label} size="icon" aria-label={label} onClick={() => runCommand(cmd, value)}>
            <Icon size={16} />
          </Button>
        ))}
      </div>

      <div className="grid gap-2.5">
        <label className="sr-only" htmlFor="essayPrompt">
          Prompt
        </label>
        <Textarea
          id="essayPrompt"
          className="min-h-[84px]"
          placeholder="Paste the prompt here…"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            scheduleAutosave();
          }}
        />

        <div
          ref={editorRef}
          id="richEditor"
          className="min-h-[280px] overflow-auto rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--field-bg)_80%,transparent)] p-3.5 outline-none focus:border-[color-mix(in_srgb,var(--field-focus)_65%,white)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--field-focus)_35%,transparent)] [&_h2]:font-bold [&_h2]:text-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          contentEditable={!!essay}
          role="textbox"
          aria-multiline="true"
          aria-label="Essay editor"
          onInput={() => {
            updateCounts();
            scheduleAutosave();
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <label className="sr-only" htmlFor="wordLimit">
              Word limit
            </label>
            <Input
              id="wordLimit"
              type="number"
              min={0}
              placeholder="Word limit (optional)"
              className="w-[180px]"
              value={wordLimit}
              onChange={(e) => {
                setWordLimit(e.target.value);
                scheduleAutosave();
              }}
            />
            {limitDiff !== null && (
              <span className="text-[0.85rem] text-[var(--tiny)]">
                {limitDiff >= 0 ? `${limitDiff} words remaining` : `${Math.abs(limitDiff)} words over limit`}
              </span>
            )}
          </div>

          <div className="flex gap-2.5">
            <Button size="sm" onClick={snapshot}>
              Save snapshot
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="w-[92px] overflow-hidden"
              disabled={saveState !== "idle"}
              aria-label={saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save"}
              onClick={() => save(true)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {saveState === "idle" && (
                  <motion.span key="idle" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                    Save
                  </motion.span>
                )}
                {saveState === "saving" && (
                  <motion.span
                    key="saving"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1, rotate: 360 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ rotate: { duration: 0.6, repeat: Infinity, ease: "linear" }, default: { duration: 0.15 } }}
                  >
                    <Loader2 size={16} />
                  </motion.span>
                )}
                {saveState === "saved" && (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={16} /> Saved
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
