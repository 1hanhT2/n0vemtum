/**
 * Shared timezone-aware date utilities.
 * All date keys are formatted as YYYY-MM-DD for the provided IANA timezone.
 */
export function normalizeTimeZone(timeZone?: string | null): string {
  const fallback = "UTC";
  if (!timeZone || typeof timeZone !== "string") return fallback;
  try {
    // Throws if the timeZone identifier is invalid
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return fallback;
  }
}

function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getDateKeyForZone(date: Date = new Date(), timeZone = "UTC"): string {
  const fmt = getFormatter(timeZone);
  const parts = fmt.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function getTodayKey(timeZone = "UTC"): string {
  return getDateKeyForZone(new Date(), timeZone);
}

export function getYesterdayKey(timeZone = "UTC"): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return getDateKeyForZone(date, timeZone);
}

export function getDateNDaysAgo(days: number, timeZone = "UTC"): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return getDateKeyForZone(date, timeZone);
}
