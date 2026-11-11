// JSON-LD como <script> en un Server Component. Se escapa "<" para que ningún texto pueda
// cerrar la etiqueta (recomendación de la guía de JSON-LD de Next).
type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export function serializeJsonLd(data: JsonLdData): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: JsonLdData }) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
