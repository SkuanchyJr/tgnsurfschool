import { AlertTriangle, Users, LifeBuoy, CheckCircle2 } from "lucide-react";

/** Instructors needed = ceil(students / 7), 0 students = 0 needed */
export function requiredInstructors(totalPax: number): number {
    return totalPax === 0 ? 0 : Math.ceil(totalPax / 7);
}

type Props = {
    maxCapacity: number;
    totalPax: number;
    assignedInstructors: number;
};

export default function CapacityWidget({ maxCapacity, totalPax, assignedInstructors }: Props) {
    const needed = requiredInstructors(totalPax);
    const pct = maxCapacity > 0 ? Math.min((totalPax / maxCapacity) * 100, 100) : 0;
    const isOverCapacity = totalPax > maxCapacity;
    const isUnderstaffed = totalPax > 0 && assignedInstructors < needed;
    const isFull = totalPax === maxCapacity;

    let barColor = "bg-green-500";
    if (isOverCapacity) barColor = "bg-red-500";
    else if (pct >= 80) barColor = "bg-amber-500";
    else if (pct >= 50) barColor = "bg-emerald-500";

    let staffStatus: React.ReactNode = null;
    if (totalPax === 0) {
        staffStatus = null;
    } else if (isUnderstaffed) {
        staffStatus = (
            <span className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                <AlertTriangle size={12} />
                {assignedInstructors}/{needed} monitores
            </span>
        );
    } else {
        staffStatus = (
            <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                <CheckCircle2 size={12} />
                {assignedInstructors}/{needed} monitores
            </span>
        );
    }

    return (
        <div className="flex flex-col gap-1.5 min-w-[140px]">
            {/* Student count */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users size={12} />
                    <span className="font-bold text-gray-900">
                        {totalPax}<span className="font-normal text-gray-400">/{maxCapacity}</span>
                    </span>
                    <span className="text-gray-400">alumnos</span>
                </div>
                {isFull && !isOverCapacity && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">Lleno</span>
                )}
                {isOverCapacity && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">Exceso</span>
                )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Instructor ratio */}
            {staffStatus}
        </div>
    );
}
