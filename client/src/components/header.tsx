import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

import logoWHITE__1_ from "@assets/logoWHITE (1).png";

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="gradient-bg text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group relative">
            <img src={logoWHITE__1_} alt="m0mentum logo" className="w-8 h-8 sm:w-10 sm:h-10 pl-[2px] pr-[2px] pt-[2px] pb-[2px] sm:pl-[3px] sm:pr-[3px] sm:pt-[3px] sm:pb-[3px] group-hover:blur-sm transition-all duration-500 ease-in-out" />
            <h1 className="logo-text text-xl sm:text-[30px] font-extralight ml-[4px] mr-[4px] sm:ml-[6px] sm:mr-[6px] mt-[0px] mb-[0px] group-hover:blur-sm transition-all duration-500 ease-in-out" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 300 }}>
              <span className="sm:hidden">m0</span>
              <span className="hidden sm:inline">m0mentum</span>
            </h1>
            
            {/* Motivational text that appears in center on hover */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out pointer-events-none">
              <span className="logo-text text-xs sm:text-sm font-light whitespace-nowrap bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full" style={{ fontFamily: 'Manrope, sans-serif' }}>
                n0thing is impossible
              </span>
            </div>
          </div>
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="icon"
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all text-white hover:text-white"
          >
            <span className="text-lg sm:text-xl">⚙️</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
