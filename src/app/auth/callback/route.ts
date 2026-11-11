import { NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    try {
      const supabase = createClientServer();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        if (next) {
          return NextResponse.redirect(`${origin}${next}`);
        }

        // Query role to route appropriately
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "ADMIN") {
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        } else {
          return NextResponse.redirect(`${origin}/portal/dashboard`);
        }
      }
    } catch (e) {
      console.error("Auth callback error:", e);
    }
  }

  // Return the user to login with notice
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

