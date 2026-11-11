export type UserRole = "admin" | "art_director" | "senior_designer" | "designer" | "client";

export type TaskStatus =
  | "backlog"
  | "in_progress"
  | "in_review"
  | "revision"
  | "completed";

export type TaskPriority = "urgent" | "high" | "medium" | "low";

export type CreativeCategory =
  | "Branding & Identity"
  | "UI/UX Design"
  | "3D & Motion"
  | "Social Media Kit"
  | "Pitch Deck & Presentation"
  | "Packaging Design";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  agency_role: string;
  department?: string;
  tasks_count?: number;
}

export interface ClientCompany {
  id: string;
  name: string;
  brand_name: string;
  logo_url: string;
  brand_accent: string;
  tier: "enterprise" | "growth" | "retainer";
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: "image" | "figma" | "video" | "pdf" | "archive";
  url: string;
  preview_url?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  client: ClientCompany;
  category: CreativeCategory;
  assigned_to: Profile;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string; // ISO date YYYY-MM-DD
  scheduled_time?: string; // e.g. "09:30"
  duration_minutes?: number; // e.g. 60
  is_pinned?: boolean;
  pin_note?: string;
  deliverable_preview?: string;
  attachments?: TaskAttachment[];
  tags: string[];
  comments_count: number;
  created_at: string;
  completed_at?: string;
}

export interface WeeklyPinnedTask {
  id: string;
  task_id: string;
  title: string;
  client_name: string;
  category: CreativeCategory;
  date_label: string;
  due_date: string;
  note: string;
  priority: TaskPriority;
  avatar: string;
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  action: string;
  target: string;
  category: string;
  timestamp: string;
  timeAgo: string;
  previewImage?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "review" | "assignment" | "deadline" | "mention" | "system";
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

