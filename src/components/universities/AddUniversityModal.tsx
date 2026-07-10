import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/store/useToastStore";
import { makeUniversity } from "@/lib/factories";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormRow, Input, Select } from "@/components/ui/Field";
import { ROUND_OPTIONS, STATUS_OPTIONS } from "@/types";
import type { ApplicationRound, UniversityStatus } from "@/types";

export function AddUniversityModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addUniversity = useAppStore((s) => s.addUniversity);

  const [name, setName] = useState("");
  const [round, setRound] = useState<ApplicationRound>("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<UniversityStatus>("Researching");
  const [admissions, setAdmissions] = useState("");
  const [npc, setNpc] = useState("");
  const [portal, setPortal] = useState("");

  function reset() {
    setName("");
    setRound("");
    setDeadline("");
    setStatus("Researching");
    setAdmissions("");
    setNpc("");
    setPortal("");
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast("University name is required.");
      return;
    }
    const uni = makeUniversity({
      name: name.trim(),
      round,
      deadline,
      links: { admissions: admissions.trim(), npc: npc.trim(), portal: portal.trim() },
    });
    uni.status = status;
    addUniversity(uni);
    toast("University added.", "success");
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add University"
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
        <FormRow label="University name" htmlFor="m_uniName" required>
          <Input id="m_uniName" placeholder="e.g., MIT" value={name} onChange={(e) => setName(e.target.value)} />
        </FormRow>

        <FormRow label="Application round" htmlFor="m_round">
          <Select id="m_round" value={round} onChange={(e) => setRound(e.target.value as ApplicationRound)}>
            {ROUND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </FormRow>

        <FormRow label="Deadline" htmlFor="m_deadline">
          <Input id="m_deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </FormRow>

        <FormRow label="Status" htmlFor="m_status">
          <Select id="m_status" value={status} onChange={(e) => setStatus(e.target.value as UniversityStatus)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormRow>

        <FormRow label="Admissions link" htmlFor="m_adm">
          <Input id="m_adm" type="url" placeholder="https://…" value={admissions} onChange={(e) => setAdmissions(e.target.value)} />
        </FormRow>
        <FormRow label="Net price calculator" htmlFor="m_npc">
          <Input id="m_npc" type="url" placeholder="https://…" value={npc} onChange={(e) => setNpc(e.target.value)} />
        </FormRow>
        <FormRow label="Portal link" htmlFor="m_portal">
          <Input id="m_portal" type="url" placeholder="https://…" value={portal} onChange={(e) => setPortal(e.target.value)} />
        </FormRow>
      </div>
    </Modal>
  );
}
