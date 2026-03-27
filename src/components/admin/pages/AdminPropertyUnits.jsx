import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";
import UnitCard from "../properties/UnitCard";
import PropertyFilters from "../properties/PropertyFilters";
import { useState } from "react";

export default function AdminPropertyUnits() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { properties, tenants, setProperties } = useAdmin();
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [unitStatus, setUnitStatus] = useState("all");
  const [bedroomFilter, setBedroomFilter] = useState("all");
  const [tenancyFilter, setTenancyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [unpublishTapCounts, setUnpublishTapCounts] = useState({});

  const property = properties.find((item) => item.id === propertyId);

  const units = useMemo(() => {
    if (!property) return [];
    const resolveBedrooms = (unit) => {
      if (typeof unit.bedrooms === "number" && Number.isFinite(unit.bedrooms)) return unit.bedrooms;
      return null;
    };
    return (property.units || []).map((unit) => {
      const tenant =
        tenants.find((item) => item.id === unit.tenantId || item.unitId === unit.id) || null;
      const normalizedStatus = String(unit.tenantStatus || unit.status || "").toLowerCase();
      const unitStatus = normalizedStatus === "available" ? "vacant" : (normalizedStatus || "vacant");

      return {
        ...unit,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: `${property.location}, ${property.area}`,
        propertyState: property.state,
        propertyImage:
          (Array.isArray(unit.images) && unit.images.find(Boolean)) ||
          unit.image ||
          property.image,
        bedrooms: resolveBedrooms(unit),
        rent: unit.rent ?? property.rent ?? 0,
        tenantName: tenant?.name || unit.tenant || null,
        publishedStatus: unit.publishedStatus || "unpublished",
        isConfigured: unit.isConfigured ?? true,
        unitStatus,
        status: unitStatus,
      };
    });
  }, [property, tenants]);

  const resetFilters = () => {
    setSearch("");
    setUnitStatus("all");
    setBedroomFilter("all");
    setTenancyFilter("all");
    setSortBy("newest");
  };

  const handlePublishAction = (unitId, currentStatus) => {
    const normalized = String(currentStatus || "unpublished").toLowerCase();

    if (normalized !== "published") {
      setProperties((prev) =>
        prev.map((prop) =>
          prop.id === propertyId
            ? {
                ...prop,
                units: (prop.units || []).map((u) =>
                  u.id === unitId ? { ...u, publishedStatus: "published" } : u
                ),
              }
            : prop
        )
      );
      setUnpublishTapCounts((prev) => ({ ...prev, [unitId]: 0 }));
      return;
    }

    const nextCount = (unpublishTapCounts[unitId] || 0) + 1;
    if (nextCount >= 3) {
      setProperties((prev) =>
        prev.map((prop) =>
          prop.id === propertyId
            ? {
                ...prop,
                units: (prop.units || []).map((u) =>
                  u.id === unitId ? { ...u, publishedStatus: "unpublished" } : u
                ),
              }
            : prop
        )
      );
      setUnpublishTapCounts((prev) => ({ ...prev, [unitId]: 0 }));
      return;
    }

    setUnpublishTapCounts((prev) => ({ ...prev, [unitId]: nextCount }));
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
  ];

  const bedroomOptions = [
    { value: "1", label: "1 Bed" },
    { value: "2", label: "2 Beds" },
    { value: "3", label: "3 Beds" },
    { value: "4", label: "4+ Beds" },
  ];

  const tenancyOptions = [
    { value: "vacant", label: "Vacant" },
    { value: "occupied", label: "Occupied" },
    { value: "reserved", label: "Reserved" },
  ];

  const sortOptions = [
    { value: "newest", label: "Sort: Newest" },
    { value: "unit-asc", label: "Unit: A -> Z" },
    { value: "unit-desc", label: "Unit: Z -> A" },
    { value: "rent-asc", label: "Rent: Low -> High" },
    { value: "rent-desc", label: "Rent: High -> Low" },
  ];

  const filteredUnits = useMemo(() => {
    let list = [...units];

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((unit) =>
        `${unit.unitNumber || unit.number || ""} ${unit.propertyTitle || ""} ${unit.tenantName || ""}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (unitStatus !== "all") {
      list = list.filter(
        (unit) => String(unit.publishedStatus || "unpublished").toLowerCase() === unitStatus
      );
    }

    if (bedroomFilter !== "all") {
      list = list.filter((unit) => {
        const beds = Number(unit.bedrooms || 0);
        if (bedroomFilter === "4") return beds >= 4;
        return String(beds) === bedroomFilter;
      });
    }

    if (tenancyFilter !== "all") {
      list = list.filter(
        (unit) => String(unit.unitStatus || unit.status || "").toLowerCase() === tenancyFilter
      );
    }

    if (sortBy === "unit-asc") {
      list.sort((a, b) =>
        String(a.unitNumber || a.number || "").localeCompare(
          String(b.unitNumber || b.number || "")
        )
      );
    } else if (sortBy === "unit-desc") {
      list.sort((a, b) =>
        String(b.unitNumber || b.number || "").localeCompare(
          String(a.unitNumber || a.number || "")
        )
      );
    } else if (sortBy === "rent-asc") {
      list.sort((a, b) => Number(a.rent || 0) - Number(b.rent || 0));
    } else if (sortBy === "rent-desc") {
      list.sort((a, b) => Number(b.rent || 0) - Number(a.rent || 0));
    }

    return list;
  }, [units, search, unitStatus, bedroomFilter, tenancyFilter, sortBy]);

  if (!property) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Property not found.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <Link to="/admin/properties" className="hover:text-[#9F7539]">Properties</Link>
        <ChevronRight size={13} />
        <Link to={`/admin/properties/${property.id}`} className="hover:text-[#9F7539]">Property Details</Link>
        <ChevronRight size={13} />
        <span className="text-gray-700 dark:text-gray-300 font-medium">Units</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white">Property Units</h1>
        </div>
        <button
          onClick={() => navigate(`/admin/properties/${property.id}/units/new`)}
          className="border border-[#9F7539] bg-[#9F7539] px-4 py-2 rounded-md text-sm font-semibold text-white"
        >
          Add New Unit
        </button>
      </div>

      <PropertyFilters
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        search={search}
        setSearch={setSearch}
        unitStatus={unitStatus}
        setUnitStatus={setUnitStatus}
        stateFilter={bedroomFilter}
        setStateFilter={setBedroomFilter}
        locationFilter={tenancyFilter}
        setLocationFilter={setTenancyFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        resetFilters={resetFilters}
        statesList={[]}
        locationsList={[]}
        searchPlaceholder="Search units..."
        statusOptions={statusOptions}
        secondFilterLabel="All Bedrooms"
        thirdFilterLabel="All Tenancy"
        secondFilterOptions={bedroomOptions}
        thirdFilterOptions={tenancyOptions}
        sortOptions={sortOptions}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredUnits.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            onPublishAction={() => handlePublishAction(unit.id, unit.publishedStatus)}
            unpublishTapCount={unpublishTapCounts[unit.id] || 0}
          />
        ))}
      </div>
    </div>
  );
}

