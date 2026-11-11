"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { EstimateRequest, EstimateResponse } from "@/lib/estimate/schema";
import { todayInTz } from "@/lib/pricing/time";
import { fetchEstimate, requestKey, type EstimateResult } from "@/lib/quote/api";
import { SERVICE_TZ } from "@/lib/quote/types";

const noop = () => () => {};

/** Fecha de hoy en CDMX (vacía durante el render del servidor). */
export function useToday(): string {
    return useSyncExternalStore(noop, () => todayInTz(SERVICE_TZ), () => "");
}

const SMALL = "(max-width: 767px)";

/** Pantalla chica (móvil): los campos de dirección se abren como hoja a pantalla completa. */
export function useSmallScreen(): boolean {
    return useSyncExternalStore(
        (cb) => {
            const mq = window.matchMedia(SMALL);
            mq.addEventListener("change", cb);
            return () => mq.removeEventListener("change", cb);
        },
        () => window.matchMedia(SMALL).matches,
        () => false,
    );
}

const DEBOUNCE_MS = 450;
const MAX_CACHED = 40;

type Entry = { result: EstimateResult; request: EstimateRequest };
type State = {
    results: Record<string, Entry>;
    /** Última estimación correcta: se mantiene visible mientras llega la siguiente. */
    lastOk: { key: string; data: EstimateResponse; request: EstimateRequest } | null;
};

/**
 * Pide /api/estimate cuando cambia la petición (espera 450 ms y cancela la anterior).
 * Cada resultado se guarda por clave: volver a una combinación ya vista no repite la consulta.
 */
export function useEstimate(request: EstimateRequest | null) {
    const key = request ? requestKey(request) : null;
    // La petición solo "cambia" cuando cambia su clave (nivel o vuelo no vuelven a consultar).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- la clave resume la petición
    const stable = useMemo(() => request, [key]);
    const [state, setState] = useState<State>({ results: {}, lastOk: null });
    const current = key ? state.results[key] : undefined;

    useEffect(() => {
        if (!key || !stable || current) return;
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            fetchEstimate(stable, controller.signal)
                .then((result) => {
                    setState((prev) => {
                        const keys = Object.keys(prev.results);
                        const results = { ...prev.results, [key]: { result, request: stable } };
                        if (keys.length >= MAX_CACHED) delete results[keys[0]!];
                        return {
                            results,
                            lastOk: result.kind === "ok" ? { key, data: result.data, request: stable } : prev.lastOk,
                        };
                    });
                })
                .catch(() => {
                    /* cancelada: la sustituye otra petición */
                });
        }, DEBOUNCE_MS);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [key, stable, current]);

    const retry = () => {
        if (!key) return;
        setState((prev) => {
            const results = { ...prev.results };
            delete results[key];
            return { ...prev, results };
        });
    };

    return {
        key,
        /** Resultado de la petición actual (undefined mientras carga). */
        result: current?.result,
        /** Petición que produjo `result`. */
        request: current?.request,
        loading: key !== null && !current,
        lastOk: state.lastOk,
        retry,
    };
}

export type EstimateState = ReturnType<typeof useEstimate>;
