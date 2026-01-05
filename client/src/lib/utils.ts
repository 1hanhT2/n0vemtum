import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getDateKeyForZone } from "@shared/time";
export { getDateKeyForZone, getTodayKey, getYesterdayKey } from "@shared/time";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekStartDate(date: Date = new Date(), timeZone = "UTC"): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  const monday = new Date(d);
  monday.setDate(diff);
  return getDateKeyForZone(monday, timeZone);
}

export function getWeekDates(startDate: Date = new Date(), timeZone = "UTC"): string[] {
  const d = new Date(startDate);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(getDateKeyForZone(date, timeZone));
  }

  return dates;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}
