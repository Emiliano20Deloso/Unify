// Script de arranque del movimiento (texto para un <script> en línea en <head>). Corre antes de la
// primera pintura y antes de hidratar, y sigue vivo en las navegaciones suaves (el documento persiste).
// Escribe solo atributos en el DOM (nunca estado de React):
//   html[data-motion]   observadores listos: a partir de aquí el CSS puede ocultar lo que se revela
//   html[data-fonts]    fuentes listas (o 700 ms): el título de cabecera arranca su entrada
//   html[data-scrolled] scroll > 8 px: fondo sólido del menú
//   [data-reveal][data-shown], [data-reveal-group][data-shown]   entró en pantalla
//   [data-reveal][data-instant]   ya estaba en pantalla en la primera pintura: visible sin animar
//   [data-media][data-loaded]     la foto nítida cargó: se funde sobre la borrosa
//   [data-enter][data-enter-late] cabecera insertada al navegar: su secuencia arranca más tarde
//   html[data-quote-restore]      hay borrador del cotizador por aplicar (lo quita la isla)
// Si React borra los atributos de <html> (montaje doble de Strict Mode en desarrollo o cambio de
// idioma), se vuelven a poner. Si el script falla antes de poner data-motion, nada se oculta.
// Atrás/adelante: ver el listener de popstate más abajo.

function boot() {
    const doc = document;
    const html = doc.documentElement;
    let fontsReady = false;
    let scrolled = false;

    const setFonts = () => {
        fontsReady = true;
        html.setAttribute("data-fonts", "");
    };
    setTimeout(setFonts, 700);
    try {
        doc.fonts.ready.then(setFonts);
    } catch {
        setFonts();
    }

    const onScroll = () => {
        const next = window.scrollY > 8;
        if (next !== scrolled) {
            scrolled = next;
            if (next) html.setAttribute("data-scrolled", "");
            else html.removeAttribute("data-scrolled");
        }
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pageshow", onScroll);

    // Fotos: la nítida se funde cuando carga (o falla: entonces se ve el alt sobre el color de fondo).
    // El fundido empieza cuando la foto ya está decodificada y a la vista: Chrome descarta la
    // decodificación de lo que está fuera de pantalla y, al llegar con scroll, la foto aparecería de
    // golpe sobre la borrosa. Si cargó fuera de pantalla, se espera a que entre (y se vuelve a decodificar).
    const reveal = (img: HTMLImageElement, box: Element) => {
        const mark = () => box.setAttribute("data-loaded", "");
        // Foto ya en caché al cargar o recargar: antes de la primera pintura todavía no se ha pintado a
        // opacidad 0, así que no habría fundido y la nítida aparecería de golpe un cuadro después. Se
        // espera a que pase esa primera pintura (se ve la borrosa) y entonces se funde como las demás.
        const ready = () => (firstFrame ? requestAnimationFrame(() => requestAnimationFrame(mark)) : mark());
        if (img.decode) img.decode().then(ready, ready);
        else ready();
    };
    const mediaIO = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            mediaIO.unobserve(entry.target);
            const img = entry.target.querySelector("img[data-media-sharp]");
            if (img instanceof HTMLImageElement) reveal(img, entry.target);
        }
    });
    const markMedia = (img: EventTarget | null, failed = false) => {
        const box = img instanceof HTMLImageElement ? img.closest("[data-media]") : null;
        if (!box || box.hasAttribute("data-loaded")) return;
        if (failed) return box.setAttribute("data-loaded", "");
        const r = box.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) reveal(img as HTMLImageElement, box);
        else mediaIO.observe(box);
    };
    doc.addEventListener("load", (e) => markMedia(e.target), true);
    doc.addEventListener("error", (e) => markMedia(e.target, true), true);

    // Atrás/adelante. Problemas de partida: (1) el router de Next procesa popstate dentro del evento y
    // React lo vuelve síncrono ("eager") y sin View Transition; (2) Chrome restaura el scroll justo
    // después de despachar popstate y, con html:focus-within { scroll-behavior: smooth }, lo anima.
    // Solución (Chrome con Navigation API y sin transición propia del navegador, hasUAVisualTransition
    // === false): se intercepta el recorrido con scroll manual; popstate se detiene y se vuelve a emitir
    // en la siguiente tarea (React lo trata como navegación normal, con la transición de página), y el
    // scroll guardado se aplica, sin animar, en cuanto React inserta la página nueva: dentro de la
    // transición, antes de la captura del estado nuevo. La página que sale no se mueve.
    // En cualquier otro caso (gesto con transición del navegador, Safari, Firefox) no se intercepta
    // nada; solo se evita que la restauración nativa vaya animada.
    type Traverse = { y: number | null; scroll: () => void; finish: () => void; id: number };
    type NavigateEventLike = Event & {
        navigationType: string;
        canIntercept: boolean;
        hashChange: boolean;
        hasUAVisualTransition?: boolean;
        downloadRequest: string | null;
        destination: { url: string; key: string };
        signal: AbortSignal;
        intercept: (options: { scroll: string; focusReset: string; handler: () => Promise<void> }) => void;
        scroll: () => void;
    };
    const navigation = (window as unknown as { navigation?: EventTarget & { currentEntry: { key: string } | null } })
        .navigation;
    let pendingTraverse: Traverse | null = null;
    // Scroll de cada entrada al dejarla (por navigation.currentEntry.key). Hace falta un mapa propio: el
    // replaceState que Next hace al terminar aborta el recorrido interceptado y su event.scroll().
    const saved = new Map<string, number>();
    let traverseId = 0;
    let replaying = false;
    // Ruta de la página que se ve (se actualiza con cada cambio del DOM, más abajo): distingue un cambio
    // de página de un recorrido entre anclas de la misma.
    const here = () => location.pathname + location.search;
    let lastPath = here();
    const instantScroll = (fn: () => void) => {
        const previous = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        try {
            fn();
        } finally {
            // La restauración nativa ocurre antes de la siguiente tarea: hasta entonces, sin animar.
            setTimeout(() => {
                html.style.scrollBehavior = previous;
            });
        }
    };
    navigation?.addEventListener("navigate", (raw) => {
        const event = raw as NavigateEventLike;
        const leaving = navigation.currentEntry?.key;
        if (leaving && event.navigationType !== "replace") saved.set(leaving, window.scrollY);
        if (
            event.navigationType !== "traverse" ||
            !event.canIntercept ||
            event.hashChange ||
            event.downloadRequest !== null ||
            event.hasUAVisualTransition !== false ||
            typeof doc.startViewTransition !== "function"
        )
            return;
        const target = new URL(event.destination.url);
        if (target.pathname + target.search === location.pathname + location.search) return;
        let finish = () => {};
        const done = new Promise<void>((resolve) => (finish = resolve));
        event.intercept({ scroll: "manual", focusReset: "manual", handler: () => done });
        const traverse: Traverse = {
            y: saved.get(event.destination.key) ?? null,
            scroll: () => event.scroll(),
            finish,
            id: ++traverseId,
        };
        pendingTraverse = traverse;
        // Si lo aborta otra navegación, la promesa se resuelve igual (nada queda colgado).
        event.signal.addEventListener("abort", finish);
    });
    addEventListener("popstate", (event) => {
        if (replaying) return;
        const pageChanged = here() !== lastPath;
        lastPath = here();
        const traverse = pendingTraverse;
        pendingTraverse = null;
        if (!traverse || traverse.id !== traverseId || !(event.state as { __NA?: boolean } | null)?.__NA) {
            if (traverse) traverse.finish();
            // Entre anclas de la misma página el regreso conserva su scroll suave.
            if (pageChanged) instantScroll(() => {});
            return;
        }
        event.stopImmediatePropagation();
        const state = event.state;
        const main = doc.getElementById("main");
        const before = main?.firstElementChild ?? null;
        let settled = false;
        const settle = () => {
            if (settled) return;
            settled = true;
            observer.disconnect();
            clearTimeout(cap);
            // Un recorrido más nuevo (dos atrás seguidos) manda: este ya no mueve nada.
            if (traverse.id === traverseId) {
                instantScroll(() => {
                    if (traverse.y !== null) window.scrollTo(0, traverse.y);
                    else
                        try {
                            traverse.scroll();
                        } catch {
                            /* sin posición guardada y el recorrido ya terminó */
                        }
                });
            }
            traverse.finish();
        };
        const observer = new MutationObserver(() => {
            // También cuando <main> es otro elemento: un recorrido que cambia de idioma vuelve a montar el layout.
            const now = doc.getElementById("main");
            if (now && (now !== main || now.firstElementChild !== before)) settle();
        });
        observer.observe(html, { childList: true, subtree: true });
        const cap = setTimeout(settle, 1500);
        setTimeout(() => {
            // Dos atrás seguidos: solo se vuelve a emitir el último; el estado de este ya no es el de la URL.
            if (traverse.id !== traverseId) return settle();
            replaying = true;
            try {
                dispatchEvent(new PopStateEvent("popstate", { state }));
            } finally {
                replaying = false;
            }
        });
    });

    // Un grupo revela a sus Reveal (cada uno con su retraso --i).
    const show = (el: Element, instant = false) => {
        const targets = [el, ...(el.hasAttribute("data-reveal-group") ? Array.from(el.querySelectorAll("[data-reveal]")) : [])];
        for (const target of targets) {
            if (instant) target.setAttribute("data-instant", "");
            target.setAttribute("data-shown", "");
        }
    };
    const io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    show(entry.target);
                    io.unobserve(entry.target);
                }
            }
        },
        // Basta con que asome el borde (umbral 0): los bloques más altos que la pantalla no esperan.
        { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );

    // Hasta la primera pintura, lo que ya está en pantalla se muestra sin animar (recarga a media página).
    let firstFrame = true;
    let pending: Element[] = [];
    const inView = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight && (r.width > 0 || r.height > 0);
    };
    const flushFirstFrame = () => {
        firstFrame = false;
        for (const el of pending) {
            if (inView(el)) show(el, true);
            else io.observe(el);
        }
        pending = [];
    };
    requestAnimationFrame(flushFirstFrame);

    const track = (el: Element) => {
        if (el.hasAttribute("data-shown")) return;
        // Un Reveal dentro de un grupo lo revela el grupo.
        if (el.hasAttribute("data-reveal") && el.parentElement?.closest("[data-reveal-group]")) return;
        if (firstFrame) pending.push(el);
        else io.observe(el);
    };
    const scan = (root: Element) => {
        // Cabeceras que llegan navegando: su secuencia espera a que la página nueva se vea.
        if (doc.readyState !== "loading") {
            if (root.matches("[data-enter]")) root.setAttribute("data-enter-late", "");
            root.querySelectorAll("[data-enter]").forEach((el) => el.setAttribute("data-enter-late", ""));
        }
        if (root.matches("[data-reveal],[data-reveal-group]")) track(root);
        root.querySelectorAll("[data-reveal],[data-reveal-group]").forEach(track);
        // Fotos que ya estaban en caché al insertarse.
        root.querySelectorAll("[data-media] img").forEach((img) => {
            if ((img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0) markMedia(img);
        });
    };

    new MutationObserver((records) => {
        for (const record of records) {
            if (record.type === "attributes") continue;
            record.addedNodes.forEach((node) => {
                if (node.nodeType === 1) scan(node as Element);
            });
        }
        if (!replaying) lastPath = here();
        // Atributos de <html> que React pudo haber quitado.
        if (!html.hasAttribute("data-motion")) html.setAttribute("data-motion", "");
        if (fontsReady && !html.hasAttribute("data-fonts")) html.setAttribute("data-fonts", "");
        if (scrolled && !html.hasAttribute("data-scrolled")) html.setAttribute("data-scrolled", "");
    }).observe(html, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-motion", "data-fonts", "data-scrolled"] });

    if (doc.body) scan(doc.body);
    html.setAttribute("data-motion", "");

    // Cotizador: con un borrador guardado (sessionStorage "unify.quote.v1", ver src/lib/quote/store.ts)
    // o con o/d en la URL, los valores que dependen de él ([data-draft-value]) se pintan transparentes
    // hasta que la isla los aplica y quita el atributo (se funden en vez de saltar). Seguros: si la
    // página no tiene cotizador, o si la isla no llega, el atributo se va solo.
    try {
        if (sessionStorage.getItem("unify.quote.v1") !== null || /[?&][od]=/.test(location.search)) {
            html.setAttribute("data-quote-restore", "");
            const release = () => html.removeAttribute("data-quote-restore");
            setTimeout(release, 4000);
            doc.addEventListener("DOMContentLoaded", () => {
                if (!doc.querySelector("[data-draft-value]")) release();
            });
        }
    } catch {
        /* almacenamiento bloqueado: no hay borrador que restaurar */
    }
}

/** Sin JS nada se oculta (todo depende de html[data-motion]); esto es un seguro extra para <noscript>. */
export const NOSCRIPT_CSS =
    "[data-reveal]{opacity:1!important;translate:none!important;scale:none!important}[data-media-sharp]{opacity:1!important}";

/** Texto del script. Se pinta tal cual en <head> (layout); va envuelto para no romper nada si falla. */
export const BOOT_SCRIPT = `(function(){try{(${boot.toString()})()}catch(e){}})()`;
