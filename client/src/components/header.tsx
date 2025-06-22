import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="gradient-bg text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <img src="/logo-white.png" alt="m0mentum logo" className="w-10 h-10 transition-all duration-300 group-hover:brightness-110" />
            <h1 className="text-3xl logo-text transition-all duration-300 group-hover:opacity-80" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 300 }}>m0mentum</h1>
          </div>
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all text-white hover:text-white"
          >
            <span className="text-xl">⚙️</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
