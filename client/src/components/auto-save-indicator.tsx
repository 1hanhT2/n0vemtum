
import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export function AutoSaveIndicator({ status, className }: AutoSaveIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Cloud className="h-4 w-4 text-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Saved to cloud</span>
        </>
      )}
      {status === 'error' && (
        <>
          <CloudOff className="h-4 w-4 text-red-500" />
          <span className="text-gray-600 dark:text-gray-400">Save failed</span>
        </>
      )}
    </div>
  );
}
