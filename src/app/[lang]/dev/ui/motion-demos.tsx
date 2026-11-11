"use client";

// Vitrina de las primitivas de movimiento (/dev/ui § Movimiento). Cada demo tiene su escenario P* en
// scripts/motion/escenarios.json: es la prueba de que no cortan ni brincan antes de usarlas en el sitio.
import { useState } from "react";
// Importes directos (no el índice): así esta isla cliente no arrastra Reveal ni el resto del barril.
import { AutoHeight } from "@/components/motion/auto-height";
import { Collapse } from "@/components/motion/collapse";
import { Presence, type PresencePreset } from "@/components/motion/presence";
import { Swap } from "@/components/motion/swap";
import { Button, PlusIcon } from "@/components/ui";
import { cn } from "@/lib";

const STATES = {
    vacio: { label: "Vacío", lines: ["Elige origen y destino para ver el precio."] },
    cargando: { label: "Cargando", lines: ["Calculando la ruta…", "Consultando la tarifa del horario."] },
    precio: {
        label: "Precio",
        lines: ["Tarifa base $200", "Distancia 16 km $160", "Horario $40", "Total $400 MXN, IVA incluido."],
    },
} as const;
type State = keyof typeof STATES;

const PRESETS: PresencePreset[] = ["fade", "rise", "drop", "sheet-bottom"];

function Demo({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} aria-labelledby={`${id}-titulo`} className="rounded-card border border-line p-5 md:p-6">
            <h3 id={`${id}-titulo`} className="type-label mb-4 text-fg-subtle">
                {title}
            </h3>
            {children}
        </section>
    );
}

export function MotionDemos() {
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<State>("vacio");
    const [word, setWord] = useState(0);
    const [shown, setShown] = useState<Record<PresencePreset, boolean>>({ fade: false, rise: false, drop: false, "sheet-bottom": false });

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Demo id="mov-collapse" title="Collapse">
                {/* Etiqueta fija (el estado lo dice aria-expanded); el + gira a × con un resorte. */}
                <Button variant="secondary" aria-expanded={open} aria-controls="mov-collapse-panel" onClick={() => setOpen((v) => !v)}>
                    Detalle
                    <PlusIcon className={cn("transition-transform [transition-duration:var(--spring-ui-dur)] ease-spring-ui motion-reduce:transition-none", open && "rotate-45")} />
                </Button>
                <Collapse open={open} id="mov-collapse-panel">
                    <div className="pt-4">
                        <div className="rounded-control bg-surface p-4">
                            <p>Incluye 30 minutos de espera en aeropuerto y 15 en el resto de los viajes.</p>
                            <p className="mt-2 text-fg-subtle">Lo de abajo baja con el alto, sin brincar.</p>
                        </div>
                    </div>
                </Collapse>
                <p className="type-small mt-4 text-fg-subtle">Contenido de abajo.</p>
            </Demo>

            <Demo id="mov-swap" title="Swap dentro de AutoHeight">
                <div role="group" aria-label="Estado" className="flex flex-wrap gap-2">
                    {(Object.keys(STATES) as State[]).map((key) => (
                        <Button key={key} size="sm" variant={key === state ? "primary" : "secondary"} aria-pressed={key === state} onClick={() => setState(key)}>
                            {STATES[key].label}
                        </Button>
                    ))}
                </div>
                <AutoHeight className="mt-4 rounded-control bg-surface">
                    <Swap id={state}>
                        <ul className="flex flex-col gap-2 p-4">
                            {STATES[state].lines.map((line) => (
                                <li key={line}>{line}</li>
                            ))}
                        </ul>
                    </Swap>
                </AutoHeight>
                <p className="type-small mt-4 text-fg-subtle">
                    Texto en línea:{" "}
                    <button type="button" className="type-subheading min-h-11 rounded-sm text-fg" onClick={() => setWord((w) => (w + 1) % 3)}>
                        <Swap inline id={word}>
                            {["16 km · 30 a 45 min", "18 km · 35 a 50 min", "21 km · 40 a 55 min"][word]}
                        </Swap>
                    </button>
                </p>
            </Demo>

            <Demo id="mov-presence" title="Presence">
                <div role="group" aria-label="Presets" className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                        <Button
                            key={preset}
                            size="sm"
                            variant="secondary"
                            aria-pressed={shown[preset]}
                            data-preset={preset}
                            onClick={() => setShown((s) => ({ ...s, [preset]: !s[preset] }))}
                        >
                            {preset}
                        </Button>
                    ))}
                </div>
                <div className="relative mt-4 grid h-48 grid-cols-2 gap-3 overflow-hidden rounded-control bg-surface p-3">
                    {PRESETS.map((preset) => (
                        <div key={preset} className="relative flex items-end overflow-hidden rounded-inner border border-line">
                            <Presence show={shown[preset]} preset={preset} data-presence={preset} className="w-full rounded-inner bg-elevated p-3">
                                {preset}
                            </Presence>
                        </div>
                    ))}
                </div>
            </Demo>
        </div>
    );
}
