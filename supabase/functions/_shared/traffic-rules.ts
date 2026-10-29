export type TrafficEndpoint = "chat" | "lead" | "email_preview";
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
export function retryMessage(seconds: number): string {
  return `Too many requests. Please try again in ${Math.max(1, Math.ceil(seconds))} seconds, or contact QikParcel on WhatsApp: https://wa.me/447443191370.`;
}