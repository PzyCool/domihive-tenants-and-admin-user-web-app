import { Eye } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const UnitCard = ({ unit }) => {
    const displayPropertyTitle = String(unit.propertyTitle || '')
        .replace(/^\s*\d+\s*bed(?:room)?\s*/i, '')
        .trim() || unit.propertyTitle || 'Property';

    const statusStyles = {
        occupied: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
        available: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
        reserved: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
        maintenance: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };

    return (
        <div
            key={unit.id}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden transition-colors"
        >
            <div className="relative h-40 w-full overflow-hidden">
                <img
                    src={unit.propertyImage}
                    alt={unit.propertyTitle}
                    className="w-full h-full object-cover"
                />

                <span
                    className={`absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full font-semibold ${statusStyles[unit.status] || "bg-gray-100 text-gray-700"
                        }`}
                >
                    {unit.status}
                </span>

                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

                <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-semibold text-white bg-black/40 px-2 py-1 rounded-md">
                        Unit {unit.unitNumber || "—"}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-[#0e1f42] dark:text-white text-sm">
                        {displayPropertyTitle}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {unit.propertyLocation}
                    </p>
                </div>

                {/* Tenant */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-3 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#9F7539] text-white flex items-center justify-center text-xs font-semibold">
                            {(unit.tenantName || "X")
                                .split(" ")
                                .slice(0, 2)
                                .map((w) => w[0])
                                .join("")}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-[#0e1f42] dark:text-white">
                                {unit.tenantName || "Vacant"}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {unit.tenantName
                                    ? "Current Tenant"
                                    : "No tenant assigned"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-[7fr_3fr] gap-3 pt-1">
                    <div className="rounded-xl border border-gray-100 dark:border-white/5 p-3 text-center">
                        <p className="text-sm font-semibold text-[#0e1f42] dark:text-white">
                            ₦{Number(unit.rent || 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Rent</p>
                    </div>

                    <div className="rounded-xl border border-gray-100 dark:border-white/5 p-3 text-center">
                        <p className="text-sm font-semibold text-[#0e1f42] dark:text-white">
                            {unit.bedrooms ?? "—"}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Beds</p>
                    </div>
                </div>

                {/* Actions */}
                <div className='w-full grid grid-cols-1 text-center'>
                    <Link to={`/admin/units/${unit.id}`} className="bg-[#9F7539] mt-2 w-full text-white text-xs flex items-center justify-center gap-2 font-semibold py-2 rounded-lg">
                        <Eye size={16} /> View Unit
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UnitCard;
