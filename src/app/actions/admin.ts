"use server";

import { createClientServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/data/profiles";

export async function inviteTeamMember(email: string, fullName: string, agencyRole: string) {
  try {
    // 1. Verify caller is authenticated and has ADMIN role
    const currentProfile = await getCurrentProfile();
    if (!currentProfile || currentProfile.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Only administrators can invite team members." };
    }

    // 2. Call Supabase Auth Admin API using server-only secret client
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

