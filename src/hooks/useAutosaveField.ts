import { useEffect, useRef, useState } from "react";

/**
 * Local-first text field state that debounces writes back to the store.
 * Keeps typing snappy (no store round-trip per keystroke) while still
 * persisting shortly after the user pauses.
 */
export function useAutosaveField(externalValue: string, commit: (value: string) => void, delay = 250) {
  const [value, setValue] = useState(externalValue);
  const lastExternal = useRef(externalValue);

  // If the external value changes for a reason other than our own typing
  // (e.g. switching schools, importing data), resync local state.
  useEffect(() => {
    if (externalValue !== lastExternal.current) {
      setValue(externalValue);
      lastExternal.current = externalValue;
    }
  }, [externalValue]);

  useEffect(() => {
    if (value === lastExternal.current) return;
    const t = setTimeout(() => {
      lastExternal.current = value;
      commit(value);
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return [value, setValue] as const;
}
