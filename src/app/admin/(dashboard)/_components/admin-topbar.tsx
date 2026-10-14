"use client";

import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

interface Props {
    email: string;
}

export function AdminTopbar({ email }: Props) {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = getBrowserSupabase();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <header className="border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#FF2400]/70 font-bold">
                        Unify
                    </p>
                    <span className="text-white/20 text-xs">·</span>
                    <p className="text-sm text-white/70 font-medium">Panel del operador</p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-xs text-white/40 hidden sm:block">{email}</p>
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        size="sm"
                        className="text-white/50 hover:text-white hover:bg-white/5 h-8 px-3 text-xs"
                    >
                        <LogOutIcon className="size-3.5 mr-1.5" />
                        Salir
                    </Button>
                </div>
            </div>
        </header>
    );
}
