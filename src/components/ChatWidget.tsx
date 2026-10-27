import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X, Package, Plane, Store, RotateCcw } from "lucide-react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { useOpenLead } from "@/components/leads/LeadDialog";
import { WHATSAPP, type LeadType } from "@/components/leads/leadForms";
import logo from "@/assets/qikparcel-logo.png";

const ID_KEY = "qik-chat-id";
const MSG_KEY = "qik-chat-messages";

function loadChat(): { id: string; messages: UIMessage[] } {
  if (typeof window === "undefined") return { id: crypto.randomUUID(), messages: [] };
  let id = localStorage.getItem(ID_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(ID_KEY, id); }
  try { return { id, messages: JSON.parse(localStorage.getItem(MSG_KEY) || "[]") }; } catch { return { id, messages: [] }; }
}

const FORM_LABEL: Record<LeadType, { label: string; icon: typeof Package }> = {
  sender: { label: "Open the sender form", icon: Package },
  traveller: { label: "Open the traveller form", icon: Plane },
  merchant: { label: "Open the business form", icon: Store },
};

const STARTERS = [
  { text: "I want to send a parcel", icon: Package },
  { text: "I want to earn as a traveller", icon: Plane },
  { text: "I want delivery for my business", icon: Store },
];

function ChatWindow({ initial, onReset }: { initial: { id: string; messages: UIMessage[] }; onReset: () => void }) {
  const openLead = useOpenLead();
  const [error, setError] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  }), []);
  const { messages, sendMessage, status, stop } = useChat({
    id: initial.id,
    messages: initial.messages,
    transport,
    onError: (e) => setError(/fetch|network/i.test(e.message) ? "Can't reach the chat — check your connection and try again." : e.message || "Something went wrong. Please try again."),
  });
  const busy = status === "submitted" || status === "streaming";
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!busy) localStorage.setItem(MSG_KEY, JSON.stringify(messages)); }, [messages, busy]);
  useEffect(() => { if (!busy) boxRef.current?.querySelector("textarea")?.focus(); }, [busy]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    setError("");
    sendMessage({ text });
  };

  const waLink = (summary?: string) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi QikParcel, I was chatting on your website${summary ? `: ${summary}` : "."}`)}`;

  return (
    <div ref={boxRef} className="flex h-full flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="gap-4 p-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-foreground">Hi! I'm Qik. I can answer questions about QikParcel and get you set up. What brings you here?</p>
              <div className="flex flex-col gap-2">
                {STARTERS.map(({ text, icon: Icon }) => (
                  <Button key={text} variant="outline" size="sm" className="justify-start" onClick={() => send(text)}>
                    <Icon className="h-4 w-4 text-primary" /> {text}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : "bg-transparent p-0"}>
                {m.parts.map((p, i) => {
                  if (p.type === "text") return <MessageResponse key={i}>{p.text}</MessageResponse>;
                  if (p.type === "tool-open_form" && p.state === "output-available") {
                    const t = (p.output as { type: LeadType }).type;
                    const { label, icon: Icon } = FORM_LABEL[t];
                    return <Button key={i} variant="hero" size="sm" className="my-1 w-fit" onClick={() => openLead(t)}><Icon className="h-4 w-4" /> {label}</Button>;
                  }
                  if (p.type === "tool-whatsapp_handoff" && p.state === "output-available") {
                    return (
                      <Button key={i} variant="outline" size="sm" className="my-1 w-fit" asChild>
                        <a href={waLink((p.output as { summary: string }).summary)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> Continue on WhatsApp</a>
                      </Button>
                    );
                  }
                  if (p.type === "tool-save_contact") {
                    return (
                      <Tool key={i} defaultOpen={false}>
                        <ToolHeader type={p.type} state={p.state} title="Saved your contact details" />
                        <ToolContent>
                          <ToolInput input={p.input} />
                          <ToolOutput output={p.output} errorText={p.errorText} />
                        </ToolContent>
                      </Tool>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer className="text-sm">Qik is thinking…</Shimmer>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t border-border p-3">
        <PromptInput onSubmit={(msg) => send(msg.text)}>
          <PromptInputTextarea autoFocus placeholder="Ask about sending, travelling or business…" />
          <PromptInputFooter className="justify-between">
            <button type="button" onClick={onReset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3 w-3" /> New chat
            </button>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(loadChat);

  const reset = () => {
    localStorage.removeItem(MSG_KEY);
    localStorage.removeItem(ID_KEY);
    setChat(loadChat());
  };

  return (
    <>
      {open && (
        <div className="fixed inset-x-2 bottom-2 top-16 z-[60] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-auto sm:bottom-24 sm:right-4 sm:h-[560px] sm:w-[380px]">
          <div className="flex items-center gap-3 border-b border-border bg-secondary px-4 py-3">
            <img src={logo} alt="" className="h-7 w-auto" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Chat with Qik</p>
              <p className="text-xs text-muted-foreground">QikParcel assistant · team replies on WhatsApp</p>
            </div>
            <button aria-label="Close chat" onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
          <div className="min-h-0 flex-1">
            <ChatWindow key={chat.id} initial={chat} onReset={reset} />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with QikParcel"}
        className="fixed bottom-48 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:bottom-28"
      >
        {open ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </>
  );
};

export default ChatWidget;
