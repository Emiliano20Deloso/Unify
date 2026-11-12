// Revisión responsive sin cambiar la ventana: la misma ruta en 390×844 y 768×1024, lado a lado.
// Uso: /dev/frame?path=/tarifas. Fuera del sitemap, noindex y bloqueada en robots.
import type { Metadata } from "next";
import { FrameViewer } from "./frame-viewer";

export const metadata: Metadata = {
    title: { absolute: "Vista móvil y tablet · Unify" },
    robots: { index: false, follow: false },
};

export default function FramePage() {
    return <FrameViewer />;
}
