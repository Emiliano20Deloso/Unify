"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Avisos breves con la superficie elevada del sistema. El sitio es siempre oscuro.
export function Toaster({ theme = "dark", ...props }: ToasterProps) {
    return (
        <Sonner
            theme={theme}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:rounded-control group-[.toaster]:border-line group-[.toaster]:bg-elevated group-[.toaster]:text-fg group-[.toaster]:font-sans",
                    description: "group-[.toast]:text-fg-subtle",
                    actionButton: "group-[.toast]:bg-brand group-[.toast]:text-white",
                    cancelButton: "group-[.toast]:bg-surface group-[.toast]:text-fg-subtle",
                },
            }}
            {...props}
        />
    );
}
