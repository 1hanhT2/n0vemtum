import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type View = 'today' | 'weekly' | 'history' | 'achievements' | 'analytics';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { value: 'today' as const, icon: '📅', label: 'Today' },
    { value: 'weekly' as const, icon: '📊', label: 'Weekly Review' },
    { value: 'history' as const, icon: '🗓️', label: 'History' },
    { value: 'achievements' as const, icon: '🏆', label: 'Achievements' },
    { value: 'analytics' as const, icon: '📈', label: 'Analytics' },
  ];

  return (
    <nav className="border-b bg-white/95 dark:bg-gray-900/95 dark:border-gray-700 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="flex justify-center space-x-1 py-2 sm:py-4 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <motion.button
              key={item.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange(item.value)}
              className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap min-w-[70px] sm:min-w-auto touch-target ${
                currentView === item.value
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              style={{ minHeight: '44px' }}
            >
              <span className="text-lg sm:text-xl">{item.icon}</span>
              <span className="text-[10px] sm:text-xs md:text-base leading-tight text-center">
                {item.label.split(' ').join('\n')}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  );
}
