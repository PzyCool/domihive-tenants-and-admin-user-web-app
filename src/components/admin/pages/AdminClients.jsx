import React, { useMemo, useState } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { AlertTriangle, Eye, Pencil, Plus, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const statusStyles = {
  Active: "bg-green-100 text-green-700",
  "Expires Soon": "bg-amber-100 text-amber-700",
  Expired: "bg-red-100 text-red-700"
};

const AdminClients = () => {
  const { clients, properties } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");

  const clientsWithLiveStats = useMemo(() => {
    return clients.map((client) => {
      const linkedProperties = properties.filter((property) => property.clientId === client.id);
      const totalProperties = linkedProperties.length;
      const totalUnits = linkedProperties.reduce(
        (sum, property) => sum + (property.units?.length || 0),
        0
      );
      const occupiedUnits = linkedProperties.reduce(
        (sum, property) =>
          sum +
          (property.units?.filter((unit) => String(unit.status || "").toLowerCase() === "occupied")
            .length || 0),
        0
      );
      const occupancyPct = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      return {
        ...client,
        totalPropertiesLive: totalProperties,
        totalUnitsLive: totalUnits,
        occupiedUnitsLive: occupiedUnits,
        occupancyPctLive: occupancyPct,
        pendingPropertyAssignmentLive: totalProperties === 0,
        noUnitsLinkedYetLive: totalProperties > 0 && totalUnits === 0,
      };
    });
  }, [clients, properties]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clientsWithLiveStats.filter((c) => {
      const matchesStatus = statusFilter === "All" || c.contractStatus === statusFilter;
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [clientsWithLiveStats, statusFilter, query]);

  return (
    <div className="space-y-5">
      {location.state?.infoBanner && (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm">
          <AlertTriangle size={15} />
          {location.state.infoBanner}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0e1f42] dark:text-white">Client Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage all property owner clients and their contracts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/clients/contracts")}
            className="inline-flex items-center gap-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-200 text-sm px-4 py-2 rounded-md shadow-sm"
          >
            <Eye size={16} />
            View All Contracts
          </button>
          <button
            onClick={() => navigate("/admin/clients/contracts/new")}
            className="inline-flex items-center gap-2 bg-[var(--accent-color,#9F7539)] text-white text-sm px-4 py-2 rounded-md shadow-sm"
          >
            <Plus size={16} />
            Create New Contracts
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500">Contract Status:</label>
            <select
              className="border border-gray-200 dark:border-white/10 dark:bg-[#0f172a] rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Active</option>
              <option>Expires Soon</option>
              <option>Expired</option>
            </select>
          </div>
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f172a] rounded-md pl-9 pr-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#0f172a] text-gray-600 dark:text-gray-300">
              <tr>
                <th className="text-left font-medium px-5 py-3">Client Name</th>
                <th className="text-left font-medium px-5 py-3">Contact</th>
                <th className="text-left font-medium px-5 py-3">Total Properties</th>
                <th className="text-left font-medium px-5 py-3">Occupied Units</th>
                <th className="text-left font-medium px-5 py-3">Contract Status</th>
                <th className="text-left font-medium px-5 py-3">Management Fee</th>
                <th className="text-left font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-gray-100 dark:border-white/10 hover:bg-gray-50/60 dark:hover:bg-white/5"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="h-9 w-9 rounded-full object-cover border border-white/50"
                      />
                      <div>
                        <div className="font-semibold text-[#0e1f42] dark:text-white">{client.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Client since {client.clientSince}</div>
                        {client.pendingPropertyAssignmentLive && (
                          <div className="text-[11px] mt-1 text-amber-700 dark:text-amber-300 inline-flex items-center gap-1">
                            <AlertTriangle size={12} />
                            {client.pendingPropertyAssignmentNote || "Pending: create a property for this client and link it"}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gray-700 dark:text-gray-200">{client.email}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{client.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-200">{client.totalPropertiesLive}</td>
                  <td className="px-5 py-4">
                    {client.noUnitsLinkedYetLive ? (
                      <>
                        <div className="text-amber-700 dark:text-amber-300 text-xs font-medium">
                          No units added
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Please add units to this client property
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-gray-700 dark:text-gray-200">
                          {client.occupiedUnitsLive}/{client.totalUnitsLive}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {client.occupancyPctLive}% occupied
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusStyles[client.contractStatus] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {client.contractStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gray-700 dark:text-gray-200">{client.managementFeePercent}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{client.managementFeeValue}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <button className="hover:text-[#9F7539]" aria-label="View" onClick={(e) => { e.stopPropagation(); navigate(`/admin/clients/${client.id}`); }}>
                        <Eye size={16} />
                      </button>
                      <button className="hover:text-[#9F7539]" aria-label="Edit" onClick={(e) => e.stopPropagation()}>
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Showing 1-{filtered.length} of {clientsWithLiveStats.length} clients</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-md text-gray-500 dark:text-gray-300">Previous</button>
            <button className="px-3 py-1 rounded-md bg-[#9F7539] text-white">1</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-md text-gray-500 dark:text-gray-300">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClients;

