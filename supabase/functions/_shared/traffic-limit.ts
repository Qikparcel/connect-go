import { createClient } from "npm:@supabase/supabase-js@2";
import {
  configuredLimit,
  resolveLimit,
  retryMessage,
  TRAFFIC_DEFAULTS,
  type SavedLimit,
  type TrafficEndpoint,
} from "./traffic-rules.ts";

export async function hashIdentifier(value: string): Promise<string> {
  // A server-only pepper stops database hashes becoming a directory of phone/IP values.
  const pepper = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!pepper) throw new Error("Traffic protection unavailable");
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${pepper}:${value}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Owner-saved ceilings live in a service-only table so the dashboard can retune them
// without a redeploy. Read at most every 15s: a short cache keeps per-message cost down
// while a failed read simply keeps the previous values, so limits are never dropped.
const SETTINGS_TTL_MS = 15000;
let settingsCache: { at: number; rows: Record<string, SavedLimit> } | null = null;

async function savedLimits(db: ReturnType<typeof createClient>): Promise<Record<string, SavedLimit>> {
  if (settingsCache && Date.now() - settingsCache.at < SETTINGS_TTL_MS) return settingsCache.rows;
  try {
    const { data, error } = await db.from("traffic_limit_settings").select("endpoint,scope,max_count,window_seconds");
    if (error) throw error;
    const rows: Record<string, SavedLimit> = {};
    for (const row of data ?? []) {
      rows[`${row.endpoint}:${row.scope}`] = { max_count: row.max_count, window_seconds: row.window_seconds };
    }
    settingsCache = { at: Date.now(), rows };
    return rows;
  } catch (error) {
    console.error("saved traffic limits unreadable; keeping previous values", { code: (error as { code?: string })?.code ?? "read_error" });
    return settingsCache?.rows ?? {};
  }
}

export async function limitTraffic(req: Request, endpoint: TrafficEndpoint, cors: Record<string, string>, identifiers: { session?: string; contact?: string; contactOnly?: boolean } = {}): Promise<Response | null> {
  try {
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Traffic protection unavailable");
    const db = createClient(url, key);
    const scopes: Record<string, string> = identifiers.contactOnly ? {} : { global: "all" };
    // Only a server-validated account ID counts as an account; never a body user ID.
    const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!identifiers.contactOnly && bearer && bearer !== Deno.env.get("SUPABASE_ANON_KEY") && !bearer.startsWith("sb_publishable_")) {
      const { data } = await db.auth.getUser(bearer);
      if (data.user) scopes.account = data.user.id;
    }
    if (identifiers.session) scopes.session = identifiers.session;
    if (identifiers.contact) scopes.contact = identifiers.contact;
    // Advisory only: header authenticity is not established for every gateway path.
    // Always enforce the global bucket regardless of these caller-influenced values.
    const network = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
    if (!identifiers.contactOnly && network && network.length <= 100) scopes.network = network;
    const rules = TRAFFIC_DEFAULTS[endpoint] as Record<string, readonly [number, number]>;
    const saved = await savedLimits(db);
    const buckets = await Promise.all(Object.entries(scopes).filter(([scope]) => rules[scope]).map(async ([scope, identity]) => {
      const prefix = `QP_LIMIT_${endpoint.toUpperCase()}_${scope.toUpperCase()}`;
      const [limit, window] = resolveLimit(rules[scope], { count: Deno.env.get(`${prefix}_COUNT`), seconds: Deno.env.get(`${prefix}_SECONDS`) }, saved[`${endpoint}:${scope}`]);
      return {
        key: await hashIdentifier(`${endpoint}:${scope}:${identity}`),
        scope,
        limit,
        window,
      };
    }));
    const { data, error } = await db.rpc("consume_traffic_limits", { p_buckets: buckets });
    if (error || !data || typeof data.allowed !== "boolean") {
      console.error("traffic limiter unavailable", { code: error?.code ?? "invalid_result" });
      throw new Error("Traffic protection unavailable");
    }
    if (data.allowed) return null;
    const seconds = Math.max(1, Number(data.retry_after) || 1);
    // Daily counters per endpoint/scope: bounded growth, and shows whether a ceiling is
    // actually turning visitors away. A failed stat write must not change the response.
    if (typeof data.blocked_scope === "string") {
      const { error: statError } = await db.rpc("record_traffic_block", { p_endpoint: endpoint, p_scope: data.blocked_scope });
      if (statError) console.error("traffic block stat not saved", { code: statError.code });
    }
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
