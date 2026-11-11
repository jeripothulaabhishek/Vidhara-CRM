import { createClientServer } from "@/lib/supabase/server";

export interface PortalTask {
  id: string;
  task_number: number;
  title: string;
  description: string | null;
  design_category: string;
  platform: string | null;
  dimensions: string | null;
  main_content: string | null;
  instructions: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "NEW" | "ACCEPTED" | "IN_PROGRESS" | "IN_REVIEW" | "REVISION" | "COMPLETED" | "REJECTED";
  client_name: string;
  created_by: string;
  assigned_to: string | null;
  deadline: string | null;
  scheduled_time: string | null;
  duration_minutes: number;
  is_pinned: boolean;
  pin_note: string | null;
  rejection_reason: string | null;
  deliverable_preview: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  attachments?: {
    id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    storage_path: string;
    is_deliverable: boolean;
    created_at: string;
  }[];
  links?: {
    id: string;
    title: string;
    url: string;
    created_at: string;
  }[];
  comments?: {
    id: string;
    content: string;
    is_revision_note: boolean;
    created_at: string;
    author: {
      full_name: string;
      avatar_url: string | null;
      role: string;
    };
  }[];
  activity?: {
    id: string;
    action: string;
    details: any;
    created_at: string;
  }[];
}

export interface MemberDashboardStats {
  totalSubmitted: number;
  inProgress: number;
  inReview: number;
  revision: number;
  completed: number;
  upcomingDeadlinesCount: number;
}

/**
 * Fetches all tasks submitted by the authenticated member.
 */
export async function getMemberTasks(memberId: string): Promise<PortalTask[]> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        attachments:task_attachments(id, file_name, file_size, file_type, storage_path, is_deliverable, created_at),
        links:task_links(id, title, url, created_at)
      `)
      .eq("created_by", memberId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as PortalTask[];
  } catch {
    return [];
  }
}

/**
 * Fetches detailed information for a single task owned by the member.
 */
export async function getMemberTaskById(
  taskId: string,
  memberId: string
): Promise<PortalTask | null> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        attachments:task_attachments(id, file_name, file_size, file_type, storage_path, is_deliverable, created_at),
        links:task_links(id, title, url, created_at),
        comments:task_comments(
          id,
          content,
          is_revision_note,
          created_at,
          author:profiles(full_name, avatar_url, role)
        ),
        activity:task_activity(id, action, details, created_at)
      `)
      .eq("id", taskId)
      .eq("created_by", memberId)
      .single();

    if (error || !data) return null;
    return data as PortalTask;
  } catch {
    return null;
  }
}

/**
 * Computes dashboard metric counters for a member.
 */
export async function getMemberDashboardStats(
  memberId: string
): Promise<MemberDashboardStats> {
  try {
    const supabase = createClientServer();
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, status, deadline")
      .eq("created_by", memberId);

    if (!tasks || tasks.length === 0) {
      return {
        totalSubmitted: 0,
        inProgress: 0,
        inReview: 0,
        revision: 0,
        completed: 0,
        upcomingDeadlinesCount: 0,
      };
    }

    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let inProgress = 0;
    let inReview = 0;
    let revision = 0;
    let completed = 0;
    let upcomingDeadlinesCount = 0;

    for (const t of tasks) {
      if (t.status === "IN_PROGRESS" || t.status === "ACCEPTED" || t.status === "NEW") {
        inProgress++;
      }
      if (t.status === "IN_REVIEW") inReview++;
      if (t.status === "REVISION") revision++;
      if (t.status === "COMPLETED") completed++;

      if (t.deadline && t.status !== "COMPLETED") {
        const d = new Date(t.deadline);
        if (d >= now && d <= next7Days) {
          upcomingDeadlinesCount++;
        }
      }
    }

    return {
      totalSubmitted: tasks.length,
      inProgress,
      inReview,
      revision,
      completed,
      upcomingDeadlinesCount,
    };
  } catch {
    return {
      totalSubmitted: 0,
      inProgress: 0,
      inReview: 0,
      revision: 0,
      completed: 0,
      upcomingDeadlinesCount: 0,
    };
  }
}
