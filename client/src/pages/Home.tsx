import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { navigationItems, type NavigationView } from "@/components/navigation";
import { Header } from "@/components/header";
import { TodayView } from "@/components/today-view";
import { WeeklyView } from "@/components/weekly-view";
import { HistoryView } from "@/components/history-view";
import { AchievementsPanel } from "@/components/achievements-panel";
import { AnalyticsView } from "@/components/analytics-view";
import { SettingsModal } from "@/components/settings-modal";
import { PlayerStatus } from "@/components/system/PlayerStatus";
import { AssistantView } from "@/components/assistant-view";
import { Button } from "@/components/ui/button";
import { Eye, LogIn } from "lucide-react";
import { StickyNotesBoard } from "@/components/sticky-notes-board";

type View = NavigationView;

interface HomeProps {
  isGuestMode?: boolean;
}

export function Home({ isGuestMode = false }: HomeProps) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const activeNavItem = navigationItems.find((item) => item.value === currentView);

  const viewCopy: Record<View, { eyebrow: string }> = useMemo(
    () => ({
      today: {
        eyebrow: "Daily Execution",
      },
      weekly: {
        eyebrow: "Weekly Intelligence",
      },
      history: {
        eyebrow: "Behavior Archive",
      },
      achievements: {
        eyebrow: "Progression Ledger",
      },
      analytics: {
        eyebrow: "Signal Dashboard",
      },
      assistant: {
        eyebrow: "AI Copilot",
      },
    }),
    []
  );

  const stickyStorageKey = useMemo(() => {
    const userScope = isGuestMode ? "demo" : String((user as any)?.id ?? "anon");
    return `sticky-notes:${userScope}:${currentView}`;
  }, [currentView, isGuestMode, user]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'today':
        return <TodayView isGuestMode={isGuestMode} />;
      case 'weekly':
        return <WeeklyView isGuestMode={isGuestMode} />;
      case 'history':
        return <HistoryView isGuestMode={isGuestMode} />;
      case 'achievements':
        return <AchievementsPanel isGuestMode={isGuestMode} />;
      case 'analytics':
        return <AnalyticsView isGuestMode={isGuestMode} />;
      case 'assistant':
        return <AssistantView isGuestMode={isGuestMode} />;
      default:
        return <TodayView isGuestMode={isGuestMode} />;
    }
  };

  return (
    <div className="app-shell min-h-screen text-foreground selection:bg-primary/10 selection:text-primary">
      <div aria-hidden="true" className="app-orb app-orb-a" />
      <div aria-hidden="true" className="app-orb app-orb-b" />
      <div aria-hidden="true" className="app-grid" />

      <Header
        onSettingsClick={() => setIsSettingsOpen(true)}
        isGuestMode={isGuestMode}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        {isGuestMode && (
          <section className="app-demo-banner mb-6 md:mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="app-demo-icon">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--app-ink)]">Demo mode is active</p>
                  <p className="text-sm text-[var(--app-muted)]">
                    Your changes are temporary. Sign in to persist progress, achievements, and AI history.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => (window.location.href = "/api/login")}
                data-testid="button-demo-sign-in"
                className="app-primary-btn h-10 rounded-full px-5 text-sm font-semibold"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </div>
          </section>
        )}

        <section className="app-overview-panel">
          <StickyNotesBoard
            storageKey={stickyStorageKey}
            contextLabel={activeNavItem ? `${viewCopy[currentView].eyebrow} · ${activeNavItem.label}` : viewCopy[currentView].eyebrow}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="space-y-6">
            <div className="app-content-panel">
              {renderCurrentView()}
            </div>

            <div className="space-y-6 xl:hidden">
              <PlayerStatus />
              <div className="app-tip-card">
                <p className="app-mono text-[10px] text-[var(--app-muted)]">Execution Tip</p>
                <p className="mt-2 text-sm text-[var(--app-ink)]">
                  Keep Today and Weekly in the same cadence: execute during the day, then tighten process in weekly review.
                </p>
              </div>
            </div>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-6 space-y-6">
              <PlayerStatus />
              <div className="app-tip-card">
                <p className="app-mono text-[10px] text-[var(--app-muted)]">Execution Tip</p>
                <p className="mt-2 text-sm text-[var(--app-ink)]">
                  Treat habit tracking as product telemetry: review anomalies quickly and adjust system design weekly.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isGuestMode={isGuestMode}
      />
    </div>
  );
}
