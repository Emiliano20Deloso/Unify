"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { CheckIcon, MailIcon } from "lucide-react";

export function LoginForm() {
    const searchParams = useSearchParams();
    const initialError = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [error, setError] = useState<string | null>(initialError);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus("sending");
        setError(null);

        const supabase = getBrowserSupabase();
        if (!supabase) {
            setError("El acceso no está configurado en este entorno.");
            setStatus("error");
            return;
        }
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                emailRedirectTo: `${siteUrl}/auth/callback?next=/admin`,
            },
        });

        if (error) {
            console.warn("[admin/login] signInWithOtp failed:", error);
            setError(error.message);
            setStatus("error");
            return;
        }

        setStatus("sent");
    };

    if (status === "sent") {
        return (
            <div className="rounded-2xl border border-[#FF2400]/25 bg-[#FF2400]/[0.06] px-6 py-7 text-center">
                <div className="size-12 rounded-full bg-[#FF2400]/15 border border-[#FF2400]/30 flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="size-5 text-[#FF2400]" />
                </div>
                <h2 className="text-base font-bold text-white">Revisa tu correo</h2>
                <p className="text-sm text-white/55 mt-2 leading-relaxed">
                    Te enviamos un link mágico a <span className="text-white/80">{email}</span>.
                    Ábrelo desde el mismo dispositivo para iniciar sesión.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs text-white/40" htmlFor="email">
                    Correo electrónico
                </label>
                <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-white/8 bg-white/[0.03] focus-within:border-[#FF2400]/35 transition-colors">
                    <MailIcon className="size-4 text-white/30 shrink-0" />
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="operador@unifyluxury.com"
                        autoComplete="email"
                        required
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                    />
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-200/90">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={status === "sending" || !email.trim()}
                className="w-full bg-[#FF2400] hover:bg-[#FF2400]/90 text-white rounded-full h-11 text-sm font-medium shadow-[0_0_20px_rgba(255,49,49,0.25)] disabled:opacity-40 disabled:shadow-none"
            >
                {status === "sending" ? "Enviando…" : "Enviar link mágico"}
            </Button>
        </form>
    );
}
