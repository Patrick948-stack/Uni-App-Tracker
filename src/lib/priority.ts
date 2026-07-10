import type { Priority } from "@/types";

const SCORES: Record<Priority, number> = { low: 1, normal: 2, high: 3 };

export function priorityScore(p: Priority | undefined): number {
  return p ? SCORES[p] : 2;
}
