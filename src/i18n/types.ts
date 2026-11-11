// Tipos de los diccionarios. El español (dictionaries/es) define la forma de cada namespace.
import type { AboutDictionary } from "./dictionaries/es/about";
import type { CommonDictionary } from "./dictionaries/es/common";
import type { HomeDictionary } from "./dictionaries/es/home";
import type { LegalDictionary } from "./dictionaries/es/legal";
import type { NotFoundDictionary } from "./dictionaries/es/not-found";
import type { PricingDictionary } from "./dictionaries/es/pricing";
import type { QuoteDictionary } from "./dictionaries/es/quote";
import type { ServicesDictionary } from "./dictionaries/es/services";

export type { Locale } from "./config";
export type { RouteKey } from "./routes";

export interface Dictionaries {
    common: CommonDictionary;
    home: HomeDictionary;
    services: ServicesDictionary;
    pricing: PricingDictionary;
    about: AboutDictionary;
    legal: LegalDictionary;
    quote: QuoteDictionary;
    "not-found": NotFoundDictionary;
}

export type Namespace = keyof Dictionaries;

/** Diccionario de un namespace. A un componente cliente se le pasa solo su trozo (p. ej. `Dictionary<"quote">`). */
export type Dictionary<N extends Namespace> = Dictionaries[N];

/** Texto con forma de metadata que todos los namespaces de página tienen. */
export interface MetaCopy {
    title: string;
    description: string;
}

export type {
    AboutDictionary,
    CommonDictionary,
    HomeDictionary,
    LegalDictionary,
    NotFoundDictionary,
    PricingDictionary,
    QuoteDictionary,
    ServicesDictionary,
};
