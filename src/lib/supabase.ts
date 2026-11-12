import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db-types";

// Server-only. Nada se valida al importar: las variables se revisan cuando se pide el cliente.

export function isServiceClientConfigured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const getServiceClient = (): SupabaseClient<Database> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
        throw new Error(
            "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Solo úsalo en el servidor."
        );
    }
    return createClient<Database>(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
};
