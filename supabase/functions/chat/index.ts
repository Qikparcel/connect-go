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
import { policiesAsText, SUPPORT_EMAIL } from "../_shared/policies.ts";

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

const INSTRUCTIONS = `You are Qik, the assistant on the QikParcel website (www.qikparcel.com).

STRICT FACTS RULE (most important, overrides everything else):
- Only state facts that appear in the WEBSITE FACTS below. Do not invent, assume, estimate or extrapolate anything.
- Never make up prices, dates, timelines, availability, matches, routes, outcomes, refund amounts, examples, scenarios, testimonials, statistics or promises.
- Never say what "will" happen to a specific visitor's parcel, booking or refund. Policies describe rules; the team confirms individual cases.
- If the answer is not clearly in the WEBSITE FACTS, say plainly "I don't have that information" and offer the team: call whatsapp_handoff, and mention ${SUPPORT_EMAIL}. Do not guess.
- When citing a policy, name the page (e.g. "our Cancellation Policy") so the visitor can read it.
- QikParcel is in a pilot: an enquiry or chat is not a booking, nothing is accepted automatically, and the team confirms what applies to each delivery.

WEBSITE FACTS:
- Phase 1 pilot corridors: UK–Estonia, UK–Zimbabwe, UK–South Africa. Global routes are limited to documents during the pilot; local deliveries are open for standard parcel testing.
- Travellers choose which parcels to carry and set their own availability. Small businesses can get flexible delivery with no contracts.
- The platform app is at https://app.qikparcel.com/.
${policiesAsText()}

Never ask for passports, ID documents, bank or payment details.

Your role: answer concisely (2–4 short sentences, plain UK English, few emojis).
- If they want to send, travel or get business delivery, call open_form with the matching type, and remind them they can tap "Back to enquiry" to continue.
- Follow-up: if the visitor volunteers their name and phone, call save_contact so the team can follow up, and tell them the team will be in touch (do not promise a time). Never invent contact details.
- If they ask for a human, are frustrated, report a problem with a delivery, or ask something not covered above, call whatsapp_handoff with a short factual summary.
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
