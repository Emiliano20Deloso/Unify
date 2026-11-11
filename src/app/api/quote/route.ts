import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validation";
import { resolveLegDistance } from "@/lib/distance";
import { computeRoute } from "@/lib/google/routes";
import { GoogleApiError, hasGoogleKey } from "@/lib/google/key";
import { isInZone } from "@/lib/places/zone";
import { calculatePrice, pricingConfig, round2 } from "@/lib/pricing";
import { getServiceClient, isServiceClientConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Body no es JSON válido" }, { status: 400 });
    }

    const parsed = quoteRequestSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Datos inválidos", issues: parsed.error.flatten() },
            { status: 400 }
        );
    }
    const q = parsed.data;

    if (!isServiceClientConfigured()) {
        return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    let distanceKm: number | null = null;
    let durationMin: number | null = null;
    let pricePreliminary: number | null = null;
    let mapsError: string | null = null;

    const pickupAt = new Date(q.pickupAt);
    const hasCoords =
        q.originLat != null && q.originLng != null && q.destinationLat != null && q.destinationLng != null;

    try {
        if (hasCoords) {
            // Con coordenadas: Routes API si hay llave, aproximado si no (nunca lanza).
            const origin = { lat: q.originLat!, lng: q.originLng! };
            const destination = { lat: q.destinationLat!, lng: q.destinationLng! };
            const leg = await resolveLegDistance(origin, destination, pickupAt);
            distanceKm = leg.km;
            durationMin = leg.min;
        } else if (hasGoogleKey()) {
            // Solo texto y con llave: waypoints por dirección.
            const r = await computeRoute({ address: q.origin }, { address: q.destination }, pickupAt);
            distanceKm = round2(r.distanceMeters / 1000);
            durationMin = Math.max(1, Math.round(r.durationSec / 60));
        } else {
            // Solo texto y sin llave: se guarda para cotización manual.
            mapsError = "NO_API_KEY";
        }

        const outOfZone =
            hasCoords &&
            (!isInZone({ lat: q.originLat!, lng: q.originLng! }) ||
                !isInZone({ lat: q.destinationLat!, lng: q.destinationLng! }));
        const overCapacity =
            q.passengers > pricingConfig.capacity.max_passengers || q.luggage > pricingConfig.capacity.max_luggage;
        const tooFar = distanceKm !== null && distanceKm > pricingConfig.service_area.max_leg_km;

        // Fuera de zona, exceso de capacidad o tramo muy largo: sin precio (cotización manual).
        if (distanceKm !== null && !outOfZone && !overCapacity && !tooFar) {
            pricePreliminary = calculatePrice({
                serviceLevel: q.serviceLevel,
                distanceKm,
                pickupAt,
                passengers: q.passengers,
                luggage: q.luggage,
            }).total;
        }
    } catch (e) {
        mapsError = e instanceof GoogleApiError ? e.code : "UNKNOWN";
        console.warn(`[/api/quote] distancia falló (${mapsError}); se guarda sin precio`);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
        .from("quotes")
        .insert({
            origin: q.origin,
            origin_lat: q.originLat ?? null,
            origin_lng: q.originLng ?? null,
            destination: q.destination,
            destination_lat: q.destinationLat ?? null,
            destination_lng: q.destinationLng ?? null,
            pickup_at: q.pickupAt,
            passengers: q.passengers,
            luggage: q.luggage,
            service_level: q.serviceLevel,
            distance_km: distanceKm,
            duration_min: durationMin,
            price_preliminary: pricePreliminary,
            customer_name: q.customerName,
            customer_email: q.customerEmail,
            customer_phone: q.customerPhone ?? null,
            is_corporate: q.isCorporate,
            notes: q.notes ?? null,
        })
        .select("id, status, distance_km, duration_min, price_preliminary, created_at")
        .single();

    if (error) {
        console.error("[/api/quote] insert falló:", error);
        return NextResponse.json({ error: "No se pudo guardar la solicitud" }, { status: 500 });
    }

    return NextResponse.json(
        {
            id: data.id,
            status: data.status,
            distanceKm: data.distance_km,
            durationMin: data.duration_min,
            pricePreliminary: data.price_preliminary,
            needsManualQuote: pricePreliminary === null,
            mapsError,
        },
        { status: 201 }
    );
}
