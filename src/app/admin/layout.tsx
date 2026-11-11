// Layout raíz del panel admin (separado del sitio público). El interior del panel no cambia.
import "@/styles/globals.css";
import type { Metadata } from "next";
import { cn } from "@/lib";
import { base, heading, subheading } from "@/styles/fonts";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "Admin | Unify",
    robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
    return (
        <html lang="es">
            <body
                className={cn(
                    "min-h-screen bg-black text-foreground antialiased font-heading",
                    base.variable,
                    heading.variable,
                    subheading.variable,
                )}
            >
                <Toaster richColors theme="dark" position="top-right" />
                {children}
            </body>
        </html>
    );
}
