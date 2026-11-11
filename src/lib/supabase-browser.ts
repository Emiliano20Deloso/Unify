"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./db-types";
import { getSupabasePublicEnv } from "./supabase-env";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Devuelve el cliente del navegador, o null si Supabase no está configurado. */
export function getBrowserSupabase() {
    if (client) return client;
    const env = getSupabasePublicEnv();
    if (!env) return null;
    client = createBrowserClient<Database>(env.url, env.anonKey);
    return client;
}
