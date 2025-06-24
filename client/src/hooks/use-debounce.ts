import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastExecutedRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastExecutedRef.current >= delay) {
        lastExecutedRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

export function usePendingProtection<T extends (...args: any[]) => Promise<any>>(
  asyncCallback: T
): [T, boolean] {
  const isPendingRef = useRef(false);

  const protectedCallback = useCallback(
    (async (...args: Parameters<T>) => {
      if (isPendingRef.current) {
        return; // Ignore if already pending
      }

      isPendingRef.current = true;
      try {
        return await asyncCallback(...args);
      } finally {
        isPendingRef.current = false;
      }
    }) as T,
    [asyncCallback]
  );

  return [protectedCallback, isPendingRef.current];
}