import { habitTagOptions } from "@shared/schema";

export type HabitTag = (typeof habitTagOptions)[number];

export const habitTagConfig: Record<HabitTag, { label: string; className: string; color: string }> = {
  STR: {
    label: "STR",
    className: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400",
    color: "#ef4444"
  },
  AGI: {
    label: "AGI",
    className: "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400",
    color: "#22c55e"
  },
  INT: {
    label: "INT",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
    color: "#3b82f6"
  },
  VIT: {
    label: "VIT",
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:text-yellow-400",
    color: "#eab308"
  },
  PER: {
    label: "PER",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400",
    color: "#a855f7"
  }
};

export function getHabitTagConfig(tag: string) {
  return habitTagConfig[tag as HabitTag] || null;
}
