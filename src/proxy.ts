import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/db-types";
import { getSupabasePublicEnv } from "@/lib/supabase-env";
import { defaultLocale, locales } from "@/i18n/config";

// Idiomas por ruta:
// - /x            → reescritura interna a /es/x (el español vive sin prefijo)
// - /es/x         → 308 a /x (una sola URL por página)
// - /en/x         → pasa tal cual
// - /admin, /auth → no se tocan las rutas; solo se refresca la sesión de Supabase
// No hay redirección automática por Accept-Language.

function startsWithSegment(pathname: string, segment: string): boolean {
    return pathname === `/${segment}` || pathname.startsWith(`/${segment}/`);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (startsWithSegment(pathname, "admin") || startsWithSegment(pathname, "auth")) {
        return refreshSupabaseSession(request);
    }

    if (startsWithSegment(pathname, defaultLocale)) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
        return NextResponse.redirect(url, 308);
    }

    if (locales.some((lang) => lang !== defaultLocale && startsWithSegment(pathname, lang))) {
        return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
}

async function refreshSupabaseSession(request: NextRequest) {
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
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            },
        },
    });

    // Refresca la sesión si hace falta (y detecta expiración)
    await supabase.auth.getUser();

    return response;
}

export const config = {
    // Todo excepto /api, archivos internos de Next, /_vercel y cualquier ruta con extensión
    // (sitemap.xml, robots.txt, fuentes, imágenes...).
    matcher: ["/((?!api|_next/static|_next/image|_vercel|.*\\..*).*)"],
};
