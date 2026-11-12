/**
 * La línea interrumpida (●—— ○): la ruta no llega. Solo para las páginas 404.
 * Al entrar, después de la secuencia de la cabecera: el trazo sale del origen y se detiene antes de
 * tiempo; el destino aparece al final, lejos y suelto (CSS en globals.css § Secciones: broken-route).
 */
export function BrokenRoute() {
    return (
        <span aria-hidden="true" className="broken-route flex w-40 items-center">
            <span className="broken-route__start size-2 shrink-0 rounded-full bg-brand-ink" />
            <span className="broken-route__track h-px flex-1 bg-route" />
            <span className="w-8" />
            <span className="broken-route__end size-2 shrink-0 rounded-full border-[1.5px] border-fg" />
        </span>
    );
}
