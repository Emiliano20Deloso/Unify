import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let configured = false;

function configure() {
    if (configured) return;
    configured = true;
    setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        v: "weekly",
    });
}

export async function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
    configure();
    return importLibrary("places") as Promise<google.maps.PlacesLibrary>;
}
