import { createClientServer } from "@/lib/supabase/server";

export interface DbActivity {
  id: string;
  task_id: string;
  user_id: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export async function getRecentActivities(limit = 10): Promise<DbActivity[]> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("task_activity")
      .select(`
        *,
        user:profiles(full_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as DbActivity[];
  } catch {
    return [];
  }
}

