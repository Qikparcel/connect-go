import { createClient } from "@supabase/supabase-js";

/**
 * Trimmed deliberately. These are pasted into a hosting dashboard by hand, and
 * a copied value routinely arrives with a trailing space, newline, or table
 * border character. The result is a 401 "Invalid API key" that looks nothing
 * like a copy-paste problem, so strip the whitespace here instead.
 */
const clean = (value: string | undefined) => value?.trim().replace(/[|│]$/, "").trim() || undefined;

const supabaseUrl = clean(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const supabaseAnonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

/**
 * The anon key is safe to ship in the browser bundle — row level security is
 * what actually protects the data. See supabase/migrations for the policies.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false },
    })
  : null;
