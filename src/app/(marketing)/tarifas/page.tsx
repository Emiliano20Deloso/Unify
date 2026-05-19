"use client";

import { useLanguage } from "@/contexts/language-context";
import { WHATSAPP_LINK } from "@/constants";
import { ArrowRightIcon, MapPinIcon, ClockIcon, RouteIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/global/container";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

function LiveClock() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!time) return null;

    const hh = time.getHours().toString().padStart(2, "0");
    const mm = time.getMinutes().toString().padStart(2, "0");
    const ss = time.getSeconds().toString().padStart(2, "0");
    const date = time.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-end gap-1.5 tabular-nums">
                <span className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none">
                    {hh}<span className="text-[#FF2400] animate-pulse">:</span>{mm}
                </span>
                <span className="text-lg font-medium text-white/30 pb-0.5">{ss}</span>
            </div>
            <p className="text-xs text-white/35 capitalize">{date}</p>
        </div>
    );
}

const ROUTES = [
    {
        id: 1,
        from: "Polanco",
        to: "AICM",
        fromFull: "Polanco, CDMX",
        toFull: "Aeropuerto Internacional Ciudad de México",
        distance: "~25 km",
        time: "~35 min",
        image: "/images/Tarifas/Aero.jpg",
    },
    {
        id: 2,
        from: "Santa Fe",
        to: "Autódromo",
        fromFull: "Santa Fe, CDMX",
        toFull: "Autódromo Hermanos Rodríguez",
        distance: "~22 km",
        time: "~30 min",
        image: "/images/Tarifas/tari2.jpg",
    },
    {
        id: 3,
        from: "La Roma",
        to: "Tepoztlán",
        fromFull: "Colonia Roma, CDMX",
        toFull: "Tepoztlán, Morelos",
        distance: "~100 km",
        time: "~1h 30 min",
        image: "/images/Tarifas/tepoz.jpg",
    },
    {
        id: 4,
        from: "Lomas de Chapultepec",
        to: "Aeropuerto Toluca",
        fromFull: "Lomas de Chapultepec, CDMX",
        toFull: "Aeropuerto Internacional de Toluca",
        distance: "~75 km",
        time: "~1 hr",
        image: "/images/Tarifas/tari3.jpg",
    },
    {
        id: 5,
        from: "Condesa",
        to: "Perisur",
        fromFull: "Colonia Condesa, CDMX",
        toFull: "Centro Comercial Perisur",
        distance: "~15 km",
        time: "~25 min",
        image: "/images/Tarifas/tari4.jpg",
    },
];

export default function TarifasPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-black">

            {/* Header */}
            <div className="w-full px-6 md:px-12 lg:px-20 pt-36 pb-16">
                <Container>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                        <div className="flex flex-col gap-4 max-w-2xl">
                            <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                                {t.nav.tarifas}
                            </p>
                            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                                Rutas{" "}
                                <span className="italic font-light text-white/50">populares</span>
                            </h1>
                            <p className="text-white/45 text-base lg:text-lg max-w-lg leading-relaxed">
                                Cotizaciones orientativas para las rutas más solicitadas. El precio final depende del tráfico y hora del servicio.
                            </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-start sm:items-end gap-2 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/8">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-[#FF2400]/60 font-medium">Hora local · CDMX</p>
                            <LiveClock />
                        </div>
                    </div>
                </Container>
            </div>

            {/* Scrollable cards */}
            <div className="relative">
                {/* Fade right edge */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />

                <div
                    className="flex gap-5 overflow-x-auto px-6 md:px-12 lg:px-20 pb-10 scroll-smooth"
                    style={{
                        scrollSnapType: "x mandatory",
                        WebkitOverflowScrolling: "touch",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {ROUTES.map((route, idx) => (
                        <RouteCard key={route.id} route={route} idx={idx} ctaText={t.pricing.cta} />
                    ))}
                    {/* Spacer at end */}
                    <div className="shrink-0 w-4" />
                </div>
            </div>

            {/* Bottom CTA */}
            <Container>
                <div className="px-6 md:px-12 lg:px-20 pt-8 pb-24 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-white/5 mx-6 md:mx-12 lg:mx-20">
                    <div>
                        <p className="text-white font-medium">¿Tu ruta no está aquí?</p>
                        <p className="text-white/40 text-sm">Cotiza cualquier destino directamente por WhatsApp.</p>
                    </div>
                    <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="sm:ml-auto shrink-0">
                        <Button className="group bg-[#ff3131] hover:bg-[#ff3131]/90 text-white rounded-full px-6 h-11">
                            Cotizar mi ruta
                            <ArrowRightIcon className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </Button>
                    </Link>
                </div>
            </Container>
        </div>
    );
}

function RouteCard({ route, idx, ctaText }: {
    route: typeof ROUTES[0];
    idx: number;
    ctaText: string;
}) {
    return (
        <div
            className="shrink-0 w-[300px] sm:w-[340px] flex flex-col rounded-2xl bg-[#0a0a0a] border border-white/8 hover:border-[#FF2400]/30 overflow-hidden transition-all duration-300 group"
            style={{ scrollSnapAlign: "start" }}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={route.image}
                    alt={`${route.from} → ${route.to}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="340px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                {/* Route badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                    <RouteIcon className="size-3 text-[#FF2400]" />
                    <span className="text-xs text-white/80 font-medium">{route.from} → {route.to}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 p-5 flex-1">
                {/* Origin → Destination */}
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-2.5">
                        <div className="mt-1.5 flex flex-col items-center gap-1 shrink-0">
                            <div className="size-2 rounded-full bg-white/60" />
                            <div className="w-px h-6 bg-white/15" />
                            <div className="size-2 rounded-full bg-[#FF2400]" />
                        </div>
                        <div className="flex flex-col gap-2.5 flex-1">
                            <div>
                                <p className="text-[10px] text-white/30 uppercase tracking-wider">Origen</p>
                                <p className="text-sm font-medium text-white/80 leading-tight">{route.fromFull}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/30 uppercase tracking-wider">Destino</p>
                                <p className="text-sm font-medium text-white/80 leading-tight">{route.toFull}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distance + time */}
                <div className="flex items-center gap-4 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                        <MapPinIcon className="size-3.5 text-[#FF2400]/60" />
                        <span className="text-xs text-white/50">{route.distance}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="size-3.5 text-[#FF2400]/60" />
                        <span className="text-xs text-white/50">{route.time}</span>
                    </div>
                </div>

                {/* CTA */}
                <Link
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto"
                >
                    <Button
                        size="sm"
                        className="w-full bg-white/5 hover:bg-[#ff3131] text-white/70 hover:text-white border border-white/10 hover:border-[#ff3131] rounded-xl h-10 text-xs font-medium transition-all duration-300"
                    >
                        {ctaText}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
