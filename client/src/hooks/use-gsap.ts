import { useRef, useEffect, useCallback, useState } from "react";
import gsap from "gsap";

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

export function useGsapFadeIn<T extends HTMLElement>(
  options: {
    y?: number;
    x?: number;
    scale?: number;
    duration?: number;
    delay?: number;
    ease?: string;
    enabled?: boolean;
  } = {}
) {
  const ref = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    y = 16,
    x = 0,
    scale = 1,
    duration = 0.5,
    delay = 0,
    ease = "power3.out",
    enabled = true,
  } = options;

  useEffect(() => {
    if (!ref.current || !enabled) return;
    const el = ref.current;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y, x, scale },
      { opacity: 1, y: 0, x: 0, scale: 1, duration, delay, ease }
    );

    return () => {
      gsap.killTweensOf(el);
    };
  }, [y, x, scale, duration, delay, ease, enabled, prefersReducedMotion]);

  return ref;
}

export function useGsapStagger<T extends HTMLElement>(
  selector: string,
  options: {
    y?: number;
    x?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
    ease?: string;
    enabled?: boolean;
  } = {}
) {
  const containerRef = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    y = 12,
    x = 0,
    duration = 0.4,
    stagger = 0.06,
    delay = 0.1,
    ease = "power2.out",
    enabled = true,
  } = options;

  useEffect(() => {
    if (!containerRef.current || !enabled) return;
    const items = containerRef.current.querySelectorAll(selector);
    if (items.length === 0) return;

    if (prefersReducedMotion) {
      gsap.set(items, { opacity: 1, y: 0, x: 0 });
      return;
    }

    gsap.fromTo(
      items,
      { opacity: 0, y, x },
      { opacity: 1, y: 0, x: 0, duration, stagger, delay, ease }
    );

    return () => {
      gsap.killTweensOf(items);
    };
  }, [selector, y, x, duration, stagger, delay, ease, enabled, prefersReducedMotion]);

  return containerRef;
}

export function useGsapCounter(
  targetValue: number,
  options: {
    duration?: number;
    delay?: number;
    ease?: string;
    enabled?: boolean;
    decimals?: number;
    suffix?: string;
  } = {}
) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    duration = 1.2,
    delay = 0.2,
    ease = "power2.out",
    enabled = true,
    decimals = 0,
    suffix = "",
  } = options;

  useEffect(() => {
    if (!ref.current || !enabled) return;
    const el = ref.current;

    if (prefersReducedMotion) {
      el.textContent = targetValue.toFixed(decimals) + suffix;
      return;
    }

    const obj = { value: 0 };

    gsap.to(obj, {
      value: targetValue,
      duration,
      delay,
      ease,
      onUpdate: () => {
        el.textContent = obj.value.toFixed(decimals) + suffix;
      },
    });

    return () => {
      gsap.killTweensOf(obj);
    };
  }, [targetValue, duration, delay, ease, enabled, decimals, suffix, prefersReducedMotion]);

  return ref;
}

export function useGsapProgress(
  percentage: number,
  options: {
    duration?: number;
    delay?: number;
    ease?: string;
    enabled?: boolean;
  } = {}
) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    duration = 1,
    delay = 0.3,
    ease = "power2.out",
    enabled = true,
  } = options;

  useEffect(() => {
    if (!ref.current || !enabled) return;
    const el = ref.current;

    if (prefersReducedMotion) {
      gsap.set(el, { width: `${Math.min(100, Math.max(0, percentage))}%` });
      return;
    }

    gsap.fromTo(
      el,
      { width: "0%" },
      { width: `${Math.min(100, Math.max(0, percentage))}%`, duration, delay, ease }
    );

    return () => {
      gsap.killTweensOf(el);
    };
  }, [percentage, duration, delay, ease, enabled, prefersReducedMotion]);

  return ref;
}

export function gsapEntrance(
  node: HTMLElement | null,
  options: {
    y?: number;
    x?: number;
    scale?: number;
    duration?: number;
    delay?: number;
    ease?: string;
  } = {}
) {
  if (!node) return;
  const {
    y = 12,
    x = 0,
    scale = 1,
    duration = 0.4,
    delay = 0,
    ease = "power2.out",
  } = options;

  gsap.fromTo(
    node,
    { opacity: 0, y, x, scale },
    { opacity: 1, y: 0, x: 0, scale: 1, duration, delay, ease }
  );
}

export function gsapStaggerItems(
  container: HTMLElement | null,
  selector: string,
  options: {
    y?: number;
    x?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
    ease?: string;
  } = {}
) {
  if (!container) return;
  const items = container.querySelectorAll(selector);
  if (items.length === 0) return;

  const {
    y = 10,
    x = 0,
    duration = 0.35,
    stagger = 0.05,
    delay = 0.05,
    ease = "power2.out",
  } = options;

  gsap.fromTo(
    items,
    { opacity: 0, y, x },
    { opacity: 1, y: 0, x: 0, duration, stagger, delay, ease }
  );
}

export function useGsapPulse<T extends HTMLElement>(
  options: {
    scale?: number;
    duration?: number;
    repeat?: number;
    enabled?: boolean;
  } = {}
) {
  const ref = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    scale = 1.05,
    duration = 0.8,
    repeat = -1,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!ref.current || !enabled) return;
    const el = ref.current;

    if (prefersReducedMotion) {
      gsap.set(el, { scale: 1 });
      return;
    }

    gsap.to(el, {
      scale,
      duration,
      repeat,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      gsap.killTweensOf(el);
    };
  }, [scale, duration, repeat, enabled, prefersReducedMotion]);

  return ref;
}

export const useGsapCallback = () => {
  return useCallback((node: HTMLElement | null, animOptions?: {
    y?: number;
    duration?: number;
    delay?: number;
    stagger?: string;
  }) => {
    if (!node) return;
    gsap.fromTo(
      node,
      { opacity: 0, y: animOptions?.y ?? 12 },
      {
        opacity: 1,
        y: 0,
        duration: animOptions?.duration ?? 0.4,
        delay: animOptions?.delay ?? 0,
        ease: "power2.out",
      }
    );
  }, []);
};
