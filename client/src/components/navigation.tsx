import { Button } from "@/components/ui/button";

type View = 'today' | 'weekly' | 'history';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { key: 'today' as const, icon: '📅', label: 'Today' },
    { key: 'weekly' as const, icon: '📊', label: 'Weekly Review' },
    { key: 'history' as const, icon: '🗓️', label: 'History' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              onClick={() => onViewChange(item.key)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium h-auto rounded-none ${
                currentView === item.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
