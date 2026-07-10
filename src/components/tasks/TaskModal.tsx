import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/store/useToastStore";
import { makeTask } from "@/lib/factories";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormRow, Input, Select, Textarea } from "@/components/ui/Field";
import type { Priority, Task } from "@/types";

export function TaskModal({
  open,
  onClose,
  task,
  defaultUniversityId,
}: {
  open: boolean;
  onClose: () => void;
  task?: Task;
  defaultUniversityId?: string;
}) {
  const universities = useAppStore((s) => s.universities);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setUniversityId(task?.universityId ?? defaultUniversityId ?? "");
    setDueDate(task?.dueDate ?? "");
    setPriority(task?.priority ?? "normal");
    setNotes(task?.notes ?? "");
  }, [open, task, defaultUniversityId]);

  function handleSubmit() {
    if (!title.trim()) {
      toast("Task title is required.");
      return;
    }
    if (isEdit && task) {
      updateTask(task.id, { title: title.trim(), universityId, dueDate, priority, notes });
      toast("Task updated.", "success");
    } else {
      addTask(makeTask({ title: title.trim(), universityId, dueDate, priority, notes }));
      toast("Task added.", "success");
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Task" : "Add Task"}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEdit ? "Save" : "Add"}
          </Button>
        </>
      }
    >
      <div className="grid gap-3.5">
        <FormRow label="Title" htmlFor="m_task_title" required>
          <Input
            id="m_task_title"
            placeholder="e.g., Request transcript"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormRow>

        <FormRow label="School" htmlFor="m_task_school">
          <Select id="m_task_school" value={universityId} onChange={(e) => setUniversityId(e.target.value)}>
            <option value="">(Global / none)</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </FormRow>

        <FormRow label="Due date" htmlFor="m_task_due">
          <Input id="m_task_due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </FormRow>

        <FormRow label="Priority" htmlFor="m_task_priority">
          <Select id="m_task_priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">low</option>
            <option value="normal">normal</option>
            <option value="high">high</option>
          </Select>
        </FormRow>

        <FormRow label="Notes" htmlFor="m_task_notes">
          <Textarea id="m_task_notes" placeholder="Optional…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormRow>
      </div>
    </Modal>
  );
}
