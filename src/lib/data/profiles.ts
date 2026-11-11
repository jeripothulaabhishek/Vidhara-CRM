import { createClientServer } from "@/lib/supabase/server";

export interface DbProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "ADMIN" | "MEMBER";
  agency_role: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export async function getCurrentProfile(): Promise<DbProfile | null> {
  try {
    const supabase = createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) return null;
    return data as DbProfile;
  } catch {
    return null;
  }
}

export async function getAllProfiles(): Promise<DbProfile[]> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as DbProfile[];
  } catch {
    return [];
  }
}

