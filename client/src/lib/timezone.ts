import { normalizeTimeZone } from "@shared/time";

export function detectClientTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return normalizeTimeZone(tz);
  } catch {
    return "UTC";
  }
}
