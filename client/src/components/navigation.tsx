import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type View = 'today' | 'weekly' | 'history';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { value: 'today' as const, icon: '📅', label: 'Today' },
    { value: 'weekly' as const, icon: '📊', label: 'Weekly Review' },
    { value: 'history' as const, icon: '🗓️', label: 'History' },
  ];

  return (
    <nav className="border-b bg-white/95 dark:bg-gray-900/95 dark:border-gray-700 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center space-x-1 py-4">
          {navItems.map((item) => (
            <motion.button
              key={item.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange(item.value)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentView === item.value
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  );
}
