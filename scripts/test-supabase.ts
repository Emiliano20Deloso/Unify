import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/db-types";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
    console.error("Faltan variables de entorno de Supabase en .env.local");
    process.exit(1);
}

const admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const anon = createClient<Database>(url, anonKey);

const sample = {
    origin: "Aeropuerto CDMX T1",
    destination: "Polanco, Masaryk 123",
    pickup_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    passengers: 2,
    luggage: 2,
    service_level: "select",
    customer_name: "Smoke Test",
    customer_email: "smoketest@unifyluxury.com",
    is_corporate: false,
} as const;

async function main() {
    console.log("→ service_role insert + select...");
    const { data, error } = await admin.from("quotes").insert(sample).select().single();
    if (error) throw new Error(`service_role falló: ${error.message}`);
    console.log("  ✓ id:", data.id, "| status:", data.status);

    console.log("→ anon insert (sin RETURNING)...");
    const { error: anonErr } = await anon.from("quotes").insert(sample);
    if (anonErr) throw new Error(`anon falló: ${anonErr.message}`);
    console.log("  ✓ anon pudo insertar");

    console.log("→ cleanup...");
    await admin.from("quotes").delete().eq("customer_email", sample.customer_email);
    console.log("  ✓ limpio");

    console.log("\n✅ Supabase OK: conexión, RLS y tabla funcionan.");
}

main().catch((e) => {
    console.error("❌", e.message ?? e);
    process.exit(1);
});
