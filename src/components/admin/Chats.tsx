import { useEffect, useMemo, useState } from "react";
import { MessageCircle, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Chat = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  interest: string | null;
  messages: { id: string; role: string; parts: { type: string; text?: string }[] }[];
  updated_at: string;
};

const textOf = (message: Chat["messages"][number]) =>
  message.parts.filter((part) => part.type === "text").map((part) => part.text).join("\n");

// Conversation history is readable only by admins (RLS), so this list is simply a view
// over what the database already allows this account to see.
export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    const { data, error } = await supabase.from("chat_conversations")
      .select("*").order("updated_at", { ascending: false }).limit(500);
    if (error) setError("Unable to load chat history. Please retry.");
    else setChats((data as unknown as Chat[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return chats;
    return chats.filter((chat) => [chat.full_name, chat.phone, chat.email, chat.interest]
      .some((value) => value?.toLowerCase().includes(needle)));
  }, [chats, query]);

  const identified = chats.filter((chat) => chat.phone || chat.email).length;

  return (
    <section className="py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Chat history</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {chats.length} conversation{chats.length === 1 ? "" : "s"} · {identified} with contact details
          </p>
        </div>
        <Button variant="outline" size="icon" aria-label="Refresh chat history" title="Refresh chat history" disabled={loading} onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-72 pl-9"
            placeholder="Search name, phone, email or interest"
            aria-label="Search chat history"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query && <Button variant="ghost" size="sm" onClick={() => setQuery("")}>Clear</Button>}
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
      {loading && <p className="py-8 text-muted-foreground">Loading chat history…</p>}
      {!loading && shown.length === 0 && (
        <p className="py-8 text-muted-foreground">{query ? "No conversations match that search." : "No website chats yet."}</p>
      )}

      <div className="space-y-3">
        {shown.map((chat) => (
          <article key={chat.id} className="rounded-xl border border-border bg-card p-4">
            <button
              className="flex w-full flex-wrap items-center gap-3 text-left"
              aria-expanded={openId === chat.id}
              onClick={() => setOpenId(openId === chat.id ? null : chat.id)}
            >
              <span className="font-semibold text-foreground">{chat.full_name ?? "Anonymous visitor"}</span>
              {chat.interest && <Badge variant="secondary" className="capitalize">{chat.interest}</Badge>}
              {chat.phone && <span className="text-sm text-muted-foreground">{chat.phone}</span>}
              {chat.email && <span className="text-sm text-muted-foreground">{chat.email}</span>}
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(chat.updated_at).toLocaleString()} · {chat.messages.length} messages
              </span>
            </button>
            {openId === chat.id && (
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                {chat.messages.length === 0 && <p className="text-muted-foreground">No messages stored.</p>}
                {chat.messages.map((message) => {
                  const text = textOf(message);
                  if (!text) return null;
                  return (
                    <p key={message.id} className={message.role === "user" ? "text-foreground" : "text-muted-foreground"}>
                      <span className="font-semibold">{message.role === "user" ? "Visitor" : "Qik"}:</span> {text}
                    </p>
                  );
                })}
                {chat.phone && (
                  <div className="pt-2">
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`https://wa.me/${chat.phone.replace("+", "")}?text=${encodeURIComponent(`Hi ${chat.full_name ?? "there"}, this is QikParcel following up on your chat with us.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />Open WhatsApp
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
