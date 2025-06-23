import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

import logoWHITE__1_ from "@assets/logoWHITE (1).png";

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="gradient-bg text-white shadow-lg landscape-header">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-6 landscape-optimize">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer transition-all duration-300 hover:scale-105 min-w-0 flex-1">
            <img src={logoWHITE__1_} alt="m0mentum logo" className="w-5 h-5 sm:w-10 sm:h-10 landscape-card flex-shrink-0" />
            <h1 className="logo-text responsive-heading font-extralight truncate" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 300 }}>n0ventum</h1>
          </div>
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="icon"
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all text-white hover:text-white touch-target flex-shrink-0"
          >
            <span className="text-sm sm:text-xl landscape-compact">⚙️</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
