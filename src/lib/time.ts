export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeekMonday(date: Date) {
  const dayStart = startOfDay(date);
  const jsDay = dayStart.getDay();
  const distanceFromMonday = (jsDay + 6) % 7;
  dayStart.setDate(dayStart.getDate() - distanceFromMonday);
  return dayStart;
}

export function addDays(date: Date, count: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

export function getWeekDays(anchorDate: Date) {
  const monday = startOfWeekMonday(anchorDate);
  return Array.from({ length: 7 }).map((_, index) => addDays(monday, index));
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
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ms));
}

export function formatWeekRange(days: Date[]) {
  if (days.length === 0) {
    return "";
  }

  const first = days[0];
  const last = days[days.length - 1];
  const sameMonth = first.getMonth() === last.getMonth();
  const firstLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(first);
  const lastLabel = new Intl.DateTimeFormat(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  }).format(last);

  return `${firstLabel} - ${lastLabel}`;
}

export function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateTimeInput(ms: number) {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function formatDateInput(ms: number) {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const result = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return null;
  }

  return result.getTime();
}

export function parseDateTimeInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const [, y, m, d, hh, mm] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const hour = Number(hh);
  const minute = Number(mm);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const result = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day ||
    result.getHours() !== hour ||
    result.getMinutes() !== minute
  ) {
    return null;
  }

  return result.getTime();
}
