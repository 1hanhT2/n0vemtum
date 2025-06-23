import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

import logoWHITE__1_ from "@assets/logoWHITE (1).png";

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="gradient-bg text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer transition-all duration-300 hover:scale-105">
            <img src={logoWHITE__1_} alt="m0mentum logo" className="w-6 h-6 sm:w-10 sm:h-10 pl-[2px] pr-[2px] pt-[2px] pb-[2px] sm:pl-[3px] sm:pr-[3px] sm:pt-[3px] sm:pb-[3px]" />
            <h1 className="logo-text text-lg sm:text-[30px] font-extralight" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 300 }}>n0ventum</h1>
          </div>
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="icon"
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all text-white hover:text-white"
          >
            <span className="text-base sm:text-xl">⚙️</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
