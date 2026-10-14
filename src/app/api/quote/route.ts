import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validation";
import { getDistance, MapsError } from "@/lib/maps";
import { calculatePrice } from "@/lib/pricing";
import { getServiceClient } from "@/lib/supabase";

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

    let distanceKm: number | null = null;
    let durationMin: number | null = null;
    let pricePreliminary: number | null = null;
    let mapsError: string | null = null;

    try {
        const distance = await getDistance(q.origin, q.destination);
        distanceKm = distance.distanceKm;
        durationMin = distance.durationMin;

        const breakdown = calculatePrice({
            serviceLevel: q.serviceLevel,
            distanceKm,
            pickupAt: new Date(q.pickupAt),
            passengers: q.passengers,
            luggage: q.luggage,
        });
        pricePreliminary = breakdown.total;
    } catch (e) {
        mapsError = e instanceof MapsError ? e.code : "UNKNOWN";
        console.warn("[/api/quote] distancia falló, se guarda sin precio:", e);
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
