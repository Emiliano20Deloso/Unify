// Modelo de los textos legales: secciones con id, título y bloques. Sin JSX ni clases:
// el diseño vive en src/components/sections/legal. Los datos del negocio (correo, WhatsApp,
// dominio) salen de src/lib/site.ts al renderizar, así nunca se escriben a mano dos veces.
import type { RouteKey } from "@/i18n/routes";

/** Fragmento de texto en línea. */
export type Inline =
    | string
    /** Énfasis del original (negritas del .md). */
    | { strong: string }
    /** Correo de contacto (site.email) como enlace mailto. */
    | { link: "email" }
    /** WhatsApp (site.whatsapp.display) como enlace a wa.me. */
    | { link: "whatsapp" }
    /** Dominio del sitio como enlace a la portada. */
    | { link: "site" }
    /** Enlace interno a otra página del sitio, en el mismo idioma. Sin `text` muestra dominio + ruta. */
    | { link: "route"; route: RouteKey; text?: string };

/** Texto enriquecido: una cadena o una secuencia de fragmentos. */
export type Rich = Inline | readonly Inline[];

export type LegalBlock =
    | { type: "p"; content: Rich }
    | { type: "ul"; items: readonly Rich[] }
    | { type: "ol"; items: readonly Rich[] }
    | { type: "table"; caption: string; head: readonly [string, string]; rows: readonly (readonly [Rich, Rich])[] };

export interface LegalSection {
    /** Ancla estable (igual en ambos idiomas). */
    id: string;
    title: string;
    blocks: readonly LegalBlock[];
}

export interface LegalDocument {
    /** Fecha de última actualización, ISO (AAAA-MM-DD). */
    updated: string;
    sections: readonly LegalSection[];
}

export const EMAIL = { link: "email" } as const satisfies Inline;
export const WHATSAPP = { link: "whatsapp" } as const satisfies Inline;
export const SITE = { link: "site" } as const satisfies Inline;
