// Layout raíz del panel admin (separado del sitio público). El interior del panel no cambia:
// misma letra (Satoshi) y fondo negro; solo toma las fuentes y tokens nuevos.
import "@/styles/globals.css";
import type { Metadata } from "next";
import { fontVariables } from "@/styles/fonts";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "Admin | Unify",
    robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
    return (
        <html lang="es" className={fontVariables}>
            <body className="bg-black">
                <Toaster richColors position="top-right" />
                {children}
            </body>
        </html>
    );
}
