import React from 'react';
import { Building, House } from 'lucide-react';

const PropertySummaryCards = ({ properties, allUnits }) => {
    const totalUnits = allUnits.length;
    const availableUnits = allUnits.filter((u) => u.status === "available").length;
    const occupiedUnits = allUnits.filter((u) => u.status === "occupied").length;
    const occupancyRate = totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100);

    const stats = [
        {
            label: "Total Properties",
            value: properties.length,
            meta: `${properties.length} properties`,
            icon: <Building size={20} />,
            color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        },
        {
            label: "Total Units",
            value: totalUnits,
            meta: `${availableUnits} available units`,
            icon: <House size={20} />,
            color: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
        },
        {
            label: "Occupied Units",
            value: occupiedUnits,
            meta: `${occupiedUnits} occupied units`,
            icon: <House size={20} />,
            color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
        },
        {
            label: "Occupancy Rate",
            value: `${occupancyRate}%`,
            meta: `${occupancyRate}% occupied`,
            icon: <House size={20} />,
            color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 md:gap-4 gap-2 mb-8">
            {stats.map((card) => (
                <div
                    key={card.label}
                    className="bg-white dark:bg-[#111827] rounded-lg p-4 shadow border border-gray-100 dark:border-white/5 flex items-center justify-between transition-colors"
                >
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{card.label}</div>
                        <div className="text-2xl font-bold text-[#0e1f42] dark:text-white">{card.value}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{card.meta}</div>
                    </div>
                    <div className={`${card.color} rounded-lg p-2 shrink-0`}>
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PropertySummaryCards;