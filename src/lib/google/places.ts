import "server-only";
import { getGoogleServerKey, googleFetch, GoogleApiError } from "./key";

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const AUTOCOMPLETE_FIELD_MASK = [
    "suggestions.placePrediction.placeId",
    "suggestions.placePrediction.text.text",
    "suggestions.placePrediction.structuredFormat",
    "suggestions.placePrediction.types",
].join(",");
// NO pedir displayName: sube la sesión a Enterprise.
const DETAILS_FIELD_MASK = "id,location,formattedAddress,types";

const ZOCALO = { latitude: 19.4326, longitude: -99.1332 };
const MAX_SUGGESTIONS = 5;

export const GOOGLE_PLACE_ID_RE = /^[A-Za-z0-9_-]{10,300}$/;

export type GooglePrediction = {
    placeId: string;
    main: string;
    secondary?: string;
    types: string[];
};

type AutocompleteResponse = {
    suggestions?: {
        placePrediction?: {
            placeId?: string;
            text?: { text?: string };
            structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
            types?: string[];
        };
    }[];
};

/** Places API (New) autocomplete. México, sesgo de 50 km al Zócalo, token de sesión. */
export async function googleAutocomplete(
    input: string,
    sessionToken: string,
    lang: "es" | "en"
): Promise<GooglePrediction[]> {
    const key = getGoogleServerKey();
    if (!key) throw new GoogleApiError("NO_KEY");
    const data = (await googleFetch(AUTOCOMPLETE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask": AUTOCOMPLETE_FIELD_MASK,
        },
        body: JSON.stringify({
            input,
            sessionToken,
            includedRegionCodes: ["mx"],
            locationBias: { circle: { center: ZOCALO, radius: 50000 } },
            languageCode: lang,
        }),
    })) as AutocompleteResponse;

    const out: GooglePrediction[] = [];
    for (const s of data?.suggestions ?? []) {
        const p = s.placePrediction;
        if (!p?.placeId) continue;
        const main = p.structuredFormat?.mainText?.text ?? p.text?.text;
        if (!main) continue;
        out.push({
            placeId: p.placeId,
            main,
            secondary: p.structuredFormat?.secondaryText?.text,
            types: p.types ?? [],
        });
        if (out.length >= MAX_SUGGESTIONS) break;
    }
    return out;
}

export type GooglePlaceDetails = {
    id: string;
    label: string;
    lat: number;
    lng: number;
    types: string[];
};

/** Place Details (New) con FieldMask mínimo. Cierra la sesión de autocompletado si hay token. */
export async function googlePlaceDetails(
    placeId: string,
    sessionToken: string | undefined,
    lang: "es" | "en"
): Promise<GooglePlaceDetails> {
    const key = getGoogleServerKey();
    if (!key) throw new GoogleApiError("NO_KEY");
    if (!GOOGLE_PLACE_ID_RE.test(placeId)) throw new GoogleApiError("BAD_RESPONSE");
    const params = new URLSearchParams({ languageCode: lang, regionCode: "mx" });
    if (sessionToken) params.set("sessionToken", sessionToken);
    const data = (await googleFetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${params}`,
        {
            method: "GET",
            headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": DETAILS_FIELD_MASK },
        }
    )) as {
        id?: string;
        formattedAddress?: string;
        types?: string[];
        location?: { latitude?: number; longitude?: number };
    };
    const lat = data?.location?.latitude;
    const lng = data?.location?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") throw new GoogleApiError("BAD_RESPONSE");
    return {
        id: data.id ?? placeId,
        label: data.formattedAddress ?? "",
        lat,
        lng,
        types: data.types ?? [],
    };
}
