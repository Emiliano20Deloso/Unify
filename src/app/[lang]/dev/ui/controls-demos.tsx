"use client";

// Vitrina de los controles (/dev/ui § Controles). Cada demo tiene sus escenarios C* en
// scripts/motion/escenarios.json: prueban que cada acción reacciona animada, sin cortes ni brincos.
import { useState } from "react";
// Importe directo (no el índice): esta isla cliente no arrastra el resto del barril de motion.
import { Swap } from "@/components/motion/swap";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Button,
    Field,
    Input,
    Price,
    RouteLine,
    Segmented,
    Stepper,
    Switch,
} from "@/components/ui";

const LEVELS = [
    { value: "practico", label: "Práctico", price: 350 },
    { value: "select", label: "Select", price: 450 },
    { value: "premium", label: "Premium", price: 599 },
] as const;
type Level = (typeof LEVELS)[number]["value"];

const PRICES = [450, 1280, 615] as const;
const ROUTES = ["AICM Terminal 1", "Santa Fe", "Toluca"] as const;

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

export function ControlsDemos() {
    const [presses, setPresses] = useState(0);
    const [off, setOff] = useState(false);
    const [level, setLevel] = useState<Level>("select");
    const [passengers, setPassengers] = useState(1);
    const [roundTrip, setRoundTrip] = useState(false);
    const [withError, setWithError] = useState(false);
    const [withHint, setWithHint] = useState(false);
    const [price, setPrice] = useState(0);
    const [route, setRoute] = useState(0);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Demo id="ctl-botones" title="Botones y enlaces">
                <div className="flex flex-wrap items-center gap-3">
                    <Button id="ctl-primario" data-count={presses} onClick={() => setPresses((n) => n + 1)}>
                        Cotizar
                    </Button>
                    <Button id="ctl-secundario" variant="secondary">
                        Cotizar Select
                    </Button>
                    <Button variant="ghost">Ver detalles</Button>
                    <Button asChild variant="link">
                        <a id="ctl-enlace" href="#ctl-botones">
                            Ver todas las tarifas
                        </a>
                    </Button>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                    <Switch id="ctl-deshabilitar" checked={off} onCheckedChange={setOff}>
                        <span className="type-small">Deshabilitar el botón</span>
                    </Switch>
                    <Button id="ctl-objetivo" disabled={off}>
                        Reservar
                    </Button>
                </div>
            </Demo>

            <Demo id="ctl-nivel" title="Segmented (nivel)">
                <Segmented
                    name="ctl-nivel"
                    legend="Nivel de servicio"
                    value={level}
                    onValueChange={setLevel}
                    selectedLabel="Elegido"
                    options={LEVELS.map((l) => ({ value: l.value, label: l.label, detail: <Price value={l.price} /> }))}
                />
            </Demo>

            <Demo id="ctl-contador" title="Stepper (tope en 1 y 4)">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <span id="ctl-pasajeros" className="type-label text-fg-subtle">
                            Pasajeros
                        </span>
                        <Stepper
                            value={passengers}
                            onValueChange={setPassengers}
                            min={1}
                            max={4}
                            labelledBy="ctl-pasajeros"
                            decrementLabel="Quitar un pasajero"
                            incrementLabel="Agregar un pasajero"
                        />
                    </div>
                    <p className="flex items-baseline gap-2.5">
                        <span className="type-label text-fg-subtle">Total</span>
                        <Price value={450 + (passengers - 1) * 25} currency className="type-figure" />
                    </p>
                </div>
            </Demo>

            <Demo id="ctl-interruptor" title="Switch">
                <div className="flex flex-col divide-y divide-line">
                    <Switch id="ctl-ida-vuelta" checked={roundTrip} onCheckedChange={setRoundTrip}>
                        <span className="text-[0.9375rem] font-medium">Ida y vuelta</span>
                    </Switch>
                    <Switch defaultChecked disabled>
                        <span className="text-[0.9375rem] font-medium text-fg-subtle">Deshabilitado (encendido)</span>
                    </Switch>
                </div>
            </Demo>

            <Demo id="ctl-campo" title="Field (error y ayuda)">
                <div className="flex flex-wrap gap-x-6">
                    <Switch id="ctl-con-error" checked={withError} onCheckedChange={setWithError}>
                        <span className="type-small">Con error</span>
                    </Switch>
                    <Switch id="ctl-con-ayuda" checked={withHint} onCheckedChange={setWithHint}>
                        <span className="type-small">Con ayuda</span>
                    </Switch>
                </div>
                <Field
                    id="ctl-telefono"
                    className="mt-4"
                    label="Teléfono"
                    hint={withHint ? "Te escribimos por WhatsApp a este número." : undefined}
                    error={withError ? "Escribe 10 dígitos, sin espacios." : undefined}
                >
                    <Input type="tel" defaultValue="55 1234" autoComplete="off" />
                </Field>
                <p data-debajo="" className="type-small mt-4 text-fg-subtle">
                    Contenido de abajo: baja y sube con el alto.
                </p>
            </Demo>

            <Demo id="ctl-acordeon" title="Accordion">
                <Accordion type="single" collapsible>
                    <AccordionItem value="espera">
                        <AccordionTrigger>¿Cuánto tiempo de espera incluye?</AccordionTrigger>
                        <AccordionContent>Cada viaje incluye 15 minutos de espera sin costo; en aeropuerto, 30 minutos desde que aterriza tu vuelo.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="casetas">
                        <AccordionTrigger>¿Las casetas están incluidas?</AccordionTrigger>
                        <AccordionContent>No. Las casetas se pagan aparte, al costo.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="pago">
                        <AccordionTrigger>¿Cómo pago?</AccordionTrigger>
                        <AccordionContent>Con tarjeta o transferencia al confirmar tu viaje.</AccordionContent>
                    </AccordionItem>
                </Accordion>
                <p data-debajo="" className="type-small mt-4 text-fg-subtle">
                    Contenido de abajo.
                </p>
            </Demo>

            <Demo id="ctl-precio" title="Price">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Price value={PRICES[price]} currency className="type-figure" />
                    <Button id="ctl-cambiar-precio" size="sm" variant="secondary" onClick={() => setPrice((p) => (p + 1) % PRICES.length)}>
                        Cambiar precio
                    </Button>
                </div>
            </Demo>

            <Demo id="ctl-ruta" title="RouteLine (redibujo y latido)">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="type-subheading flex min-w-0 flex-1 items-center gap-4">
                        Polanco
                        <RouteLine label="a" className="w-14 shrink-0" redraw={route} pulse={route} />
                        <Swap inline id={route}>
                            {ROUTES[route]}
                        </Swap>
                    </p>
                    <Button id="ctl-cambiar-ruta" size="sm" variant="secondary" data-route={route} onClick={() => setRoute((r) => (r + 1) % ROUTES.length)}>
                        Cambiar ruta
                    </Button>
                </div>
            </Demo>
        </div>
    );
}
