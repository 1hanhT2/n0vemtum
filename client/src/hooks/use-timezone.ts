import { useMemo } from "react";
import { detectClientTimeZone } from "@/lib/timezone";

export function useTimeZone(): string {
  return useMemo(() => detectClientTimeZone(), []);
}
