import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/store/useToastStore";
import { makeEssay } from "@/lib/factories";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormRow, Input, Select, Textarea } from "@/components/ui/Field";
import type { EssayStatus } from "@/types";

export function AddEssayModal({
  open,
  onClose,
  universityId,
}: {
  open: boolean;
  onClose: () => void;
  universityId: string;
}) {
  const addEssay = useAppStore((s) => s.addEssay);

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [wordLimit, setWordLimit] = useState("");
  const [status, setStatus] = useState<EssayStatus>("Draft");

  function reset() {
    setTitle("");
    setPrompt("");
    setWordLimit("");
    setStatus("Draft");
  }

  function handleSubmit() {
    if (!title.trim()) {
      toast("Essay title is required.");
      return;
    }
    addEssay(
      makeEssay({
        universityId,
        title: title.trim(),
        prompt,
        wordLimit: parseInt(wordLimit, 10) || 0,
        status,
      }),
    );
    toast("Essay added.", "success");
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Essay"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>
            Add
          </Button>
        </>
      }
    >
      <div className="grid gap-3.5">
        <FormRow label="Title" htmlFor="m_essay_title" required>
          <Input
            id="m_essay_title"
            placeholder="e.g., Why this college?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormRow>
        <FormRow label="Prompt" htmlFor="m_essay_prompt">
          <Textarea id="m_essay_prompt" placeholder="Paste the prompt…" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </FormRow>
        <FormRow label="Word limit" htmlFor="m_essay_limit">
          <Input
            id="m_essay_limit"
            type="number"
            min={0}
            placeholder="e.g., 250"
            value={wordLimit}
            onChange={(e) => setWordLimit(e.target.value)}
          />
        </FormRow>
        <FormRow label="Status" htmlFor="m_essay_status">
          <Select id="m_essay_status" value={status} onChange={(e) => setStatus(e.target.value as EssayStatus)}>
            <option>Not started</option>
            <option>Draft</option>
            <option>Revised</option>
            <option>Final</option>
          </Select>
        </FormRow>
      </div>
    </Modal>
  );
}
