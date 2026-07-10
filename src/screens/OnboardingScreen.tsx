import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/store/useToastStore";
import { makeUniversity } from "@/lib/factories";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FormRow, Input, Select } from "@/components/ui/Field";
import { ROUND_OPTIONS } from "@/types";
import type { ApplicationRound } from "@/types";

export function OnboardingScreen() {
  const addUniversity = useAppStore((s) => s.addUniversity);
  const loadDemoData = useAppStore((s) => s.loadDemoData);

  const [name, setName] = useState("");
  const [round, setRound] = useState<ApplicationRound>("");
  const [deadline, setDeadline] = useState("");
  const [admissions, setAdmissions] = useState("");
  const [npc, setNpc] = useState("");
  const [portal, setPortal] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast("University name is required.");
      return;
    }
    addUniversity(
      makeUniversity({
        name: name.trim(),
        round,
        deadline,
        links: { admissions: admissions.trim(), npc: npc.trim(), portal: portal.trim() },
      }),
    );
    toast("University added!", "success");
  }

  return (
    <div className="min-h-screen p-5">
      <header className="mx-auto mb-4 flex max-w-[980px] items-center justify-between gap-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-[34px] w-[34px] place-items-center rounded-xl border border-white/40 bg-gradient-to-br from-blue-500/35 to-violet-500/25 shadow-sm"
            aria-hidden="true"
          >
            ◆
          </span>
          <span className="font-bold tracking-tight">University Application Hub</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-[720px]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <GlassCard hover={false}>
            <h2 className="text-[1.1rem] font-bold">Add your first university</h2>
            <p className="mt-1 text-[var(--muted)]">Start small. You can add more schools anytime.</p>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-3.5">
              <FormRow label="University name" htmlFor="uniName" required>
                <Input
                  id="uniName"
                  placeholder="e.g., Stanford University"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FormRow>

              <FormRow label="Application round" htmlFor="appRound">
                <Select id="appRound" value={round} onChange={(e) => setRound(e.target.value as ApplicationRound)}>
                  {ROUND_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormRow>

              <FormRow label="Deadline" htmlFor="deadline">
                <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </FormRow>

              <fieldset className="rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg-2)_70%,transparent)] p-3">
                <legend className="px-2 font-bold text-[var(--muted)]">Optional links</legend>
                <div className="grid gap-3">
                  <FormRow label="Admissions page" htmlFor="linkAdmissions">
                    <Input
                      id="linkAdmissions"
                      type="url"
                      placeholder="https://…"
                      value={admissions}
                      onChange={(e) => setAdmissions(e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="Net price calculator" htmlFor="linkNPC">
                    <Input
                      id="linkNPC"
                      type="url"
                      placeholder="https://…"
                      value={npc}
                      onChange={(e) => setNpc(e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="Applicant portal" htmlFor="linkPortal">
                    <Input
                      id="linkPortal"
                      type="url"
                      placeholder="https://…"
                      value={portal}
                      onChange={(e) => setPortal(e.target.value)}
                    />
                  </FormRow>
                </div>
              </fieldset>

              <div className="mt-1 flex flex-wrap gap-2.5">
                <Button type="submit" variant="primary">
                  Add University
                </Button>
                <Button type="button" onClick={() => loadDemoData()}>
                  Skip (use demo data)
                </Button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}
