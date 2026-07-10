import { uid } from "./id";
import type { ApplicationRound, Essay, Task, University } from "@/types";

export function makeUniversity(
  input: Partial<Pick<University, "name" | "round" | "deadline">> & {
    links?: Partial<University["links"]>;
  } = {},
): University {
  return {
    id: uid(),
    name: input.name ?? "",
    round: (input.round ?? "") as ApplicationRound,
    deadline: input.deadline ?? "",
    status: "Researching",
    priority: "normal",
    tags: [],
    links: {
      admissions: input.links?.admissions ?? "",
      npc: input.links?.npc ?? "",
      portal: input.links?.portal ?? "",
    },
    feeNotes: "",
    notes: {
      admissions: "",
      academics: "",
      location: "",
      cost: "",
      outcomes: "",
    },
    lists: {
      courses: [],
      research: [],
      clubs: [],
    },
    pipelineStage: "Researching",
    submissionChecklist: [],
    trackingPortal: "",
    trackingCreds: "",
    createdAt: new Date().toISOString(),
  };
}

export function makeTask(
  input: Partial<Pick<Task, "title" | "universityId" | "dueDate" | "priority" | "notes">> = {},
): Task {
  return {
    id: uid(),
    universityId: input.universityId ?? "",
    title: input.title ?? "",
    dueDate: input.dueDate ?? "",
    priority: input.priority ?? "normal",
    status: "todo",
    notes: input.notes ?? "",
  };
}

export function makeEssay(
  input: Partial<Pick<Essay, "title" | "universityId" | "prompt" | "wordLimit" | "status">> = {},
): Essay {
  return {
    id: uid(),
    universityId: input.universityId ?? "",
    title: input.title ?? "",
    prompt: input.prompt ?? "",
    wordLimit: input.wordLimit ?? 0,
    status: input.status ?? "Not started",
    bodyHtml: "",
    lastEdited: "",
  };
}
