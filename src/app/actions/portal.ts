"use server";

import { createClientServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface TaskSubmissionPayload {
  title: string;
  description: string;
  designCategory: string;
  platform?: string;
  dimensions?: string;
  requestedDeadline?: string;
  priority: "low" | "medium" | "high" | "urgent";
  // Content details
  mainHeading?: string;
  supportingText?: string;
  callToAction?: string;
  brandInfo?: string;
  creativeInstructions?: string;
  // External reference links
  referenceLinks?: { title: string; url: string }[];
}

/**
 * Creates a new design task request from a logged-in member.
 * Server strictly enforces status = 'NEW' and created_by = authenticated member id.
 */
export async function submitNewTaskRequest(payload: TaskSubmissionPayload) {
  try {
    const supabase = createClientServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required to submit design requests." };
    }

    // 1. Validate mandatory fields
    if (!payload.title?.trim()) {
      return { success: false, error: "Task title is required." };
    }
    if (!payload.designCategory?.trim()) {
      return { success: false, error: "Design category is required." };
    }

    // 2. Fetch member profile to record client/agency details
    const { data: memberProfile } = await supabase
      .from("profiles")
      .select("full_name, email, agency_role, department")
      .eq("id", user.id)
      .single();

    const clientName = memberProfile?.department || memberProfile?.agency_role || "Studio Client";

    // Format content brief
    const combinedContent = [
      payload.mainHeading ? `Heading: ${payload.mainHeading}` : "",
      payload.supportingText ? `Copy: ${payload.supportingText}` : "",
      payload.callToAction ? `CTA: ${payload.callToAction}` : "",
      payload.brandInfo ? `Brand Context: ${payload.brandInfo}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    // 3. Insert task record with enforced 'NEW' status
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        design_category: payload.designCategory,
        platform: payload.platform || "General",
        dimensions: payload.dimensions || "Standard",
        main_content: combinedContent || null,
        instructions: payload.creativeInstructions || null,
        priority: payload.priority || "medium",
        status: "NEW", // Strictly enforced on server
        client_name: clientName,
        created_by: user.id,
        deadline: payload.requestedDeadline ? new Date(payload.requestedDeadline).toISOString() : null,
        scheduled_time: "10:00",
        duration_minutes: 60,
        is_pinned: false,
        tags: [payload.designCategory.split(" ")[0]],
      })
      .select("id, task_number, title")
      .single();

    if (taskError || !task) {
      return { success: false, error: taskError?.message || "Failed to create task record." };
    }

    const taskId = task.id;

    // 4. Save external reference links if provided
    if (payload.referenceLinks && payload.referenceLinks.length > 0) {
      const validLinks = payload.referenceLinks
        .filter((l) => l.url && l.url.trim().length > 0)
        .map((l) => ({
          task_id: taskId,
          title: l.title?.trim() || "Reference Link",
          url: l.url.trim(),
          created_by: user.id,
        }));

      if (validLinks.length > 0) {
        await supabase.from("task_links").insert(validLinks);
      }
    }

    // 5. Create task activity history
    await supabase.from("task_activity").insert({
      task_id: taskId,
      user_id: user.id,
      action: "TASK_SUBMITTED",
      details: {
        title: task.title,
        category: payload.designCategory,
        priority: payload.priority,
        timestamp: new Date().toISOString(),
      },
    });

    // 6. Notify administrators using admin client
    try {
      const adminSupabase = createAdminClient();
      const { data: adminProfiles } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("role", "ADMIN");

      if (adminProfiles && adminProfiles.length > 0) {
        const notifications = adminProfiles.map((adm) => ({
          user_id: adm.id,
          title: "New Creative Request",
          message: `${memberProfile?.full_name || "A member"} submitted #${task.task_number}: "${task.title}".`,
          type: "task",
          is_read: false,
          action_url: `/admin/tasks/${taskId}`,
        }));
        await adminSupabase.from("notifications").insert(notifications);
      }
    } catch {
      // Non-blocking notification
    }

    return {
      success: true,
      taskId: taskId,
      taskNumber: task.task_number,
      message: "Creative request submitted successfully.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

/**
 * Record attachment metadata after file is uploaded to task-files bucket.
 */
export async function recordTaskAttachment(data: {
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storagePath: string;
  isDeliverable?: boolean;
}) {
  try {
    const supabase = createClientServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const { data: attachment, error } = await supabase
      .from("task_attachments")
      .insert({
        task_id: data.taskId,
        file_name: data.fileName,
        file_size: data.fileSize,
        file_type: data.fileType,
        storage_path: data.storagePath,
        is_deliverable: data.isDeliverable || false,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log activity
    await supabase.from("task_activity").insert({
      task_id: data.taskId,
      user_id: user.id,
      action: data.isDeliverable ? "DELIVERABLE_UPLOADED" : "REFERENCE_ATTACHED",
      details: {
        fileName: data.fileName,
        fileSize: data.fileSize,
      },
    });

    return { success: true, attachment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Generates a signed URL for reading or downloading a private file in task-files bucket.
 */
export async function getSignedFileUrl(storagePath: string, expiresIn = 3600) {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase.storage
      .from("task-files")
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data?.signedUrl) {
      return { success: false, error: error?.message || "Could not generate signed URL." };
    }

    return { success: true, signedUrl: data.signedUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Adds a feedback or revision comment to a task.
 */
export async function addMemberComment(data: {
  taskId: string;
  content: string;
  isRevisionNote?: boolean;
}) {
  try {
    const supabase = createClientServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    if (!data.content?.trim()) {
      return { success: false, error: "Comment cannot be empty." };
    }

    const { data: comment, error } = await supabase
      .from("task_comments")
      .insert({
        task_id: data.taskId,
        user_id: user.id,
        content: data.content.trim(),
        is_revision_note: !!data.isRevisionNote,
      })
      .select(`
        *,
        author:profiles(full_name, email, avatar_url, role)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Record activity
    await supabase.from("task_activity").insert({
      task_id: data.taskId,
      user_id: user.id,
      action: data.isRevisionNote ? "REVISION_NOTE_POSTED" : "FEEDBACK_COMMENTED",
      details: { snippet: data.content.substring(0, 100) },
    });

    return { success: true, comment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sends a password reset email via Supabase.
 */
export async function requestPasswordReset(email: string) {
  try {
    const supabase = createClientServer();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: "Password reset link sent to your email." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates the user's password once reset token is verified.
 */
export async function updateMemberPassword(password: string) {
  try {
    const supabase = createClientServer();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: "Password updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
