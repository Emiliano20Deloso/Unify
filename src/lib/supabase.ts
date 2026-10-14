import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db-types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    throw new Error(
        "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(url, anonKey);

export const getServiceClient = (): SupabaseClient<Database> => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        throw new Error(
            "SUPABASE_SERVICE_ROLE_KEY no está definida. Solo úsala en el servidor."
        );
    }
    return createClient<Database>(url!, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
};
