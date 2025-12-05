import { Button } from "@/components/ui/button";
import { Settings, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  onSettingsClick: () => void;
  isGuestMode?: boolean;
}

export function Header({ onSettingsClick, isGuestMode = false }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
        <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-2xl shadow-lg shadow-blue-100/40 px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/app">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-['Lexend_Giga'] text-xl font-semibold text-gray-900 dark:text-white">PushFoward</span>
            </div>
          </Link>

          {/* Settings button */}
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="icon"
            className="w-10 h-10 hover:bg-white/70 dark:hover:bg-gray-800 rounded-lg transition-colors border border-white/70"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
        </div>
      </div>
    </header>
  );
}
