import { track } from "@/lib/tracking";

export type RouteAction = "enquiry" | "whatsapp" | "traveller";

/** Label format read by the admin "Route interest" tab: route:<route>:<direction>:<action>. */
export function routeLabel(route: string, direction: string, action: RouteAction) {
  return `route:${route}:${direction}:${action}`;
}

export function trackRouteClick(route: string, direction: string, action: RouteAction) {
  const event = action === "whatsapp" ? "whatsapp_clicked" : action === "traveller" ? "traveller_registration_clicked" : "cta_click";
  track(event, routeLabel(route, direction, action));
}

export type RouteCount = { route: string; direction: string; enquiry: number; whatsapp: number; traveller: number; total: number };

export function summariseRouteClicks(labels: (string | null)[]): RouteCount[] {
  const map = new Map<string, RouteCount>();
  for (const label of labels) {
    const parts = label?.split(":");
    if (!parts || parts.length !== 4 || parts[0] !== "route") continue;
    const [, route, direction, action] = parts;
    if (action !== "enquiry" && action !== "whatsapp" && action !== "traveller") continue;
    const key = `${route}:${direction}`;
    const row = map.get(key) ?? { route, direction, enquiry: 0, whatsapp: 0, traveller: 0, total: 0 };
    row[action] += 1;
    row.total += 1;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}
