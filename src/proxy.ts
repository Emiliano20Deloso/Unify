import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/db-types";
import { getSupabasePublicEnv } from "@/lib/supabase-env";

export async function proxy(request: NextRequest) {
    // Sin configuración de Supabase no hay sesión que refrescar: deja pasar la petición.
    const env = getSupabasePublicEnv();
    if (!env) return NextResponse.next();

    let response = NextResponse.next({ request });

    const supabase = createServerClient<Database>(env.url, env.anonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                );
            },
        },
    });

    // Refresca la sesión si hace falta (y detecta expiración)
    await supabase.auth.getUser();

    return response;
}

export const config = {
    // Solo las rutas que usan sesión de Supabase (panel admin y callback de auth).
    // El sitio público y /api no pasan por aquí.
    matcher: ["/admin/:path*", "/auth/:path*"],
};
