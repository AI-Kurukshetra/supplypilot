import { createClient } from "@supabase/supabase-js";

import { getAppEnv, requireSupabaseEnv } from "@/lib/env";

export function createAdminClient() {
  const { supabaseUrl, supabasePublishableKey } = requireSupabaseEnv();
  const { supabaseServiceRoleKey } = getAppEnv();

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey ?? supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
