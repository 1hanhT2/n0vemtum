/**
 * Quick helper to inspect date keys across timezones for a given instant.
 * Usage:
 *   npx tsx scripts/check-timezone-boundary.ts [isoDate] [tz1,tz2,...]
 *
 * Examples:
 *   npx tsx scripts/check-timezone-boundary.ts
 *   npx tsx scripts/check-timezone-boundary.ts 2024-12-31T23:30:00Z America/New_York,Europe/London,UTC
 */
import { getDateKeyForZone, normalizeTimeZone } from "../shared/time";

const [isoInput, tzInput] = process.argv.slice(2);
const instant = isoInput ? new Date(isoInput) : new Date();
if (Number.isNaN(instant.getTime())) {
  console.error(`Invalid date input: ${isoInput}`);
  process.exit(1);
}

const defaultTz = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
})();

const timeZones = (tzInput ? tzInput.split(",") : [defaultTz, "UTC"]).map(normalizeTimeZone);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatInstant(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}Z`;
}

console.log(`Instant (UTC): ${formatInstant(instant)}`);
console.log("Zone breakdown:");

for (const tz of timeZones) {
  const dateKeyForInstant = getDateKeyForZone(instant, tz);
  const prevDayAtInstant = new Date(instant);
  prevDayAtInstant.setUTCDate(prevDayAtInstant.getUTCDate() - 1);
  const prevKeyForInstant = getDateKeyForZone(prevDayAtInstant, tz);
  console.log(`  ${tz}: dateKeyForInstant=${dateKeyForInstant} (prevDayKeyForInstant=${prevKeyForInstant})`);
}
