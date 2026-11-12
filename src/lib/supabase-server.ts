// Server-only. Lee la sesión de las cookies via @supabase/ssr.
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./db-types";
import { getSupabasePublicEnv } from "./supabase-env";

/** Devuelve el cliente de servidor, o null si Supabase no está configurado. */
export async function getServerSupabase() {
    // cookies() va primero para que las páginas que usan esto sigan siendo dinámicas aunque falte la config.
    const cookieStore = await cookies();
    const env = getSupabasePublicEnv();
    if (!env) return null;
    return createServerClient<Database>(
        env.url,
        env.anonKey,
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
                        // RSC puede intentar setear cookies — está OK, el proxy lo refresca.
                    }
                },
            },
        }
    );
}

export async function getSessionUser() {
    const supabase = await getServerSupabase();
    if (!supabase) return null;
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
    const supabase = await getServerSupabase();
    if (!supabase) return false;
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
