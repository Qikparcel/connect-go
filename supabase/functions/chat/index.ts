import { corsHeaders as baseCors } from "npm:@supabase/supabase-js@2/cors";
const corsHeaders = { ...baseCors, "Access-Control-Allow-Headers": `${baseCors["Access-Control-Allow-Headers"]}, x-chat-token` };
import { createClient } from "npm:@supabase/supabase-js@2";
import { createOpenAI } from "npm:@ai-sdk/openai@^4";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "npm:ai@^7";
import { z } from "npm:zod@^3";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "../_shared/run-id.ts";

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

const INSTRUCTIONS = `You are Qik, the friendly assistant on the QikParcel website.
QikParcel is a community-powered delivery platform (currently in BETA pilot). It helps connect senders with available delivery capacity, including eligible travellers and delivery partners, locally and internationally.
Facts you may share:
- Phase 1 pilot corridors: UK ↔ Estonia, UK ↔ Zimbabwe, UK ↔ South Africa. More routes coming soon. Global routes are limited to secure document relay during the pilot; local deliveries are open for standard parcel testing.
- Planned trust features include identity checks for travellers, secure payment held until delivery is confirmed, ratings and delivery confirmation. Travellers are only described as verified after checks are completed, and no parcel is accepted automatically from a chat.
- Travellers can earn on trips they already take, choose which parcels to carry and set their own availability.
- Small businesses can get flexible delivery with no contracts.
- Pricing: local is dynamic by distance; global document relay is a flat rate; early testers get reduced platform fees. Never quote specific prices, dates, availability, matches, insurance, guaranteed or instant delivery, live escrow, or 24/7 support — say the team will confirm.
- The platform is at https://app.qikparcel.com/.
Never ask for passports, ID documents, bank or payment details.

Your role: the visitor has come from a guided enquiry and has a question. Answer concisely (2–4 short sentences, plain UK English, few emojis).
- If they want to send, travel or get business delivery, call open_form with the matching type, and remind them they can tap "Back to enquiry" at the top to continue the quick questions.
- Only if they volunteer name and phone, call save_contact. Never invent details.
- If they ask for a human, are frustrated, or ask something you can't answer, call whatsapp_handoff.
Don't use the tools more than needed.`;

const Body = z.object({
  id: z.string().uuid(),
  messages: z.array(z.any()).min(1).max(80),
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json(500, { error: "Chat is not configured." });

  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return json(400, { error: "Invalid JSON" });
  }
  if (!parsed.success) return json(400, { error: "Invalid request" });
  const { id } = parsed.data;
  const messages = parsed.data.messages as UIMessage[];
  if (JSON.stringify(messages).length > 200_000) return json(400, { error: "Conversation too long" });

  const token = req.headers.get("x-chat-token") ?? "";
  if (!/^[a-f0-9]{64}$/.test(token)) return json(401, { error: "Missing chat session. Please start a new chat." });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const tokenHash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Bind the conversation to the visitor's secret token; never touch someone else's chat.
  const { data: existing, error: lookupErr } = await db.from("chat_conversations").select("token_hash").eq("id", id).maybeSingle();
  if (lookupErr) { console.error("chat lookup", lookupErr); return json(500, { error: "Chat is temporarily unavailable." }); }
  if (existing) {
    if (existing.token_hash !== tokenHash) return json(403, { error: "This chat session has expired. Please start a new chat." });
  } else {
    const { error: insErr } = await db.from("chat_conversations").insert({ id, token_hash: tokenHash });
    if (insErr) { console.error("chat create", insErr); return json(403, { error: "Please start a new chat." }); }
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
    stopWhen: stepCountIs(4),
    tools: {
      save_contact: tool({
        description: "Save the visitor's name and phone so the QikParcel team can follow up.",
        inputSchema: z.object({
          full_name: z.string().min(2).max(100),
          phone: z.string().min(6).max(30),
          email: z.string().email().max(200).nullable(),
          interest: z.enum(["sender", "traveller", "merchant", "other"]),
        }),
        execute: async (c) => {
          const { error } = await db.from("chat_conversations").update({
            full_name: c.full_name, phone: c.phone, email: c.email, interest: c.interest,
            updated_at: new Date().toISOString(),
          }).eq("id", id).eq("token_hash", tokenHash);
          if (error) { console.error("save_contact", error); return { saved: false }; }
          return { saved: true };
        },
      }),
      open_form: tool({
        description: "Show the visitor a button to open the full enquiry form.",
        inputSchema: z.object({ type: z.enum(["sender", "traveller", "merchant"]) }),
        execute: async ({ type }) => ({ type }),
      }),
      whatsapp_handoff: tool({
        description: "Offer the visitor a button to continue with a human on WhatsApp.",
        inputSchema: z.object({ summary: z.string().max(300) }),
        execute: async ({ summary }) => ({ summary }),
      }),
    },
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      onFinish: async ({ messages: all }) => {
        const { error } = await db.from("chat_conversations").update({
          messages: all, updated_at: new Date().toISOString(),
        }).eq("id", id).eq("token_hash", tokenHash);
        if (error) console.error("save chat", error);
      },
      onError: (e) => {
        console.error("chat error", e);
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 429) return "We're busy right now — please try again in a moment.";
        if (status === 402) return "Chat is temporarily unavailable. Please use the enquiry forms instead.";
        return "Sorry, something went wrong. Please try again.";
      },
    }),
    runIdFetch,
    corsHeaders,
  );
});
