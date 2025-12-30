import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "wouter";
import { SystemLogo } from "./SystemLogo";
import { Navigation, type NavigationView } from "./navigation";

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
  return (
    <header className="fixed top-0 w-full z-50 bg-cream/95 dark:bg-[#0b0d12]/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3 lg:py-0">
          <div className="flex items-center gap-4 lg:h-20">
            {/* Logo */}
            <Link href="/app">
              <div className="cursor-pointer group py-2 lg:py-0 lg:translate-y-0.5">
                <div className="block scale-75 origin-left">
                  <SystemLogo variant="wordmark" />
                </div>
              </div>
            </Link>

            <Navigation
              className="hidden sm:block sm:ml-3 sm:w-auto"
              currentView={currentView}
              onViewChange={onViewChange}
            />

            {/* Settings button */}
            <Button
              onClick={onSettingsClick}
              variant="ghost"
              size="icon"
              className="ml-auto w-9 h-9 hover:bg-teal-light/50 text-gray-500 hover:text-teal-dark dark:text-white/65 dark:hover:text-white dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="sm:hidden pb-2">
            <Navigation currentView={currentView} onViewChange={onViewChange} />
          </div>
        </div>
      </div>
    </header>
  );
}
