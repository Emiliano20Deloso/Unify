"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPinIcon } from "lucide-react";
import { cn } from "@/lib";
import { loadPlacesLibrary } from "@/lib/maps-loader";

export interface PlaceResult {
    text: string;
    lat: number;
    lng: number;
}

interface Prediction {
    placeId: string;
    description: string;
}

interface Props {
    value: PlaceResult;
    onChange: (result: PlaceResult) => void;
    label: string;
    placeholder?: string;
    icon?: React.ReactNode;
}

export function PlaceAutocomplete({ value, onChange, label, placeholder, icon }: Props) {
    const [input, setInput] = useState(value.text);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesRef = useRef<google.maps.places.PlacesService | null>(null);
    const dummyRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        loadPlacesLibrary().then(places => {
            autocompleteRef.current = new places.AutocompleteService();
            if (dummyRef.current) {
                placesRef.current = new places.PlacesService(dummyRef.current);
            }
        });
    }, []);

    const fetchPredictions = useCallback((text: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!text || text.length < 2) {
            setPredictions([]);
            setOpen(false);
            return;
        }

        debounceRef.current = setTimeout(() => {
            if (!autocompleteRef.current) return;
            setLoading(true);
            autocompleteRef.current.getPlacePredictions(
                { input: text, componentRestrictions: { country: "mx" } },
                (results, status) => {
                    setLoading(false);
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        setPredictions(
                            results.map(r => ({ placeId: r.place_id, description: r.description }))
                        );
                        setOpen(true);
                    } else {
                        setPredictions([]);
                    }
                }
            );
        }, 300);
    }, []);

    const handleSelect = (pred: Prediction) => {
        setInput(pred.description);
        setPredictions([]);
        setOpen(false);

        if (!placesRef.current) return;
        placesRef.current.getDetails(
            { placeId: pred.placeId, fields: ["geometry"] },
            (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                    onChange({
                        text: pred.description,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    });
                }
            }
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setInput(v);
        if (!v) onChange({ text: "", lat: 0, lng: 0 });
        else fetchPredictions(v);
    };

    const isConfirmed = value.lat !== 0;

    return (
        <div className="space-y-1.5">
            <label className="text-xs text-white/40">{label}</label>
            <div ref={dummyRef} className="hidden" />
            <div className="relative">
                <div className={cn(
                    "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border bg-white/[0.03] transition-colors duration-200",
                    open
                        ? "border-[#FF2400]/35"
                        : isConfirmed
                            ? "border-white/20 focus-within:border-[#FF2400]/35"
                            : "border-white/8 focus-within:border-[#FF2400]/35"
                )}>
                    {icon}
                    <input
                        value={input}
                        onChange={handleChange}
                        onFocus={() => predictions.length > 0 && setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                        placeholder={placeholder}
                        autoComplete="off"
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                    />
                    {loading && (
                        <div className="size-3.5 border border-t-white/50 border-white/10 rounded-full animate-spin shrink-0" />
                    )}
                </div>

                {open && predictions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1.5 bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                        {predictions.map((p, i) => (
                            <button
                                key={p.placeId}
                                type="button"
                                onMouseDown={() => handleSelect(p)}
                                className={cn(
                                    "w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-white/5 transition-colors",
                                    i < predictions.length - 1 && "border-b border-white/5"
                                )}
                            >
                                <MapPinIcon className="size-3.5 text-[#FF2400]/60 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/70 leading-snug">{p.description}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
