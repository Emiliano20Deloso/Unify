import { Suspense } from "react";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { LoginForm } from "./_components/login-form";

export default function AdminLoginPage() {
    const configured = isSupabaseConfigured();

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <div className="mb-10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-[#FF2400]/70 font-medium mb-3">
                        Unify · Admin
                    </p>
                    <h1 className="text-2xl font-bold text-white">Panel del operador</h1>
                    <p className="text-sm text-white/40 mt-2">
                        Accede con tu correo autorizado.
                    </p>
                </div>

                {configured ? (
                    <Suspense fallback={null}>
                        <LoginForm />
                    </Suspense>
                ) : (
                    <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/60 text-center">
                        El acceso al panel no está configurado en este entorno.
                    </div>
                )}

                <p className="text-[11px] text-white/25 text-center mt-10 leading-relaxed">
                    Solo correos autorizados pueden acceder.
                    <br />
                    Si no tienes acceso, contacta al administrador.
                </p>
            </div>
        </div>
    );
}
