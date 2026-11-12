// Carga de diccionarios por idioma y namespace. Solo servidor: los textos no viajan al bundle
// del cliente salvo el trozo que una página le pase explícitamente a un componente cliente.
import "server-only";
import { cache } from "react";
import type { Locale } from "./config";
import type { Dictionaries, Namespace } from "./types";

type Loaders = { [N in Namespace]: () => Promise<Dictionaries[N]> };

const loaders: Record<Locale, Loaders> = {
    es: {
        common: () => import("./dictionaries/es/common").then((m) => m.default),
        home: () => import("./dictionaries/es/home").then((m) => m.default),
        services: () => import("./dictionaries/es/services").then((m) => m.default),
        pricing: () => import("./dictionaries/es/pricing").then((m) => m.default),
        about: () => import("./dictionaries/es/about").then((m) => m.default),
        legal: () => import("./dictionaries/es/legal").then((m) => m.default),
        quote: () => import("./dictionaries/es/quote").then((m) => m.default),
        "not-found": () => import("./dictionaries/es/not-found").then((m) => m.default),
    },
    en: {
        common: () => import("./dictionaries/en/common").then((m) => m.default),
        home: () => import("./dictionaries/en/home").then((m) => m.default),
        services: () => import("./dictionaries/en/services").then((m) => m.default),
        pricing: () => import("./dictionaries/en/pricing").then((m) => m.default),
        about: () => import("./dictionaries/en/about").then((m) => m.default),
        legal: () => import("./dictionaries/en/legal").then((m) => m.default),
        quote: () => import("./dictionaries/en/quote").then((m) => m.default),
        "not-found": () => import("./dictionaries/en/not-found").then((m) => m.default),
    },
};

// Memoizado por petición/render (React cache); los módulos importados ya quedan en caché del runtime.
const load = cache((lang: Locale, namespace: Namespace) => loaders[lang][namespace]());

export function getDictionary<N extends Namespace>(lang: Locale, namespace: N): Promise<Dictionaries[N]> {
    return load(lang, namespace) as Promise<Dictionaries[N]>;
}
