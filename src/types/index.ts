export type ApplicationRound = "ED" | "EA" | "REA" | "RD" | "Rolling" | "Other" | "";

export type UniversityStatus = "Researching" | "Drafting" | "Submitted";

export type Priority = "low" | "normal" | "high";

export type TaskStatus = "todo" | "done";

export type EssayStatus = "Not started" | "Draft" | "Revised" | "Final";

export type PipelineStage =
  | "Researching"
  | "In progress"
  | "Essays drafted"
  | "Ready to submit"
  | "Submitted"
  | "Waiting decision"
  | "Accepted"
  | "Waitlisted"
  | "Rejected";

export interface LinkEntry {
  name: string;
  link?: string;
  tag?: string;
  notes?: string;
}

export interface CheckItem {
  id: string;
  label: string;
  done: boolean;
}

export interface University {
  id: string;
  name: string;
  round: ApplicationRound;
  deadline: string; // ISO date string, "" if unset
  status: UniversityStatus;
  priority: Priority;
  tags: string[];
  links: {
    admissions: string;
    npc: string;
    portal: string;
  };
  feeNotes?: string;
  notes: {
    admissions: string;
    academics: string;
    location: string;
    cost: string;
    outcomes: string;
  };
  lists: {
    courses: LinkEntry[];
    research: LinkEntry[];
    clubs: LinkEntry[];
  };
  pipelineStage: PipelineStage;
  submissionChecklist: CheckItem[];
  trackingPortal: string;
  trackingCreds: string;
  createdAt: string;
}

export interface Task {
  id: string;
  universityId: string; // "" = global task
  title: string;
  dueDate: string; // ISO date, "" if unset
  priority: Priority;
  status: TaskStatus;
  notes: string;
}

export interface Essay {
  id: string;
  universityId: string;
  title: string;
  prompt: string;
  wordLimit: number;
  status: EssayStatus;
  bodyHtml: string;
  lastEdited: string; // ISO datetime, "" if never
}

export interface StorySnippet {
  id: string;
  title: string;
  body: string;
}

export interface ReusableBlock {
  id: string;
  title: string;
  body: string;
}

export interface EssaySnapshot {
  id: string;
  essayId: string;
  title: string;
  bodyHtml: string;
  createdAt: string;
}

export interface DailySnapshot {
  id: string;
  title: string;
  createdAt: string;
}

export interface AppMeta {
  version: number;
  createdAt: string;
  theme: "light" | "dark";
  focusSchoolId: string | null;
  autoSnapshot: boolean;
}

export interface AppState {
  meta: AppMeta;
  universities: University[];
  tasks: Task[];
  essays: Essay[];
  storyVault: StorySnippet[];
  reusableBlocks: ReusableBlock[];
  snapshots: EssaySnapshot[];
  dailySnapshots: DailySnapshot[];
}

export const ROUND_OPTIONS: { value: ApplicationRound; label: string }[] = [
  { value: "", label: "Choose one" },
  { value: "ED", label: "ED (Early Decision)" },
  { value: "EA", label: "EA (Early Action)" },
  { value: "REA", label: "REA (Restrictive EA)" },
  { value: "RD", label: "RD (Regular Decision)" },
  { value: "Rolling", label: "Rolling" },
  { value: "Other", label: "Other" },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  "Researching",
  "In progress",
  "Essays drafted",
  "Ready to submit",
  "Submitted",
  "Waiting decision",
  "Accepted",
  "Waitlisted",
  "Rejected",
];

export const STATUS_OPTIONS: UniversityStatus[] = ["Researching", "Drafting", "Submitted"];
