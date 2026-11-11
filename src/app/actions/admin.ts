"use server";

import { createClientServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/data/profiles";

/**
 * Checks whether any accounts exist in the Supabase project.
 * Used by login page to show first-time administrator initialization.
 */
export async function checkIfUsersExist() {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      return { exists: false, error: error.message };
    }
    return { exists: (data.users?.length || 0) > 0 };
  } catch (err: any) {
    return { exists: false, error: err.message };
  }
}

/**
 * Bootstraps the very first Super Admin account in Supabase.
 * Strictly locked once users exist unless executed by an existing ADMIN.
 */
export async function setupInitialAdmin(formData: {
  email: string;
  password: string;
  fullName: string;
  agencyRole?: string;
}) {
  try {
    const adminSupabase = createAdminClient();

    // Check existing count for security
    const { data: list } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (list?.users && list.users.length > 0) {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile || currentProfile.role !== "ADMIN") {
        return {
          success: false,
          error: "Setup is closed. An agency administrator already exists. Please log in or request an invite.",
        };
      }
    }

    // Create user via Admin API (email automatically confirmed)
    const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        full_name: formData.fullName,
        role: "ADMIN",
        agency_role: formData.agencyRole || "Creative Director & Lead Architect",
      },
    });

    if (createError || !userData?.user) {
      return { success: false, error: createError?.message || "Failed to create user" };
    }

    const userId = userData.user.id;

    // Guarantee ADMIN role in public.profiles table
    const { error: profileError } = await adminSupabase.from("profiles").upsert(
      {
        id: userId,
        email: formData.email,
        full_name: formData.fullName,
        avatar_url:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "ADMIN",
        agency_role: formData.agencyRole || "Creative Director & Lead Architect",
        department: "Agency Leadership",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile setup notice:", profileError.message);
    }

    // Seed realistic starter agency tasks
    await seedStarterTasksForUser(adminSupabase, userId);

    return { success: true, email: formData.email };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to bootstrap administrator." };
  }
}

/**
 * Seeds initial agency tasks assigned to the given admin user.
 */
async function seedStarterTasksForUser(adminSupabase: any, userId: string) {
  try {
    const starterTasks = [
      {
        title: "Lumina Mobile Banking Design System & Token Sync",
        description:
          "Complete the high-fidelity component library with token export for iOS and Android engineering handoff.",
        design_category: "UI/UX Design",
        platform: "iOS & Android",
        dimensions: "Auto-layout",
        priority: "urgent",
        status: "IN_PROGRESS",
        client_name: "Lumina Fintech",
        created_by: userId,
        assigned_to: userId,
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        scheduled_time: "10:00",
        duration_minutes: 90,
        is_pinned: true,
        pin_note: "Token pipeline must align with Figma variables and React Native styled-components.",
        tags: ["Design System", "Tokens", "Figma"],
      },
      {
        title: "Aura Smart Ring Deluxe Packaging Die-Cut",
        description:
          "Production-ready foiled die-cut packaging specifications and matte black soft-touch unboxing experience.",
        design_category: "Packaging Design",
        platform: "Print & Hardware",
        dimensions: "180x180x60mm",
        priority: "high",
        status: "IN_REVIEW",
        client_name: "Aura Health",
        created_by: userId,
        assigned_to: userId,
        deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
        scheduled_time: "13:30",
        duration_minutes: 60,
        is_pinned: true,
        pin_note: "Verify spot UV varnish layers and pantone metallic silver ink specs with Shenzhen printer.",
        tags: ["Packaging", "Print", "CMYK"],
      },
      {
        title: "Zephyr Electric Brand Identity & Typography Guidelines",
        description:
          "Comprehensive typography hierarchy, geometric glyph lockups, and digital asset kit for EV brand launch.",
        design_category: "Brand Identity",
        platform: "Vector & Print",
        dimensions: "Scalable Vector",
        priority: "medium",
        status: "ACCEPTED",
        client_name: "Zephyr Mobility",
        created_by: userId,
        assigned_to: userId,
        deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
        scheduled_time: "15:00",
        duration_minutes: 75,
        is_pinned: false,
        tags: ["Branding", "Vector", "Typography"],
      },
      {
        title: "Prism Global Q4 Instagram Performance Campaign",
        description:
          "Suite of 9 motion carousels and vertical stories for high-converting holiday retargeting campaign.",
        design_category: "Social Media Assets",
        platform: "Instagram & TikTok",
        dimensions: "1080x1920 & 1080x1080",
        priority: "medium",
        status: "NEW",
        client_name: "Prism Global",
        created_by: userId,
        assigned_to: userId,
        deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
        scheduled_time: "11:00",
        duration_minutes: 60,
        is_pinned: false,
        tags: ["Social", "Motion", "Retargeting"],
      },
      {
        title: "Lumina Apple Watch Biometric Complication",
        description:
          "Micro-glance watchOS complication designs for instant account balance and fraud alerts.",
        design_category: "UI/UX Design",
        platform: "watchOS",
        dimensions: "Corner & Modular",
        priority: "high",
        status: "COMPLETED",
        client_name: "Lumina Fintech",
        created_by: userId,
        assigned_to: userId,
        completed_at: new Date().toISOString(),
        deadline: new Date(Date.now() - 86400000).toISOString(),
        scheduled_time: "09:00",
        duration_minutes: 45,
        is_pinned: false,
        tags: ["watchOS", "Biometrics", "Micro-UX"],
      },
    ];

    const { data: insertedTasks, error: taskError } = await adminSupabase
      .from("tasks")
      .insert(starterTasks)
      .select("id, title");

    if (taskError) {
      console.error("Task seed error:", taskError.message);
      return;
    }

    // Add initial feedback comment on first task
    if (insertedTasks && insertedTasks.length > 0) {
      await adminSupabase.from("task_comments").insert({
        task_id: insertedTasks[0].id,
        user_id: userId,
        content:
          "Please ensure Apple Pay biometric exchange and error state styling match our latest Figma variables before client review.",
        is_revision_note: false,
      });

      // Add welcome notification
      await adminSupabase.from("notifications").insert([
        {
          user_id: userId,
          title: "Vidhara Studio Connected",
          message:
            "Your Supabase PostgreSQL database is connected and active with Row Level Security.",
          type: "system",
          is_read: false,
          action_url: "/admin/dashboard",
        },
        {
          user_id: userId,
          title: "New Creative Request Assigned",
          message: 'Lumina Fintech submitted "Design System & Token Sync".',
          type: "task",
          is_read: false,
          action_url: `/admin/tasks/${insertedTasks[0].id}`,
        },
      ]);
    }
  } catch (err: any) {
    console.error("Seeding error:", err.message);
  }
}

/**
 * Invites a new team member via Supabase Auth Admin API.
 */
export async function inviteTeamMember(email: string, fullName: string, agencyRole: string) {
  try {
    const currentProfile = await getCurrentProfile();
    if (!currentProfile || currentProfile.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Only administrators can invite team members." };
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        agency_role: agencyRole,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to invite member." };
  }
}


