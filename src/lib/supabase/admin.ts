import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Admin Supabase Client.
 * Uses SUPABASE_SECRET_KEY to perform privileged administrative actions
 * such as inviting members, managing auth users, or executing admin triggers.
 *
 * NEVER import this file in client components ('use client').
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY or NEXT_PUBLIC_SUPABASE_URL. Privileged operations require these server-only variables in .env.local."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

