import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/supabase-server";
import { AdminTopbar } from "./_components/admin-topbar";

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAdmin } = await getAdminContext();

    if (!user) {
        redirect("/admin/login");
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 text-center">
                <div className="max-w-md">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-red-400/80 font-medium mb-3">
                        Acceso denegado
                    </p>
                    <h1 className="text-2xl font-bold text-white">No eres administrador</h1>
                    <p className="text-sm text-white/50 mt-3 leading-relaxed">
                        Tu cuenta ({user.email}) no tiene permisos para ver este panel.
                        Contacta al administrador si necesitas acceso.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <AdminTopbar email={user.email ?? ""} />
            <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
        </div>
    );
}
