import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../../context/AdminContext";
import PropertySummaryCards from "../properties/PropertySummaryCards";
import PropertyFilters from "../properties/PropertyFilters";
import UnitCard from "../properties/UnitCard";

export default function AdminUnits() {
  const navigate = useNavigate();
  const { properties, tenants } = useAdmin();
  const [filtersOpen, setFiltersOpen] = useState(true);

  const unitsWithMeta = useMemo(() => {
    const resolveBedrooms = (unit) => {
      if (typeof unit.bedrooms === "number" && Number.isFinite(unit.bedrooms)) return unit.bedrooms;
      return null;
    };

    return properties.flatMap((prop) =>
      (prop.units || []).map((unit) => {
        const tenant =
          tenants?.find((t) => t.id === unit.tenantId || t.unitId === unit.id) || null;

        return {
          ...unit,
          propertyId: prop.id,
          propertyTitle: prop.title,
          propertyLocation: `${prop.location}, ${prop.area}`,
          propertyState: prop.state,
          propertyImage: prop.image,
          tenantName: tenant?.name || unit.tenant || null,
          rent: unit.rent ?? prop.rent ?? 0,
          bedrooms: resolveBedrooms(unit),
        };
      })
    );
  }, [properties, tenants]);

  const allUnitsForStats = useMemo(
    () => properties.flatMap((p) => p.units || []),
    [properties]
  );

  const [search, setSearch] = useState("");
  const [unitStatus, setUnitStatus] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const resetFilters = () => {
    setSearch("");
    setUnitStatus("all");
    setStateFilter("all");
    setLocationFilter("all");
    setSortBy("newest");
  };

  const statesList = useMemo(
    () => Array.from(new Set(properties.map((p) => p.state).filter(Boolean))),
    [properties]
  );

  const locationsList = useMemo(
    () =>
      Array.from(
        new Set(
          properties
            .filter((p) => (stateFilter === "all" ? true : p.state === stateFilter))
            .map((p) => p.location)
            .filter(Boolean)
        )
      ),
    [properties, stateFilter]
  );

  const normalizedStatus = (status) => String(status || "").toLowerCase();

  const filteredUnits = useMemo(() => {
    let list = [...unitsWithMeta];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        `${u.propertyTitle} ${u.propertyLocation} ${u.unitNumber || u.number || ""} ${u.tenantName || ""}`
          .toLowerCase()
          .includes(q)
      );
    }

    if (unitStatus !== "all") {
      list = list.filter((u) => normalizedStatus(u.status) === unitStatus);
    }

    if (stateFilter !== "all") {
      list = list.filter((u) => u.propertyState === stateFilter);
    }

    if (locationFilter !== "all") {
      list = list.filter((u) => u.propertyLocation.includes(locationFilter));
    }

    if (sortBy === "rent-asc") {
      list.sort((a, b) => Number(a.rent || 0) - Number(b.rent || 0));
    } else if (sortBy === "rent-desc") {
      list.sort((a, b) => Number(b.rent || 0) - Number(a.rent || 0));
    }

    return list;
  }, [unitsWithMeta, search, unitStatus, stateFilter, locationFilter, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0e1f42] dark:text-white">
            Units Inventory
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            All rentable units across all properties
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/properties")}
          className="bg-[#9F7539] text-white px-4 py-2 rounded-md flex text-sm items-center justify-center gap-2 w-full sm:w-auto"
        >
          View Properties
        </button>
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
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  );
}
