// "What day is it for this user?" on the server.
//
// Vercel functions run in UTC, so `new Date()` there is 8 hours behind Taiwan:
// between midnight and 08:00 the server still thinks it's yesterday. The
// browser stores its IANA time zone in the `tz` cookie (see TimezoneCookie);
// we read it here and fall back to Asia/Taipei.
//
// zonedNow() returns a Date whose *local* getters (getFullYear, getDate,
// getDay, setDate…) read the user's wall-clock time, so the existing helpers
// such as todayStr(date) keep working unchanged.
import { cookies } from "next/headers";

export const DEFAULT_TZ = "Asia/Taipei";

export function isValidTimeZone(tz) {
  if (!tz || typeof tz !== "string" || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function userTimeZone() {
  try {
    const tz = cookies().get("tz")?.value;
    return isValidTimeZone(tz) ? tz : DEFAULT_TZ;
  } catch {
    return DEFAULT_TZ;
  }
}

export function zonedNow(tz = userTimeZone(), at = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value])
  );
  return new Date(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
}
