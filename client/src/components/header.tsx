import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "wouter";

import logoWHITE__1_ from "@assets/logoWHITE (1).png";

interface HeaderProps {
  onSettingsClick: () => void;
  isGuestMode?: boolean;
}

export function Header({ onSettingsClick, isGuestMode = false }: HeaderProps) {
  return (
    <header className="gradient-bg text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Mobile: Center the combined logo+settings unit, Desktop: separate layout */}
        <div className="flex items-center justify-center sm:justify-between">
          {/* Mobile: Combined logo + settings unit, Desktop: logo only */}
          <div className="flex items-center space-x-8 sm:space-x-3">
            {/* Logo and text group - clickable link to today page */}
            <Link href="/app">
              <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                <img src={logoWHITE__1_} alt="n0ventum logo" className="w-8 h-8 sm:w-10 sm:h-10 pl-[2px] pr-[2px] pt-[2px] pb-[2px] sm:pl-[3px] sm:pr-[3px] sm:pt-[3px] sm:pb-[3px]" />
                <h1 className="logo-text text-xl sm:text-[30px] font-extralight ml-[4px] mr-[4px] sm:ml-[6px] sm:mr-[6px] mt-[0px] mb-[0px]" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 300 }}>
                  <span className="sm:hidden">n0</span>
                  <span className="hidden sm:inline font-light text-left text-[34px]">n0ventum</span>
                </h1>
              </div>
            </Link>
            
            {/* Separator - mobile only */}
            <div className="sm:hidden flex items-center">
              <div className="w-6 h-px bg-white bg-opacity-30"></div>
            </div>
            
            {/* Settings button - part of centered unit on mobile, separate on desktop */}
            <Button
              onClick={onSettingsClick}
              variant="ghost"
              size="icon"
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all text-white hover:text-white sm:hidden"
            >
              <span className="text-lg sm:text-xl">⚙️</span>
            </Button>
          </div>
          
          {/* Desktop-only settings button positioned separately */}
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="icon"
            className="hidden sm:block w-10 h-10 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all text-white hover:text-white"
          >
            <span className="text-xl">⚙️</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
