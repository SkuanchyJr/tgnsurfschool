import { getAllInstructors } from "../actions";
import { Mail, Phone, LifeBuoy } from "lucide-react";

export const metadata = {
    title: "Monitores | Admin TGN Surf",
};

export default async function AdminInstructorsPage() {
    const instructors = await getAllInstructors();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-[#0F172A] font-fredoka leading-none mb-2">Plantilla de Monitores</h1>
                <p className="text-gray-500 font-medium">Gestión del equipo técnico de la escuela.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructors.map((instructor: any) => (
                    <div key={instructor.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 w-full h-1 bg-[#3F7FE3]" />
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3F7FE3] text-white flex items-center justify-center font-black text-3xl mb-4 group-hover:scale-110 transition-transform">
                            {instructor.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-xl font-bold text-[#0F172A] mb-1">{instructor.name}</h3>
                        <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs flex items-center justify-center gap-1 mb-4">
                            <LifeBuoy size={14} /> Monitor / Instructor
                        </span>

                        <div className="w-full space-y-2 mt-2 pt-4 border-t border-gray-100 text-sm">
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <Mail size={16} /> {instructor.email}
                            </div>
                            {instructor.phone ? (
                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                    <Phone size={16} /> {instructor.phone}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-gray-400 italic">
                                    <Phone size={16} /> Sin teléfono asignado
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {instructors.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-500 font-medium">No hay monitores registrados en el sistema. Asegúrate de que los usuarios tengan el 'role' INSTRUCTOR en Supabase.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
