import { NavLink } from "react-router-dom";
import { BookMarked, Compass, GraduationCap, LayoutDashboard, ListChecks, PenLine, Save } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/universities", label: "Universities", icon: GraduationCap },
  { to: "/guided", label: "Guided Research", icon: Compass },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/essays", label: "Essays", icon: PenLine },
  { to: "/tracking", label: "Tracking", icon: BookMarked },
  { to: "/storage", label: "Backup", icon: Save },
];

export function SideNav() {
  return (
    <nav
      className="grid content-start gap-2.5 md:sticky md:top-[80px] flex md:flex-col overflow-x-auto md:overflow-visible pb-1"
      aria-label="Primary navigation"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex shrink-0 items-center gap-2.5 rounded-[16px] border px-3 py-3 text-left font-semibold transition-shadow duration-200",
              "border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg)_70%,transparent)] shadow-[0_10px_26px_rgba(0,0,0,0.08)] hover:-translate-y-px",
              isActive &&
                "border-[color-mix(in_srgb,var(--color-accent)_45%,var(--glass-border))] shadow-[var(--shadow),var(--glow)]",
            )
          }
        >
          <Icon size={19} className="shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
