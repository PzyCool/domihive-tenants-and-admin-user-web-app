import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../../../context/AdminContext";

export default function AdminContracts() {
  const { clients } = useAdmin();

  const contracts = useMemo(
    () =>
      clients.map((client, index) => ({
        id: `CTR-${String(index + 1).padStart(3, "0")}`,
        clientId: client.id,
        clientName: client.name,
        type: client.contractType || "Full Management",
        duration: client.contractDuration || "Not set",
        status: client.contractStatus || "Draft",
        fee: `${client.managementFeePercent ?? 10}% of rent`,
      })),
    [clients]
  );

  const statusClass = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized.includes("active")) return "bg-green-100 text-green-700";
    if (normalized.includes("expire")) return "bg-amber-100 text-amber-700";
    if (normalized.includes("expired") || normalized.includes("terminated")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0e1f42] dark:text-white">Contracts</h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Client contract registry for managed properties
        </p>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="text-left p-3">Contract ID</th>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Duration</th>
                <th className="text-left p-3">Fee</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="border-t border-gray-100 dark:border-white/5 text-[#0e1f42] dark:text-white"
                >
                  <td className="p-3 font-semibold">{contract.id}</td>
                  <td className="p-3">{contract.clientName}</td>
                  <td className="p-3">{contract.type}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{contract.duration}</td>
                  <td className="p-3">{contract.fee}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full ${statusClass(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/admin/clients/${contract.clientId}`}
                      className="text-[#9F7539] font-semibold text-xs hover:underline"
                    >
                      View Client
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

