"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/sonner";

const loadFeatures = () => import("@/lib/motion/features").then((mod) => mod.default);

/**
 * Envuelve el sitio una sola vez (layout). Motion carga sus features después de la primera pintura
 * y respeta prefers-reduced-motion: con "user" se quitan los desplazamientos y quedan los fundidos.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={loadFeatures} strict>
            <MotionConfig reducedMotion="user">
                {children}
                <Toaster position="bottom-center" />
            </MotionConfig>
        </LazyMotion>
    );
}
