import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useThemeSync } from "@/hooks/useThemeSync";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { Background } from "@/components/layout/Background";
import { Toaster } from "@/components/ui/Toaster";
import { ShortcutsOverlay } from "@/components/ui/ShortcutsOverlay";
import { LoadingScreen } from "@/screens/LoadingScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { AppShell } from "@/components/layout/AppShell";

// Route-level code splitting: each page (and the two heaviest third-party
// deps, cmdk and Recharts, pulled in by CommandPalette and DashboardPage)
// ships as its own chunk instead of one large initial bundle.
const CommandPalette = lazy(() =>
  import("@/components/ui/CommandPalette").then((m) => ({ default: m.CommandPalette })),
);
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const UniversitiesPage = lazy(() =>
  import("@/pages/UniversitiesPage").then((m) => ({ default: m.UniversitiesPage })),
);
const GuidedResearchPage = lazy(() =>
  import("@/pages/GuidedResearchPage").then((m) => ({ default: m.GuidedResearchPage })),
);
const TasksPage = lazy(() => import("@/pages/TasksPage").then((m) => ({ default: m.TasksPage })));
const EssaysPage = lazy(() => import("@/pages/EssaysPage").then((m) => ({ default: m.EssaysPage })));
const TrackingPage = lazy(() => import("@/pages/TrackingPage").then((m) => ({ default: m.TrackingPage })));
const StoragePage = lazy(() => import("@/pages/StoragePage").then((m) => ({ default: m.StoragePage })));

function App() {
  useThemeSync();
  useGlobalShortcuts();
  const hasData = useAppStore((s) => s.hasData());
  const maybeDailySnapshot = useAppStore((s) => s.maybeDailySnapshot);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const ms = hasData ? 1000 : 1600;
    const t = setTimeout(() => setBooted(true), ms);
    return () => clearTimeout(t);
    // Intentionally run once: this is a one-time boot splash, not a reaction to hasData changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (booted) maybeDailySnapshot();
  }, [booted, maybeDailySnapshot]);

  return (
    <>
      <Background />
      <Toaster />
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      <ShortcutsOverlay />
      <AnimatePresence mode="wait">
        {!booted ? (
          <motion.div key="loading" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <LoadingScreen />
          </motion.div>
        ) : !hasData ? (
          <motion.div key="onboarding" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <OnboardingScreen />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="universities" element={<UniversitiesPage />} />
                <Route path="guided" element={<GuidedResearchPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="essays" element={<EssaysPage />} />
                <Route path="tracking" element={<TrackingPage />} />
                <Route path="storage" element={<StoragePage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
