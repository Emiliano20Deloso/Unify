"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Marca `data-inview` la primera vez que el elemento entra en pantalla. La animación la hace el CSS
 * (solo transform/opacity). Lo usa RouteLine draw; sirve para cualquier dibujo de una sola vez.
 */
export function InView({ children, ...props }: React.HTMLAttributes<HTMLSpanElement> & Record<`data-${string}`, string>) {
    const ref = useRef<HTMLSpanElement>(null);
    const [seen, setSeen] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || seen) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setSeen(true);
                    io.disconnect();
                }
            },
            { rootMargin: "0px 0px -10% 0px" },
        );
        io.observe(node);
        return () => io.disconnect();
    }, [seen]);

    return (
        <span ref={ref} data-inview={seen ? "" : undefined} {...props}>
            {children}
        </span>
    );
}
