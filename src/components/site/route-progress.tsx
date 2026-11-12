/**
 * La línea como progreso: ● origen arriba, ○ destino abajo, fija en el margen izquierdo. Al bajar, un
 * trazo claro la recorre y al llegar al final de la página el destino se rellena. Solo CSS
 * (animation-timeline: scroll(), globals.css § La línea como progreso): sin JS ni estado. Decorativa;
 * solo existe en escritorio ancho y donde el navegador lo soporta. Entra en la transición de página
 * con nombre propio (route-progress) y se funde como el pie.
 */
export function RouteProgress() {
    return (
        <div data-site-chrome aria-hidden="true" className="route-progress" style={{ viewTransitionName: "route-progress" }}>
            <span className="route-progress__start" />
            <span className="route-progress__track" />
            <span className="route-progress__end" />
        </div>
    );
}
