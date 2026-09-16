/**
 * Loose "is this a plausible http(s) URL" check. Intentionally permissive —
 * this is a save-time warning, not a real network validation.
 */
export function isValidUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
