"use client";

// Borrador compartido por el widget del hero y el cotizador de /tarifas.
// Fuente de verdad en memoria, con copia en sessionStorage (sobrevive a la navegación y a recargar
// la pestaña, no a cerrarla). Se valida al leer: nada almacenado se usa sin pasar por sanitizeDraft.
import { useSyncExternalStore } from "react";
import { SERVER_DRAFT, sanitizeDraft } from "./draft";
import type { QuoteDraft } from "./types";

const KEY = "unify.quote.v1";

let state: QuoteDraft | null = null;
const listeners = new Set<() => void>();

function load(): QuoteDraft {
    let raw: unknown = null;
    try {
        const text = window.sessionStorage.getItem(KEY);
        raw = text ? JSON.parse(text) : null;
    } catch {
        raw = null;
    }
    return sanitizeDraft(raw);
}

function getSnapshot(): QuoteDraft {
    if (state === null) state = load();
    return state;
}

function getServerSnapshot(): QuoteDraft {
    return SERVER_DRAFT;
}

function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

/** Mezcla cambios en el borrador, lo guarda y avisa a los suscriptores. */
export function updateDraft(patch: Partial<QuoteDraft> | ((d: QuoteDraft) => Partial<QuoteDraft>)): void {
    const prev = getSnapshot();
    const next = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
    state = next;
    try {
        window.sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        /* almacenamiento bloqueado o lleno: el borrador sigue en memoria */
    }
    for (const l of listeners) l();
}

export function useQuoteDraft(): QuoteDraft {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
