import { z } from "zod";

/**
 * Validates data crossing a real trust boundary: a JSON file the user picked
 * off their filesystem. Everything else in the app (the Zustand store's own
 * actions) is trusted internal code and isn't re-validated here — see the
 * course notes on "validate at boundaries, not everywhere."
 */

const linkEntrySchema = z.object({
  name: z.string(),
  link: z.string().optional(),
  tag: z.string().optional(),
  notes: z.string().optional(),
});

const checkItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  done: z.boolean(),
});

const universitySchema = z.object({
  id: z.string(),
  name: z.string(),
  round: z.enum(["ED", "EA", "REA", "RD", "Rolling", "Other", ""]),
  deadline: z.string(),
  status: z.enum(["Researching", "Drafting", "Submitted"]),
  priority: z.enum(["low", "normal", "high"]),
  tags: z.array(z.string()),
  links: z.object({
    admissions: z.string(),
    npc: z.string(),
    portal: z.string(),
  }),
  feeNotes: z.string().optional(),
  notes: z.object({
    admissions: z.string(),
    academics: z.string(),
    location: z.string(),
    cost: z.string(),
    outcomes: z.string(),
  }),
  lists: z.object({
    courses: z.array(linkEntrySchema),
    research: z.array(linkEntrySchema),
    clubs: z.array(linkEntrySchema),
  }),
  pipelineStage: z.enum([
    "Researching",
    "In progress",
    "Essays drafted",
    "Ready to submit",
    "Submitted",
    "Waiting decision",
    "Accepted",
    "Waitlisted",
    "Rejected",
  ]),
  submissionChecklist: z.array(checkItemSchema),
  trackingPortal: z.string(),
  trackingCreds: z.string(),
  createdAt: z.string(),
});

const taskSchema = z.object({
  id: z.string(),
  universityId: z.string(),
  title: z.string(),
  dueDate: z.string(),
  priority: z.enum(["low", "normal", "high"]),
  status: z.enum(["todo", "done"]),
  notes: z.string(),
});

const essaySchema = z.object({
  id: z.string(),
  universityId: z.string(),
  title: z.string(),
  prompt: z.string(),
  wordLimit: z.number(),
  status: z.enum(["Not started", "Draft", "Revised", "Final"]),
  bodyHtml: z.string(),
  lastEdited: z.string(),
});

const storySnippetSchema = z.object({ id: z.string(), title: z.string(), body: z.string() });
const reusableBlockSchema = z.object({ id: z.string(), title: z.string(), body: z.string() });
const essaySnapshotSchema = z.object({
  id: z.string(),
  essayId: z.string(),
  title: z.string(),
  bodyHtml: z.string(),
  createdAt: z.string(),
});
const dailySnapshotSchema = z.object({ id: z.string(), title: z.string(), createdAt: z.string() });

const appMetaSchema = z.object({
  version: z.number(),
  createdAt: z.string(),
  theme: z.enum(["light", "dark"]),
  focusSchoolId: z.string().nullable(),
  autoSnapshot: z.boolean(),
});

export const appStateSchema = z.object({
  meta: appMetaSchema.partial().optional(),
  universities: z.array(universitySchema).optional(),
  tasks: z.array(taskSchema).optional(),
  essays: z.array(essaySchema).optional(),
  storyVault: z.array(storySnippetSchema).optional(),
  reusableBlocks: z.array(reusableBlockSchema).optional(),
  snapshots: z.array(essaySnapshotSchema).optional(),
  dailySnapshots: z.array(dailySnapshotSchema).optional(),
});

export type ImportedAppState = z.infer<typeof appStateSchema>;
