import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") ?? "/admin";

    if (!code) {
        return NextResponse.redirect(new URL("/admin/login?error=missing_code", url.origin));
    }

    const supabase = await getServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.warn("[auth/callback] exchange failed:", error);
        return NextResponse.redirect(
            new URL(`/admin/login?error=${encodeURIComponent(error.message)}`, url.origin)
        );
    }

    return NextResponse.redirect(new URL(next, url.origin));
}
