import { createClient } from "npm:@supabase/supabase-js@2";
import { configuredLimit, retryMessage, TRAFFIC_DEFAULTS, type TrafficEndpoint } from "./traffic-rules.ts";

export async function hashIdentifier(value: string): Promise<string> {
  // A server-only pepper stops database hashes becoming a directory of phone/IP values.
  const pepper = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!pepper) throw new Error("Traffic protection unavailable");
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${pepper}:${value}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function limitTraffic(req: Request, endpoint: TrafficEndpoint, cors: Record<string, string>, identifiers: { session?: string; contact?: string } = {}): Promise<Response | null> {
  try {
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Traffic protection unavailable");
    const db = createClient(url, key);
    const scopes: Record<string, string> = { global: "all" };
    // Only a server-validated account ID counts as an account; never a body user ID.
    const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (bearer && bearer !== Deno.env.get("SUPABASE_ANON_KEY") && !bearer.startsWith("sb_publishable_")) {
      const { data } = await db.auth.getUser(bearer);
      if (data.user) scopes.account = data.user.id;
    }
    if (identifiers.session) scopes.session = identifiers.session;
    if (identifiers.contact) scopes.contact = identifiers.contact;
    // Advisory only: header authenticity is not established for every gateway path.
    // Always enforce the global bucket regardless of these caller-influenced values.
    const network = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
    if (network && network.length <= 100) scopes.network = network;
    const rules = TRAFFIC_DEFAULTS[endpoint] as Record<string, readonly [number, number]>;
    const buckets = await Promise.all(Object.entries(scopes).filter(([scope]) => rules[scope]).map(async ([scope, identity]) => {
      const [limit, window] = rules[scope];
      const prefix = `QP_LIMIT_${endpoint.toUpperCase()}_${scope.toUpperCase()}`;
      return {
        key: await hashIdentifier(`${endpoint}:${scope}:${identity}`),
        limit: configuredLimit(Deno.env.get(`${prefix}_COUNT`), limit),
        window: configuredLimit(Deno.env.get(`${prefix}_SECONDS`), window),
      };
    }));
    const { data, error } = await db.rpc("consume_traffic_limits", { p_buckets: buckets });
    if (error || !data || typeof data.allowed !== "boolean") throw new Error("Traffic protection unavailable");
    if (data.allowed) return null;
    const seconds = Math.max(1, Number(data.retry_after) || 1);
    return new Response(JSON.stringify({ error: retryMessage(seconds), retryAfter: seconds }), {
      status: 429,
      headers: { ...cors, "Content-Type": "application/json", "Retry-After": String(seconds), "Cache-Control": "no-store", "Access-Control-Expose-Headers": "Retry-After" },
    });
  } catch {
    // Do not spend on models/email or save leads while the durable limiter is unavailable.
    return new Response(JSON.stringify({ error: "Request protection is temporarily unavailable. Please retry shortly or contact https://wa.me/447443191370." }), {
      status: 503, headers: { ...cors, "Content-Type": "application/json", "Retry-After": "30", "Cache-Control": "no-store" },
    });
  }
}