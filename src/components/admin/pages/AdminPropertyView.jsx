import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Eye } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";

export default function AdminPropertyView() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { properties, clients, tenants } = useAdmin();

  const property = properties.find((item) => item.id === propertyId);

  const details = useMemo(() => {
    if (!property) return null;
    const owner = clients.find((client) => client.id === property.clientId);
    const units = property.units || [];
    const occupied = units.filter((unit) => String(unit.status || "").toLowerCase() === "occupied").length;
    const available = units.filter((unit) =>
      ["available", "vacant"].includes(String(unit.status || "").toLowerCase())
    ).length;
    const maintenance = units.filter((unit) => String(unit.status || "").toLowerCase() === "maintenance").length;
    const occupancyRate = units.length ? Math.round((occupied / units.length) * 100) : 0;

    const tenantsCount = tenants.filter((tenant) => tenant.propertyId === property.id).length;

    return {
      ownerName: owner?.name || "Unassigned client",
      contractLength: owner?.contractDuration || "Not linked",
      units,
      occupied,
      available,
      maintenance,
      occupancyRate,
      tenantsCount,
    };
  }, [property, clients, tenants]);

  if (!property || !details) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Property not found.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <Link to="/admin/properties" className="hover:text-[#9F7539]">Properties</Link>
        <ChevronRight size={13} />
        <span className="text-gray-700 dark:text-gray-300 font-medium">Property Details</span>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        <img src={property.image} alt={property.title} className="h-72 w-full object-cover" />
        <div className="p-5 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white">{property.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {property.address || property.location}, {property.area}, {property.state}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
              {property.description || "No building description yet."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Units</div>
              <div className="text-xl font-bold text-[#0e1f42] dark:text-white">{details.units.length}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Occupied</div>
              <div className="text-xl font-bold text-green-600">{details.occupied}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Available</div>
              <div className="text-xl font-bold text-sky-600">{details.available}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Maintenance</div>
              <div className="text-xl font-bold text-amber-600">{details.maintenance}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Occupancy Rate</div>
              <div className="text-xl font-bold text-[#0e1f42] dark:text-white">{details.occupancyRate}%</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Property Owner</div>
              <div className="font-semibold text-[#0e1f42] dark:text-white">{details.ownerName}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Contract Length</div>
              <div className="font-semibold text-[#0e1f42] dark:text-white">{details.contractLength}</div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Unit room numbers & prices ({details.units.length} units)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {details.units.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between rounded-md border border-gray-100 dark:border-white/10 px-3 py-2">
                  <div className="text-sm text-[#0e1f42] dark:text-white font-medium">
                    {unit.unitNumber || unit.number || unit.id}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    ₦{Number(unit.rent || property.rent || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => navigate(`/admin/properties/${property.id}/units`)}
              className="bg-[#9F7539] text-white px-4 py-2 rounded-md text-sm font-semibold"
            >
              View Units
            </button>
            <button
              onClick={() => navigate("/admin/properties")}
              className="border border-gray-200 dark:border-white/10 px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[#0e1f42] dark:text-white">
            Current tenants in this property: {details.tenantsCount}
          </div>
          <button
            onClick={() => navigate(`/admin/properties/${property.id}/units`)}
            className="inline-flex items-center gap-2 text-[#9F7539] text-xs font-semibold"
          >
            <Eye size={14} />
            Open units board
          </button>
        </div>
      </div>
    </div>
  );
}

