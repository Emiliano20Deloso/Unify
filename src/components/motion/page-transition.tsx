import { ViewTransition } from "react";
import { LOCALE_TYPE } from "@/lib/motion";

const CLASSES = { [LOCALE_TYPE]: "page-fade", default: "page" };

/**
 * Transición entre páginas: la que sale se desvanece y sube 10 px; la nueva entra con fundido y su
 * cabecera hace la secuencia data-enter. Con el tipo "locale" (cambio de idioma) es un fundido
 * cruzado sin desplazamiento. Va en cada page.tsx envolviendo todo su contenido (en el layout no
 * funcionaría: el layout persiste). Un solo nodo = una sola instantánea por página.
 * El menú queda fijo (site-header); pie, punto del menú y hoja tienen nombre propio. CSS en globals.css.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <ViewTransition enter={CLASSES} exit={CLASSES} default="none">
            <div>{children}</div>
        </ViewTransition>
    );
}
