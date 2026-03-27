import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";
import { useNavigate, useParams } from "react-router-dom";

const UNIT_TYPE_OPTIONS = [
  "Self-Contain (Studio)",
  "Mini Flat",
  "Apartment (Flat)",
  "Penthouse",
];

const AMENITIES = [
  "Parking",
  "Security",
  "Generator",
  "WiFi",
  "Swimming Pool",
  "Gym",
  "CCTV",
];

export default function AdminPropertyDetails() {
  const { properties, setProperties, tenants } = useAdmin();
  const navigate = useNavigate();
  const { unitId } = useParams();

  const unitLookup = useMemo(() => {
    for (const property of properties) {
      const unit = (property.units || []).find((item) => item.id === unitId);
      if (unit) {
        const tenant = tenants?.find((t) => t.id === unit.tenantId) || null;
        return { property, unit, tenant };
      }
    }
    return null;
  }, [properties, tenants, unitId]);

  const [form, setForm] = useState({
    unitNumber: "",
    type: "Apartment (Flat)",
    bedrooms: 0,
    bathrooms: 0,
    size: "",
    rent: 0,
    caution: 0,
    billsIncluded: false,
    billsNote: "",
    status: "available",
    amenities: [],
    notes: "",
  });

  useEffect(() => {
    if (!unitLookup) return;
    const { unit } = unitLookup;
    setForm({
      unitNumber: unit.unitNumber || unit.number || "",
      type: unit.type || "Apartment (Flat)",
      bedrooms: Number(unit.bedrooms) || 0,
      bathrooms: Number(unit.bathrooms) || 0,
      size: unit.size || "",
      rent: Number(unit.rent) || 0,
      caution: Number(unit.caution) || 0,
      billsIncluded: Boolean(unit.billsIncluded),
      billsNote: unit.billsNote || "",
      status: unit.status || "available",
      amenities: Array.isArray(unit.amenities) ? unit.amenities : [],
      notes: unit.notes || "",
    });
  }, [unitLookup]);

  if (!unitLookup) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Unit not found.</div>;
  }

  const { property, unit, tenant } = unitLookup;
  const propertyImage = (Array.isArray(property.images) && property.images[0]) || property.image;

  const toggleAmenity = (name) => {
    setForm((prev) => {
      const hasAmenity = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: hasAmenity
          ? prev.amenities.filter((item) => item !== name)
          : [...prev.amenities, name],
      };
    });
  };

  const handleSave = () => {
    setProperties((prev) =>
      prev.map((item) => {
        if (item.id !== property.id) return item;
        return {
          ...item,
          units: (item.units || []).map((existing) =>
            existing.id === unit.id
              ? {
                  ...existing,
                  unitNumber: form.unitNumber,
                  number: form.unitNumber,
                  type: form.type,
                  bedrooms: Number(form.bedrooms) || 0,
                  bathrooms: Number(form.bathrooms) || 0,
                  size: form.size,
                  rent: Number(form.rent) || 0,
                  caution: Number(form.caution) || 0,
                  billsIncluded: form.billsIncluded,
                  billsNote: form.billsNote,
                  status: form.status,
                  amenities: form.amenities,
                  notes: form.notes,
                  isConfigured: true,
                }
              : existing
          ),
        };
      })
    );
    navigate(`/admin/properties/${property.id}/units`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span
            className="hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
            onClick={() => navigate(`/admin/properties/${property.id}/units`)}
          >
            Units
          </span>
          <ChevronRight size={14} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">Edit Unit</span>
        </div>

        <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white mt-2">
          {form.unitNumber || "Unit"} — {property.title}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Complete and update this unit details record.
        </p>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm transition-colors">
        <div className="h-56 w-full overflow-hidden">
          <img src={propertyImage} alt={property.title} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white">Unit Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Unit Code</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none"
              value={form.unitNumber}
              readOnly
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Unit Type</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539] cursor-pointer"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {UNIT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type} className="dark:bg-[#111827]">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bedrooms</label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
              value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bathrooms</label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
              value={form.bathrooms}
              onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Size</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
              placeholder="e.g. 120 sqm"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539] cursor-pointer"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="available" className="dark:bg-[#111827]">Available</option>
              <option value="vacant" className="dark:bg-[#111827]">Vacant</option>
              <option value="reserved" className="dark:bg-[#111827]">Reserved</option>
              <option value="occupied" className="dark:bg-[#111827]">Occupied</option>
              <option value="maintenance" className="dark:bg-[#111827]">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Annual Rent (₦)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
              value={form.rent}
              onChange={(e) => setForm({ ...form, rent: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Caution Fee (₦)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
              value={form.caution}
              onChange={(e) => setForm({ ...form, caution: Number(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="unit-bills-included"
            type="checkbox"
            checked={form.billsIncluded}
            onChange={(e) => setForm({ ...form, billsIncluded: e.target.checked })}
          />
          <label htmlFor="unit-bills-included" className="text-sm text-gray-700 dark:text-gray-300">
            Bills included
          </label>
        </div>

        {form.billsIncluded && (
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bills Note</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
              value={form.billsNote}
              onChange={(e) => setForm({ ...form, billsNote: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Unit Features</label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
            {AMENITIES.map((amenity) => (
              <label key={amenity} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Notes</label>
          <textarea
            className="mt-1 w-full min-h-[90px] rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-5">
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-2">Tenant Information</h3>
        {tenant ? (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {tenant.name} ({tenant.status})
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">No tenant assigned</div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="bg-[#9F7539] text-white px-4 py-2 rounded-md text-sm font-semibold cursor-pointer hover:bg-[#866230] transition-colors"
        >
          Save Unit
        </button>
        <button
          onClick={() => navigate(`/admin/properties/${property.id}/units`)}
          className="border border-gray-200 dark:border-white/10 px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
