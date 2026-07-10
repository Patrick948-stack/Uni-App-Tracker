import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useUIStore } from "@/store/useUIStore";
import { AddUniversityModal } from "@/components/universities/AddUniversityModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { TopBar } from "./TopBar";
import { SideNav } from "./SideNav";

function PageFallback() {
  return (
    <div className="grid gap-3.5">
      <Skeleton className="h-9 w-48 rounded-xl" />
      <Skeleton className="h-55 rounded-glass-lg" />
    </div>
  );
}

export function AppShell() {
  const addUniversityOpen = useUIStore((s) => s.addUniversityOpen);
  const setAddUniversityOpen = useUIStore((s) => s.setAddUniversityOpen);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <div className="mx-auto grid w-full max-w-[1300px] flex-1 gap-4 p-4 md:grid-cols-[250px_1fr]">
        <SideNav />
        <main className="min-w-0" aria-live="polite">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <AddUniversityModal open={addUniversityOpen} onClose={() => setAddUniversityOpen(false)} />
    </div>
  );
}
