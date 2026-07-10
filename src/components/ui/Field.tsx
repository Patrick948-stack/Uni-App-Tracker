import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldClasses =
  "w-full text-[var(--text)] bg-[var(--field-bg)] border border-[var(--field-border)] rounded-[14px] px-3 py-2.5 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-[border-color,box-shadow] duration-200 focus:border-[color-mix(in_srgb,var(--field-focus)_65%,white)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--field-focus)_35%,transparent)]";

export function FormRow({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-[0.92rem] font-semibold text-[var(--muted)]">
        {label} {required && <span className="text-[var(--color-danger)] font-bold">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, "min-h-[120px] resize-y", className)} {...props} />;
}
