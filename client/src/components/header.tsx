import { Button } from "@/components/ui/button";
import { Settings, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  onSettingsClick: () => void;
  isGuestMode?: boolean;
}

export function Header({ onSettingsClick, isGuestMode = false }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/app">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-['Lexend_Giga'] text-xl font-semibold text-gray-900 dark:text-white">n0ventum</span>
            </div>
          </Link>
          
          {/* Settings button */}
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="icon"
            className="w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
      </div>
    </header>
  );
}
