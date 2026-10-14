import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/db-types";

config({ path: ".env.local" });

const BASE = process.env.API_BASE ?? "http://localhost:3000";

const payload = {
    origin: "Aeropuerto Internacional de la Ciudad de México, Terminal 1",
    destination: "Masaryk 123, Polanco, Ciudad de México",
    pickupAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    passengers: 2,
    luggage: 2,
    serviceLevel: "select",
    customerName: "E2E Test",
    customerEmail: "e2e-test@unifyluxury.com",
    isCorporate: false,
};

async function main() {
    console.log(`→ POST ${BASE}/api/quote`);
    const resp = await fetch(`${BASE}/api/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const json = await resp.json();
    console.log(`  status: ${resp.status}`);
    console.log(`  body:`, json);

    if (resp.status !== 201) {
        console.error("❌ Falló el POST");
        process.exit(1);
    }

    console.log(`\n→ Validando en Supabase (service_role)...`);
    const admin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data: row, error } = await admin
        .from("quotes")
        .select()
        .eq("id", json.id)
        .single();
    if (error) throw error;
    console.log(`  ✓ encontrado en DB:`, {
        id: row.id,
        status: row.status,
        price_preliminary: row.price_preliminary,
        distance_km: row.distance_km,
        duration_min: row.duration_min,
    });

    console.log(`\n→ cleanup...`);
    await admin.from("quotes").delete().eq("id", json.id);
    console.log(`  ✓ limpio`);

    console.log(`\n✅ Endpoint /api/quote funciona end-to-end.`);
}

main().catch((e) => {
    console.error("❌", e);
    process.exit(1);
});
