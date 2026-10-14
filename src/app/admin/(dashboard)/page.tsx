export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Solicitudes</h1>
                <p className="text-sm text-white/40 mt-1">
                    Cotizaciones recibidas desde el sitio.
                </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-8 py-14 text-center">
                <p className="text-sm text-white/50">
                    La tabla se construye en el siguiente paso. Por ahora, estás autenticado como admin ✓
                </p>
            </div>
        </div>
    );
}
