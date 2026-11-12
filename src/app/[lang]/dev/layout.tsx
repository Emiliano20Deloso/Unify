// Herramientas de desarrollo (/dev/ui, /dev/frame): solo en local. En producción responden 404;
// además siguen fuera del sitemap y bloqueadas en robots.
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

export default function DevLayout({ children }: { children: ReactNode }) {
    if (process.env.NODE_ENV === "production") notFound();
    return children;
}
