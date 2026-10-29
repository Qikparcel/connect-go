import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import {
  LIMIT_ENDPOINTS,
  LIMIT_SCOPES,
  resolveLimit,
  TRAFFIC_DEFAULTS,
  type SavedLimit,
  type TrafficEndpoint,
} from "../_shared/traffic-rules.ts";

// Admin-only control over the traffic ceilings that protect the chatbot, enquiry forms
// and email previews. Reads and writes both run here because the settings table is
// service-role only: the browser can never read or widen a ceiling directly.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Endpoint = z.enum(["chat", "lead", "email_preview"]);
const Scope = z.enum(["global", "session", "account", "network", "contact"]);
const Body = z.object({
  limits: z.array(z.object({
    endpoint: Endpoint,
    scope: Scope,
    max_count: z.number().int().min(1).max(100000),
    window_seconds: z.number().int().min(1).max(86400),
  })).min(1).max(20),
});

async function adminId(req: Request): Promise<string | null> {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!bearer || bearer === Deno.env.get("SUPABASE_ANON_KEY") || bearer.startsWith("sb_publishable_")) return null;
  const { data } = await adminClient().auth.getUser(bearer);
  if (!data.user) return null;
  const { data: isAdmin } = await adminClient().rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return isAdmin === true ? data.user.id : null;
}

function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

// What the server would actually enforce right now: saved value, then environment
// override, then code default. The dashboard shows these, so it can never drift from the limiter.
function effectiveLimits(saved: Record<string, SavedLimit & { updated_at: string }>) {
  const rows: { endpoint: TrafficEndpoint; scope: string; max_count: number; window_seconds: number; saved: boolean; updated_at: string | null }[] = [];
  for (const endpoint of LIMIT_ENDPOINTS) {
    const rules = TRAFFIC_DEFAULTS[endpoint] as Record<string, readonly [number, number]>;
    for (const scope of Object.keys(rules)) {
      const prefix = `QP_LIMIT_${endpoint.toUpperCase()}_${scope.toUpperCase()}`;
      const row = saved[`${endpoint}:${scope}`];
      const [max_count, window_seconds] = resolveLimit(rules[scope], {
        count: Deno.env.get(`${prefix}_COUNT`),
        seconds: Deno.env.get(`${prefix}_SECONDS`),
      }, row);
      rows.push({ endpoint, scope, max_count, window_seconds, saved: !!row, updated_at: row?.updated_at ?? null });
    }
  }
  return rows;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const db = adminClient();
  const uid = await adminId(req);
  if (!uid) return json({ error: "Sign in as a team member with admin access to manage these settings." }, 403);

  const { data: savedRows, error: readError } = await db
    .from("traffic_limit_settings")
    .select("endpoint,scope,max_count,window_seconds,updated_at");
  if (readError) {
    console.error("traffic limit settings unreadable", { code: readError.code });
    return json({ error: "Unable to load the traffic limits. Please try again." }, 500);
  }
  const saved: Record<string, SavedLimit & { updated_at: string }> = {};
  for (const row of savedRows ?? []) saved[`${row.endpoint}:${row.scope}`] = row;

  if (req.method === "POST") {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Please enter whole-number limits within the allowed range.", fields: parsed.error.flatten().fieldErrors }, 400);
    // A ceiling for a scope the endpoint never checks would silently do nothing,
    // so it is rejected rather than stored.
    for (const item of parsed.data.limits) {
      const rules = TRAFFIC_DEFAULTS[item.endpoint] as Record<string, readonly [number, number]>;
      if (!LIMIT_SCOPES.includes(item.scope) || !rules[item.scope]) {
        return json({ error: `The ${item.endpoint} protection has no ${item.scope} limit.` }, 400);
      }
    }
    const { error: writeError } = await db.from("traffic_limit_settings").upsert(
      parsed.data.limits.map((item) => ({ ...item, updated_by: uid, updated_at: new Date().toISOString() })),
      { onConflict: "endpoint,scope" },
    );
    if (writeError) {
      console.error("traffic limit settings not saved", { code: writeError.code });
      return json({ error: "Unable to save the traffic limits. Nothing was changed." }, 500);
    }
    const { data: after, error: afterError } = await db
      .from("traffic_limit_settings")
      .select("endpoint,scope,max_count,window_seconds,updated_at");
    if (afterError) return json({ error: "The limits were saved but could not be read back. Please reload." }, 500);
    const merged: Record<string, SavedLimit & { updated_at: string }> = {};
    for (const row of after ?? []) merged[`${row.endpoint}:${row.scope}`] = row;
    return json({ limits: effectiveLimits(merged), blocks: [], saved: parsed.data.limits.length });
  }

  const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const { data: blocks } = await db
    .from("traffic_limit_blocks")
    .select("endpoint,scope,day,blocks")
    .gte("day", since)
    .order("day", { ascending: true });

  return json({ limits: effectiveLimits(saved), blocks: blocks ?? [] });
});
