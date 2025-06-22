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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h1 className="text-3xl font-bold logo-text cursor-pointer transition-opacity duration-300 hover:opacity-70">Momentum</h1>
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
