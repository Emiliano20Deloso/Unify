"use client";

// Script en línea que corre al analizar el HTML (antes de pintar y de hidratar). En el cliente se
// pinta como text/plain para que React no avise ni lo vuelva a ejecutar en navegaciones suaves
// (patrón de node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md).
export function InlineScript({ html }: { html: string }) {
    return (
        <script
            type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
