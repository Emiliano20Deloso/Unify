/**
 * Menú fijo: transparente sobre el hero, carbón sólido con línea inferior en cuanto hay scroll.
 * Sin estado de React: el script de arranque pone html[data-scrolled] (scroll > 8 px) y el CSS funde el
 * fondo en 240 ms (globals.css § Menú). Al recargar a media página el fondo se funde, no salta.
 * No se anima entre páginas (view-transition-name: site-header).
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
    return (
        <header
            data-site-chrome
            data-site-header
            style={{ viewTransitionName: "site-header" }}
            className="fixed inset-x-0 top-0 z-40 border-b border-transparent bg-transparent"
        >
            {children}
        </header>
    );
}
