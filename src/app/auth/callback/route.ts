import { NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/dashboard";

  if (code) {
    try {
      const supabase = createClientServer();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (e) {
      console.error("Auth callback error:", e);
    }
  }

  // Return the user to an error page or login with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
