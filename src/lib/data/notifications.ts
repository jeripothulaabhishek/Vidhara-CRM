import { createClientServer } from "@/lib/supabase/server";

export interface DbNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export async function getUserNotifications(): Promise<DbNotification[]> {
  try {
    const supabase = createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as DbNotification[];
  } catch {
    return [];
  }
}

