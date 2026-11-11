// Lugares frecuentes. Se buscan antes que Google (gratis, instantáneo y sin llave).
// Coordenadas WGS84 verificadas contra OpenStreetMap (nov-2026), salvo AICM Terminal 2 (sin confirmar).

export type CatalogPlace = {
    slug: string;
    name: { es: string; en: string };
    aliases: string[];
    lat: number;
    lng: number;
    kind: "airport" | "zone" | "venue";
    zone?: "in" | "out";
};

export const CATALOG: readonly CatalogPlace[] = [
    { slug: "aicm-t1", name: { es: "AICM Terminal 1", en: "Mexico City Airport (MEX) Terminal 1" }, aliases: ["aeropuerto", "airport", "mex", "aicm", "benito juarez", "t1", "terminal 1"], lat: 19.4352, lng: -99.0827, kind: "airport" },
    { slug: "aicm-t2", name: { es: "AICM Terminal 2", en: "Mexico City Airport (MEX) Terminal 2" }, aliases: ["aeropuerto", "airport", "mex", "aicm", "benito juarez", "t2", "terminal 2"], lat: 19.4224, lng: -99.0718, kind: "airport" },
    { slug: "aifa", name: { es: "AIFA (Aeropuerto Felipe Ángeles)", en: "Felipe Ángeles Airport (NLU)" }, aliases: ["aeropuerto", "airport", "nlu", "santa lucia", "felipe angeles"], lat: 19.7438, lng: -99.0106, kind: "airport" },
    { slug: "aeropuerto-toluca", name: { es: "Aeropuerto de Toluca", en: "Toluca Airport (TLC)" }, aliases: ["aeropuerto", "airport", "tlc", "toluca", "adolfo lopez mateos"], lat: 19.3381, lng: -99.5653, kind: "airport", zone: "out" },
    { slug: "polanco", name: { es: "Polanco", en: "Polanco" }, aliases: ["masaryk", "parque lincoln", "antara"], lat: 19.4295, lng: -99.1971, kind: "zone" },
    { slug: "santa-fe", name: { es: "Santa Fe", en: "Santa Fe" }, aliases: ["centro santa fe", "zedec"], lat: 19.3613, lng: -99.2738, kind: "zone" },
    { slug: "reforma-angel", name: { es: "Reforma (Ángel de la Independencia)", en: "Reforma (Angel of Independence)" }, aliases: ["angel", "paseo de la reforma", "juarez", "zona rosa"], lat: 19.427, lng: -99.1677, kind: "zone" },
    { slug: "roma", name: { es: "Roma", en: "Roma" }, aliases: ["roma norte", "colonia roma"], lat: 19.4211, lng: -99.1605, kind: "zone" },
    { slug: "condesa", name: { es: "Condesa", en: "Condesa" }, aliases: ["parque mexico", "hipodromo"], lat: 19.4124, lng: -99.1692, kind: "zone" },
    { slug: "coyoacan", name: { es: "Coyoacán", en: "Coyoacán" }, aliases: ["centro de coyoacan", "jardin centenario"], lat: 19.3493, lng: -99.1637, kind: "zone" },
    { slug: "interlomas", name: { es: "Interlomas", en: "Interlomas" }, aliases: ["paseo interlomas", "huixquilucan"], lat: 19.398, lng: -99.2832, kind: "zone" },
    { slug: "bosques-de-las-lomas", name: { es: "Bosques de las Lomas", en: "Bosques de las Lomas" }, aliases: ["arcos bosques", "bosques"], lat: 19.3877, lng: -99.251, kind: "zone" },
    { slug: "lomas-de-chapultepec", name: { es: "Lomas de Chapultepec", en: "Lomas de Chapultepec" }, aliases: ["lomas", "prado norte", "virreyes"], lat: 19.4211, lng: -99.2185, kind: "zone" },
    { slug: "pedregal", name: { es: "Jardines del Pedregal", en: "Jardines del Pedregal" }, aliases: ["pedregal", "pedregal de san angel"], lat: 19.3198, lng: -99.2074, kind: "zone" },
    { slug: "perisur", name: { es: "Perisur", en: "Perisur" }, aliases: ["plaza perisur", "centro comercial perisur"], lat: 19.304, lng: -99.19, kind: "venue" },
    { slug: "satelite", name: { es: "Ciudad Satélite", en: "Ciudad Satélite" }, aliases: ["satelite", "plaza satelite", "naucalpan"], lat: 19.5103, lng: -99.2344, kind: "zone" },
    { slug: "centro-historico", name: { es: "Centro Histórico (Zócalo)", en: "Historic Center (Zócalo)" }, aliases: ["zocalo", "centro", "historic center", "downtown"], lat: 19.4326, lng: -99.1332, kind: "zone" },
    { slug: "auditorio-nacional", name: { es: "Auditorio Nacional", en: "Auditorio Nacional" }, aliases: ["auditorio"], lat: 19.4248, lng: -99.1949, kind: "venue" },
    { slug: "wtc", name: { es: "World Trade Center CDMX", en: "World Trade Center Mexico City" }, aliases: ["wtc", "world trade center", "napoles"], lat: 19.3941, lng: -99.1739, kind: "venue" },
    { slug: "autodromo", name: { es: "Autódromo Hermanos Rodríguez", en: "Autódromo Hermanos Rodríguez" }, aliases: ["autodromo", "formula 1", "f1", "gran premio"], lat: 19.4062, lng: -99.0946, kind: "venue" },
    { slug: "estadio-gnp", name: { es: "Estadio GNP Seguros (Foro Sol)", en: "Estadio GNP Seguros (Foro Sol)" }, aliases: ["foro sol", "estadio gnp", "gnp"], lat: 19.405, lng: -99.0956, kind: "venue" },
    { slug: "palacio-de-los-deportes", name: { es: "Palacio de los Deportes", en: "Palacio de los Deportes" }, aliases: ["domo de cobre", "palacio"], lat: 19.4053, lng: -99.0996, kind: "venue" },
    { slug: "arena-cdmx", name: { es: "Arena CDMX", en: "Arena CDMX" }, aliases: ["arena ciudad de mexico", "azcapotzalco"], lat: 19.4976, lng: -99.1752, kind: "venue" },
    { slug: "estadio-banorte", name: { es: "Estadio Banorte (Azteca)", en: "Estadio Banorte (Azteca)" }, aliases: ["estadio azteca", "azteca", "banorte", "santa ursula"], lat: 19.303, lng: -99.1505, kind: "venue" },
    { slug: "museo-antropologia", name: { es: "Museo Nacional de Antropología", en: "National Museum of Anthropology" }, aliases: ["antropologia", "chapultepec", "museo"], lat: 19.4262, lng: -99.1867, kind: "venue" },
];

export const CATALOG_PREFIX = "cat:";

/** Minúsculas y sin acentos ni signos, para comparar. */
export function normalize(s: string): string {
    return s
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

const index = CATALOG.map((p) => ({
    place: p,
    names: [normalize(p.name.es), normalize(p.name.en)],
    aliases: p.aliases.map(normalize),
}));

export function catalogId(slug: string): string {
    return `${CATALOG_PREFIX}${slug}`;
}

export function getCatalogPlace(idOrSlug: string): CatalogPlace | undefined {
    const slug = idOrSlug.startsWith(CATALOG_PREFIX) ? idOrSlug.slice(CATALOG_PREFIX.length) : idOrSlug;
    return CATALOG.find((p) => p.slug === slug);
}

/**
 * Búsqueda que ignora acentos y mayúsculas. Puntúa coincidencias al inicio del nombre o de una
 * palabra por encima de coincidencias por alias o en medio de la palabra.
 */
export function searchCatalog(query: string, limit = 5): CatalogPlace[] {
    const q = normalize(query);
    if (q.length < 2) return [];
    const scored: { place: CatalogPlace; score: number; order: number }[] = [];
    index.forEach((entry, order) => {
        let score = 0;
        for (const n of entry.names) {
            if (n.startsWith(q)) score = Math.max(score, 100);
            else if (n.split(" ").includes(q)) score = Math.max(score, 90);
            else if (n.split(" ").some((w) => w.startsWith(q))) score = Math.max(score, 80);
            else if (n.includes(q)) score = Math.max(score, 50);
        }
        for (const a of entry.aliases) {
            if (a.startsWith(q)) score = Math.max(score, 70);
            else if (a.split(" ").some((w) => w.startsWith(q))) score = Math.max(score, 60);
            else if (a.includes(q)) score = Math.max(score, 40);
        }
        // Lo que está fuera de zona baja en la lista: rara vez es lo que se busca.
        if (score > 0 && entry.place.zone === "out") score -= 35;
        if (score > 0) scored.push({ place: entry.place, score, order });
    });
    return scored
        .sort((a, b) => b.score - a.score || a.order - b.order)
        .slice(0, limit)
        .map((s) => s.place);
}
