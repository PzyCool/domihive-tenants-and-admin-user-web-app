import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../../../context/AdminContext";
import { Download, Eye } from "lucide-react";

const AdminClientPortfolio = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, properties } = useAdmin();
  const client = clients.find((c) => c.id === clientId);
  const [tab, setTab] = useState("all");

  const portfolio = properties.slice(0, 2);

  const stats = useMemo(() => {
    const totalProperties = portfolio.length;
    const totalUnits = portfolio.reduce((acc, p) => acc + (p.units?.length || 0), 0);
    const occupied = portfolio.reduce((acc, p) => acc + (p.units?.filter((u) => u.status === "occupied").length || 0), 0);
    const maintenance = portfolio.reduce((acc, p) => acc + (p.units?.filter((u) => u.status === "maintenance").length || 0), 0);
    const available = totalUnits - occupied - maintenance;
    const occupancy = totalUnits ? Math.round((occupied / totalUnits) * 1000) / 10 : 0;
    return { totalProperties, totalUnits, occupied, available, maintenance, occupancy };
  }, [portfolio]);

  const filtered = useMemo(() => {
    if (tab === "all") return portfolio;
    if (tab === "full") return portfolio.filter((p) => {
      const total = p.units?.length || 0;
      const occ = p.units?.filter((u) => u.status === "occupied").length || 0;
      return total > 0 && occ === total;
    });
    if (tab === "partial") return portfolio.filter((p) => {
      const total = p.units?.length || 0;
      const occ = p.units?.filter((u) => u.status === "occupied").length || 0;
      return occ > 0 && occ < total;
    });
    if (tab === "vacant") return portfolio.filter((p) => {
      const occ = p.units?.filter((u) => u.status === "occupied").length || 0;
      return occ === 0;
    });
    return portfolio;
  }, [tab, portfolio]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <Link to="/admin/clients" className="hover:text-[#9F7539]">Clients</Link>
          <span className="px-1">&gt;</span>
          <Link to={`/admin/clients/${clientId}`} className="hover:text-[#9F7539]">
            {client?.name || "Client"}
          </Link>
          <span className="px-1">&gt;</span>
          <span>Portfolio View</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
          <div>
            <h1 className="text-lg font-semibold text-[#0e1f42] dark:text-white">
              {client?.name || "Client"} - Portfolio
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Full management client with {stats.totalProperties} properties across Lagos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 text-xs border border-gray-200 dark:border-white/10 rounded-md text-gray-600 dark:text-gray-200 bg-white dark:bg-[#0f172a]">
              <Download size={14} /> Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Total Properties</div>
          <div className="text-xl font-semibold text-[#0e1f42] dark:text-white">{stats.totalProperties}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Total Units</div>
          <div className="text-xl font-semibold text-[#0e1f42] dark:text-white">{stats.totalUnits}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Occupied</div>
          <div className="text-xl font-semibold text-green-600">{stats.occupied}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Available</div>
          <div className="text-xl font-semibold text-sky-600">{stats.available}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Under Maintenance</div>
          <div className="text-xl font-semibold text-amber-600">{stats.maintenance}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Overall Occupancy Rate</div>
          <div className="text-xl font-semibold text-green-600">{stats.occupancy}%</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0e1f42] dark:text-white">Properties</h2>
        <div className="flex items-center gap-4 text-xs">
          {[
            { key: "all", label: "All Properties" },
            { key: "full", label: "Fully Occupied Properties" },
            { key: "partial", label: "Partially Occupied Properties" },
            { key: "vacant", label: "No Occupancy" }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-2 border-b-2 ${tab === t.key ? "border-[#9F7539] text-[#9F7539]" : "border-transparent text-gray-500 dark:text-gray-400"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((prop) => {
          const totalUnits = prop.units?.length || 0;
          const occ = prop.units?.filter((u) => u.status === "occupied").length || 0;
          const avail = prop.units?.filter((u) => u.status === "available").length || 0;
          const maint = prop.units?.filter((u) => u.status === "maintenance").length || 0;
          const occPct = totalUnits ? Math.round((occ / totalUnits) * 100) : 0;
          return (
            <div key={prop.id} className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
              <img src={prop.image} alt={prop.title} className="h-44 w-full object-cover" />
              <div className="p-4 space-y-2">
                <div className="font-semibold text-[#0e1f42] dark:text-white">{prop.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{prop.address || prop.location}, {prop.area}</div>
                <div className="grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400 pt-3 gap-y-2">
                  <div><div className="font-semibold text-[#0e1f42] dark:text-white">{totalUnits}</div>Total Units</div>
                  <div><div className="font-semibold text-[#0e1f42] dark:text-white">{occ}</div>Occupied</div>
                  <div><div className="font-semibold text-[#0e1f42] dark:text-white">₦{Math.round((prop.rent || 0) / 10000) * 10}k</div>Monthly Revenue</div>
                </div>
                <div className="pt-2 text-[10px] text-gray-500 dark:text-gray-400">Unit Breakdown</div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden flex">
                  <div className="bg-green-500" style={{ width: `${occPct}%` }} />
                  <div className="bg-amber-500" style={{ width: `${totalUnits ? (maint / totalUnits) * 100 : 0}%` }} />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] text-green-600">{occ} Occupied</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">{avail} Available</div>
                  <div className="text-[10px] text-amber-600">{maint} Maintenance</div>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">{occPct}% Occupied</span>
                  <button
                    className="text-[#9F7539] hover:text-[#7a5a2c]"
                    aria-label="View property details"
                    onClick={() => navigate(`/admin/properties/${prop.id}`)}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminClientPortfolio;

