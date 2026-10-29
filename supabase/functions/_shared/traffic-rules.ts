export type TrafficEndpoint = "chat" | "lead" | "email_preview";
export type TrafficScope = "global" | "session" | "account" | "network" | "contact";
export type SavedLimit = { max_count: number; window_seconds: number };

export const LIMIT_ENDPOINTS: readonly TrafficEndpoint[] = ["chat", "lead", "email_preview"];
export const LIMIT_SCOPES: readonly TrafficScope[] = ["global", "session", "account", "network", "contact"];

export const TRAFFIC_DEFAULTS = {
  chat: { global: [120, 60], session: [12, 60], account: [20, 60], network: [120, 60] },
  lead: { global: [60, 60], contact: [5, 3600], account: [10, 3600], network: [60, 60] },
  email_preview: { global: [10, 60] },
} as const;
export function configuredLimit(value: string | undefined, fallback: number): number {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 1 && n <= 100000 ? n : fallback;
}

// A ceiling saved from the admin dashboard must be a whole number inside the same range
// the server accepts; anything else keeps the previous ceiling instead of widening it.
export function validLimit(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 1 && value <= 100000 ? value : fallback;
}

// Which ceiling actually applies: the owner's saved value first, then the server
// environment override, then the code default. A broken saved row never removes a limit.
export function resolveLimit(
  defaults: readonly [number, number],
  env: { count?: string; seconds?: string },
  saved?: SavedLimit | null,
): [number, number] {
  const fallback: [number, number] = [configuredLimit(env.count, defaults[0]), configuredLimit(env.seconds, defaults[1])];
  if (!saved) return fallback;
  return [validLimit(saved.max_count, fallback[0]), validLimit(saved.window_seconds, fallback[1])];
}

export function retryMessage(seconds: number): string {
  return `Too many requests. Please try again in ${Math.max(1, Math.ceil(seconds))} seconds, or contact QikParcel on WhatsApp: https://wa.me/447443191370.`;
}
