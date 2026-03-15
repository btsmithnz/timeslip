import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function startOfDay(date: Date) {
  return dayjs(date).startOf("day").toDate();
}

export function startOfWeekMonday(date: Date) {
  const dayStart = dayjs(date).startOf("day");
  const distanceFromMonday = (dayStart.day() + 6) % 7;
  return dayStart.subtract(distanceFromMonday, "day").toDate();
}

export function addDays(date: Date, count: number) {
  return dayjs(date).add(count, "day").toDate();
}

export function getWeekDays(anchorDate: Date) {
  const monday = dayjs(startOfWeekMonday(anchorDate));
  return Array.from({ length: 7 }).map((_, index) =>
    monday.add(index, "day").toDate(),
  );
}

export function roundToQuarterHour(ms: number) {
  const quarter = 15 * MINUTE_MS;
  return Math.round(ms / quarter) * quarter;
}

export function formatDuration(durationMs: number) {
  const clamped = Math.max(0, durationMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatTime(ms: number) {
  return dayjs(ms).format("h:mm A");
}

export function formatWeekRange(days: Date[]) {
  if (days.length === 0) {
    return "";
  }

  const first = dayjs(days[0]);
  const last = dayjs(days[days.length - 1]);
  const sameMonth = first.isSame(last, "month");
  const firstLabel = first.format("MMM D");
  const lastLabel = sameMonth ? last.format("D") : last.format("MMM D");

  return `${firstLabel} - ${lastLabel}`;
}

export function formatDateLabel(date: Date) {
  return dayjs(date).format("ddd, MMM D");
}

export function dayKey(date: Date) {
  return dayjs(date).format("YYYY-MM-DD");
}

export function formatDateTimeInput(ms: number) {
  return dayjs(ms).format("YYYY-MM-DD HH:mm");
}

export function formatDateInput(ms: number) {
  return dayjs(ms).format("YYYY-MM-DD");
}

export function parseDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = dayjs(trimmed, "YYYY-MM-DD", true);
  if (!parsed.isValid()) {
    return null;
  }

  return parsed.startOf("day").valueOf();
}

export function parseDateTimeInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = dayjs(trimmed, "YYYY-MM-DD HH:mm", true);
  if (!parsed.isValid()) {
    return null;
  }

  return parsed.valueOf();
}
