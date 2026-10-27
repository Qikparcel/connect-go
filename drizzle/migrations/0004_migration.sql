CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY,
  full_name text,
  phone text,
  email text,
  interest text,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read chats" ON public.chat_conversations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));