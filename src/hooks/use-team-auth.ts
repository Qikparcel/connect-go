import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useTeamAuth() {
  const [state, setState] = useState<{ loading: boolean; user: User | null; admin: boolean; error: string }>({ loading: true, user: null, admin: false, error: "" });
  useEffect(() => {
    let active = true;
    let version = 0;
    const check = async () => {
      const current = ++version;
      const { data, error } = await supabase.auth.getUser();
      if (!active || current !== version) return;
      if (!data.user) { setState({ loading: false, user: null, admin: false, error: "" }); return; }
      const roles = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (active && current === version) setState({ loading: false, user: data.user, admin: roles.data === true, error: error?.message ?? roles.error?.message ?? "" });
    };
    const { data } = supabase.auth.onAuthStateChange(() => { setTimeout(() => { if (active) void check(); }, 0); });
    void check();
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  return state;
}