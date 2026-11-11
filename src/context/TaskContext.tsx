"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Task,
  WeeklyPinnedTask,
  NotificationItem,
  TaskStatus,
  TaskPriority,
  CreativeCategory,
} from "@/types/database";
import {
  INITIAL_TASKS,
  INITIAL_WEEKLY_PINS,
  INITIAL_NOTIFICATIONS,
  CURRENT_USER,
  CLIENT_COMPANIES,
} from "@/lib/mock-data";

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

  // Actions
  setSelectedDate: (date: Date) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: string) => void;
  toggleSidebar: () => void;
  setIsCreateTaskOpen: (open: boolean) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  addCommentToTask: (taskId: string, comment: string) => void;
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
  }) => void;
  togglePinTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  addWeeklyPin: (pin: Omit<WeeklyPinnedTask, "id">) => void;
  removeWeeklyPin: (pinId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  showToast: (title: string, description?: string, type?: ToastMessage["type"]) => void;
  dismissToast: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [pinnedTasks, setPinnedTasks] = useState<WeeklyPinnedTask[]>(INITIAL_WEEKLY_PINS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
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

  const addCommentToTask = (taskId: string, comment: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments_count: (t.comments_count || 0) + 1 }
          : t
      )
    );
    showToast("Feedback Added", "New comment recorded on creative deliverable.", "info");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const showToast = (title: string, description?: string, type: ToastMessage["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const createTask = (data: {
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
    const client = CLIENT_COMPANIES.find((c) => c.brand_name.toLowerCase().includes(data.clientName.toLowerCase())) || {
      id: `client-${Date.now()}`,
      name: data.clientName,
      brand_name: data.clientName,
      logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
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
      assigned_to: CURRENT_USER,
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
        avatar: CURRENT_USER.avatar_url,
      };
      setPinnedTasks((prev) => [newPin, ...prev]);
    }

    showToast("Task Created Successfully", `"${data.title}" has been assigned and scheduled.`, "success");
  };

  const togglePinTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

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
        date_label: task.scheduled_time ? `${task.due_date} • ${task.scheduled_time}` : task.due_date,
        due_date: task.due_date,
        note: task.pin_note || task.description.substring(0, 80),
        priority: task.priority,
        avatar: task.assigned_to.avatar_url,
      };
      setPinnedTasks((prev) => [newPin, ...prev]);
      showToast("Pinned to Weekly Schedule", `"${task.title}" is now highlighted.`, "success");
    }
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
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
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setPinnedTasks((prev) => prev.filter((p) => p.task_id !== taskId));
    if (task) {
      showToast("Task Deleted", `"${task.title}" has been removed.`, "warning");
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

