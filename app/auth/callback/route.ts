import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

// Handles the email-confirmation redirect from Supabase.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = configuredSiteUrl || url.origin;
  const code = url.searchParams.get("code");
  const errorCode = url.searchParams.get("error_code");

  if (errorCode) {
    return NextResponse.redirect(
      `${origin}/signup?error=${encodeURIComponent(errorCode)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/signup?error=confirmation_failed`);
}
