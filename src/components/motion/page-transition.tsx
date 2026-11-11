import { ViewTransition } from "react";

/**
 * Fundido corto entre páginas (150 ms sale, 250 ms entra). Va en cada page.tsx, envolviendo todo su
 * contenido: en el layout no funcionaría porque el layout persiste entre navegaciones.
 * El menú queda fijo (view-transition-name: site-header). Estilos en src/styles/globals.css.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <ViewTransition enter="page" exit="page" default="none">
            {children}
        </ViewTransition>
    );
}
