import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  onSettingsClick: () => void;
  isGuestMode?: boolean;
}

export function Header({ onSettingsClick, isGuestMode = false }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-cream/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/app">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img src="/favicon.png" alt="PushForward logo" className="h-8 w-8 opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="font-serif text-lg font-bold text-gray-900 tracking-tight">PushForward</span>
            </div>
          </Link>

          {/* Settings button */}
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="icon"
            className="w-9 h-9 hover:bg-teal-light/50 text-gray-500 hover:text-teal-dark rounded-full transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
