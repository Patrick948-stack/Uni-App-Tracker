import { Component, type ErrorInfo, type ReactNode } from "react";
import { GlassCard } from "./ui/GlassCard";
import { Button } from "./ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// React error boundaries must be class components — there is no hook
// equivalent (as of React 19) for catching render errors in a subtree.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center p-5">
          <GlassCard hover={false} className="w-[min(480px,92vw)] text-center">
            <h1 className="text-[1.1rem] font-bold">Something broke.</h1>
            <p className="mt-2 text-[var(--muted)]">
              This screen hit an unexpected error. Your data is safe in local storage — reloading usually fixes
              this.
            </p>
            <Button variant="primary" className="mt-4" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
