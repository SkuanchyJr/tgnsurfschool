import { createClient } from "@supabase/supabase-js";
import ClassesClientUI from "../classes/ClassesClientUI";
import { Package } from "lucide-react";

export const metadata = { title: "Servicios | Admin TGN Surf" };

export default async function AdminServicesPage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: services } = await supabase
        .from("services")
        .select("*")
        .order("type", { ascending: true });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3F7FE3]/10 text-[#3F7FE3] rounded-xl flex items-center justify-center">
                        <Package size={20} />
                    </div>
                    Catálogo de Servicios
                </h1>
                <p className="text-gray-500 font-medium">Gestiona los tipos de clase y actividad que aparecen en el calendario de reservas.</p>
            </header>
            <ClassesClientUI initialServices={services || []} />
        </div>
    );
}
