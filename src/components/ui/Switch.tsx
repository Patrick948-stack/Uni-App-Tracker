export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <label htmlFor={id} className="inline-flex select-none items-center gap-2.5 cursor-pointer">
      <span className="relative inline-block h-[30px] w-[52px]">
        <input
          id={id}
          type="checkbox"
          className="peer absolute h-px w-px opacity-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className="absolute inset-0 rounded-full border border-white/30 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] transition-colors duration-200 peer-checked:bg-gradient-to-b peer-checked:from-[color-mix(in_srgb,var(--color-accent)_70%,transparent)] peer-checked:to-[color-mix(in_srgb,var(--color-accent-2)_40%,transparent)]"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute top-1/2 left-1 h-6 w-6 -translate-y-1/2 rounded-full bg-gradient-to-b from-white/90 to-white/65 shadow-[0_10px_22px_rgba(0,0,0,0.18)] transition-transform duration-200 peer-checked:translate-x-[22px] peer-checked:-translate-y-1/2"
          aria-hidden="true"
        />
      </span>
      <span className="font-bold text-[var(--muted)]">{label}</span>
    </label>
  );
}
