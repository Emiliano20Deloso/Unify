"use client";

import { useEffect, useState } from "react";
import { Button, Container, Field, Input } from "@/components/ui";

const DEVICES = [
    { name: "Móvil", width: 390, height: 844 },
    { name: "Tablet", width: 768, height: 1024 },
] as const;

function normalize(value: string): string {
    const path = value.trim() || "/";
    return path.startsWith("/") ? path : `/${path}`;
}

export function FrameViewer() {
    // La ruta sale de ?path= después de montar (la página sigue siendo estática).
    const [path, setPath] = useState<string | null>(null);
    const [draft, setDraft] = useState("/");

    useEffect(() => {
        const initial = normalize(new URLSearchParams(window.location.search).get("path") ?? "/");
        // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de la URL tras montar
        setPath(initial);
        setDraft(initial);
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const next = normalize(draft);
        setPath(next);
        const url = new URL(window.location.href);
        url.searchParams.set("path", next);
        window.history.replaceState(null, "", url);
    };

    return (
        <Container className="pb-section-sm pt-[calc(var(--header-h)+2rem)]">
            <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
                <Field label="Ruta" className="w-full max-w-sm">
                    <Input value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} autoComplete="off" />
                </Field>
                <Button type="submit">Ver</Button>
            </form>
            <div className="mt-8 flex gap-10 overflow-x-auto pb-4">
                {DEVICES.map((d) => (
                    <figure key={d.name} className="flex shrink-0 flex-col gap-3">
                        <figcaption className="type-label text-fg-subtle">
                            {d.name} · <span className="tabular">{d.width} × {d.height}</span>
                        </figcaption>
                        <div className="overflow-hidden rounded-card border border-line-strong bg-bg" style={{ width: d.width + 2, height: d.height + 2 }}>
                            {path ? <iframe src={path} title={`${path} en ${d.name.toLowerCase()}`} width={d.width} height={d.height} className="block" /> : null}
                        </div>
                    </figure>
                ))}
            </div>
        </Container>
    );
}
