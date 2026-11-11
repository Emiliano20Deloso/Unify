"use client";

// Islas interactivas del muestrario (estado local para ver las primitivas en uso).
import { useState } from "react";
import { toast } from "sonner";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    Field,
    Input,
    Price,
    Segmented,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
    Stepper,
} from "@/components/ui";

const LEVELS = [
    { value: "practico", label: "Práctico", price: 350 },
    { value: "select", label: "Select", price: 450 },
    { value: "premium", label: "Premium", price: 599 },
] as const;

type Level = (typeof LEVELS)[number]["value"];

export function QuoteControlsDemo() {
    const [level, setLevel] = useState<Level>("select");
    const [passengers, setPassengers] = useState(2);
    const total = LEVELS.find((l) => l.value === level)!.price + (passengers - 1) * 25;

    return (
        <div className="flex flex-col gap-6">
            <Segmented
                name="nivel"
                legend="Nivel de servicio"
                value={level}
                onValueChange={setLevel}
                selectedLabel="Elegido"
                options={LEVELS.map((l) => ({ value: l.value, label: l.label, detail: <Price value={l.price} /> }))}
            />
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <span id="pasajeros-label" className="type-label text-fg-subtle">
                        Pasajeros
                    </span>
                    <Stepper
                        value={passengers}
                        onValueChange={setPassengers}
                        min={1}
                        max={4}
                        labelledBy="pasajeros-label"
                        decrementLabel="Quitar un pasajero"
                        incrementLabel="Agregar un pasajero"
                    />
                </div>
                <p className="flex items-baseline gap-2.5">
                    <span className="type-label text-fg-subtle">IVA incluido</span>
                    <Price value={total} currency className="type-figure" />
                </p>
            </div>
        </div>
    );
}

export function OverlaysDemo() {
    return (
        <div className="flex flex-wrap gap-3">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary">Abrir diálogo</Button>
                </DialogTrigger>
                <DialogContent closeLabel="Cerrar">
                    <DialogTitle>Confirma tu viaje</DialogTitle>
                    <DialogDescription>Polanco a AICM Terminal 1, viernes 20 de noviembre a las 10:30.</DialogDescription>
                    <Field label="Nombre">
                        <Input autoComplete="name" placeholder="Como aparece en tu identificación" />
                    </Field>
                    <Button className="mt-2">Confirmar</Button>
                </DialogContent>
            </Dialog>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="secondary">Abrir hoja</Button>
                </SheetTrigger>
                <SheetContent closeLabel="Cerrar" header={<SheetTitle>Detalle del viaje</SheetTitle>}>
                    <SheetDescription className="mt-2">
                        Pantalla completa en móvil; panel a la derecha desde 640 px. Escape cierra y el foco vuelve al botón.
                    </SheetDescription>
                </SheetContent>
            </Sheet>
            <Button variant="ghost" onClick={() => toast("Tarifa copiada", { description: "Polanco ●—○ AICM · $450 MXN" })}>
                Mostrar aviso
            </Button>
        </div>
    );
}
