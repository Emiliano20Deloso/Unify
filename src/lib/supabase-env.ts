// Lectura centralizada de la configuración pública de Supabase.
// Sin dependencias: se puede importar desde proxy, servidor y cliente.
// Las variables NEXT_PUBLIC_* se escriben literalmente para que Next las inyecte en el bundle del cliente.

export interface SupabasePublicEnv {
    url: string;
    anonKey: string;
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
    return getSupabasePublicEnv() !== null;
}
