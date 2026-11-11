"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Task,
  WeeklyPinnedTask,
  NotificationItem,
  TaskStatus,
  TaskPriority,
  CreativeCategory,
  Profile,
} from "@/types/database";
import {
  INITIAL_TASKS,
  INITIAL_WEEKLY_PINS,
  INITIAL_NOTIFICATIONS,
  CURRENT_USER,
  CLIENT_COMPANIES,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "warning" | "error";
}

interface TaskContextType {
  tasks: Task[];
  pinnedTasks: WeeklyPinnedTask[];
  notifications: NotificationItem[];
  unreadCount: number;
  selectedDate: Date;
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  isSidebarCollapsed: boolean;
  isCreateTaskOpen: boolean;
  selectedTaskId: string | null;
  toasts: ToastMessage[];
  currentUser: Profile | null;
  isLiveConnected: boolean;

  // Actions
  setSelectedDate: (date: Date) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: string) => void;
  toggleSidebar: () => void;
  setIsCreateTaskOpen: (open: boolean) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  addCommentToTask: (taskId: string, comment: string) => Promise<void>;
  createTask: (newTask: {
    title: string;
    description: string;
    category: CreativeCategory;
    priority: TaskPriority;
    clientName: string;
    dueDate: string;
    scheduledTime?: string;
    durationMinutes?: number;
    pinToWeek?: boolean;
    pinNote?: string;
  }) => Promise<void>;
  togglePinTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addWeeklyPin: (pin: Omit<WeeklyPinnedTask, "id">) => void;
  removeWeeklyPin: (pinId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  showToast: (title: string, description?: string, type?: ToastMessage["type"]) => void;
  dismissToast: (id: string) => void;
  uploadTaskFile: (
    taskId: string,
    file: File,
    isDeliverable?: boolean
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Helpers to map between Supabase DB enum/naming and UI types
function mapDbStatusToUi(dbStatus: string): TaskStatus {
  switch (dbStatus) {
    case "NEW":
    case "ACCEPTED":
      return "backlog";
    case "IN_PROGRESS":
      return "in_progress";
    case "IN_REVIEW":
      return "in_review";
    case "REVISION":
      return "revision";
    case "COMPLETED":
      return "completed";
    default:
      return "in_progress";
  }
}

function mapUiStatusToDb(uiStatus: TaskStatus): string {
  switch (uiStatus) {
    case "backlog":
      return "ACCEPTED";
    case "in_progress":
      return "IN_PROGRESS";
    case "in_review":
      return "IN_REVIEW";
    case "revision":
      return "REVISION";
    case "completed":
      return "COMPLETED";
    default:
      return "IN_PROGRESS";
  }
}

function mapDbCategoryToUi(dbCategory: string): CreativeCategory {
  const map: Record<string, CreativeCategory> = {
    "Branding & Identity": "Branding & Identity",
    "UI/UX Design": "UI/UX Design",
    "3D & Motion": "3D & Motion",
    "Social Media Kit": "Social Media Kit",
    "Social Media Assets": "Social Media Kit",
    "Pitch Deck & Presentation": "Pitch Deck & Presentation",
    "Packaging Design": "Packaging Design",
  };
  return map[dbCategory] || "UI/UX Design";
}

function mapDbRowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    category: mapDbCategoryToUi(row.design_category),
    priority: row.priority || "medium",
    status: mapDbStatusToUi(row.status),
    due_date: row.deadline ? row.deadline.split("T")[0] : new Date().toISOString().split("T")[0],
    scheduled_time: row.scheduled_time || "10:00",
    duration_minutes: row.duration_minutes || 60,
    is_pinned: !!row.is_pinned,
    pin_note: row.pin_note || undefined,
    deliverable_preview: row.deliverable_preview || undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    comments_count: 0,
    created_at: row.created_at,
    completed_at: row.completed_at || undefined,
    client: {
      id: `client-${row.client_name?.toLowerCase().replace(/\s+/g, "-") || "direct"}`,
      name: row.client_name || "Direct Client",
      brand_name: row.client_name || "Direct Client",
      logo_url:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      brand_accent: "#6F00FF",
      tier: "growth",
    },
    assigned_to: {
      id: row.assigned_to || row.created_by || "user-1",
      email: row.assignee?.email || "designer@vidhara.design",
      full_name: row.assignee?.full_name || "Studio Designer",
      avatar_url:
        row.assignee?.avatar_url ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "designer",
      agency_role: "Creative Specialist",
    },
  };
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [pinnedTasks, setPinnedTasks] = useState<WeeklyPinnedTask[]>(INITIAL_WEEKLY_PINS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [currentUser, setCurrentUser] = useState<Profile | null>(CURRENT_USER);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 10, 11)); // Nov 11, 2026
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const openTaskDetail = (taskId: string) => setSelectedTaskId(taskId);
  const closeTaskDetail = () => setSelectedTaskId(null);

  const showToast = useCallback(
    (title: string, description?: string, type: ToastMessage["type"] = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        dismissToast(id);
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Re-fetch tasks from live Supabase
  const refreshTasks = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsLiveConnected(true);
        // Fetch current user's profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setCurrentUser({
            id: profileData.id,
            email: profileData.email,
            full_name: profileData.full_name,
            avatar_url:
              profileData.avatar_url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: profileData.role === "ADMIN" ? "admin" : "designer",
            agency_role: profileData.agency_role || "Creative Member",
            department: profileData.department || "Design",
          });
        }

        // Fetch tasks
        const { data: dbTasks, error: taskError } = await supabase
          .from("tasks")
          .select(
            `
            *,
            creator:profiles!tasks_created_by_fkey(full_name, email, avatar_url),
            assignee:profiles!tasks_assigned_to_fkey(full_name, email, avatar_url)
          `
          )
          .order("created_at", { ascending: false });

        if (!taskError && dbTasks && dbTasks.length > 0) {
          const mappedTasks = dbTasks.map(mapDbRowToTask);
          setTasks(mappedTasks);

          // Update pinned tasks from live data
          const livePinned: WeeklyPinnedTask[] = mappedTasks
            .filter((t) => t.is_pinned)
            .map((t) => ({
              id: `pin-${t.id}`,
              task_id: t.id,
              title: t.title,
              client_name: t.client.brand_name,
              category: t.category,
              date_label: t.scheduled_time
                ? `${t.due_date} • ${t.scheduled_time}`
                : t.due_date,
              due_date: t.due_date,
              note: t.pin_note || t.description.substring(0, 75),
              priority: t.priority,
              avatar: t.assigned_to.avatar_url,
            }));
          setPinnedTasks(livePinned);
        }

        // Fetch notifications
        const { data: dbNotifs } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (dbNotifs && dbNotifs.length > 0) {
          setNotifications(
            dbNotifs.map((n) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: (n.type as any) || "system",
              is_read: n.is_read,
              created_at: n.created_at,
              action_url: n.action_url || undefined,
            }))
          );
        }
      }
    } catch {
      // Offline or unauthenticated fallback persists gracefully
    }
  }, []);

  // On initial mount, load session and attach Supabase Realtime
  useEffect(() => {
    refreshTasks();

    try {
      const supabase = createClient();
      const channel = supabase
        .channel("vidhara-tasks-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks" },
          () => {
            refreshTasks();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications" },
          () => {
            refreshTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // No realtime in offline mode
    }
  }, [refreshTasks]);

  const addCommentToTask = async (taskId: string, comment: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments_count: (t.comments_count || 0) + 1 }
          : t
      )
    );
    showToast("Feedback Added", "New comment recorded on creative deliverable.", "info");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("task_comments").insert({
          task_id: taskId,
          user_id: user.id,
          content: comment,
        });
      }
    } catch (err: any) {
      console.warn("Could not sync comment to Supabase:", err.message);
    }
  };

  const createTask = async (data: {
    title: string;
    description: string;
    category: CreativeCategory;
    priority: TaskPriority;
    clientName: string;
    dueDate: string;
    scheduledTime?: string;
    durationMinutes?: number;
    pinToWeek?: boolean;
    pinNote?: string;
  }) => {
    const client = CLIENT_COMPANIES.find((c) =>
      c.brand_name.toLowerCase().includes(data.clientName.toLowerCase())
    ) || {
      id: `client-${Date.now()}`,
      name: data.clientName,
      brand_name: data.clientName,
      logo_url:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      brand_accent: "#6F00FF",
      tier: "growth" as const,
    };

    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newTaskId,
      title: data.title,
      description: data.description,
      client,
      category: data.category,
      assigned_to: currentUser || CURRENT_USER,
      priority: data.priority,
      status: "in_progress",
      due_date: data.dueDate,
      scheduled_time: data.scheduledTime || "10:00",
      duration_minutes: data.durationMinutes || 60,
      is_pinned: !!data.pinToWeek,
      pin_note: data.pinNote,
      tags: [data.category.split(" ")[0]],
      comments_count: 0,
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setTasks((prev) => [newTask, ...prev]);

    if (data.pinToWeek) {
      const newPin: WeeklyPinnedTask = {
        id: `pin-${Date.now()}`,
        task_id: newTaskId,
        title: data.title,
        client_name: client.brand_name,
        category: data.category,
        date_label: `${data.dueDate} • ${data.scheduledTime || "10:00 AM"}`,
        due_date: data.dueDate,
        note: data.pinNote || data.description.substring(0, 70),
        priority: data.priority,
        avatar: (currentUser || CURRENT_USER).avatar_url,
      };
      setPinnedTasks((prev) => [newPin, ...prev]);
    }

    showToast("Task Created Successfully", `"${data.title}" has been assigned and scheduled.`, "success");

    // Supabase sync
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from("tasks").insert({
          title: data.title,
          description: data.description,
          design_category: data.category,
          priority: data.priority,
          status: "IN_PROGRESS",
          client_name: data.clientName,
          created_by: user.id,
          assigned_to: user.id,
          deadline: data.dueDate,
          scheduled_time: data.scheduledTime || "10:00",
          duration_minutes: data.durationMinutes || 60,
          is_pinned: !!data.pinToWeek,
          pin_note: data.pinNote,
          tags: [data.category.split(" ")[0]],
        });

        if (!error) {
          refreshTasks();
        }
      }
    } catch (err: any) {
      console.warn("Could not insert task into Supabase:", err.message);
    }
  };

  const togglePinTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextPinState = !task.is_pinned;

    if (task.is_pinned) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_pinned: false } : t))
      );
      setPinnedTasks((prev) => prev.filter((p) => p.task_id !== taskId));
      showToast("Unpinned from Weekly View", `"${task.title}" was removed from pins.`, "info");
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_pinned: true } : t))
      );
      const newPin: WeeklyPinnedTask = {
        id: `pin-${Date.now()}`,
        task_id: task.id,
        title: task.title,
        client_name: task.client.brand_name,
        category: task.category,
        date_label: task.scheduled_time
          ? `${task.due_date} • ${task.scheduled_time}`
          : task.due_date,
        due_date: task.due_date,
        note: task.pin_note || task.description.substring(0, 80),
        priority: task.priority,
        avatar: task.assigned_to.avatar_url,
      };
      setPinnedTasks((prev) => [newPin, ...prev]);
      showToast("Pinned to Weekly Schedule", `"${task.title}" is now highlighted.`, "success");
    }

    // Supabase sync
    try {
      const supabase = createClient();
      await supabase
        .from("tasks")
        .update({ is_pinned: nextPinState })
        .eq("id", taskId);
    } catch (err: any) {
      console.warn("Could not toggle pin on Supabase:", err.message);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              completed_at: status === "completed" ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
    showToast("Status Updated", `Task moved to "${status.replace("_", " ").toUpperCase()}".`, "info");

    // Supabase sync
    try {
      const supabase = createClient();
      const dbStatus = mapUiStatusToDb(status);
      await supabase
        .from("tasks")
        .update({
          status: dbStatus,
          completed_at: status === "completed" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);
    } catch (err: any) {
      console.warn("Could not update task status on Supabase:", err.message);
    }
  };

  const deleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setPinnedTasks((prev) => prev.filter((p) => p.task_id !== taskId));
    if (task) {
      showToast("Task Deleted", `"${task.title}" has been removed.`, "warning");
    }

    // Supabase sync
    try {
      const supabase = createClient();
      await supabase.from("tasks").delete().eq("id", taskId);
    } catch (err: any) {
      console.warn("Could not delete task on Supabase:", err.message);
    }
  };

  const uploadTaskFile = async (taskId: string, file: File, isDeliverable = false) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${taskId}/${Date.now()}-${sanitizedName}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("task-files")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) {
        showToast("Upload Failed", uploadErr.message, "error");
        return { success: false, error: uploadErr.message };
      }

      // Record in task_attachments
      if (user) {
        await supabase.from("task_attachments").insert({
          task_id: taskId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type || "application/octet-stream",
          storage_path: storagePath,
          is_deliverable: isDeliverable,
          uploaded_by: user.id,
        });
      }

      showToast("File Attached", `"${file.name}" uploaded to secure studio storage.`, "success");
      return { success: true, url: storagePath };
    } catch (err: any) {
      showToast("Upload Error", err.message, "error");
      return { success: false, error: err.message };
    }
  };

  const addWeeklyPin = (pin: Omit<WeeklyPinnedTask, "id">) => {
    const newPin: WeeklyPinnedTask = {
      ...pin,
      id: `pin-${Date.now()}`,
    };
    setPinnedTasks((prev) => [newPin, ...prev]);
    showToast("Pin Added", `"${pin.title}" added to weekly priorities.`, "success");
  };

  const removeWeeklyPin = (pinId: string) => {
    const pin = pinnedTasks.find((p) => p.id === pinId);
    setPinnedTasks((prev) => prev.filter((p) => p.id !== pinId));
    if (pin) {
      setTasks((prev) =>
        prev.map((t) => (t.id === pin.task_id ? { ...t, is_pinned: false } : t))
      );
      showToast("Pin Removed", `Removed from weekly pinned items.`, "info");
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast("Notifications Cleared", "All notifications marked as read.", "info");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <TaskContext.Provider
      value={{
        tasks,
        pinnedTasks,
        notifications,
        unreadCount,
        selectedDate,
        searchQuery,
        categoryFilter,
        statusFilter,
        isSidebarCollapsed,
        isCreateTaskOpen,
        selectedTaskId,
        toasts,
        currentUser,
        isLiveConnected,
        setSelectedDate,
        setSearchQuery,
        setCategoryFilter,
        setStatusFilter,
        toggleSidebar,
        setIsCreateTaskOpen,
        openTaskDetail,
        closeTaskDetail,
        addCommentToTask,
        createTask,
        togglePinTask,
        updateTaskStatus,
        deleteTask,
        addWeeklyPin,
        removeWeeklyPin,
        markNotificationRead,
        markAllNotificationsRead,
        showToast,
        dismissToast,
        uploadTaskFile,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}


