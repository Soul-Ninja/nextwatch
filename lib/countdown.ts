export interface Countdown { days: number; hours: number; minutes: number; seconds: number }

/** Time left until an exact instant; null once it has passed. Only call this for EXACT windows. */
export function countdown(targetUtc: string, now: string): Countdown | null {
  const total = Math.floor((Date.parse(targetUtc) - Date.parse(now)) / 1000);
  if (!(total > 0)) return null;
  return { days: Math.floor(total / 86_400), hours: Math.floor((total % 86_400) / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60 };
}
