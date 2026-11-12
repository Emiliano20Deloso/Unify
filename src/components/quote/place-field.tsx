"use client";

// Campo de dirección: combobox ARIA 1.2 (input + listbox con aria-activedescendant).
// Vacío: lugares frecuentes (aeropuertos primero). Escribiendo: catálogo al instante y, desde
// 3 caracteres, /api/places/autocomplete con espera de 300 ms, cancelación y token por campo.
// Un solo DOM en escritorio y móvil: en pantallas chicas, tocar o enfocar el campo abre una hoja
// inferior con el buscador listo (se decide en el evento, no al pintar: nada cambia al hidratar).
// Movimiento: la lista entra y sale (siempre montada, data-state), su alto sigue al contenido, las
// opciones se relevan con fundido cruzado, el resaltado se desliza y el valor elegido entra con fundido.
import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, useIsPresent } from "motion/react";
import * as m from "motion/react-m";
import { Building2, Landmark, LoaderCircle, MapPin, Plane } from "lucide-react";
import { AutoHeight } from "@/components/motion/auto-height";
import { Collapse } from "@/components/motion/collapse";
import { Presence } from "@/components/motion/presence";
import { hideIndicator, slideIndicatorTo } from "@/components/motion/sliding-indicator";
import { Swap } from "@/components/motion/swap";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui";
import type { Dictionary, Locale } from "@/i18n/types";
import { cn } from "@/lib";
import { EASE_EXIT, EASE_OUT } from "@/lib/motion";
import { CATALOG, catalogId, searchCatalog } from "@/lib/places/catalog";
import { fetchPlaceDetails, fetchSuggestions, newSessionToken } from "@/lib/quote/api";
import { catalogPlace } from "@/lib/quote/draft";
import type { PlaceKind, QuotePlace, Suggestion } from "@/lib/quote/types";
import { enterValue, pulseOutline } from "./motion";

type Dict = Dictionary<"quote">;

const FREQUENT = ["aicm-t1", "aicm-t2", "aifa", "polanco", "santa-fe", "reforma-angel", "lomas-de-chapultepec", "interlomas"];
const MIN_REMOTE = 3;
const DEBOUNCE_MS = 300;
/** Pantalla chica: el campo abre la hoja inferior (se consulta en el evento). */
const SMALL = "(max-width: 767px)";

type Option = { id: string; main: string; secondary?: string; kind: PlaceKind; source: "catalog" | "google" };

function catalogOptions(slugsOrPlaces: readonly (typeof CATALOG)[number][], lang: Locale): Option[] {
    return slugsOrPlaces.map((p) => ({ id: catalogId(p.slug), main: p.name[lang], kind: p.kind, source: "catalog" }));
}

function fromSuggestion(s: Suggestion): Option {
    return { id: s.id, main: s.main, secondary: s.secondary, kind: s.kind ?? "address", source: s.source };
}

const KIND_ICON = { airport: Plane, zone: MapPin, venue: Landmark, address: Building2 } as const;

function KindIcon({ kind, className }: { kind: PlaceKind; className?: string }) {
    const Icon = KIND_ICON[kind];
    return <Icon aria-hidden="true" strokeWidth={1.6} className={cn("size-[18px] shrink-0", className)} />;
}

type Remote = {
    query: string;
    options: Option[];
    attribution: boolean;
    degraded: boolean;
    error: boolean;
};

/** Búsqueda compartida por el campo en línea y por la hoja móvil. */
function usePlaceSearch(query: string, lang: Locale) {
    const q = query.trim();
    const [remote, setRemote] = useState<Remote | null>(null);
    const tokenRef = useRef<string | null>(null);

    const local = useMemo<Option[]>(() => {
        if (q.length === 0) return catalogOptions(FREQUENT.map((s) => CATALOG.find((p) => p.slug === s)!), lang);
        return catalogOptions(searchCatalog(q, 6), lang);
    }, [q, lang]);

    useEffect(() => {
        if (q.length < MIN_REMOTE) return;
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            tokenRef.current ??= newSessionToken();
            fetchSuggestions(q, tokenRef.current, lang, controller.signal)
                .then((r) =>
                    setRemote(
                        r.kind === "ok"
                            ? { query: q, options: r.suggestions.map(fromSuggestion), attribution: r.attribution === "google_maps", degraded: r.degraded === "no_key", error: false }
                            : { query: q, options: [], attribution: false, degraded: false, error: true },
                    ),
                )
                .catch(() => {});
        }, DEBOUNCE_MS);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [q, lang]);

    const settled = q.length >= MIN_REMOTE && remote?.query === q ? remote : null;
    const loading = q.length >= MIN_REMOTE && !settled;
    const options = settled && !settled.error && settled.options.length > 0 ? settled.options : local;
    return {
        frequent: q.length === 0,
        options,
        loading,
        empty: !!settled && !settled.error && options.length === 0,
        error: !!settled?.error,
        degraded: !!settled?.degraded,
        attribution: !!settled?.attribution && options.some((o) => o.source === "google"),
        short: q.length > 0 && q.length < MIN_REMOTE && options.length === 0,
        /** Token de la sesión de autocompletado (se renueva al elegir). */
        takeToken: () => {
            const t = tokenRef.current ?? newSessionToken();
            tokenRef.current = null;
            return t;
        },
    };
}

export interface PlaceFieldHandle {
    focus: () => void;
    /** El campo señala que falta (el contorno late una vez). */
    flag: () => void;
    /** El próximo valor entra desde `dy` px (invertir origen y destino). */
    enterFrom: (dy: number) => void;
}

interface PlaceFieldProps {
    lang: Locale;
    dict: Dict;
    label: string;
    placeholder: string;
    value: QuotePlace | null;
    onChange: (place: QuotePlace | null) => void;
    invalid?: boolean;
    /** Id del mensaje de error que describe el campo. */
    errorId?: string;
    /** Caja del campo (alto, relleno, fondo). */
    className?: string;
    labelClassName?: string;
    inputClassName?: string;
    /** Alinea la lista desplegable bajo el campo (escritorio). */
    listClassName?: string;
}

export const PlaceField = forwardRef<PlaceFieldHandle, PlaceFieldProps>(function PlaceField(
    { lang, dict, label, placeholder, value, onChange, invalid, errorId, className, labelClassName, inputClassName, listClassName },
    ref,
) {
    const id = useId();
    const inputId = `${id}-input`;
    const boxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetSeed, setSheetSeed] = useState("");
    // Desplazamiento de entrada del próximo valor (null = el fundido corto de siempre).
    const enterDy = useRef<number | null>(null);
    // Foco devuelto por la hoja al cerrarse: no la vuelve a abrir.
    const returning = useRef(false);

    // Foco sin abrir nada en pantalla chica (validación, regreso desde la hoja): sin teclado ni hoja.
    const quietFocus = () => {
        const node = inputRef.current;
        if (!node) return;
        if (window.matchMedia(SMALL).matches) node.readOnly = true;
        returning.current = true;
        node.focus({ preventScroll: true });
        returning.current = false;
    };

    useImperativeHandle(
        ref,
        () => ({
            focus: () => {
                if (window.matchMedia(SMALL).matches) quietFocus();
                else inputRef.current?.focus();
            },
            flag: () => pulseOutline(boxRef.current),
            enterFrom: (dy: number) => {
                enterDy.current = dy;
            },
        }),
        [],
    );

    // El valor nuevo entra con fundido (y 4 px, o desde donde estaba el otro campo al invertir).
    // Al restaurar un borrador lo hace el fundido de [data-draft-value] (globals.css § Cotizador).
    const valueKey = value ? `${value.id}|${value.label}` : "";
    const lastKey = useRef(valueKey);
    useLayoutEffect(() => {
        if (lastKey.current === valueKey) return;
        lastKey.current = valueKey;
        const dy = enterDy.current ?? 4;
        enterDy.current = null;
        if (document.documentElement.hasAttribute("data-quote-restore")) return;
        enterValue(inputRef.current, dy);
    }, [valueKey]);

    const openSheet = (seed = "") => {
        setSheetSeed(seed);
        setSheetOpen(true);
    };

    const choose = (place: QuotePlace) => {
        onChange(place);
        setSheetOpen(false);
    };

    return (
        <div ref={boxRef} className={cn("quote-cell relative flex min-w-0 flex-col", className)}>
            <label
                htmlFor={inputId}
                className={cn("type-label transition-colors duration-micro ease", invalid ? "text-brand-ink" : "text-fg-subtle", labelClassName)}
            >
                {label}
            </label>
            <PlaceCombobox
                mode="inline"
                inputRef={inputRef}
                inputId={inputId}
                lang={lang}
                dict={dict}
                label={label}
                placeholder={placeholder}
                value={value}
                invalid={invalid}
                errorId={errorId}
                onChoose={choose}
                inputClassName={inputClassName}
                listClassName={listClassName}
                small={() => !returning.current && window.matchMedia(SMALL).matches}
                onSmallOpen={openSheet}
            />
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent
                    variant="bottom"
                    className="h-[calc(100dvh-3rem)]"
                    closeLabel={dict.places.close}
                    header={<SheetTitle className="type-subheading">{label}</SheetTitle>}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => {
                        // El foco vuelve al campo sin abrir el teclado ni otra vez la hoja.
                        e.preventDefault();
                        quietFocus();
                    }}
                    aria-describedby={undefined}
                >
                    <PlaceCombobox
                        mode="sheet"
                        lang={lang}
                        dict={dict}
                        label={label}
                        placeholder={placeholder}
                        value={value}
                        seed={sheetSeed}
                        onChoose={choose}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
});

const fieldInput =
    "w-full min-w-0 truncate bg-transparent font-medium text-fg placeholder:font-normal placeholder:text-fg-subtle focus-visible:outline-none";

interface ComboboxProps {
    mode: "inline" | "sheet";
    lang: Locale;
    dict: Dict;
    label: string;
    placeholder: string;
    value: QuotePlace | null;
    onChoose: (place: QuotePlace) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    inputId?: string;
    seed?: string;
    invalid?: boolean;
    errorId?: string;
    inputClassName?: string;
    listClassName?: string;
    /** En línea: ¿la pantalla es chica? (entonces el campo abre la hoja en vez de la lista). */
    small?: () => boolean;
    onSmallOpen?: (seed?: string) => void;
}

function PlaceCombobox({
    mode,
    lang,
    dict,
    label,
    placeholder,
    value,
    onChoose,
    inputRef,
    inputId,
    seed = "",
    invalid,
    errorId,
    inputClassName,
    listClassName,
    small,
    onSmallOpen,
}: ComboboxProps) {
    const t = dict.places;
    const sheet = mode === "sheet";
    const uid = useId();
    const listId = `${uid}-list`;
    const statusId = `${uid}-status`;
    const ownRef = useRef<HTMLInputElement>(null);
    const ref = inputRef ?? ownRef;

    // Texto escrito por la persona; null = muestra la etiqueta del lugar elegido. Al cerrar la lista
    // se conserva (la lista sale con su contenido) y se limpia al volver a abrirla.
    const [typed, setTyped] = useState<string | null>(sheet ? seed : null);
    const [open, setOpen] = useState(sheet);
    // Cada apertura vuelve a montar el contenido: entra ya con su alto, sin crecer desde el anterior.
    const [session, setSession] = useState(0);
    const [active, setActive] = useState<string | null>(null);
    const [resolving, setResolving] = useState(false);
    const [resolveError, setResolveError] = useState(false);

    const search = usePlaceSearch(typed ?? "", lang);
    const options = search.options;
    const activeIndex = options.findIndex((o) => o.id === active);

    useEffect(() => {
        if (!sheet) return;
        // La hoja abre con el teclado listo (la llamada sigue al toque que abrió la hoja).
        const node = ref.current;
        node?.focus();
        if (node && seed) node.setSelectionRange(seed.length, seed.length);
    }, [sheet, seed, ref]);

    const openList = (fresh: boolean) => {
        if (!open) {
            setSession((s) => s + 1);
            if (fresh) setTyped(null);
            setActive(null);
            setResolveError(false);
        }
        setOpen(true);
    };

    const finish = (place: QuotePlace) => {
        // La lista (o la hoja) sale con lo que mostraba: el texto escrito se limpia al reabrir.
        if (!sheet) setOpen(false);
        setActive(null);
        onChoose(place);
    };

    const select = async (option: Option) => {
        setResolveError(false);
        if (option.source === "catalog") {
            const place = catalogPlace(option.id, lang);
            if (!place) return;
            finish(place);
            return;
        }
        setResolving(true);
        const place = await fetchPlaceDetails(option.id, search.takeToken(), lang).catch(() => null);
        setResolving(false);
        if (!place) {
            setResolveError(true);
            return;
        }
        finish({ ...place, label: option.main });
    };

    const move = (delta: number) => {
        if (options.length === 0) return;
        const next = activeIndex === -1 ? (delta > 0 ? 0 : options.length - 1) : (activeIndex + delta + options.length) % options.length;
        const option = options[next]!;
        setActive(option.id);
        document.getElementById(`${uid}-o-${next}`)?.scrollIntoView({ block: "nearest" });
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!sheet && small?.()) {
            // Pantalla chica: el campo es un botón que abre la hoja (una tecla escrita la abre ya buscando).
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                onSmallOpen?.();
            } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                onSmallOpen?.(e.key);
            }
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (!open) openList(true);
                else move(1);
                break;
            case "ArrowUp":
                e.preventDefault();
                if (!open) openList(true);
                else move(-1);
                break;
            case "Enter":
                if (open && activeIndex >= 0) {
                    e.preventDefault();
                    void select(options[activeIndex]!);
                } else if (open && options.length === 1) {
                    e.preventDefault();
                    void select(options[0]!);
                }
                break;
            case "Escape":
                if (!sheet && open) {
                    e.preventDefault();
                    setOpen(false);
                    setActive(null);
                }
                break;
            case "Tab":
                if (!sheet) setOpen(false);
                break;
        }
    };

    const shown = open && !resolving;
    const status = resolving
        ? t.resolving
        : resolveError
          ? t.resolveError
          : search.loading
            ? t.searching
            : search.error
              ? t.error
              : search.empty
                ? t.noResults
                : search.short
                  ? t.minChars
                  : null;
    const busy = resolving || (search.loading && open);

    const list = (
        <ListContent
            sheet={sheet}
            uid={uid}
            listId={listId}
            statusId={statusId}
            t={t}
            options={options}
            frequent={search.frequent}
            activeIndex={activeIndex}
            status={status}
            degraded={search.degraded && !search.loading}
            attribution={search.attribution}
            live={sheet || shown}
            onPick={(o) => void select(o)}
            onHover={(o) => active !== o.id && setActive(o.id)}
        />
    );

    return (
        <>
            <div className={cn("relative flex items-center gap-3", sheet && "mt-2 rounded-control border border-line-strong bg-surface px-4")}>
                <input
                    ref={ref}
                    id={inputId}
                    type="text"
                    role="combobox"
                    data-draft-value={sheet ? undefined : ""}
                    aria-label={sheet ? label : undefined}
                    aria-autocomplete="list"
                    aria-expanded={shown}
                    aria-controls={listId}
                    aria-activedescendant={shown && activeIndex >= 0 ? `${uid}-o-${activeIndex}` : undefined}
                    aria-invalid={invalid || undefined}
                    aria-describedby={[errorId, shown && status ? statusId : null].filter(Boolean).join(" ") || undefined}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="search"
                    placeholder={placeholder}
                    value={(sheet || open) && typed !== null ? typed : (value?.label ?? "")}
                    onChange={(e) => {
                        setTyped(e.target.value);
                        setActive(null);
                        setResolveError(false);
                        openList(false);
                    }}
                    onPointerDown={(e) => {
                        if (sheet || e.button !== 0 || !small?.()) return;
                        // Sin foco ni teclado: la hoja trae su propio buscador.
                        e.preventDefault();
                        e.currentTarget.readOnly = true;
                        onSmallOpen?.();
                    }}
                    onFocus={(e) => {
                        if (sheet) return;
                        if (small?.()) {
                            e.currentTarget.readOnly = true;
                            e.currentTarget.blur();
                            onSmallOpen?.();
                            return;
                        }
                        if (e.currentTarget.readOnly) return;
                        openList(true);
                        e.currentTarget.select();
                    }}
                    onClick={(e) => {
                        if (!sheet && !e.currentTarget.readOnly) openList(true);
                    }}
                    onBlur={(e) => {
                        if (sheet) return;
                        e.currentTarget.readOnly = false;
                        setOpen(false);
                        setActive(null);
                    }}
                    onKeyDown={onKeyDown}
                    className={cn(fieldInput, sheet ? "h-14 text-base" : "", inputClassName)}
                />
                <Presence show={busy} preset="fade" className="flex shrink-0">
                    <LoaderCircle aria-hidden="true" strokeWidth={1.6} className="size-[18px] animate-spin text-fg-subtle motion-reduce:animate-none" />
                </Presence>
            </div>

            {sheet ? (
                <div className="mt-3 flex flex-col">{list}</div>
            ) : (
                <div
                    data-state={shown ? "open" : "closed"}
                    className={cn(
                        "quote-popover absolute left-0 top-full z-30 mt-3 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-line-strong bg-elevated",
                        listClassName,
                    )}
                >
                    {/* La lista se monta al abrirla la primera vez (menos trabajo al cargar la página). */}
                    {session > 0 ? (
                        <AutoHeight key={session}>{list}</AutoHeight>
                    ) : (
                        <div id={listId} role="listbox" aria-label={t.frequent} />
                    )}
                </div>
            )}
        </>
    );
}

interface ListContentProps {
    sheet: boolean;
    /** Lista abierta: solo entonces las opciones llevan rol e id (cerrada sale con su contenido). */
    live: boolean;
    uid: string;
    listId: string;
    statusId: string;
    t: Dict["places"];
    options: Option[];
    frequent: boolean;
    activeIndex: number;
    status: string | null;
    degraded: boolean;
    attribution: boolean;
    onPick: (o: Option) => void;
    onHover: (o: Option) => void;
}

/** Lista + estado + avisos. Un solo resaltado que se desliza; el grupo de opciones se releva con fundido cruzado. */
function ListContent({ sheet, live, uid, listId, statusId, t, options, frequent, activeIndex, status, degraded, attribution, onPick, onHover }: ListContentProps) {
    const indicator = useRef<HTMLSpanElement>(null);
    const signature = `${frequent ? "f:" : ""}${options.map((o) => o.id).join("|")}`;

    useLayoutEffect(() => {
        const node = indicator.current;
        if (!node) return;
        const target = activeIndex >= 0 ? document.getElementById(`${uid}-o-${activeIndex}`) : null;
        if (!target) return hideIndicator(node);
        node.style.height = `${target.offsetHeight}px`;
        slideIndicatorTo(node, target, "y");
    }, [activeIndex, signature, uid]);

    return (
        <>
            <div
                id={listId}
                role="listbox"
                aria-label={frequent ? t.frequent : t.listLabel}
                className={cn("relative grid", sheet ? "-mx-3" : "max-h-[22rem] overflow-y-auto overscroll-contain")}
            >
                <span
                    ref={indicator}
                    aria-hidden="true"
                    className={cn("quote-option-indicator sliding-indicator pointer-events-none absolute inset-x-0 top-0", sheet ? "rounded-inner bg-elevated" : "bg-surface")}
                />
                {/* Los dos juegos comparten la misma celda: se cruzan sin que la lista se encoja de golpe
                    (fuera del flujo, el que sale quedaría recortado por el scroll de la lista). */}
                <AnimatePresence initial={false}>
                    <OptionGroup
                        key={signature}
                        sheet={sheet}
                        uid={uid}
                        t={t}
                        options={options}
                        frequent={frequent}
                        activeIndex={activeIndex}
                        live={live}
                        onPick={onPick}
                        onHover={onHover}
                    />
                </AnimatePresence>
            </div>
            <div id={statusId} role="status" className="type-label font-normal text-fg-subtle">
                <Collapse open={!!status}>
                    <p className={sheet ? "py-3" : "px-4 pb-3 pt-1"}>
                        <Swap inline id={status ?? ""}>
                            {status}
                        </Swap>
                    </p>
                </Collapse>
            </div>
            <Collapse open={degraded}>
                <p className={cn("type-label border-t border-line font-normal text-fg-subtle", sheet ? "py-3" : "px-4 py-3")}>{t.degraded}</p>
            </Collapse>
            <Collapse open={attribution}>
                <p className={cn("type-label flex justify-end border-t border-line text-fg-subtle", sheet ? "py-3" : "px-4 py-2.5")}>{t.attribution}</p>
            </Collapse>
        </>
    );
}

// Relevo de opciones: rápido y sin escalonar (el que sale se va antes de que el nuevo termine de entrar).
const GROUP_IN = { duration: 0.18, ease: EASE_OUT, delay: 0.04 } as const;
const GROUP_OUT = { duration: 0.12, ease: EASE_EXIT } as const;

interface OptionGroupProps {
    sheet: boolean;
    live: boolean;
    uid: string;
    t: Dict["places"];
    options: Option[];
    frequent: boolean;
    activeIndex: number;
    onPick: (o: Option) => void;
    onHover: (o: Option) => void;
}

/** Un juego de opciones. Al salir pierde ids y roles: no se lee ni se duplica mientras se funde. */
function OptionGroup({ sheet, live, uid, t, options, frequent, activeIndex, onPick, onHover }: OptionGroupProps) {
    const present = useIsPresent() && live;
    return (
        <m.div
            style={{ gridArea: "1 / 1" }}
            aria-hidden={present ? undefined : true}
            inert={!present}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: GROUP_IN }}
            exit={{ opacity: 0, transition: GROUP_OUT }}
        >
            {frequent && options.length > 0 ? (
                <p className={cn("type-label pb-1 pt-3 text-fg-subtle", sheet ? "px-3" : "px-4")} aria-hidden="true">
                    {t.frequent}
                </p>
            ) : null}
            <div className={cn("flex flex-col", !sheet && "py-1.5")}>
                {options.map((o, i) => (
                    <div
                        key={o.id}
                        id={present ? `${uid}-o-${i}` : undefined}
                        role={present ? "option" : undefined}
                        aria-selected={present ? i === activeIndex : undefined}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => present && onPick(o)}
                        onMouseMove={() => present && onHover(o)}
                        className={cn("relative flex min-h-12 cursor-pointer items-center gap-3.5 px-4 py-2.5", sheet && "min-h-14 px-3")}
                    >
                        <KindIcon kind={o.kind} className={o.kind === "airport" ? "text-brand-ink" : "text-fg-subtle"} />
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate text-[0.9375rem] font-medium">{o.main}</span>
                            <span className="type-label truncate font-normal text-fg-subtle">{o.secondary ?? t.kinds[o.kind]}</span>
                        </span>
                    </div>
                ))}
            </div>
        </m.div>
    );
}
