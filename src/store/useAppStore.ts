import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/id";
import { makeEssay, makeTask, makeUniversity } from "@/lib/factories";
import { appStateSchema } from "@/types/schema";
import type {
  AppState,
  CheckItem,
  Essay,
  EssaySnapshot,
  PipelineStage,
  ReusableBlock,
  StorySnippet,
  Task,
  University,
} from "@/types";

const STORAGE_KEY = "uah:v2";

function defaultState(): AppState {
  return {
    meta: {
      version: 2,
      createdAt: new Date().toISOString(),
      theme: "light",
      focusSchoolId: null,
      autoSnapshot: false,
    },
    universities: [],
    tasks: [],
    essays: [],
    storyVault: [],
    reusableBlocks: [],
    snapshots: [],
    dailySnapshots: [],
  };
}

interface AppActions {
  hasData: () => boolean;

  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  addUniversity: (u: University) => void;
  updateUniversity: (id: string, patch: Partial<University>) => void;
  removeUniversity: (id: string) => void;
  getUniversity: (id: string) => University | undefined;

  addTask: (t: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTaskDone: (id: string) => void;
  removeTask: (id: string) => void;

  addEssay: (e: Essay) => void;
  updateEssay: (id: string, patch: Partial<Essay>) => void;
  removeEssay: (id: string) => void;

  addSnapshot: (snap: EssaySnapshot) => void;

  addStorySnippet: (s: StorySnippet) => void;
  updateStorySnippet: (id: string, patch: Partial<StorySnippet>) => void;
  removeStorySnippet: (id: string) => void;

  addReusableBlock: (b: ReusableBlock) => void;
  updateReusableBlock: (id: string, patch: Partial<ReusableBlock>) => void;
  removeReusableBlock: (id: string) => void;

  setPipelineStage: (universityId: string, stage: PipelineStage) => void;
  addCheckItem: (universityId: string, label: string) => void;
  toggleCheckItem: (universityId: string, itemId: string) => void;
  removeCheckItem: (universityId: string, itemId: string) => void;

  setFocusSchool: (id: string | null) => void;

  loadDemoData: () => void;
  importState: (data: unknown) => boolean;
  resetAll: () => void;
  maybeDailySnapshot: () => void;
}

export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...defaultState(),

      hasData: () => {
        const s = get();
        return s.universities.length > 0 || s.tasks.length > 0 || s.essays.length > 0;
      },

      setTheme: (theme) => set((s) => ({ meta: { ...s.meta, theme } })),
      toggleTheme: () =>
        set((s) => ({ meta: { ...s.meta, theme: s.meta.theme === "dark" ? "light" : "dark" } })),

      addUniversity: (u) => set((s) => ({ universities: [...s.universities, u] })),
      updateUniversity: (id, patch) =>
        set((s) => ({
          universities: s.universities.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
      removeUniversity: (id) =>
        set((s) => ({
          universities: s.universities.filter((u) => u.id !== id),
          tasks: s.tasks.filter((t) => t.universityId !== id),
          essays: s.essays.filter((e) => e.universityId !== id),
        })),
      getUniversity: (id) => get().universities.find((u) => u.id === id),

      addTask: (t) => set((s) => ({ tasks: [...s.tasks, t] })),
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      toggleTaskDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t,
          ),
        })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addEssay: (e) => set((s) => ({ essays: [...s.essays, e] })),
      updateEssay: (id, patch) =>
        set((s) => ({ essays: s.essays.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      removeEssay: (id) => set((s) => ({ essays: s.essays.filter((e) => e.id !== id) })),

      addSnapshot: (snap) => set((s) => ({ snapshots: [...s.snapshots, snap] })),

      addStorySnippet: (snippet) => set((s) => ({ storyVault: [...s.storyVault, snippet] })),
      updateStorySnippet: (id, patch) =>
        set((s) => ({
          storyVault: s.storyVault.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removeStorySnippet: (id) =>
        set((s) => ({ storyVault: s.storyVault.filter((x) => x.id !== id) })),

      addReusableBlock: (block) => set((s) => ({ reusableBlocks: [...s.reusableBlocks, block] })),
      updateReusableBlock: (id, patch) =>
        set((s) => ({
          reusableBlocks: s.reusableBlocks.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removeReusableBlock: (id) =>
        set((s) => ({ reusableBlocks: s.reusableBlocks.filter((x) => x.id !== id) })),

      setPipelineStage: (universityId, stage) =>
        set((s) => ({
          universities: s.universities.map((u) =>
            u.id === universityId ? { ...u, pipelineStage: stage } : u,
          ),
        })),
      addCheckItem: (universityId, label) =>
        set((s) => ({
          universities: s.universities.map((u) =>
            u.id === universityId
              ? {
                  ...u,
                  submissionChecklist: [
                    ...u.submissionChecklist,
                    { id: uid(), label, done: false } satisfies CheckItem,
                  ],
                }
              : u,
          ),
        })),
      toggleCheckItem: (universityId, itemId) =>
        set((s) => ({
          universities: s.universities.map((u) =>
            u.id === universityId
              ? {
                  ...u,
                  submissionChecklist: u.submissionChecklist.map((c) =>
                    c.id === itemId ? { ...c, done: !c.done } : c,
                  ),
                }
              : u,
          ),
        })),
      removeCheckItem: (universityId, itemId) =>
        set((s) => ({
          universities: s.universities.map((u) =>
            u.id === universityId
              ? {
                  ...u,
                  submissionChecklist: u.submissionChecklist.filter((c) => c.id !== itemId),
                }
              : u,
          ),
        })),

      setFocusSchool: (id) => set((s) => ({ meta: { ...s.meta, focusSchoolId: id } })),

      loadDemoData: () => {
        const u1 = makeUniversity({
          name: "Example University",
          round: "RD",
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40).toISOString().slice(0, 10),
          links: { admissions: "https://example.com/admissions" },
        });
        const u2 = makeUniversity({
          name: "North Valley College",
          round: "EA",
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString().slice(0, 10),
          links: { npc: "https://example.com/npc" },
        });

        const t1 = makeTask({
          universityId: u2.id,
          title: "Request counselor recommendation",
          dueDate: u2.deadline,
          priority: "high",
        });
        const t2 = makeTask({
          universityId: u1.id,
          title: "Draft supplemental #1",
          notes: "Find prompt on admissions site.",
        });

        const essay = makeEssay({
          universityId: u1.id,
          title: "Why this college?",
          prompt: "Describe why you want to attend.",
          wordLimit: 250,
          status: "Draft",
        });
        essay.bodyHtml = "<p>I'm excited about...</p>";
        essay.lastEdited = new Date().toISOString();

        set((s) => ({
          universities: [...s.universities, u1, u2],
          tasks: [...s.tasks, t1, t2],
          essays: [...s.essays, essay],
        }));
      },

      importState: (data) => {
        const result = appStateSchema.safeParse(data);
        if (!result.success) return false;

        const parsed = result.data;
        const base = defaultState();
        set({
          ...base,
          ...parsed,
          meta: { ...base.meta, ...(parsed.meta ?? {}) },
        });
        return true;
      },

      resetAll: () => set(defaultState()),

      maybeDailySnapshot: () => {
        const s = get();
        if (!s.meta.autoSnapshot) return;
        const today = new Date().toISOString().slice(0, 10);
        const already = s.dailySnapshots.some((d) => d.createdAt.slice(0, 10) === today);
        if (already) return;
        set((state) => ({
          dailySnapshots: [
            ...state.dailySnapshots,
            { id: uid(), title: `Daily snapshot • ${today}`, createdAt: new Date().toISOString() },
          ],
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      // Only persist plain data, never the action functions.
      partialize: (s): AppState => ({
        meta: s.meta,
        universities: s.universities,
        tasks: s.tasks,
        essays: s.essays,
        storyVault: s.storyVault,
        reusableBlocks: s.reusableBlocks,
        snapshots: s.snapshots,
        dailySnapshots: s.dailySnapshots,
      }),
    },
  ),
);
