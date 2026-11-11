import { createClientServer } from "@/lib/supabase/server";

export type TaskStatusType =
  | "NEW"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "REVISION"
  | "COMPLETED"
  | "REJECTED";

export type TaskPriorityType = "urgent" | "high" | "medium" | "low";

export interface DbTask {
  id: string;
  task_number: number;
  title: string;
  description: string | null;
  design_category: string;
  platform: string | null;
  dimensions: string | null;
  main_content: string | null;
  instructions: string | null;
  priority: TaskPriorityType;
  status: TaskStatusType;
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
  creator?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  assignee?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface TaskStats {
  total: number;
  newRequests: number;
  accepted: number;
  inProgress: number;
  inReview: number;
  revision: number;
  completed: number;
  overdue: number;
}

export async function getDashboardTasks(): Promise<DbTask[]> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        creator:profiles!tasks_created_by_fkey(full_name, email, avatar_url),
        assignee:profiles!tasks_assigned_to_fkey(full_name, email, avatar_url)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as DbTask[];
  } catch {
    return [];
  }
}

export async function getTaskById(taskId: string): Promise<DbTask | null> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        creator:profiles!tasks_created_by_fkey(full_name, email, avatar_url),
        assignee:profiles!tasks_assigned_to_fkey(full_name, email, avatar_url)
      `)
      .eq("id", taskId)
      .single();

    if (error || !data) return null;
    return data as DbTask;
  } catch {
    return null;
  }
}

export async function getTaskStats(): Promise<TaskStats> {
  try {
    const supabase = createClientServer();
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("id, status, deadline");

    if (error || !tasks) {
      return {
        total: 0,
        newRequests: 0,
        accepted: 0,
        inProgress: 0,
        inReview: 0,
        revision: 0,
        completed: 0,
        overdue: 0,
      };
    }

    const now = new Date();
    let total = tasks.length;
    let newRequests = 0;
    let accepted = 0;
    let inProgress = 0;
    let inReview = 0;
    let revision = 0;
    let completed = 0;
    let overdue = 0;

    for (const t of tasks) {
      if (t.status === "NEW") newRequests++;
      else if (t.status === "ACCEPTED") accepted++;
      else if (t.status === "IN_PROGRESS") inProgress++;
      else if (t.status === "IN_REVIEW") inReview++;
      else if (t.status === "REVISION") revision++;
      else if (t.status === "COMPLETED") completed++;

      if (t.deadline && t.status !== "COMPLETED" && t.status !== "REJECTED") {
        if (new Date(t.deadline) < now) {
          overdue++;
        }
      }
    }

    return {
      total,
      newRequests,
      accepted,
      inProgress,
      inReview,
      revision,
      completed,
      overdue,
    };
  } catch {
    return {
      total: 0,
      newRequests: 0,
      accepted: 0,
      inProgress: 0,
      inReview: 0,
      revision: 0,
      completed: 0,
      overdue: 0,
    };
  }
}

