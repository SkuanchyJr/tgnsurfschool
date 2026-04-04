"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { createService, updateService, deleteService } from "../actions";
import { useRouter } from "next/navigation";

type ServiceType = {
    id: string;
    title: string;
    type: string;
    description: string | null;
    price: number;
};

export default function ClassesClientUI({ initialServices }: { initialServices: ServiceType[] }) {
    const [services, setServices] = useState<ServiceType[]>(initialServices);
    const [isEditingId, setIsEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Sync state when initialServices change (server refresh)
    useEffect(() => {
        setServices(initialServices);
    }, [initialServices]);

    // Form states
    const [title, setTitle] = useState("");
    const [type, setType] = useState("SURF");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("0");

    const resetForm = () => {
        setTitle("");
        setType("SURF");
        setDescription("");
        setPrice("0");
        setIsCreating(false);
        setIsEditingId(null);
    };

    const handleEditStart = (service: ServiceType) => {
        setIsEditingId(service.id);
        setIsCreating(false);
        setTitle(service.title);
        setType(service.type);
        setDescription(service.description || "");
        setPrice(service.price.toString());
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert("El título es obligatorio");
            return;
        }

        setLoading(true);
        const data = { title, type, description, price: parseFloat(price) || 0 };

        try {
            let res;
            if (isEditingId) {
                res = await updateService(isEditingId, data);
            } else {
                res = await createService(data);
            }

            if (res.success) {
                resetForm();
                router.refresh();
            } else {
                alert(res.error || "Error al guardar el servicio");
            }
        } catch (err: any) {
            alert("Error de conexión: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que quieres borrar este servicio?")) return;
        setLoading(true);
        const res = await deleteService(id);
        if (res.success) {
            setServices(prev => prev.filter(s => s.id !== id));
            router.refresh();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Action Bar */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-[#0F172A]">Catálogo de Servicios</h2>
                {!isCreating && !isEditingId && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-[#3F7FE3] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1E3A8A] transition-colors"
                    >
                        <Plus size={16} /> Nuevo Servicio
                    </button>
                )}
            </div>

            {/* Form Area */}
            {(isCreating || isEditingId) && (
                <div className="p-6 bg-blue-50/30 border-b border-blue-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Título</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#3F7FE3] outline-none" placeholder="Clase de Surf Adultos" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#3F7FE3] outline-none bg-white">
                            <option value="SURF">SURF</option>
                            <option value="RENTAL">RENTAL</option>
                            <option value="BONO">BONO</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Precio (€)</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#3F7FE3] outline-none" min="0" step="0.5" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={loading} className="flex-1 bg-green-600 text-white p-2 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-green-700 disabled:opacity-50">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        </button>
                        <button onClick={resetForm} disabled={loading} className="flex-1 bg-gray-200 text-gray-700 p-2 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-gray-300 disabled:opacity-50">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="lg:col-span-5">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Descripción</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#3F7FE3] outline-none h-16" placeholder="Detalles de la clase..."></textarea>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Servicio</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold text-[#0F172A]">{service.title}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{service.description || "Sin descripción"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{service.type}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-black text-[#3F7FE3]">
                                    {service.price}€
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEditStart(service)} className="p-2 text-gray-400 hover:text-[#3F7FE3] transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(service.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {services.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">No hay servicios creados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
