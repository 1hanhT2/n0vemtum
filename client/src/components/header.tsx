import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Settings, Sparkles, UserCircle2, Zap } from "lucide-react";
import { Link } from "wouter";
import { Navigation, navigationItems, type NavigationView } from "./navigation";

interface HeaderProps {
  onSettingsClick: () => void;
  isGuestMode?: boolean;
  currentView: NavigationView;
  onViewChange: (view: NavigationView) => void;
}

export function Header({
  onSettingsClick,
  isGuestMode = false,
  currentView,
  onViewChange,
}: HeaderProps) {
  const { user } = useAuth();
  const activeView = navigationItems.find((item) => item.value === currentView);
  const userLabel =
    (user as any)?.firstName ||
    (user as any)?.username ||
    (user as any)?.email?.split("@")[0] ||
    "Operator";

  return (
    <header className="app-header-shell">
      <div className="mx-auto w-full max-w-7xl px-4 pb-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="app-header-panel">
          <div className="flex items-center gap-3">
            <Link href="/app" className="app-brand" data-testid="link-app-logo">
              <span className="app-brand-mark">
                <Zap className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="app-display truncate text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
                  PushForward
                </p>
                <p className="app-mono text-[10px] text-[var(--app-muted)] sm:text-[11px]">Execution Console</p>
              </div>
            </Link>

            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <div className={cn("app-inline-chip", isGuestMode ? "app-chip-warn" : "")}>
                <Sparkles className="h-3.5 w-3.5" />
                {isGuestMode ? "Demo session" : activeView?.label || "Console"}
              </div>
              <div className="app-inline-chip">
                <UserCircle2 className="h-3.5 w-3.5" />
                {userLabel}
              </div>
            </div>

            <Button
              onClick={onSettingsClick}
              variant="ghost"
              size="icon"
              className="app-settings-btn ml-auto lg:ml-0"
              data-testid="button-open-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 hidden md:block">
            <Navigation
              currentView={currentView}
              onViewChange={onViewChange}
            />
          </div>

          <div className="mt-4 md:hidden">
            <Navigation
              currentView={currentView}
              onViewChange={onViewChange}
              itemClassName="px-3 py-2 text-xs"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
