// Server-side only. No importar desde componentes cliente.

export type DistanceResult = {
    distanceKm: number;
    durationMin: number;
};

export class MapsError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = "MapsError";
    }
}

const DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";

export async function getDistance(
    origin: string,
    destination: string
): Promise<DistanceResult> {
    const key = process.env.GOOGLE_MAPS_SERVER_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
        throw new MapsError(
            "Falta GOOGLE_MAPS_SERVER_KEY (o NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) en .env.local",
            "NO_API_KEY"
        );
    }

    const params = new URLSearchParams({
        origins: origin,
        destinations: destination,
        mode: "driving",
        units: "metric",
        language: "es",
        region: "mx",
        key,
    });

    const resp = await fetch(`${DISTANCE_MATRIX_URL}?${params}`, {
        cache: "no-store",
    });

    if (!resp.ok) {
        throw new MapsError(`HTTP ${resp.status} de Google Distance Matrix`, "HTTP_ERROR");
    }

    const data = (await resp.json()) as DistanceMatrixResponse;

    if (data.status !== "OK") {
        throw new MapsError(
            `Google respondió status=${data.status}${data.error_message ? `: ${data.error_message}` : ""}`,
            data.status
        );
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element) {
        throw new MapsError("Respuesta vacía de Google Distance Matrix", "EMPTY_RESPONSE");
    }
    if (element.status !== "OK") {
        throw new MapsError(`Ruta no disponible: ${element.status}`, element.status);
    }

    return {
        distanceKm: Math.round((element.distance.value / 1000) * 100) / 100,
        durationMin: Math.round(element.duration.value / 60),
    };
}

type DistanceMatrixResponse = {
    status: string;
    error_message?: string;
    rows?: Array<{
        elements: Array<{
            status: string;
            distance: { value: number; text: string };
            duration: { value: number; text: string };
        }>;
    }>;
};
