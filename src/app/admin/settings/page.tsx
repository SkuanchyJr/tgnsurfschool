export const metadata = { title: "Ajustes | Admin TGN Surf" };

export default function AdminSettingsPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-black text-[#0F172A] font-fredoka mb-2">Configuración General</h1>
            <p className="text-gray-500 mb-8">Horarios de apertura globales, coordenadas de la escuela y reglas de negocio del sistema ERP.</p>
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center border-dashed">
                <p className="text-gray-400 font-bold">Módulo en Desarrollo (Fase 5B)</p>
            </div>
        </div>
    );
}
