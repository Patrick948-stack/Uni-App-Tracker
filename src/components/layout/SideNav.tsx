import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  BookMarked,
  Compass,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  PenLine,
  Save,
} from "lucide-react";
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

// Mobile bottom bar only has room for a handful of tabs; the rest live
// behind "More". Primary items are the ones a student checks most often.
const PRIMARY_KEYS = ["/dashboard", "/universities", "/tasks", "/essays"];
const primaryItems = NAV_ITEMS.filter((i) => PRIMARY_KEYS.includes(i.to));
const overflowItems = NAV_ITEMS.filter((i) => !PRIMARY_KEYS.includes(i.to));

function DesktopNav() {
  return (
    <nav className="hidden gap-2.5 md:sticky md:top-[80px] md:grid md:content-start" aria-label="Primary navigation">
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

function MobileTabBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const onOverflowRoute = overflowItems.some((i) => pathname.startsWith(i.to));

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMoreOpen(false)}
              aria-hidden="true"
              initial={{ opacity: 0, pointerEvents: "none" }}
              animate={{ opacity: 1, pointerEvents: "auto" }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={{ duration: 0.15 }}
            />
            <motion.div
              className="glass-surface pointer-events-auto fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 grid gap-1.5 rounded-[var(--radius-glass-lg)] p-2 md:hidden"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              {overflowItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-semibold",
                      isActive
                        ? "bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
                        : "hover:bg-white/10",
                    )
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around gap-1 border-t border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg)_92%,transparent)] px-1 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
        aria-label="Primary navigation"
      >
        {primaryItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[0.7rem] font-semibold",
                isActive ? "text-[var(--color-accent-text)]" : "text-[var(--muted)]",
              )
            }
          >
            <Icon size={20} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          aria-label="More navigation options"
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[0.7rem] font-semibold",
            moreOpen || onOverflowRoute ? "text-[var(--color-accent-text)]" : "text-[var(--muted)]",
          )}
        >
          <MoreHorizontal size={20} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}

export function SideNav() {
  return (
    <>
      <DesktopNav />
      <MobileTabBar />
    </>
  );
}
