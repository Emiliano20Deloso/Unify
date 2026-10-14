"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon, MapPinIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib";
import { PlaceAutocomplete, type PlaceResult } from "@/components/marketing/place-autocomplete";

type TierKey = "practico" | "select" | "premium";

interface QuoteDialogProps {
    trigger: React.ReactNode;
    initialTier?: TierKey;
}

interface FormData {
    origin: PlaceResult;
    destination: PlaceResult;
    date: string;
    time: string;
    passengers: number;
    luggage: number;
    tier: TierKey;
    notes: string;
    name: string;
    email: string;
    phone: string;
    corporate: boolean;
}

interface QuoteResponse {
    id: string;
    pricePreliminary: number | null;
    distanceKm: number | null;
    durationMin: number | null;
    needsManualQuote: boolean;
}

const buildClientReference = (id: string) =>
    `UF-${new Date().getFullYear()}-${id.slice(0, 8).toUpperCase()}`;

const TIER_LABELS: Record<TierKey, { es: string; en: string }> = {
    practico: { es: "Práctico", en: "Essential" },
    select: { es: "Select", en: "Select" },
    premium: { es: "Premium", en: "Premium" },
};

export const QuoteDialog = ({ trigger, initialTier = "select" }: QuoteDialogProps) => {
    const { t, lang } = useLanguage();
    const q = t.quote;

    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiResponse, setApiResponse] = useState<QuoteResponse | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>({
        origin: { text: "", lat: 0, lng: 0 },
        destination: { text: "", lat: 0, lng: 0 },
        date: "",
        time: "",
        passengers: 1,
        luggage: 0,
        tier: initialTier,
        notes: "",
        name: "",
        email: "",
        phone: "",
        corporate: false,
    });

    const set = (field: keyof FormData, value: unknown) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const canNext1 = form.origin.lat !== 0 && form.destination.lat !== 0 && form.date !== "" && form.time !== "";
    const canSubmit = form.name.trim() !== "" && form.email.trim() !== "";

    const handleSubmit = async () => {
        setSubmitting(true);
        setApiError(null);
        try {
            const [year, month, day] = form.date.split("-").map(Number);
            const [hour, minute] = form.time.split(":").map(Number);
            const pickupAt = new Date(year, month - 1, day, hour, minute).toISOString();

            const payload = {
                origin: form.origin.text,
                originLat: form.origin.lat || undefined,
                originLng: form.origin.lng || undefined,
                destination: form.destination.text,
                destinationLat: form.destination.lat || undefined,
                destinationLng: form.destination.lng || undefined,
                pickupAt,
                passengers: form.passengers,
                luggage: form.luggage,
                serviceLevel: form.tier,
                customerName: form.name.trim(),
                customerEmail: form.email.trim(),
                customerPhone: form.phone.trim() || undefined,
                isCorporate: form.corporate,
                notes: form.notes.trim() || undefined,
            };

            const resp = await fetch("/api/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const errBody = (await resp.json().catch(() => null)) as { error?: string } | null;
                console.warn("[QuoteDialog] API error:", resp.status, errBody);
                setApiError(q.errorGeneric);
                return;
            }

            const data = (await resp.json()) as QuoteResponse;
            setApiResponse(data);
            setSubmitted(true);
        } catch (e) {
            console.warn("[QuoteDialog] network error:", e);
            setApiError(q.errorNetwork);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenChange = (v: boolean) => {
        setOpen(v);
        if (!v) {
            setTimeout(() => {
                setStep(1);
                setSubmitted(false);
                setSubmitting(false);
                setApiResponse(null);
                setApiError(null);
            }, 300);
        }
    };

    const tiers: TierKey[] = ["practico", "select", "premium"];
    const langKey = lang === "es" ? "es" : "en";

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border border-white/10 text-white p-0 max-w-xl overflow-hidden gap-0">
                <DialogTitle className="sr-only">{q.title}</DialogTitle>

                {!submitted ? (
                    <>
                        {/* Header */}
                        <div className="px-7 pt-7 pb-5 border-b border-white/5">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium mb-1">
                                {q.title}
                            </p>
                            <p className="text-sm text-white/40">{q.subtitle}</p>

                            {/* Step progress */}
                            <div className="flex items-center gap-2 mt-5">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                                        <div className={cn(
                                            "flex items-center justify-center size-6 rounded-full text-xs font-bold shrink-0 transition-all duration-300",
                                            step > s
                                                ? "bg-[#FF2400] text-white"
                                                : step === s
                                                    ? "bg-[#FF2400]/15 border border-[#FF2400]/40 text-[#FF2400]"
                                                    : "bg-white/5 border border-white/10 text-white/25"
                                        )}>
                                            {step > s ? <CheckIcon className="size-3" /> : s}
                                        </div>
                                        <span className={cn(
                                            "text-xs hidden sm:block transition-colors duration-300",
                                            step === s ? "text-white/60" : "text-white/20"
                                        )}>
                                            {s === 1 ? q.step1 : s === 2 ? q.step2 : q.step3}
                                        </span>
                                        {s < 3 && (
                                            <div className={cn(
                                                "flex-1 h-px transition-colors duration-300",
                                                step > s ? "bg-[#FF2400]/40" : "bg-white/8"
                                            )} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-7 py-6 space-y-4 min-h-[272px]">

                            {step === 1 && (
                                <>
                                    <PlaceAutocomplete
                                        value={form.origin}
                                        onChange={result => set("origin", result)}
                                        label={q.origin}
                                        placeholder={q.originPlaceholder}
                                        icon={<MapPinIcon className="size-4 text-white/30 shrink-0" />}
                                    />
                                    <PlaceAutocomplete
                                        value={form.destination}
                                        onChange={result => set("destination", result)}
                                        label={q.destination}
                                        placeholder={q.destinationPlaceholder}
                                        icon={<MapPinIcon className="size-4 text-[#FF2400]/60 shrink-0" />}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldWrap icon={<CalendarIcon className="size-4 text-white/30 shrink-0" />} label={q.date}>
                                            <input
                                                type="date"
                                                value={form.date}
                                                onChange={e => set("date", e.target.value)}
                                                min={new Date().toISOString().split("T")[0]}
                                                className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                                            />
                                        </FieldWrap>
                                        <FieldWrap icon={<ClockIcon className="size-4 text-white/30 shrink-0" />} label={q.time}>
                                            <input
                                                type="time"
                                                value={form.time}
                                                onChange={e => set("time", e.target.value)}
                                                className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                                            />
                                        </FieldWrap>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-white/40 block mb-2">{q.passengers}</label>
                                            <Stepper value={form.passengers} min={1} max={10} onChange={v => set("passengers", v)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-white/40 block mb-2">{q.luggage}</label>
                                            <Stepper value={form.luggage} min={0} max={10} onChange={v => set("luggage", v)} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-white/40 block mb-2">{q.serviceLevel}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {tiers.map(key => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => set("tier", key)}
                                                    className={cn(
                                                        "py-3 px-2 rounded-xl border text-xs font-medium transition-all duration-200 text-center",
                                                        form.tier === key
                                                            ? "border-[#FF2400]/60 bg-[#FF2400]/10 text-[#FF2400]"
                                                            : "border-white/8 bg-white/3 text-white/50 hover:border-white/20 hover:text-white/75"
                                                    )}
                                                >
                                                    {TIER_LABELS[key][langKey]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <FieldWrap label={q.notes}>
                                        <textarea
                                            value={form.notes}
                                            onChange={e => set("notes", e.target.value)}
                                            placeholder={q.notesPlaceholder}
                                            rows={2}
                                            className="w-full bg-transparent text-sm text-white placeholder:text-white/25 outline-none resize-none"
                                        />
                                    </FieldWrap>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <FieldWrap label={q.name}>
                                        <input
                                            value={form.name}
                                            onChange={e => set("name", e.target.value)}
                                            placeholder="Ej. Ana García"
                                            className="w-full bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                                        />
                                    </FieldWrap>
                                    <FieldWrap label={q.email}>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => set("email", e.target.value)}
                                            placeholder="tu@correo.com"
                                            className="w-full bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                                        />
                                    </FieldWrap>
                                    <FieldWrap label={q.phone}>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => set("phone", e.target.value)}
                                            placeholder="+52 55 0000 0000"
                                            className="w-full bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                                        />
                                    </FieldWrap>
                                    <button
                                        type="button"
                                        onClick={() => set("corporate", !form.corporate)}
                                        className="flex items-center gap-3 cursor-pointer mt-1 group"
                                    >
                                        <div className={cn(
                                            "size-5 rounded border flex items-center justify-center transition-all duration-200 shrink-0",
                                            form.corporate
                                                ? "border-[#FF2400] bg-[#FF2400]/20"
                                                : "border-white/20 bg-white/5 group-hover:border-white/35"
                                        )}>
                                            {form.corporate && <CheckIcon className="size-3 text-[#FF2400]" />}
                                        </div>
                                        <span className="text-sm text-white/55 group-hover:text-white/75 transition-colors">
                                            {q.corporate}
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Error inline */}
                        {apiError && step === 3 && (
                            <div className="mx-7 mb-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-200/90">
                                {apiError}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-7 pb-7 pt-5 flex items-center justify-between gap-3 border-t border-white/5">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(s => s - 1)}
                                    className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/65 transition-colors"
                                >
                                    <ArrowLeftIcon className="size-3.5" />
                                    {q.back}
                                </button>
                            ) : <div />}

                            {step < 3 ? (
                                <Button
                                    onClick={() => setStep(s => s + 1)}
                                    disabled={step === 1 && !canNext1}
                                    className="bg-[#FF2400] hover:bg-[#FF2400]/90 text-white rounded-full px-7 h-10 text-sm font-medium shadow-[0_0_20px_rgba(255,49,49,0.3)] disabled:opacity-30 disabled:shadow-none"
                                >
                                    {q.next}
                                    <ArrowRightIcon className="ml-2 size-3.5" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || submitting}
                                    className="bg-[#FF2400] hover:bg-[#FF2400]/90 text-white rounded-full px-7 h-10 text-sm font-medium shadow-[0_0_20px_rgba(255,49,49,0.3)] disabled:opacity-30 disabled:shadow-none"
                                >
                                    {submitting ? q.submitting : q.submit}
                                    {!submitting && <ArrowRightIcon className="ml-2 size-3.5" />}
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    /* Success state — thank-you. La propuesta oficial se envía por email tras aprobación del admin. */
                    <div className="flex flex-col items-center py-14 px-8 text-center gap-4">
                        <div className="size-16 rounded-full bg-[#FF2400]/15 border border-[#FF2400]/30 flex items-center justify-center mb-1">
                            <CheckIcon className="size-7 text-[#FF2400]" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{q.successTitle}</h3>
                        <p className="text-sm text-white/55 max-w-sm leading-relaxed">{q.successDesc}</p>
                        <p className="text-xs text-white/35">{q.successSub}</p>
                        {apiResponse && (
                            <p className="text-[11px] text-white/30 font-mono mt-2">
                                {q.successRefLabel}: {buildClientReference(apiResponse.id)}
                            </p>
                        )}
                        <Button
                            onClick={() => handleOpenChange(false)}
                            className="mt-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full px-8 h-10 text-sm"
                        >
                            {q.successClose}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

const FieldWrap = ({
    label,
    icon,
    children,
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <label className="text-xs text-white/40">{label}</label>
        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-white/8 bg-white/[0.03] focus-within:border-[#FF2400]/35 transition-colors duration-200">
            {icon}
            {children}
        </div>
    </div>
);

const Stepper = ({
    value,
    min,
    max,
    onChange,
}: {
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}) => (
    <div className="flex items-center rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden h-11">
        <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="flex-1 h-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 text-xl font-light select-none"
        >
            −
        </button>
        <span className="w-10 text-center text-sm font-bold text-white select-none">{value}</span>
        <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            className="flex-1 h-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 text-xl font-light select-none"
        >
            +
        </button>
    </div>
);

