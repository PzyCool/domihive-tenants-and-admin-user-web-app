import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";
import PropertySummaryCards from "../properties/PropertySummaryCards";
import PropertyFilters from "../properties/PropertyFilters";

export default function AdminProperties() {
  const navigate = useNavigate();
  const { properties, clients } = useAdmin();
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [unitStatus, setUnitStatus] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const safeStatus = (status) => String(status || "").toLowerCase();

  const propertyRows = useMemo(() => {
    return properties.map((property) => {
      const units = property.units || [];
      const totalUnits = units.length;
      const occupiedUnits = units.filter((u) => safeStatus(u.status) === "occupied").length;
      const availableUnits = units.filter((u) => ["available", "vacant"].includes(safeStatus(u.status))).length;
      const maintenanceUnits = units.filter((u) => safeStatus(u.status) === "maintenance").length;
      const occupancyRate = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      const owner = clients.find((client) => client.id === property.clientId);
      const contractLength = owner?.contractDuration || "Not linked";

      return {
        ...property,
        ownerName: owner?.name || "Unassigned client",
        contractLength,
        totalUnits,
        occupiedUnits,
        availableUnits,
        maintenanceUnits,
        occupancyRate,
      };
    });
  }, [properties, clients]);

  const statesList = useMemo(
    () => Array.from(new Set(properties.map((property) => property.state).filter(Boolean))),
    [properties]
  );

  const locationsList = useMemo(
    () =>
      Array.from(
        new Set(
          properties
            .filter((property) => (stateFilter === "all" ? true : property.state === stateFilter))
            .map((property) => property.location)
            .filter(Boolean)
        )
      ),
    [properties, stateFilter]
  );

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
  ];

  const sortOptions = [
    { value: "newest", label: "Sort: Newest" },
    { value: "title-asc", label: "Title: A -> Z" },
    { value: "title-desc", label: "Title: Z -> A" },
    { value: "units-desc", label: "Units: High -> Low" },
    { value: "units-asc", label: "Units: Low -> High" },
  ];

  const resetFilters = () => {
    setSearch("");
    setUnitStatus("all");
    setStateFilter("all");
    setLocationFilter("all");
    setSortBy("newest");
  };

  const filteredProperties = useMemo(() => {
    let list = [...propertyRows];

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((property) =>
        `${property.title} ${property.address || ""} ${property.location || ""} ${property.area || ""} ${property.state || ""} ${property.ownerName}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (unitStatus !== "all") {
      list = list.filter((property) => String(property.status || "").toLowerCase() === unitStatus);
    }

    if (stateFilter !== "all") {
      list = list.filter((property) => property.state === stateFilter);
    }

    if (locationFilter !== "all") {
      list = list.filter((property) => property.location === locationFilter);
    }

    if (sortBy === "title-asc") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      list.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "units-desc") {
      list.sort((a, b) => b.totalUnits - a.totalUnits);
    } else if (sortBy === "units-asc") {
      list.sort((a, b) => a.totalUnits - b.totalUnits);
    }

    return list;
  }, [propertyRows, search, unitStatus, stateFilter, locationFilter, sortBy]);

  const allUnitsForStats = useMemo(
    () => properties.flatMap((property) => property.units || []),
    [properties]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0e1f42] dark:text-white">Properties</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Building-level inventory sourced from landlords and clients
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate("/admin/units")}
            className="border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-semibold"
          >
            View Units
          </button>
          <button
            onClick={() => navigate("/admin/add-property")}
            className="bg-[#9F7539] text-white px-4 py-2 rounded-md flex text-sm items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={18} /> Add New Property
          </button>
        </div>
      </div>

      <PropertySummaryCards properties={properties} allUnits={allUnitsForStats} />

      <PropertyFilters
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        search={search}
        setSearch={setSearch}
        unitStatus={unitStatus}
        setUnitStatus={setUnitStatus}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        resetFilters={resetFilters}
        statesList={statesList}
        locationsList={locationsList}
        searchPlaceholder="Search properties..."
        statusOptions={statusOptions}
        sortOptions={sortOptions}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
            <img src={property.image} alt={property.title} className="h-56 w-full object-cover" />
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#0e1f42] dark:text-white">{property.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {property.address || property.location}, {property.area}, {property.state}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700">
                  {property.occupancyRate}% Occupied
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Owner: <span className="font-semibold text-[#0e1f42] dark:text-white">{property.ownerName}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Contract: <span className="font-semibold text-[#0e1f42] dark:text-white">{property.contractLength}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs pt-2">
                <div className="rounded-lg border border-gray-100 dark:border-white/10 p-2">
                  <div className="font-semibold text-[#0e1f42] dark:text-white">{property.totalUnits}</div>
                  <div className="text-gray-500 dark:text-gray-400">Units</div>
                </div>
                <div className="rounded-lg border border-gray-100 dark:border-white/10 p-2">
                  <div className="font-semibold text-green-600">{property.occupiedUnits}</div>
                  <div className="text-gray-500 dark:text-gray-400">Occupied</div>
                </div>
                <div className="rounded-lg border border-gray-100 dark:border-white/10 p-2">
                  <div className="font-semibold text-sky-600">{property.availableUnits}</div>
                  <div className="text-gray-500 dark:text-gray-400">Vacant</div>
                </div>
                <div className="rounded-lg border border-gray-100 dark:border-white/10 p-2">
                  <div className="font-semibold text-amber-600">{property.maintenanceUnits}</div>
                  <div className="text-gray-500 dark:text-gray-400">Maint.</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => navigate(`/admin/properties/${property.id}`)}
                  className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
                >
                  <Eye size={14} />
                  View Details
                </button>
                <button
                  onClick={() => navigate(`/admin/properties/${property.id}/units`)}
                  className="text-xs px-3 py-2 rounded-md bg-[#9F7539] text-white font-semibold"
                >
                  View Units
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
