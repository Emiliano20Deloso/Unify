"use client";

// Campo de dirección: combobox ARIA 1.2 (input + listbox con aria-activedescendant).
// Vacío: lugares frecuentes (aeropuertos primero). Escribiendo: catálogo al instante y, desde
// 3 caracteres, /api/places/autocomplete con espera de 300 ms, cancelación y token por campo.
// En pantallas chicas el campo abre una hoja a pantalla completa con el buscador listo.
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Building2, Landmark, LoaderCircle, MapPin, Plane } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui";
import type { Dictionary, Locale } from "@/i18n/types";
import { cn } from "@/lib";
import { CATALOG, catalogId, searchCatalog } from "@/lib/places/catalog";
import { fetchPlaceDetails, fetchSuggestions, newSessionToken } from "@/lib/quote/api";
import { catalogPlace } from "@/lib/quote/draft";
import type { PlaceKind, QuotePlace, Suggestion } from "@/lib/quote/types";
import { useSmallScreen } from "./hooks";

type Dict = Dictionary<"quote">;

const FREQUENT = ["aicm-t1", "aicm-t2", "aifa", "polanco", "santa-fe", "reforma-angel", "lomas-de-chapultepec", "interlomas"];
const MIN_REMOTE = 3;
const DEBOUNCE_MS = 300;

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
    const small = useSmallScreen();
    const id = useId();
    const inputId = `${id}-input`;
    const inputRef = useRef<HTMLInputElement>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetSeed, setSheetSeed] = useState("");

    useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

    const openSheet = (seed = "") => {
        setSheetSeed(seed);
        setSheetOpen(true);
    };

    const choose = (place: QuotePlace) => {
        onChange(place);
        setSheetOpen(false);
    };

    return (
        <div className={cn("relative flex min-w-0 flex-col", className)}>
            <label htmlFor={inputId} className={cn("type-label text-fg-subtle", labelClassName)}>
                {label}
            </label>
            {small ? (
                <>
                    <input
                        ref={inputRef}
                        id={inputId}
                        readOnly
                        inputMode="none"
                        value={value?.label ?? ""}
                        placeholder={placeholder}
                        aria-haspopup="dialog"
                        aria-invalid={invalid || undefined}
                        aria-describedby={errorId}
                        onClick={() => openSheet()}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                                e.preventDefault();
                                openSheet();
                            } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
                                e.preventDefault();
                                openSheet(e.key);
                            }
                        }}
                        className={cn(fieldInput, "cursor-pointer", inputClassName)}
                    />
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetContent
                            variant="full"
                            closeLabel={dict.places.close}
                            header={<SheetTitle className="type-subheading">{label}</SheetTitle>}
                            onOpenAutoFocus={(e) => e.preventDefault()}
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
                </>
            ) : (
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
                />
            )}
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
}: ComboboxProps) {
    const t = dict.places;
    const sheet = mode === "sheet";
    const uid = useId();
    const listId = `${uid}-list`;
    const statusId = `${uid}-status`;
    const ownRef = useRef<HTMLInputElement>(null);
    const ref = inputRef ?? ownRef;

    // Texto escrito por la persona; null = muestra la etiqueta del lugar elegido.
    const [typed, setTyped] = useState<string | null>(sheet ? seed : null);
    const [open, setOpen] = useState(sheet);
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

    const finish = (place: QuotePlace) => {
        setTyped(null);
        setActive(null);
        if (!sheet) setOpen(false);
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
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (!open) setOpen(true);
                else move(1);
                break;
            case "ArrowUp":
                e.preventDefault();
                if (!open) setOpen(true);
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
                    setTyped(null);
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

    return (
        <>
            <div className={cn("relative flex items-center gap-3", sheet && "mt-2 rounded-control border border-line-strong bg-surface px-4")}>
                <input
                    ref={ref}
                    id={inputId}
                    type="text"
                    role="combobox"
                    aria-label={sheet ? label : undefined}
                    aria-autocomplete="list"
                    aria-expanded={shown}
                    aria-controls={listId}
                    aria-activedescendant={shown && activeIndex >= 0 ? `${uid}-o-${activeIndex}` : undefined}
                    aria-invalid={invalid || undefined}
                    aria-describedby={[errorId, status ? statusId : null].filter(Boolean).join(" ") || undefined}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="search"
                    placeholder={placeholder}
                    value={typed ?? value?.label ?? ""}
                    onChange={(e) => {
                        setTyped(e.target.value);
                        setActive(null);
                        setResolveError(false);
                        setOpen(true);
                    }}
                    onFocus={(e) => {
                        if (!sheet) {
                            setOpen(true);
                            e.currentTarget.select();
                        }
                    }}
                    onClick={() => setOpen(true)}
                    onBlur={() => {
                        if (sheet) return;
                        setOpen(false);
                        setTyped(null);
                        setActive(null);
                    }}
                    onKeyDown={onKeyDown}
                    className={cn(fieldInput, sheet ? "h-14 text-base" : "", inputClassName)}
                />
                {resolving || (search.loading && open) ? (
                    <LoaderCircle aria-hidden="true" strokeWidth={1.6} className="size-[18px] shrink-0 animate-spin text-fg-subtle motion-reduce:animate-none" />
                ) : null}
            </div>

            <div
                className={cn(
                    sheet
                        ? "mt-3 flex flex-col"
                        : "absolute left-0 top-full z-30 mt-3 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-line-strong bg-elevated",
                    !sheet && !shown && "hidden",
                    !sheet && listClassName,
                )}
            >
                {search.frequent && options.length > 0 ? (
                    <p className={cn("type-label px-4 pb-1 pt-3 text-fg-subtle", sheet && "px-0")} aria-hidden="true">
                        {t.frequent}
                    </p>
                ) : null}
                <ul
                    id={listId}
                    role="listbox"
                    aria-label={search.frequent ? t.frequent : t.listLabel}
                    className={cn("flex flex-col", !sheet && "max-h-[22rem] overflow-y-auto py-1.5")}
                >
                    {shown &&
                        options.map((o, i) => (
                            <li
                                key={o.id}
                                id={`${uid}-o-${i}`}
                                role="option"
                                aria-selected={i === activeIndex}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => void select(o)}
                                onMouseMove={() => active !== o.id && setActive(o.id)}
                                className={cn(
                                    "flex min-h-12 cursor-pointer items-center gap-3.5 px-4 py-2.5 transition-[background-color] duration-fast ease",
                                    sheet && "-mx-3 min-h-14 rounded-inner px-3",
                                    i === activeIndex && (sheet ? "bg-elevated" : "bg-surface"),
                                )}
                            >
                                <KindIcon kind={o.kind} className={o.kind === "airport" ? "text-brand-ink" : "text-fg-subtle"} />
                                <span className="flex min-w-0 flex-col">
                                    <span className="truncate text-[0.9375rem] font-medium">{o.main}</span>
                                    <span className="type-label truncate font-normal text-fg-subtle">
                                        {o.secondary ?? t.kinds[o.kind]}
                                    </span>
                                </span>
                            </li>
                        ))}
                </ul>
                <div
                    id={statusId}
                    role="status"
                    className={cn("type-label font-normal text-fg-subtle empty:hidden", sheet ? "py-3" : "px-4 pb-3 pt-1")}
                >
                    {shown ? status : null}
                </div>
                {shown && search.degraded && !search.loading ? (
                    <p className={cn("type-label border-t border-line font-normal text-fg-subtle", sheet ? "py-3" : "px-4 py-3")}>{t.degraded}</p>
                ) : null}
                {shown && search.attribution ? (
                    <p className={cn("type-label flex justify-end border-t border-line text-fg-subtle", sheet ? "py-3" : "px-4 py-2.5")}>
                        {t.attribution}
                    </p>
                ) : null}
            </div>
        </>
    );
}
