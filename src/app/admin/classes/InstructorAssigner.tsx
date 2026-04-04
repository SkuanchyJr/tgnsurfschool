"use client";

import { useState } from "react";
import { X, Loader2, Plus, Minus, UserCheck, UserX, LifeBuoy } from "lucide-react";
import { assignInstructor, removeInstructor, type ClassInstructor } from "../actions";

type Instructor = { id: string; name: string; email: string; role: string };

type Props = {
    classId: string;
    assignedInstructors: ClassInstructor[];
    allInstructors: Instructor[];
};

export default function InstructorAssigner({ classId, assignedInstructors, allInstructors }: Props) {
    const [instructors, setInstructors] = useState<ClassInstructor[]>(assignedInstructors);
    const [selectedId, setSelectedId] = useState("");
    const [loading, setLoading] = useState(false);

    const assignedIds = instructors.map(i => i.instructor_id);
    const availableInstructors = allInstructors.filter(i => !assignedIds.includes(i.id));

    const handleAssign = async () => {
        if (!selectedId) return;
        setLoading(true);
        const res = await assignInstructor(classId, selectedId);
        if (res.success) {
            const newInstructor = allInstructors.find(i => i.id === selectedId);
            if (newInstructor) {
                setInstructors(prev => [...prev, {
                    id: crypto.randomUUID(),
                    instructor_id: selectedId,
                    status: 'ASSIGNED',
                    instructor: { id: newInstructor.id, name: newInstructor.name, email: newInstructor.email }
                }]);
            }
            setSelectedId("");
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    const handleRemove = async (instructorId: string) => {
        setLoading(true);
        const res = await removeInstructor(classId, instructorId);
        if (res.success) {
            setInstructors(prev => prev.filter(i => i.instructor_id !== instructorId));
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        ASSIGNED: { label: 'Asignado', className: 'bg-blue-50 text-blue-700 border-blue-100', icon: <LifeBuoy size={12} /> },
        ACCEPTED: { label: 'Aceptado', className: 'bg-green-50 text-green-700 border-green-100', icon: <UserCheck size={12} /> },
        REJECTED: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-100', icon: <UserX size={12} /> },
    };

    return (
        <div className="pt-3 mt-3 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Monitores</p>

            {/* Assigned instructors list */}
            <div className="flex flex-wrap gap-2 mb-2">
                {instructors.length === 0 && (
                    <span className="text-xs text-gray-400 italic">Sin monitor asignado</span>
                )}
                {instructors.map(i => {
                    const cfg = statusConfig[i.status] || statusConfig.ASSIGNED;
                    return (
                        <div
                            key={i.instructor_id}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.className}`}
                        >
                            {cfg.icon}
                            <span>{i.instructor?.name || 'Monitor'}</span>
                            <span className="opacity-60">· {cfg.label}</span>
                            <button
                                onClick={() => handleRemove(i.instructor_id)}
                                disabled={loading}
                                className="ml-1 hover:opacity-70 transition-opacity"
                                title="Quitar monitor"
                            >
                                <X size={11} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Add instructor dropdown */}
            {availableInstructors.length > 0 && (
                <div className="flex items-center gap-2">
                    <select
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 flex-1 focus:outline-none focus:border-[#3F7FE3] bg-white"
                    >
                        <option value="">Añadir monitor...</option>
                        {availableInstructors.map(i => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedId || loading}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#3F7FE3] text-white rounded-lg disabled:opacity-40 hover:bg-[#2A5BA6] transition-colors font-bold"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                        Asignar
                    </button>
                </div>
            )}
            {availableInstructors.length === 0 && instructors.length > 0 && (
                <p className="text-xs text-gray-400 italic">Todos los monitores asignados</p>
            )}
        </div>
    );
}
