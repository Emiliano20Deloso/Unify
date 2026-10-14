// Server-only. Lee la sesión de las cookies via @supabase/ssr.
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./db-types";

export async function getServerSupabase() {
    const cookieStore = await cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // RSC puede intentar setear cookies — está OK, el middleware lo refresca.
                    }
                },
            },
        }
    );
}

export async function getSessionUser() {
    const supabase = await getServerSupabase();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

    if (error || !data) return false;
    return data.role === "admin";
}

/**
 * Para rutas y páginas protegidas. Devuelve { user, isAdmin }.
 * Si no hay sesión, user es null. Si hay sesión pero no es admin, isAdmin es false.
 * El caller decide qué hacer (redirect, 403, etc.).
 */
export async function getAdminContext() {
    const user = await getSessionUser();
    if (!user) return { user: null, isAdmin: false as const };
    const admin = await isUserAdmin(user.id);
    return { user, isAdmin: admin };
}
