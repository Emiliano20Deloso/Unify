"use client";

import { useLanguage } from "@/contexts/language-context";
import { StarIcon } from "lucide-react";
import Container from "../global/container";

const AVATAR_COLORS = [
    "from-[#FF2400]/30 to-[#7f0000]/20",
    "from-white/10 to-white/5",
    "from-[#FF2400]/20 to-[#FF2400]/5",
    "from-white/8 to-white/3",
];

type Item = { name: string; text: string; rating: number };

const Testimonials = () => {
    const { t } = useLanguage();
    const items = t.testimonials.items;
    // Duplicate for seamless loop: animation goes from 0 to -50% (one full pass of the original set)
    const looped = [...items, ...items];

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-24">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#FF2400]/4 blur-[120px] rounded-full pointer-events-none" />

            <Container>
                <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto mb-14">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                        {t.testimonials.label}
                    </p>
                    <h2 className="text-3xl lg:text-5xl font-bold !leading-tight text-white">
                        {t.testimonials.title}{" "}
                        <span className="italic font-light text-white/50">{t.testimonials.titleHighlight}</span>
                    </h2>
                </div>
            </Container>

            {/* Marquee — fades at edges, pauses on hover */}
            <div
                className="relative w-full overflow-hidden"
                style={{
                    maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                }}
            >
                <div
                    className="flex gap-5 w-max animate-scroll-left hover:[animation-play-state:paused] py-2"
                    style={{ ["--duration" as string]: "50s" }}
                >
                    {looped.map((item, i) => (
                        <TestimonialCard
                            key={`${item.name}-${i}`}
                            item={item}
                            colorIdx={i % items.length}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const TestimonialCard = ({ item, colorIdx }: { item: Item; colorIdx: number }) => (
    <div className="relative flex flex-col gap-4 p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/15 transition-all duration-300 w-[340px] shrink-0 group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF2400]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Rating */}
        <div className="flex items-center gap-1.5">
            <StarRating rating={item.rating} />
            <span className="text-xs font-semibold text-white/70">{item.rating.toFixed(1)}</span>
        </div>

        {/* Quote */}
        <p className="text-sm text-white/80 leading-relaxed flex-1">
            &ldquo;{item.text}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <div className={`size-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center shrink-0`}>
                <span className="text-xs font-bold text-white/70">
                    {item.name.split(" ").map((w) => w[0]).join("")}
                </span>
            </div>
            <p className="text-sm font-semibold text-white">{item.name}</p>
        </div>
    </div>
);

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
            const fill = Math.max(0, Math.min(1, rating - i));
            if (fill === 1) {
                return <StarIcon key={i} className="size-3.5 text-[#FF2400] fill-[#FF2400]" />;
            }
            if (fill > 0) {
                return (
                    <div key={i} className="relative size-3.5">
                        <StarIcon className="absolute inset-0 size-3.5 text-[#FF2400]/30" />
                        <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                            <StarIcon className="size-3.5 text-[#FF2400] fill-[#FF2400]" />
                        </div>
                    </div>
                );
            }
            return <StarIcon key={i} className="size-3.5 text-[#FF2400]/30" />;
        })}
    </div>
);

export default Testimonials;
