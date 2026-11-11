// View Transition propia para la navegación en la que React no inicia una: el cambio de idioma (vuelve
// a montar el layout raíz [lang]). Comprobado en ejecución con Next 16.4.6 / React 19.3.1. El CSS del
// tipo "locale" está en globals.css.

/**
 * Inicia `document.startViewTransition` con `types: [type]` y, dentro de la actualización, llama a
 * `start` (que dispara la navegación). La captura del estado nuevo espera a que `isDone()` sea cierto
 * (comprobado en cada cambio del DOM o de `html[lang]`) más 50 ms para los efectos, con un tope de 1.5 s.
 * Devuelve false si el navegador no tiene View Transitions: entonces `start` no se llamó.
 */
// lib.dom de TypeScript aún no trae la forma con opciones ({ update, types }).
type StartWithTypes = (options: { update: () => Promise<void>; types: string[] }) => unknown;

export function navigateWithTransition(type: string, start: () => void, isDone: () => boolean): boolean {
    const doc = document;
    if (typeof doc.startViewTransition !== "function") return false;
    const update = () =>
        new Promise<void>((resolve) => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                observer.disconnect();
                clearTimeout(cap);
                setTimeout(resolve, 50);
            };
            const observer = new MutationObserver(() => {
                if (isDone()) finish();
            });
            observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["lang"] });
            const cap = setTimeout(finish, 1500);
            start();
        });
    try {
        (doc.startViewTransition as unknown as StartWithTypes).call(doc, { update, types: [type] });
    } catch {
        return false;
    }
    return true;
}

/**
 * Señal de "la página del otro idioma ya está": cambió `html[lang]` y #main tiene otro contenido.
 * Se toma la foto del estado actual al llamarla.
 */
export function localeSwapDone(): () => boolean {
    const html = document.documentElement;
    const lang = html.lang;
    const main = document.getElementById("main");
    const first = main?.firstElementChild ?? null;
    return () => {
        const now = document.getElementById("main");
        return html.lang !== lang && !!now && (now !== main || now.firstElementChild !== first);
    };
}
