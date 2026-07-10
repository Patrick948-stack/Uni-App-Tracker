import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy");
}

export function daysUntil(iso: string | undefined | null): number | null {
  if (!iso) return null;
  const d = parseISO(iso);
  if (!isValid(d)) return null;
  return differenceInCalendarDays(d, new Date());
}

export function formatDaysUntil(days: number | null): string {
  if (days === null) return "";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `${days}d`;
  return `${Math.abs(days)}d past`;
}
