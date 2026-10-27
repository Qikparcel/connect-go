import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
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
QikParcel is a community-powered, peer-to-peer delivery platform (currently in BETA). It matches senders with verified travellers and couriers already heading their way, locally and internationally.
Facts you may share:
- Phase 1 pilot corridors: UK ↔ Estonia, UK ↔ Zimbabwe, UK ↔ South Africa. More global routes coming soon. Global routes are limited to secure document relay during the pilot; local deliveries are open for standard parcel testing.
- How it works: post a delivery request → AI route matching with a verified traveller/courier → payment held in escrow, identity verified → recipient confirms, payment released.
- Trust: ID verification, escrow-style payments, in-app communication, ratings & reviews, delivery confirmation before payout.
- Travellers earn on trips they already take, choose which parcels to carry and set their own availability.
- Small businesses get flexible on-demand delivery with no contracts.
- Pricing: local is dynamic by distance; global document relay is a flat secure rate; early testers get reduced platform fees. Never quote specific prices, dates, or promises not listed here — say the team will confirm.
- The platform is at https://app.qikparcel.com/.

Your chat flow:
1. Greet briefly and find out whether they want to send a parcel, earn as a traveller, or deliver for a business. Answer questions concisely (2–4 short sentences, plain UK English).
2. Once you know their interest, ask for their name and WhatsApp/phone number (email optional) so the team can follow up. When you have name and phone, call save_contact. Never invent details.
3. Then call open_form with the matching type so they can complete the full enquiry form.
4. If they ask for a human, are frustrated, or ask something you can't answer, call whatsapp_handoff.
Keep it short and warm. Don't use the tools more than needed.`;

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

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

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
          const { error } = await db.from("chat_conversations").upsert({
            id, full_name: c.full_name, phone: c.phone, email: c.email, interest: c.interest,
            updated_at: new Date().toISOString(),
          });
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
        const { error } = await db.from("chat_conversations").upsert({
          id, messages: all, updated_at: new Date().toISOString(),
        });
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
