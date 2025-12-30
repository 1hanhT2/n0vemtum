import React from 'react';
import { cn } from "@/lib/utils";

interface SystemLogoProps {
  variant?: 'default' | 'wordmark' | 'monogram' | 'compact' | 'outlined';
  className?: string;
  showTag?: boolean;
}

export function SystemLogo({ variant = 'default', className, showTag = false }: SystemLogoProps) {

  if (variant === 'monogram') {
    return (
      <div className={cn("inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-gradient-to-b dark:from-white/10 dark:to-white/5 shadow-2xl relative overflow-hidden group select-none", className)} role="img" aria-label="[TS] logo">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[60%] group-hover:translate-x-[60%] transition-transform duration-1000 ease-in-out opacity-20 pointer-events-none" />
        <span className="font-mono font-semibold text-2xl text-gray-400 dark:text-white/55 tracking-tight">[</span>
        <span className="font-extrabold text-3xl tracking-tighter leading-none bg-gradient-to-r from-teal-500 to-blue-500 dark:from-[#89f7d8] dark:to-[#7aa7ff] bg-clip-text text-transparent">TS</span>
        <span className="font-mono font-semibold text-2xl text-gray-400 dark:text-white/55 tracking-tight">]</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-[14px] border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-gradient-to-b dark:from-white/10 dark:to-white/5 shadow-lg relative overflow-hidden select-none", className)}>
        <span className="font-mono font-semibold text-lg text-gray-400 dark:text-white/55 tracking-tight">[</span>
        <span className="font-extrabold text-xl tracking-tighter leading-none bg-gradient-to-r from-teal-500 to-blue-500 dark:from-[#89f7d8] dark:to-[#7aa7ff] bg-clip-text text-transparent">TS</span>
        <span className="font-mono font-semibold text-lg text-gray-400 dark:text-white/55 tracking-tight">]</span>
      </div>
    );
  }

  if (variant === 'outlined') {
    return (
      <div className={cn("flex items-baseline gap-4", className)}>
        <div
          className="font-serif font-extrabold tracking-[-0.07em] leading-none select-none text-transparent dark:text-transparent text-white/0"
          style={{
            fontSize: 'clamp(44px, 5.8vw, 74px)',
            WebkitTextStroke: '1px rgba(255,255,255,.38)', // Fallback for dark
          }}
        >
          {/* Note: WebkitTextStroke isn't easily toggleable via Tailwind classes without custom utility,
              assuming outlined is primarily a hero element often on dark or image backgrounds.
              For light mode specifically, we might want a dark stroke. */}
          <span className="dark:hidden" style={{ WebkitTextStroke: '1px rgba(0,0,0,.38)' }}>System</span>
          <span className="hidden dark:inline">System</span>
        </div>
        {showTag && (
          <span className="font-mono text-xs text-gray-500 dark:text-white/65 tracking-widest uppercase ml-2 px-2.5 py-1.5 border border-dashed border-gray-300 dark:border-white/20 rounded-full bg-black/5 dark:bg-black/10">
            hero / cover
          </span>
        )}
      </div>
    );
  }

  // Default / Wordmark variant
  return (
    <div className={cn("group flex flex-col gap-1 cursor-default", className)}>
      <div className="relative inline-block">
        <div className={cn(
          "text-4xl sm:text-5xl font-serif font-extrabold tracking-[-0.065em] leading-none transition-all duration-300",
          "text-gray-900 dark:text-white",
          "group-hover:text-transparent",
          "group-hover:[-webkit-text-stroke:1px_rgba(0,0,0,0.38)]",
          "dark:group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,0.38)]"
        )}>
          System
        </div>
      </div>
    </div>
  );
}
