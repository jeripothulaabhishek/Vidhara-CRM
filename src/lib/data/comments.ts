import { createClientServer } from "@/lib/supabase/server";

export interface DbComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  is_revision_note: boolean;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
}

export async function getTaskComments(taskId: string): Promise<DbComment[]> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("task_comments")
      .select(`
        *,
        author:profiles(full_name, avatar_url, role)
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as DbComment[];
  } catch {
    return [];
  }
}

