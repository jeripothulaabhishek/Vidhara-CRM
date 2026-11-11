import { createClientServer } from "@/lib/supabase/server";

export interface DbAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  is_deliverable: boolean;
  uploaded_by: string;
  created_at: string;
}

export async function getTaskAttachments(taskId: string): Promise<DbAttachment[]> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("task_attachments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as DbAttachment[];
  } catch {
    return [];
  }
}

